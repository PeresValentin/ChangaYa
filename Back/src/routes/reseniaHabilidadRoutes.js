import { Router } from 'express'
import {
  addReseniaHabilidad,
  getReseniaHabilidadesByResenia,
  deleteReseniaHabilidad
} from '../controllers/reseniaHabilidadController.js'

import { verificarToken } from '../middleware/authMiddleware.js'

const router = Router()

router.get('/resenia/:id', getReseniaHabilidadesByResenia)

router.post('/', verificarToken, addReseniaHabilidad)
router.delete('/:id', verificarToken, deleteReseniaHabilidad)

export default router
