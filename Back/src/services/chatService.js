// services/chatService.js
import { supabase } from "../config/supabaseClient.js";

export const crearChat = async (usuario1, usuario2) => {
  return await supabase
    .from("Chat")
    .insert([{ usuario1, usuario2 }])
    .select();
};

export const obtenerChatPorId = async (chatID) => {
  const { data, error } = await supabase
    .from("Chat")
    .select(`
      *,
      usuario1:usuario1 (*),
      usuario2:usuario2 (*),
      mensajes:Mensaje (*)
    `)
    .eq("chatID", chatID)
    .single();

  return { data, error };
};

export const borrarChat = async (chatID) => {
  return await supabase.from("Chat").delete().eq("chatID", chatID);
};

export const obtenerChatsDeUsuario = async (userID) => {
  try {
    // 1) Obtener los chats donde participa el usuario
    const { data: chats, error } = await supabase
      .from("Chat")
      .select(`
        chatID,
        fechaInicio,
        usuario1:usuario1 (*),
        usuario2:usuario2 (*)
      `)
      .or(`usuario1.eq.${userID},usuario2.eq.${userID}`)
      .order("fechaInicio", { ascending: false });

    if (error) return { data: null, error };

    // 2) Para cada chat buscar SOLO el último mensaje
    const resultado = await Promise.all(
      chats.map(async (chat) => {
        const { data: ultimoMensaje } = await supabase
          .from("Mensaje")
          .select("*")
          .eq("chatID", chat.chatID)
          .order("fecha", { ascending: false })
          .limit(1)
          .maybeSingle(); // devuelve null si no hay mensajes

        return {
          chatID: chat.chatID,
          fechaInicio: chat.fechaInicio,
          // determinar cuál es el otro usuario
          otroUsuario:
            chat.usuario1.usuarioID === userID
              ? chat.usuario2
              : chat.usuario1,
          ultimoMensaje:
            ultimoMensaje?.contenido || null,
          fechaUltimoMensaje:
            ultimoMensaje?.fecha || null
        };
      })
    );

    return { data: resultado, error: null };
  } catch (err) {
    return { data: null, error: err.message };
  }
};