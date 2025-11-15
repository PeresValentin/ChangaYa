import { supabase } from '../config/supabaseClient.js'

/**
 * Crear una nueva postulación (worker)
 */
export const createPostulacion = async (req, res) => {
  try {
    const user = req.user
    const { changaID } = req.body

    if (user.rol !== 'trabajador') {
      return res.status(403).json({ error: 'Solo los trabajadores pueden postularse' })
    }

    // Evitar postulaciones duplicadas
    const { data: existente } = await supabase
      .from('Postulacion')
      .select('*')
      .eq('changaID', changaID)
      .eq('usuarioID', user.id)
      .single()

    if (existente) {
      return res.status(400).json({ error: 'Ya te postulaste a esta changa' })
    }

    const { data, error } = await supabase
      .from('Postulacion')
      .insert([
        {
          changaID,
          usuarioID: user.id
          // estado no se envia → Supabase asigna "iniciada"
        }
      ])
      .select()

    if (error) throw error
    res.status(201).json({ message: 'Postulación creada', data })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

/**
 * Obtener todas las postulaciones de un trabajador autenticado
 */
export const getPostulacionesByTrabajador = async (req, res) => {
  try {
    const user = req.user

    if (user.rol !== 'trabajador') {
      return res.status(403).json({ error: 'Solo trabajadores pueden ver sus postulaciones' })
    }

    const { data, error } = await supabase
      .from('Postulacion')
      .select(`
        *,
        changa:changaID (
          changaID,
          titulo,
          remuneracion,
          estado
        )
      `)
      .eq('usuarioID', user.id)

    if (error) throw error
    res.status(200).json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

/**
 * Obtener todas las postulaciones de una changa (solo admin/contratante)
 */
export const getPostulacionesByChanga = async (req, res) => {
  try {
    const user = req.user
    const { changaID } = req.params

    if (user.rol !== 'contratante' && user.rol !== 'admin') {
      return res.status(403).json({ error: 'No autorizado' })
    }

    const { data, error } = await supabase
      .from('Postulacion')
      .select(`
        *,
        usuario:usuarioID (
          usuarioID,
          nombre,
          apellido,
          email,
          telefono,
          rankingGeneral
        )
      `)
      .eq('changaID', changaID)

    if (error) throw error
    res.status(200).json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

/**
 * Actualizar estado de una postulación (admin/contratante)
 */
export const updatePostulacion = async (req, res) => {
  try {
    const user = req.user
    const { postulacionID } = req.params
    const { estado } = req.body

    if (user.rol !== 'contratante' && user.rol !== 'admin') {
      return res.status(403).json({ error: 'No autorizado' })
    }

    const { data, error } = await supabase
      .from('Postulacion')
      .update({ estado })
      .eq('postulacionID', postulacionID)
      .select()

    if (error) throw error
    res.status(200).json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

/**
 * Eliminar una postulación (solo dueño o admin)
 */
export const deletePostulacion = async (req, res) => {
  try {
    const user = req.user
    const { postulacionID } = req.params

    const { data: postulacion } = await supabase
      .from('Postulacion')
      .select('*')
      .eq('postulacionID', postulacionID)
      .single()

    if (!postulacion) return res.status(404).json({ error: 'No existe la postulación' })

    // Solo dueño o admin
    if (postulacion.usuarioID !== user.id && user.rol !== 'admin') {
      return res.status(403).json({ error: 'No autorizado a eliminar' })
    }

    const { error } = await supabase
      .from('Postulacion')
      .delete()
      .eq('postulacionID', postulacionID)

    if (error) throw error

    res.status(200).json({ message: 'Postulación eliminada' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
