// websockets/chatSocket.js

export function chatSocket(io) {
  io.on("connection", (socket) => {
    console.log("🟢 Usuario conectado al chat");

    socket.on("joinChat", (chatID) => {
      socket.join(chatID);
    });

    socket.on("nuevoMensaje", (msg) => {
      io.to(msg.chatID).emit("mensajeRecibido", msg);
    });

    socket.on("disconnect", () => {
      console.log("🔴 Usuario desconectado del chat");
    });
  });
}
