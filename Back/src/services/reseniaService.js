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

export const updateReseniaService = async (id, fields) => {
  const { data, error } = await supabase
    .from('Reseña')
    .update(fields)
    .eq('reseñaID', id)
    .select()

  if (error) throw new Error(error.message)
  return data[0]
}

const ROL_ALIAS = {
  trabajador: [
    'trabajadorID',
    'trabajadorId',
    'trabajador'
  ],
  contratante: [
    'contratanteID',
    'contratanteId',
    'contratante'
  ]
}

const normalizeIdField = (rawBody, aliases, fallback) => {
  for (const key of aliases) {
    if (rawBody?.[key] !== undefined && rawBody?.[key] !== null) {
      return rawBody[key]
    }
  }
  return fallback ?? null
}

const normalizeChangaId = (rawBody) => {
  const aliases = ['changaID', 'changaId', 'changa', 'idChanga']
  for (const key of aliases) {
    if (rawBody?.[key] !== undefined && rawBody?.[key] !== null) {
      return rawBody[key]
    }
  }
  return null
}

const sanitizeComentario = (value) => {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length ? trimmed : null
}

const normalizeRatings = (payload = {}) => {
  const rawRatings = payload.ratings ?? payload.calificaciones ?? null

  if (Array.isArray(rawRatings)) {
    return rawRatings
      .map((rating) => {
        const nombre = (rating?.nombre ?? rating?.label ?? rating?.name ?? '').trim()
        const calificacion = Number(rating?.calificacion ?? rating?.rating)
        if (!Number.isFinite(calificacion)) {
          return { nombre: '', calificacion: 0 }
        }
        const boundedScore = Math.min(5, Math.max(1, calificacion))
        return { nombre, calificacion: boundedScore }
      })
      .filter((rating) => rating.nombre && Number.isFinite(rating.calificacion))
  }

  if (rawRatings && typeof rawRatings === 'object') {
    return Object.entries(rawRatings)
      .map(([key, value]) => {
        const calificacion = Number(value)
        if (!Number.isFinite(calificacion)) {
          return { nombre: '', calificacion: 0 }
        }
        return {
          nombre: key,
          calificacion: Math.min(5, Math.max(1, calificacion))
        }
      })
      .filter((rating) => rating.nombre && Number.isFinite(rating.calificacion))
  }

  return []
}

const fetchHabilidadIds = async (nombres = []) => {
  if (!nombres.length) return new Map()

  const { data, error } = await supabase
    .from('Habilidad')
    .select('habilidadID, nombre')
    .in('nombre', [...new Set(nombres)])

  if (error) throw new Error(error.message)

  return new Map(data.map((habilidad) => [habilidad.nombre, habilidad.habilidadID]))
}

export const submitReseniaCompletaService = async (payload = {}, user = {}) => {
  const usuarioID = payload.usuarioID
    ?? payload.usuarioId
    ?? user?.id
    ?? normalizeIdField(payload, ROL_ALIAS.trabajador)
    ?? normalizeIdField(payload, ROL_ALIAS.contratante)

  const changaID = normalizeChangaId(payload)
  const destinatarioID = payload.destinatarioID
    ?? payload.destinatarioId
    ?? normalizeIdField(payload, ROL_ALIAS.trabajador)
    ?? normalizeIdField(payload, ROL_ALIAS.contratante)

  const comentario = sanitizeComentario(payload.comentario ?? payload.comment ?? payload.descripcion)

  if (!usuarioID) {
    throw new Error('No se pudo identificar al autor de la reseña.')
  }

  if (!destinatarioID) {
    throw new Error('No se especificó a quién va dirigida la reseña.')
  }

  if (!changaID) {
    throw new Error('Falta el ID de la changa asociada a la reseña.')
  }

  const normalizedRatings = normalizeRatings(payload)

  const { data: existing, error: existingError } = await supabase
    .from('Reseña')
    .select('*')
    .eq('changaID', changaID)
    .eq('usuarioID', usuarioID)
    .eq('destinatarioID', destinatarioID)
    .maybeSingle()

  if (existingError) throw new Error(existingError.message)

  let reseñaRecord = existing

  if (!reseñaRecord) {
    reseñaRecord = await createReseniaService({ comentario, changaID, usuarioID, destinatarioID })
    if (normalizedRatings.length) {
      reseñaRecord = await updateReseniaService(reseñaRecord.reseñaID, { estado: 'completada' })
    }
  } else {
    const updateFields = {}
    if (comentario !== null) {
      updateFields.comentario = comentario
    }
    if (normalizedRatings.length) {
      updateFields.estado = 'completada'
    }

    if (Object.keys(updateFields).length) {
      reseñaRecord = await updateReseniaService(reseñaRecord.reseñaID, updateFields)
    }
  }

  if (!reseñaRecord) {
    throw new Error('No se pudo crear o actualizar la reseña.')
  }

  if (!normalizedRatings.length) {
    return { reseña: reseñaRecord, calificaciones: [] }
  }

  const { error: deleteError } = await supabase
    .from('ReseñaHabilidad')
    .delete()
    .eq('reseñaID', reseñaRecord.reseñaID)

  if (deleteError) throw new Error(deleteError.message)

  const habilidadMap = await fetchHabilidadIds(normalizedRatings.map((rating) => rating.nombre))

  const inserts = normalizedRatings
    .map((rating) => {
      const habilidadID = rating.habilidadID ?? habilidadMap.get(rating.nombre)
      if (!habilidadID) {
        return null
      }
      return {
        reseñaID: reseñaRecord.reseñaID,
        habilidadID,
        calificacion: rating.calificacion
      }
    })
    .filter(Boolean)

  if (inserts.length) {
    const { error: insertError } = await supabase
      .from('ReseñaHabilidad')
      .insert(inserts)

    if (insertError) throw new Error(insertError.message)

    await calcularPuntajeResenia(reseñaRecord.reseñaID).catch(() => {})
  }

  return {
    reseña: reseñaRecord,
    calificacionesGuardadas: inserts.length
  }
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
  
export const deleteReseniaService = async (id) => {
  const { error } = await supabase
    .from('Reseña')
    .delete()
    .eq('reseñaID', id)

  if (error) throw new Error(error.message)
  return true
}
