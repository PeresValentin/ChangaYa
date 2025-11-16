import { Router } from 'express'
import {
  createHabilidad,
  getHabilidades,
  getHabilidadById,
  updateHabilidad,
  deleteHabilidad
} from '../controllers/habilidadController.js'

import { verificarToken } from '../middleware/authMiddleware.js'

const router = Router()

router.get('/', getHabilidades)
router.get('/:id', getHabilidadById)

router.post('/', verificarToken, createHabilidad)
router.put('/:id', verificarToken, updateHabilidad)
router.delete('/:id', verificarToken, deleteHabilidad)

export default router
