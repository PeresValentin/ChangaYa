import express from 'express'
import {
  getUsuarios,
  getUsuarioById,
  createUsuario,
  loginUsuario,
  updateUsuario,
  deleteUsuario
} from '../controllers/usuarioController.js'

const router = express.Router()

router.get('/', getUsuarios)
router.get('/:id', getUsuarioById)
router.post('/', createUsuario)
router.post('/login', loginUsuario)  
router.put('/:id', updateUsuario)
router.delete('/:id', deleteUsuario)

export default router
