import express from 'express'
import {
  createChanga,
  getChangasIniciadas,
  getChangasByTrabajador,
  getChangasByContratante,
  updateChanga,
  deleteChanga
} from '../controllers/changaController.js'

import { verificarToken } from '../middleware/authMiddleware.js'

const router = express.Router()


// 🔒 protegidas
router.get('/iniciadas', verificarToken, getChangasIniciadas)
router.post('/', verificarToken, createChanga)
router.get('/trabajador', verificarToken, getChangasByTrabajador)
router.get('/contratante', verificarToken, getChangasByContratante)
router.put('/:id', verificarToken, updateChanga)
router.delete('/:id', verificarToken, deleteChanga)

export default router
