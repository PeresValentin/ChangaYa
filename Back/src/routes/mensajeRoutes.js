import express from "express";
import { sendMessage, getMessages } from "../controllers/mensajeController.js";
import { verificarToken } from '../middleware/authMiddleware.js'

const router = express.Router();

router.get("/:chatID", verificarToken, getMessages);
router.post("/:chatID", verificarToken, sendMessage);

export default router;

