import express from 'express'
import {
  createPostulacion,
  getPostulacionesByTrabajador,
  getPostulacionesByChanga,
  updatePostulacion,
  deletePostulacion
} from '../controllers/postulacionController.js'

import { verificarToken } from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/', verificarToken, createPostulacion)                       // Crear postulación (trabajador)
router.get('/mis', verificarToken, getPostulacionesByTrabajador)          // Ver mis propias postulaciones (trabajador)
router.get('/changa/:changaID', verificarToken, getPostulacionesByChanga) // Ver postulaciones de una changa (contratante/admin)
router.put('/:postulacionID', verificarToken, updatePostulacion)          // Actualizar estado de postulacion (contratante/admin)
router.delete('/:postulacionID', verificarToken, deletePostulacion)       // Eliminar postulación (dueño o admin)

export default router
