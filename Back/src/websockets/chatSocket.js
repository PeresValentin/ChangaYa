// websockets/chatSocket.js

// chatSocket.js
export function initChatSocket(io) {
  console.log("🔌 WebSocket de Chat inicializado.");

  io.on("connection", (socket) => {
    console.log("✨ Usuario conectado al WebSocket:", socket.id);

    // Prepáralo para rooms por chat
    socket.on("join_chat", (chatID) => {
      console.log(`📥 Usuario se une al chat: ${chatID}`);
      socket.join(chatID);
    });

    // Recibir un mensaje y reenviarlo a la room correspondiente
    socket.on("nuevo_mensaje", ({ chatID, mensaje }) => {
      console.log("💬 Mensaje recibido:", mensaje);
      io.to(chatID).emit("mensaje_recibido", mensaje);
    });

    socket.on("disconnect", () => {
      console.log("❌ Usuario desconectado:", socket.id);
    });
  });
}

