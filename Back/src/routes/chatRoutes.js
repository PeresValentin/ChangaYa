import express from "express";
import {
  createChat,
  getChatById,
  deleteChat
} from "../controllers/chatController.js";

const router = express.Router();

router.post("/", createChat);
router.get("/:id", getChatById);
router.delete("/:id", deleteChat);

export default router;

