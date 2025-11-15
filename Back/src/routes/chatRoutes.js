import express from "express";
import {
  createChat,
  getChatById,
  deleteChat,
  getUserChats
} from "../controllers/chatController.js";
import { verificarToken } from '../middleware/authMiddleware.js'

const router = express.Router();

router.post("/", verificarToken, createChat);
router.get("/:id", verificarToken, getChatById);
router.delete("/:id", verificarToken, deleteChat);

router.get("/mis-chats", verificarToken, getUserChats);

export default router;

