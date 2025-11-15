import express from 'express'
import {
  createChanga,
  getChangasIniciadas,
  getChangasByTrabajador,
  getChangasByContratante,
  getChangaDetalle,
  updateChanga,
  deleteChanga
} from '../controllers/changaController.js'

import { verificarToken } from '../middleware/authMiddleware.js'

const router = express.Router()


// protegidas
router.get('/iniciadas', verificarToken, getChangasIniciadas)
router.get('/trabajador', verificarToken, getChangasByTrabajador)
router.get('/contratante', verificarToken, getChangasByContratante)
router.get('/detalle/:id', verificarToken, getChangaDetalle)

router.post('/', verificarToken, createChanga)
router.put('/:id', verificarToken, updateChanga)
router.delete('/:id', verificarToken, deleteChanga)

export default router
