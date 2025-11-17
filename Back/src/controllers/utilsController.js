// controllers/utilsController.js
import axios from "axios";

export const geocodeAddress = async (req, res) => {
  try {
    const q = req.query.q;

    if (!q) {
      return res.status(400).json({ error: "Parámetro 'q' requerido" });
    }

    const response = await axios.get(
      "https://nominatim.openstreetmap.org/search",
      {
        params: {
          q,
          format: "json",
          limit: 1
        },
        headers: {
          "User-Agent": "ChangaYa-App",
          "Accept-Language": "es"
        }
      }
    );

    const data = response.data;

    if (!data || !data.length) {
      return res.status(404).json({ error: "Dirección no encontrada" });
    }

    const { lat, lon } = data[0];

    return res.json({ lat, lon });
  } catch (error) {
    console.error("Error geocoding:", error.response?.data || error.message);
    return res.status(500).json({
      error: "Error consultando geocodificación",
      detail: error.response?.data || error.message,
    });
  }
};
