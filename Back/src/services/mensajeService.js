// src/services/mensajeService.js
import { supabase } from "../config/supabaseClient.js";

// Obtener mensajes de un chat
export const obtenerMensajesPorChat = async (chatID) => {
  return await supabase
    .from("Mensaje")
    .select("*")
    .eq("chatID", chatID)
    .order("fecha", { ascending: true });
};

// Crear un mensaje
export const crearMensaje = async (chatID, usuarioID, contenido, archivoAdjunto) => {
  return await supabase
    .from("Mensaje")
    .insert([
      {
        chatID,
        usuarioID,
        contenido,
        archivoAdjunto: archivoAdjunto || null,
        fecha: new Date().toISOString()
      }
    ])
    .select();
};

// Eliminar mensaje
export const borrarMensaje = async (mensajeID, usuarioID) => {
  const { data: mensaje } = await supabase
    .from("Mensaje")
    .select("usuarioID")
    .eq("mensajeID", mensajeID)
    .single();

  if (!mensaje) return { error: "Mensaje no encontrado" };
  if (mensaje.usuarioID !== usuarioID) return { error: "No autorizado" };

  return await supabase
    .from("Mensaje")
    .delete()
    .eq("mensajeID", mensajeID);
};
