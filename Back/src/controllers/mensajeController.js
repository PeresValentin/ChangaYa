// src/controllers/mensajeController.js
import {
  crearMensaje,
  obtenerMensajesPorChat,
  borrarMensaje
} from "../services/mensajeService.js";

export const getMessages = async (req, res) => {
  try {
    const { chatID } = req.params;

    const { data, error } = await obtenerMensajesPorChat(chatID);
    if (error) throw error;

    res.status(200).json(data);
  } catch (err) {
    console.error("Error en getMessages:", err);
    res.status(500).json({ error: err.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const user = req.user;
    const { chatID } = req.params;
    const { contenido, archivoAdjunto } = req.body;

    if (!contenido || !contenido.trim()) {
      return res.status(400).json({ error: "El mensaje no puede estar vacío" });
    }

    const { data, error } = await crearMensaje(
      chatID,
      user.id,
      contenido,
      archivoAdjunto
    );

    if (error) throw error;

    // Websocket listo para usar
    // io.to(chatID).emit("nuevoMensaje", data[0]);

    res.status(201).json(data[0]);
  } catch (err) {
    console.error("Error en sendMessage:", err);
    res.status(500).json({ error: err.message });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const user = req.user;
    const { mensajeID } = req.params;

    const { error } = await borrarMensaje(mensajeID, user.id);
    if (error) return res.status(403).json({ error });

    res.status(204).send();
  } catch (err) {
    console.error("Error en deleteMessage:", err);
    res.status(500).json({ error: err.message });
  }
};


