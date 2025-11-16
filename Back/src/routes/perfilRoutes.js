import { Router } from 'express'
import {
  createPerfil,
  getPerfilByUsuario,
  updatePerfil,
  deletePerfil
} from '../controllers/perfilController.js'

import { verificarToken } from '../middleware/authMiddleware.js'

const router = Router()

router.get('/usuario/:id', getPerfilByUsuario)

router.post('/', verificarToken, createPerfil)
router.put('/:id', verificarToken, updatePerfil)
router.delete('/:id', verificarToken, deletePerfil)

export default router
