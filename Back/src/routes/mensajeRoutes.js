import express from "express";
import { sendMessage, getMessages } from "../controllers/mensajeController.js";

const router = express.Router();

router.get("/:chatID", getMessages);
router.post("/:chatID", sendMessage);

export default router;

