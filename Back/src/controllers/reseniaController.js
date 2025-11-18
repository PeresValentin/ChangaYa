import {
  getReseniasService,
  getReseniaByIdService,
  updateReseniaService,
  deleteReseniaService,
  submitReseniaCompletaService
} from '../services/reseniaService.js'

export const createResenia = async (req, res) => {
  try {
    const data = await submitReseniaCompletaService(req.body, req.user)
    res.status(201).json(data)
  } catch (err) {
     const status = /Falta|autor|dirigida/.test(err.message) ? 400 : 500
    res.status(status).json({ error: err.message })
  }
}

export const getResenias = async (req, res) => {
  try {
    const data = await getReseniasService()
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const getReseniaById = async (req, res) => {
  try {
    const data = await getReseniaByIdService(req.params.id)
    res.json(data)
  } catch (err) {
    res.status(404).json({ error: err.message })
  }
}

export const updateResenia = async (req, res) => {
  try {
    const data = await updateReseniaService(req.params.id, req.body)
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const deleteResenia = async (req, res) => {
  try {
    await deleteReseniaService(req.params.id)
    res.json({ message: 'Reseña eliminada correctamente' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
