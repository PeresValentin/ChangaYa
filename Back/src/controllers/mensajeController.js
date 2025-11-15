// controllers/mensajeController.js
import { crearMensaje, obtenerMensajes } from "../services/mensajeService.js";

export const sendMessage = async (req, res) => {
  try {
    const user = req.user;
    const { chatID } = req.params;
    const { contenido, archivoAdjunto } = req.body;

    if (!contenido) return res.status(400).json({ error: "El mensaje no puede estar vacío" });

    const { data, error } = await crearMensaje(chatID, user.id, contenido, archivoAdjunto);
    if (error) throw error;

    // Luego acá enchufás WebSockets
    // io.to(chatID).emit("mensajeRecibido", data);

    res.status(201).json(data);
  } catch (err) {
    console.error("Error en sendMessage:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { chatID } = req.params;

    const { data, error } = await obtenerMensajes(chatID);
    if (error) throw error;

    res.status(200).json(data);
  } catch (err) {
    console.error("Error en getMessages:", err);
    res.status(500).json({ error: err.message });
  }
};

