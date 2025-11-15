// services/chatService.js
import { supabase } from "../config/supabaseClient.js";

export async function crearChat(usuario1, usuario2) {
  return await supabase
    .from("Chat")
    .insert([{ usuario1, usuario2 }])
    .select()
    .single();
}

export async function obtenerChatPorId(chatID) {
  return await supabase
    .from("Chat")
    .select(`
      *,
      mensajes: mensajeID (*)
    `)
    .eq("chatID", chatID)
    .single();
}

export async function borrarChat(chatID) {
  return await supabase
    .from("Chat")
    .delete()
    .eq("chatID", chatID);
}
