import express from 'express'
import {
  getUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  loginUsuario,
  verificarUsuario,
  getUsuarioPublicProfile
} from '../controllers/usuarioController.js'

import { verificarToken } from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/', createUsuario)
router.post('/login', loginUsuario)
router.get('/verificar', verificarUsuario)

// Rutas protegidas (requieren token)
router.get('/', verificarToken, getUsuarios)
router.get('/:id', verificarToken, getUsuarioById)
router.get('/public/:id', verificarToken, getUsuarioPublicProfile)
router.put('/:id', verificarToken, updateUsuario)
router.delete('/:id', verificarToken, deleteUsuario)

export default router

