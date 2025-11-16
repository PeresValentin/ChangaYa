import { Router } from 'express'
import {
  createResenia,
  getResenias,
  getReseniaById,
  updateResenia,
  deleteResenia
} from '../controllers/reseniaController.js'
import { verificarToken } from '../middleware/authMiddleware.js'

const router = Router()

router.get('/', getResenias)
router.get('/:id', getReseniaById)

router.post('/', verificarToken, createResenia)
router.put('/:id', verificarToken, updateResenia)
router.delete('/:id', verificarToken, deleteResenia)

export default router
