// controllers/chatController.js
import { crearChat, obtenerChatPorId, borrarChat, obtenerChatsDeUsuario } from '../services/chatService.js';

export const createChat = async (req, res) => {
  try {
    const user = req.user;
    const { usuario2 } = req.body;

    // Solo contratante o admin inicializan chat
    if (!["contratante", "admin"].includes(user.rol)) {
      return res.status(403).json({ error: "No autorizado para iniciar chats" });
    }

    if (!usuario2) {
      return res.status(400).json({ error: "Falta usuario destino" });
    }

    const { data, error } = await crearChat(user.id, usuario2);
    if (error) throw error;

    res.status(201).json({ message: "Chat creado correctamente", data });
  } catch (err) {
    console.error("Error en createChat:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getChatById = async (req, res) => {
  try {
    const user = req.user;
    const chatID = req.params.id;

    const { data: chat, error } = await obtenerChatPorId(chatID);
    if (error) throw error;

    if (!chat) return res.status(404).json({ error: "Chat no encontrado" });

    // Usuario debe pertenecer al chat
    if (![chat.usuario1, chat.usuario2].includes(user.id) && user.rol !== "admin") {
      return res.status(403).json({ error: "No autorizado para ver este chat" });
    }

    res.status(200).json(chat);
  } catch (err) {
    console.error("Error en getChatById:", err);
    res.status(500).json({ error: err.message });
  }
};

export const deleteChat = async (req, res) => {
  try {
    const user = req.user;
    const chatID = req.params.id;

    const { data: chat } = await obtenerChatPorId(chatID);
    if (!chat) return res.status(404).json({ error: "Chat no encontrado" });

    // Solo usuario1, usuario2 o admin pueden borrar
    const pertenece = [chat.usuario1, chat.usuario2].includes(user.id);
    if (!pertenece && user.rol !== "admin") {
      return res.status(403).json({ error: "No autorizado para eliminar este chat" });
    }

    const { error } = await borrarChat(chatID);
    if (error) throw error;

    res.status(200).json({ message: "Chat eliminado correctamente" });
  } catch (err) {
    console.error("Error en deleteChat:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getUserChats = async (req, res) => {
  try {
    const user = req.user;

    const { data: chats, error } = await obtenerChatsDeUsuario(user.id);
    if (error) throw error;

    const response = chats.map(chat => {
      const esUsuario1 = chat.usuario1 === user.id;

      const otro = esUsuario1 ? chat.usuario2Info : chat.usuario1Info;

      // ordenar mensajes por fecha y tomar el último
      const ultimoMensaje = [...(chat.mensajes || [])].sort(
        (a, b) => new Date(b.fecha) - new Date(a.fecha)
      )[0] || null;

      return {
        chatID: chat.chatID,
        con: otro,
        ultimoMensaje
      };
    });

    res.status(200).json(response);

  } catch (err) {
    console.error("❌ Error en getUserChats:", err);
    res.status(500).json({ error: err.message });
  }
};

