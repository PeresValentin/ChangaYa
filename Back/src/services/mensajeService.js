import { supabase } from "../config/supabaseClient.js";

export async function crearMensaje(chatID, usuarioID, contenido, archivoAdjunto) {
  return await supabase
    .from("Mensaje")
    .insert([{ chatID, usuarioID, contenido, archivoAdjunto }])
    .select(`
      *,
      usuario:usuarioID (usuarioID, nombre, apellido, nombreUsuario)
    `)
    .single();
}

export async function obtenerMensajes(chatID) {
  return await supabase
    .from("Mensaje")
    .select(`
      *,
      usuario:usuarioID (usuarioID, nombre, apellido, nombreUsuario)
    `)
    .eq("chatID", chatID)
    .order("fecha", { ascending: true });
}
