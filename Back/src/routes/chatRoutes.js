// src/routes/chatRoutes.js
import express from "express";
import { verificarToken } from "../middleware/authMiddleware.js";

import {
  createChat,
  getChatById,
  deleteChat,
  getChatsByUser
} from "../controllers/chatController.js";

import {
  getMessages,
  sendMessage,
  deleteMessage
} from "../controllers/mensajeController.js";

const router = express.Router();

// CHAT CRUD
router.post("/", verificarToken, createChat);
router.get("/mine", verificarToken, getChatsByUser);
router.get("/:id", verificarToken, getChatById);
router.delete("/:id", verificarToken, deleteChat);

// MENSAJES ANIDADOS
router.get("/:chatID/mensajes", verificarToken, getMessages);
router.post("/:chatID/mensajes", verificarToken, sendMessage);
router.delete("/mensajes/:mensajeID", verificarToken, deleteMessage);

export default router;



