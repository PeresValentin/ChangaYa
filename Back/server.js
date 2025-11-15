import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { chatSocket } from "./websockets/chatSocket.js";

dotenv.config()

// Importar rutas
import usuarioRoutes from './src/routes/usuarioRoutes.js'
import changaRoutes from './src/routes/changaRoutes.js'
import postulacionRoutes from './src/routes/postulacionRoutes.js'

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
chatSocket(io);

const app = express()
app.use(cors())
app.use(express.json())
//un comentario de prueba
// Rutas principales
app.use('/api/usuarios', usuarioRoutes)
app.use('/api/changas', changaRoutes)
app.use('/api/postulaciones', postulacionRoutes)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`))
server.listen(3000);
