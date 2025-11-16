import {
  createPerfilService,
  getPerfilByUsuarioService,
  updatePerfilService,
  deletePerfilService
} from '../services/perfilService.js'

export const createPerfil = async (req, res) => {
  try {
    const usuarioID = req.user.id   // ← viene del JWT (seguro)

    const { fotoHash, descripcion } = req.body

    const nuevoPerfil = await createPerfilService({
      usuarioID,
      fotoHash,
      descripcion
    })

    res.status(201).json(nuevoPerfil)

  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

export const getPerfilByUsuario = async (req, res) => {
  try {
    const perfil = await getPerfilByUsuarioService(req.params.id)

    // SI NO EXISTE PERFIL → responder 404
    if (!perfil) {
      return res.status(404).json({ error: "Perfil no encontrado" })
    }

    // Construimos URL SOLO si existe perfil.foto
    const fotoURL = perfil.foto
      ? `${process.env.SUPABASE_URL}/storage/v1/object/public/perfiles/${perfil.foto}`
      : null

    res.json({
      ...perfil,
      fotoURL
    })

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const updatePerfil = async (req, res) => {
  try {
    const data = await updatePerfilService(req.params.id, req.body)
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const deletePerfil = async (req, res) => {
  try {
    await deletePerfilService(req.params.id)
    res.json({ message: 'Perfil eliminado correctamente' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
