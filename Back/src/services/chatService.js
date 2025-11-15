import { supabase } from "../config/supabaseClient.js";

// Crear chat
export async function crearChat(usuario1, usuario2) {
  return await supabase
    .from("Chat")
    .insert([{ usuario1, usuario2 }])
    .select()
    .single();
}

// Obtener chat por ID con mensajes y usuarios
export async function obtenerChatPorId(chatID) {
  return await supabase
    .from("Chat")
    .select(`
      *,
      usuario1Info:usuario1 (usuarioID, nombre, apellido, nombreUsuario, email),
      usuario2Info:usuario2 (usuarioID, nombre, apellido, nombreUsuario, email),
      mensajes (
        mensajeID,
        fecha,
        contenido,
        archivoAdjunto,
        usuarioID,
        usuario:usuarioID (usuarioID, nombre, apellido, nombreUsuario)
      )
    `)
    .eq("chatID", chatID)
    .single();
}

// Borrar chat
export async function borrarChat(chatID) {
  return await supabase.from("Chat").delete().eq("chatID", chatID);
}

// Obtener todos los chats de un usuario con mensajes y usuarios
export async function obtenerChatsDeUsuario(userID) {
  return await supabase
    .from("Chat")
    .select(`
      chatID,
      usuario1,
      usuario2,
      fechaInicio,
      mensajes:Mensaje (
        contenido,
        fecha
      ),
      usuario1Info:usuario1 (
        usuarioID,
        nombre,
        apellido,
        nombreUsuario,
        email
      ),
      usuario2Info:usuario2 (
        usuarioID,
        nombre,
        apellido,
        nombreUsuario,
        email
      )
    `)
    .or(`usuario1.eq.${userID},usuario2.eq.${userID}`);
}
