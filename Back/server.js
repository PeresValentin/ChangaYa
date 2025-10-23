import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

// Importar rutas
import usuarioRoutes from './src/routes/usuarioRoutes.js'
import changaRoutes from './src/routes/changaRoutes.js'

const app = express()
app.use(cors())
app.use(express.json())

// Rutas principales
app.use('/api/usuarios', usuarioRoutes)
app.use('/api/changas', changaRoutes)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`))
