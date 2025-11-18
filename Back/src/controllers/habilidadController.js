import {
  createHabilidadService,
  getHabilidadesService,
  getHabilidadByIdService,
  updateHabilidadService,
  deleteHabilidadService
} from '../services/habilidadService.js'

export const createHabilidad = async (req, res) => {
  try {
    const data = await createHabilidadService(req.body)
    res.status(201).json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const getHabilidades = async (req, res) => {
  try {
    const data = await getHabilidadesService()
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const getHabilidadById = async (req, res) => {
  try {
    const data = await getHabilidadByIdService(req.params.id)
    res.json(data)
  } catch (err) {
    res.status(404).json({ error: err.message })
  }
}

export const updateHabilidad = async (req, res) => {
  try {
    const data = await updateHabilidadService(req.params.id, req.body)
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const deleteHabilidad = async (req, res) => {
  try {
    await deleteHabilidadService(req.params.id)
    res.json({ message: 'Eliminada correctamente' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// POST /api/habilidades/especificas
export const createHabilidadEspecifica = async (req, res) => {
  try {
    const { nombre } = req.body
    if (!nombre) return res.status(400).json({ error: "Falta el nombre" })

    const data = await createHabilidadService({
      nombre,
      esGeneral: false,
      descripcion: null
    })

    res.status(201).json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

