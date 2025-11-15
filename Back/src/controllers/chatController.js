// controllers/chatController.js
import { crearChat, obtenerChatPorId, borrarChat } from "../services/chatService.js";

export const createChat = async (req, res) => {
  try {
    const user = req.user;
    const { usuario2 } = req.body;

    if (!["contratante", "admin"].includes(user.rol)) {
      return res.status(403).json({ error: "No autorizado para iniciar chats" });
    }

    const { data, error } = await crearChat(user.id, usuario2);
    if (error) throw error;

    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getChatById = async (req, res) => {
  try {
    const { data, error } = await obtenerChatPorId(req.params.id);
    if (error) throw error;

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteChat = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;

    const chat = await obtenerChatPorId(id);
    if (!chat.data) return res.status(404).json({ error: "Chat no encontrado" });

    const pertenece = [chat.data.usuario1, chat.data.usuario2].includes(user.id);
    if (!pertenece && user.rol !== "admin") {
      return res.status(403).json({ error: "No autorizado" });
    }

    const { error } = await borrarChat(id);
    if (error) throw error;

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

