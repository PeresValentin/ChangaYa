import { supabase } from '../config/supabaseClient.js'

/* ---------------------------------------------------------
 *   1) CALCULAR PUNTAJE DE LA RESEÑA
 * --------------------------------------------------------- */
export const calcularPuntajeResenia = async (reseñaID) => {
  const { data: reseña, error: rError } = await supabase
    .from('Reseña')
    .select('reseñaID, usuarioID')
    .eq('reseñaID', reseñaID)
    .single()

  if (rError) throw new Error("No se pudo obtener la reseña")

  const { usuarioID } = reseña

  const { data: usuario, error: uError } = await supabase
    .from('Usuario')
    .select('tipoUsuario')
    .eq('usuarioID', usuarioID)
    .single()

  if (uError) throw new Error("No se pudo obtener el usuario")

  const rol = usuario.tipoUsuario

  let habilidadesNecesarias = []

  if (rol === "trabajador") {
    habilidadesNecesarias = [
      "Actitud",
      "Comunicación",
      "Trabajo en Equipo",
      "Responsabilidad",
      "Puntualidad"
    ]
  } else {
    habilidadesNecesarias = [
      "Claridad en las Indicaciones",
      "Respeto y Tratos",
      "Paga en Tiempo y Forma",
      "Responsabilidad",
      "Puntualidad"
    ]
  }

  const { data: habilidades, error: hError } = await supabase
    .from('Habilidad')
    .select('habilidadID, nombre')
    .in('nombre', habilidadesNecesarias)

  if (hError) throw new Error("No se pudieron obtener habilidades necesarias")

  const habilidadIDs = habilidades.map(h => h.habilidadID)

  const { data: calificaciones, error: cError } = await supabase
    .from('ReseñaHabilidad')
    .select('calificacion')
    .eq('reseñaID', reseñaID)
    .in('habilidadID', habilidadIDs)

  if (cError) throw new Error("No se pudieron obtener calificaciones")

  if (calificaciones.length < 5) {
    return { updated: false, message: "Aún faltan calificaciones para finalizar el puntaje." }
  }

  const puntaje =
    calificaciones.reduce((acc, h) => acc + h.calificacion, 0) /
    calificaciones.length

  const { error: updError } = await supabase
    .from('Reseña')
    .update({ puntaje })
    .eq('reseñaID', reseñaID)

  if (updError) throw new Error("No se pudo actualizar el puntaje de la reseña")

  return { updated: true, puntaje }
}

/* ---------------------------------------------------------
 *   2) CREAR RESEÑA (INCLUYE TODAS LAS VALIDACIONES NESESARIAS)
 * --------------------------------------------------------- */
export const createReseniaService = async ({ comentario, changaID, usuarioID, destinatarioID }) => {

  /* -------- VALIDACIÓN 1 ----------
   Un usuario NO puede reseñar más de una vez
   al MISMO destinatario en la MISMA changa
  ----------------------------------- */
  const { data: prev, error: prevErr } = await supabase
    .from("Reseña")
    .select("reseñaID")
    .eq("changaID", changaID)
    .eq("usuarioID", usuarioID)
    .eq("destinatarioID", destinatarioID)

  if (prevErr) throw new Error(prevErr.message)

  if (prev.length > 0) {
    throw new Error("Ya dejaste una reseña para este usuario en esta changa.")
  }

  /* -------- VALIDACIÓN 2 ----------
   Límite total de reseñas por changa:
   → #reseñas <= #actores involucrados
  ----------------------------------- */

  // Obtener contratante
  const { data: changa, error: chErr } = await supabase
    .from("Changa")
    .select("contratanteID")
    .eq("changaID", changaID)
    .single()

  if (chErr) throw new Error("No se pudo obtener la changa")

  const contratanteID = changa.contratanteID

  // Obtener trabajadores (postulaciones asignadas)
  const { data: postulaciones, error: postErr } = await supabase
    .from("Postulacion") // Si usás otra tabla para asignados, avisame
    .select("usuarioID")
    .eq("changaID", changaID)

  if (postErr) throw new Error("No se pudieron obtener los trabajadores")

  // Lista única de trabajadores
  const trabajadores = [...new Set(postulaciones.map(p => p.usuarioID))]

  // Cantidad de actores = contratante + N trabajadores
  const cantidadActores = 1 + trabajadores.length

  // Contar reseñas actuales
  const { data: reseñasActuales, error: resErr } = await supabase
    .from("Reseña")
    .select("reseñaID")
    .eq("changaID", changaID)

  if (resErr) throw new Error("No se pudieron obtener las reseñas existentes")

  if (reseñasActuales.length >= cantidadActores) {
    throw new Error("No se pueden agregar más reseñas para esta changa.")
  }

  /* -------- CREAR RESEÑA ----------
     Sin puntaje todavía (lo genera calcularPuntajeResena)
  ----------------------------------- */
  const { data: nuevaReseña, error: resError } = await supabase
    .from("Reseña")
    .insert([{ comentario, changaID, usuarioID, destinatarioID, estado: "pendiente" }])
    .select()

  if (resError) throw new Error(resError.message)

  return nuevaReseña[0]
}

/* ---------------------------------------------------------
 *   3) CRUD RESTANTE
 * --------------------------------------------------------- */

export const getReseniasService = async () => {
  const { data, error } = await supabase.from('Reseña').select('*')
  if (error) throw new Error(error.message)
  return data
}

export const getReseniaByIdService = async (id) => {
  const { data, error } = await supabase
    .from('Reseña')
    .select('*')
    .eq('reseñaID', id)
    .single()

  if (error) throw new Error(error.message)
  return data
}

export const updateReseniaService = async (id, fields) => {
  const { data, error } = await supabase
    .from('Reseña')
    .update(fields)
    .eq('reseñaID', id)
    .select()

  if (error) throw new Error(error.message)
  return data[0]
}

export const deleteReseniaService = async (id) => {
  const { error } = await supabase
    .from('Reseña')
    .delete()
    .eq('reseñaID', id)

  if (error) throw new Error(error.message)
  return true
}
