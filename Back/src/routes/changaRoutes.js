import express from 'express'
import {
  createChanga,
  getChangasIniciadas,
  getChangasByTrabajador,
  getChangasByContratante,
  getChangaDetalle,
  updateChanga,
  deleteChanga,
  getChangasFinalizadasByUser,
  getChangasEnProceso,
  getChangasAbiertas,
  cerrarPostulaciones
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

// 1) Changas finalizadas para el usuario autenticado
router.get('/finalizadas', verificarToken, getChangasFinalizadasByUser);
// 2) Changas en progreso para trabajador / contratante
router.get('/enProceso', verificarToken, getChangasEnProceso);
// 3) Changas abiertas (sin asignar / iniciadas)
router.get('/abiertas', verificarToken, getChangasAbiertas);

router.post('/cerrar/:id', verificarToken, cerrarPostulaciones);



export default router
