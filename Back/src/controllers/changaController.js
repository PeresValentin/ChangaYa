import { supabase } from '../config/supabaseClient.js'

const WORKER_ID_ALIASES = [
  'trabajadorID',
  'trabajadorId',
  'trabajador',
  'trabajadorAsignado',
  'trabajadorAsignadoId',
  'usuarioAsignadoId',
  'usuarioAsignadoID'
]

const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj ?? {}, key)

const normalizeTrabajadoresUpdate = (rawUpdates = {}, changa) => {
  const sanitized = { ...rawUpdates }
  let aliasValue

  for (const key of WORKER_ID_ALIASES) {
    if (aliasValue === undefined && sanitized[key] !== undefined && sanitized[key] !== null) {
      aliasValue = sanitized[key]
    }
    delete sanitized[key]
  }

  const touchedDirectField = hasOwn(rawUpdates, 'trabajadores')
  if (!touchedDirectField && aliasValue === undefined) {
    return sanitized
  }

  const existingWorkers = Array.isArray(changa?.trabajadores)
    ? changa.trabajadores.filter(Boolean).map((id) => String(id))
    : []

  let incomingWorkers = null
  if (touchedDirectField) {
    const directValue = rawUpdates.trabajadores
    if (directValue == null) {
      incomingWorkers = []
    } else if (Array.isArray(directValue)) {
      incomingWorkers = directValue.filter(Boolean).map((id) => String(id))
    } else {
      incomingWorkers = [String(directValue)]
    }
  } else if (aliasValue !== undefined && aliasValue !== null) {
    incomingWorkers = [String(aliasValue)]
  }

  if (incomingWorkers) {
    const base = touchedDirectField ? incomingWorkers : [...existingWorkers, ...incomingWorkers]
    sanitized.trabajadores = [...new Set(base)]
  }

  return sanitized
}

const isUserAssignedToChanga = (changa, userId) => {
  if (!changa || !userId) return false
  if (!Array.isArray(changa.trabajadores)) return false
  return changa.trabajadores.map((id) => String(id)).includes(String(userId))
}

/**
 * Crear una nueva changa
 * Solo usuarios autenticados pueden crear.
 */
export const createChanga = async (req, res) => {
  try {
    const user = req.user  // viene del JWT
    const { titulo, descripcion, remuneracion, horaInicio, horaFin, ubicacion } = req.body

    if (!titulo || !descripcion || !remuneracion || !ubicacion) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' })
    }

    
    const { data, error } = await supabase
      .from('Changa')
      .insert([
        {
          titulo,
          descripcion,
          remuneracion,
          horaInicio,
          horaFin,
          ubicacion,
          estado: 'iniciada',
          trabajadores: user.rol === 'trabajador' ? [user.id] : [],
          ...(user.rol === 'contratante' ? { contratanteID: user.id } : {})
        }
      ])
      .select()

    if (error) throw error
    res.status(201).json({ message: 'Changa creada correctamente', data })
  } catch (err) {
    console.error('❌ Error al crear changa:', err)
    res.status(500).json({ error: err.message })
  }
}

/**
 * Obtener changas con estado "iniciado"
 */
export const getChangasIniciadas = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('Changa')
      .select('*')
      .eq('estado', 'iniciada')

    if (error) throw error
    res.status(200).json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

/**
 * Obtener todas las changas de un trabajador autenticado
 */
export const getChangasByTrabajador = async (req, res) => {
  try {
    const user = req.user

    if (user.rol !== 'trabajador') {
      return res.status(403).json({ error: 'Solo los trabajadores pueden ver sus changas' })
    }

    const { data, error } = await supabase
      .from('Changa')
      .select('*')
       .contains('trabajadores', [user.id])

    if (error) throw error
    res.status(200).json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

/**
 * Obtener todas las changas creadas por un contratante autenticado
 */
export const getChangasByContratante = async (req, res) => {
  try {
    const user = req.user

    if (user.rol !== 'contratante') {
      return res.status(403).json({ error: 'Solo los contratantes pueden ver sus changas' })
    }

    const { data, error } = await supabase
      .from('Changa')
      .select('*')
      .eq('contratanteID', user.id)

    if (error) throw error
    res.status(200).json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

/**
 * Actualizar una changa (solo el dueño)
 */
export const updateChanga = async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body
    const user = req.user

    // Validar propietario
    const { data: changa } = await supabase
      .from('Changa')
      .select('*')
      .eq('changaID', id)
      .single()

    if (!changa) return res.status(404).json({ error: 'Changa no encontrada' })
     const esTrabajadorAsignado = isUserAssignedToChanga(changa, user.id)
    if (!esTrabajadorAsignado && changa.contratanteID !== user.id && user.rol !== 'admin') {
      return res.status(403).json({ error: 'No autorizado para modificar esta changa' })
    }

    const sanitizedUpdates = normalizeTrabajadoresUpdate(updates, changa)

    const { data, error } = await supabase
      .from('Changa')
      .update(sanitizedUpdates)
      .eq('changaID', id)
      .select()

    if (error) throw error
    res.status(200).json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

/**
 * Eliminar una changa (solo el dueño)
 */
export const deleteChanga = async (req, res) => {
  try {
    const { id } = req.params
    const user = req.user

    const { data: changa } = await supabase
      .from('Changa')
      .select('*')
      .eq('changaID', id)
      .single()

    if (!changa) return res.status(404).json({ error: 'Changa no encontrada' })
    const esTrabajadorAsignado = isUserAssignedToChanga(changa, user.id)
    if (!esTrabajadorAsignado && changa.contratanteID !== user.id && user.rol !== 'admin') {
      return res.status(403).json({ error: 'No autorizado para eliminar esta changa' })
    }

    const { error } = await supabase.from('Changa').delete().eq('changaID', id)
    if (error) throw error

    res.status(200).json({ message: 'Changa eliminada correctamente' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

/**
 * Obtener detalle de una changa dependiendo del rol del usuario
 * - Admin / contratante → changa + postulaciones + datos de postulantes
 * - Trabajador → changa + datos del contratante
 */
export const getChangaDetalle = async (req, res) => {
  try {
    const { id } = req.params
    const user = req.user  // { id, rol }

    // 1) Buscar changa
    const { data: changa, error: changaError } = await supabase
      .from('Changa')
      .select('*')
      .eq('changaID', id)
      .single()

    if (changaError) throw changaError
    if (!changa) return res.status(404).json({ error: 'Changa no encontrada' })

    // ================================================================
    // A) CASO ADMIN O CONTRATANTE → retornar postulaciones completas
    // ================================================================
    if (user.rol === 'admin' || user.rol === 'contratante') {

      // Obtener postulaciones + datos de cada usuario postulante
      const { data: postulaciones, error: postError } = await supabase
        .from('Postulacion')
        .select(`
          *,
          usuario:usuarioID (
            usuarioID,
            nombreUsuario,
            nombre,
            apellido,
            email,
            telefono,
            rankingGeneral,
            tipoUsuario
          )
        `)
        .eq('changaID', id)

      if (postError) throw postError

      return res.status(200).json({
        changa,
        postulaciones
      })
    }

    // ================================================================
    // B) CASO TRABAJADOR → retornar contratante asociado
    // ================================================================
    if (user.rol === 'trabajador') {

      // Obtener info del contratante
      const { data: contratante, error: contError } = await supabase
        .from('Usuario')
        .select('usuarioID, nombreUsuario, nombre, apellido, email, telefono, rankingGeneral')
        .eq('usuarioID', changa.contratanteID)
        .single()

      if (contError) throw contError

      return res.status(200).json({
        changa,
        contratante
      })
    }

    // ================================================================
    // Si no matchea ningún rol conocido
    // ================================================================
    return res.status(403).json({ error: 'Rol no autorizado' })

  } catch (err) {
    console.error('❌ Error en getChangaDetalle:', err)
    return res.status(500).json({ error: err.message })
  }
}
