import { crearMensaje, obtenerMensajes } from "../services/mensajeService.js";

export const sendMessage = async (req, res) => {
  try {
    const user = req.user;
    const { chatID } = req.params;
    const { contenido, archivoAdjunto } = req.body;

    const { data, error } = await crearMensaje(chatID, user.id, contenido, archivoAdjunto);
    if (error) throw error;

    // Luego acá enchufás el websocket:
    // io.to(chatID).emit("mensajeRecibido", data);

    res.status(201).json(data);
  } catch (err) {
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
    res.status(500).json({ error: err.message });
  }
};
