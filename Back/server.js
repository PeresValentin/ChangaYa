// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import { initChatSocket } from "./src/websockets/chatSocket.js";

// Load env
dotenv.config();

// Express app
const app = express();
app.use(cors());
app.use(express.json());

// HTTP + Websocket server
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

// Inicializar sockets
initChatSocket(io);

// Rutas
import usuarioRoutes from "./src/routes/usuarioRoutes.js";
import changaRoutes from "./src/routes/changaRoutes.js";
import postulacionRoutes from "./src/routes/postulacionRoutes.js";
import chatRoutes from "./src/routes/chatRoutes.js";

app.use("/api/usuarios", usuarioRoutes);
app.use("/api/changas", changaRoutes);
app.use("/api/postulaciones", postulacionRoutes);
app.use("/api/chats", chatRoutes);

// Puerto
const PORT = process.env.PORT || 3000;

// 🚀 IMPORTANTE → SOLO SE USA server.listen()
server.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});

