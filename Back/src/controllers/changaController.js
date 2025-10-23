import { supabase } from '../config/supabaseClient.js'

/**
 * ✅ Crear una nueva changa
 * Solo usuarios autenticados pueden crear.
 */
export const createChanga = async (req, res) => {
  try {
    const user = req.user  // viene del JWT
    const { titulo, descripcion, remuneracion, horaInicio, horaFin } = req.body

    if (!titulo || !descripcion || !remuneracion) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' })
    }

    // Definir rol y columna correspondiente
    const columnaRol = user.rol === 'trabajador' ? 'trabajadorID' : 'contratanteID'

    const { data, error } = await supabase
      .from('Changa')
      .insert([
        {
          titulo,
          descripcion,
          remuneracion,
          horaInicio,
          horaFin,
          estado: 'iniciado',
          [columnaRol]: user.id  // asignamos automáticamente el ID del JWT
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
 * ✅ Obtener changas con estado "iniciado"
 */
export const getChangasIniciadas = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('Changa')
      .select('*')
      .eq('estado', 'iniciado')

    if (error) throw error
    res.status(200).json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

/**
 * ✅ Obtener todas las changas de un trabajador autenticado
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
      .eq('trabajadorID', user.id)

    if (error) throw error
    res.status(200).json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

/**
 * ✅ Obtener todas las changas creadas por un contratante autenticado
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
 * ✅ Actualizar una changa (solo el dueño)
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
    if (changa.trabajadorID !== user.id && changa.contratanteID !== user.id && user.rol !== 'admin') {
      return res.status(403).json({ error: 'No autorizado para modificar esta changa' })
    }

    const { data, error } = await supabase
      .from('Changa')
      .update(updates)
      .eq('changaID', id)
      .select()

    if (error) throw error
    res.status(200).json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

/**
 * ✅ Eliminar una changa (solo el dueño)
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
    if (changa.trabajadorID !== user.id && changa.contratanteID !== user.id && user.rol !== 'admin') {
      return res.status(403).json({ error: 'No autorizado para eliminar esta changa' })
    }

    const { error } = await supabase.from('Changa').delete().eq('changaID', id)
    if (error) throw error

    res.status(200).json({ message: 'Changa eliminada correctamente' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
