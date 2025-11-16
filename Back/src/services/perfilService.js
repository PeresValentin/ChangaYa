import { supabase } from '../config/supabaseClient.js'

export const createPerfilService = async ({ usuarioID, fotoHash, descripcion }) => {

  // 1️Validación: un usuario no puede tener más de un perfil
  const { data: existing, error: existingError } = await supabase
    .from("Perfil")
    .select("perfilID")
    .eq("usuarioID", usuarioID)
    .maybeSingle()

  if (existingError) throw new Error(existingError.message)

  if (existing) {
    throw new Error("El usuario ya tiene un perfil creado.")
  }

  // 2️Crear perfil
  const { data, error } = await supabase
    .from("Perfil")
    .insert([{
      usuarioID,
      foto: fotoHash,
      descripcion
    }])
    .select()

  if (error) throw new Error(error.message)

  return data[0]
}

export const getPerfilByUsuarioService = async (usuarioID) => {
  const { data, error } = await supabase
    .from('Perfil')
    .select('*')
    .eq('usuarioID', usuarioID)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data
}

export const updatePerfilService = async (perfilID, fields) => {
  const { data, error } = await supabase
    .from('Perfil')
    .update(fields)
    .eq('perfilID', perfilID)
    .select()

  if (error) throw new Error(error.message)
  return data[0]
}

export const deletePerfilService = async (perfilID) => {
  const { error } = await supabase
    .from('Perfil')
    .delete()
    .eq('perfilID', perfilID)

  if (error) throw new Error(error.message)
  return true
}

export const getGeneralRankingService = async (usuarioID) => {

  // 1) Obtener tipo de usuario (destinatario)
  const { data: usuario, error: uError } = await supabase
    .from("Usuario")
    .select("tipoUsuario")
    .eq("usuarioID", usuarioID)
    .single()

  if (uError) throw new Error("No se pudo obtener el usuario")

  const tipo = usuario.tipoUsuario

  // 2) Seleccionar set de habilidades generales
  let habilidadesGenerales = []

  if (tipo === "trabajador") {
    habilidadesGenerales = [
      "Actitud",
      "Comunicación",
      "Trabajo en Equipo",
      "Responsabilidad",
      "Puntualidad"
    ]
  } else if (tipo === "contratante") {
    habilidadesGenerales = [
      "Claridad en las Indicaciones", 
      "Respeto y Tratos",
      "Paga en Tiempo y Forma",
      "Responsabilidad",
      "Puntualidad"
    ]
  } else {
    throw new Error("El rol no posee habilidades generales evaluables.")
  }

  // 3) Obtener IDs de habilidades generales
  const { data: habilidades, error: hError } = await supabase
    .from("Habilidad")
    .select("habilidadID")
    .in("nombre", habilidadesGenerales)

  if (hError) throw new Error("No se pudieron obtener las habilidades generales")

  const habilidadIDs = habilidades.map(h => h.habilidadID)

  // 4) Obtener reseñas recibidas (donde el usuario es DESTINATARIO)
  const { data: reseñas, error: rError } = await supabase
    .from("Reseña")
    .select("reseñaID")
    .eq("destinatarioID", usuarioID)

  if (rError) throw new Error("No se pudieron obtener las reseñas")

  const reseñaIDs = reseñas.map(r => r.reseñaID)

  if (reseñaIDs.length === 0) {
    return { ranking: 0, updated: false, message: "El usuario no tiene reseñas aún." }
  }

  // 5) Obtener calificaciones de esas habilidades
  const { data: calificaciones, error: cError } = await supabase
    .from("ReseñaHabilidad")
    .select("calificacion")
    .in("reseñaID", reseñaIDs)
    .in("habilidadID", habilidadIDs)

  if (cError) throw new Error("No se pudieron obtener calificaciones")

  if (calificaciones.length === 0) {
    return { ranking: 0, updated: false, message: "El usuario no tiene calificaciones de estas habilidades." }
  }

  // 6) Calcular el promedio general
  const ranking = calificaciones.reduce((acc, x) => acc + x.calificacion, 0) / calificaciones.length

  // 7) Actualizar rankingGeneral del usuario
  await supabase
    .from("Usuario")
    .update({ rankingGeneral: ranking })
    .eq("usuarioID", usuarioID)

  return { ranking, updated: true }
}

export const getGeneralHabilitiesService = async (usuarioID) => {

  // Obtener tipoUsuario
  const { data: usuario } = await supabase
    .from("Usuario")
    .select("tipoUsuario")
    .eq("usuarioID", usuarioID)
    .single()

  const tipo = usuario.tipoUsuario

  let habilidadesGenerales = []

  if (tipo === "trabajador") {
    habilidadesGenerales = [
      "Actitud",
      "Comunicación",
      "Trabajo en Equipo",
      "Responsabilidad",
      "Puntualidad"
    ]
  } else {
    habilidadesGenerales = [
      "Claridad en las Indicaciones", 
      "Respeto y Tratos",
      "Paga en Tiempo y Forma",
      "Responsabilidad",
      "Puntualidad"
    ]
  }

  // Obtener IDs
  const { data: habilidades } = await supabase
    .from("Habilidad")
    .select("habilidadID, nombre")
    .in("nombre", habilidadesGenerales)

  const habilidadIDs = habilidades.map(h => h.habilidadID)

  // Obtener reseñas recibidas
  const { data: reseñas } = await supabase
    .from("Reseña")
    .select("reseñaID")
    .eq("destinatarioID", usuarioID)

  const reseñaIDs = reseñas.map(r => r.reseñaID)

  if (reseñaIDs.length === 0) {
    return { habilidades: {}, message: "Sin reseñas" }
  }

  // Obtener calificaciones agrupadas
  const { data: calificaciones } = await supabase
    .rpc("promedio_por_habilidad", {
      reseñas_ids: reseñaIDs,
      habilidades_ids: habilidadIDs
    })

  return calificaciones
}

export const getTop5SpecificHabilitiesService = async (usuarioID) => {

  const { data: usuario } = await supabase
    .from("Usuario")
    .select("tipoUsuario")
    .eq("usuarioID", usuarioID)
    .single()

  if (usuario.tipoUsuario !== "trabajador") {
    throw new Error("Solo los trabajadores poseen habilidades específicas.")
  }

  // Obtener IDs de habilidades específicas
  const { data: habilidades } = await supabase
    .from("Habilidad")
    .select("habilidadID, nombre")
    .eq("esGeneral", false)

  const habilidadIDs = habilidades.map(h => h.habilidadID)

  // Reseñas recibidas
  const { data: reseñas } = await supabase
    .from("Reseña")
    .select("reseñaID")
    .eq("destinatarioID", usuarioID)

  const reseñaIDs = reseñas.map(r => r.reseñaID)

  if (reseñaIDs.length === 0) return []

  // Usamos otra RPC
  const { data: resultados, error: rpcError } = await supabase.rpc(
    "promedio_por_habilidad",
    {
      reseñas_ids: reseñaIDs,
      habilidades_ids: habilidadIDs
    }
  )

  if (rpcError) {
    console.error("RPC Error:", rpcError)
    return []
  }

  if (!resultados || resultados.length === 0) {
    return []
  }

  return resultados
    .sort((a, b) => b.promedio - a.promedio)
    .slice(0, 5)

}
