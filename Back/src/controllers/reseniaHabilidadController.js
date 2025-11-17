import {
  createReseniaHabilidadService,
  getReseniaHabilidadesByReseniaService,
  deleteReseniaHabilidadService
} from '../services/reseniaHabilidadService.js'

export const addReseniaHabilidad = async (req, res) => {
  try {
    const data = await createReseniaHabilidadService(req.body)
    res.status(201).json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const getReseniaHabilidadesByResenia = async (req, res) => {
  try {
    const data = await getReseniaHabilidadesByReseniaService(req.params.id)
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const deleteReseniaHabilidad = async (req, res) => {
  try {
    await deleteReseniaHabilidadService(req.params.id)
    res.json({ message: 'ReseñaHabilidad eliminada correctamente' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
