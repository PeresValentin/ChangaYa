import { Router } from 'express'
import {
  createPerfil,
  getPerfilByUsuario,
  updatePerfil,
  uploadPerfilAvatar,
  deletePerfil,
  getGeneralRanking,
  getGeneralHabilities,
  getTop5SpecificHabilities
} from '../controllers/perfilController.js'

import { verificarToken } from '../middleware/authMiddleware.js'

const router = Router()

router.get('/usuario/:id', verificarToken, getPerfilByUsuario)

router.post('/avatar', verificarToken, uploadPerfilAvatar)


router.post('/', verificarToken, createPerfil)
router.put('/:id', verificarToken, updatePerfil)
router.delete('/:id', verificarToken, deletePerfil)

router.get("/general-ranking/:usuarioID", verificarToken, getGeneralRanking)
router.get("/general-habilities/:usuarioID", verificarToken, getGeneralHabilities)
router.get("/top5-specific-habilities/:usuarioID", verificarToken, getTop5SpecificHabilities)

export default router
