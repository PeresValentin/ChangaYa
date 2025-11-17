// src/websockets/chatSocket.js
import { crearMensaje } from '../services/mensajeService.js';

export const initChatSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('🔌 Cliente conectado:', socket.id);

    // Guardamos datos básicos en el socket
    socket.data = socket.data || {};

    // Unirse a un chat
    socket.on('joinChat', ({ chatID, userID }) => {
      if (!chatID || !userID) return;

      socket.join(chatID);
      socket.data.chatID = chatID;
      socket.data.userID = userID;

      console.log(`🟢 Usuario ${userID} se unió al chat ${chatID}`);

      // Avisar al otro usuario que este está online
      socket.to(chatID).emit('userOnline', { userID });
    });

    // Enviar mensaje vía WebSocket
    socket.on('sendMessage', async ({ chatID, contenido, archivoAdjunto, userID }) => {
      try {
        const effectiveChatID = chatID || socket.data.chatID;
        const effectiveUserID = userID || socket.data.userID;

        if (!effectiveChatID || !effectiveUserID || !contenido) return;

        const { data, error } = await crearMensaje(
          effectiveChatID,
          effectiveUserID,
          contenido,
          archivoAdjunto
        );

        if (error) throw error;

        const saved = Array.isArray(data) ? data[0] : data;

        console.log(`✉️ Mensaje guardado en chat ${effectiveChatID} por ${effectiveUserID}`);

        // Broadcast a todos en la sala
        io.to(effectiveChatID).emit('nuevoMensaje', saved);
      } catch (err) {
        console.error('❌ Error en sendMessage (socket):', err);
      }
    });

    // Indicador "escribiendo..."
    socket.on('typing', ({ chatID, isTyping }) => {
      const room = chatID || socket.data.chatID;
      if (!room || !socket.data.userID) return;

      socket.to(room).emit('typing', {
        userID: socket.data.userID,
        isTyping: !!isTyping,
      });
    });

    // Abandonar chat explícitamente
    socket.on('leaveChat', ({ chatID, userID }) => {
      const room = chatID || socket.data.chatID;
      const user = userID || socket.data.userID;

      if (room) socket.leave(room);

      if (room && user) {
        console.log(`🔴 Usuario ${user} salió del chat ${room}`);
        socket.to(room).emit('userOffline', { userID: user });
      }
    });

    // Desconexión del socket
    socket.on('disconnect', () => {
      const { chatID, userID } = socket.data || {};
      if (chatID && userID) {
        socket.to(chatID).emit('userOffline', { userID });
      }
      console.log('🔌 Cliente desconectado:', socket.id);
    });
  });
};


