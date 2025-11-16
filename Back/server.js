import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

// Importar rutas
import usuarioRoutes from './src/routes/usuarioRoutes.js'
import changaRoutes from './src/routes/changaRoutes.js'
import postulacionRoutes from './src/routes/postulacionRoutes.js'
import habilidadRoutes from './src/routes/habilidadRoutes.js'
import reseniaRoutes from './src/routes/reseniaRoutes.js' 
import reseniaHabilidadRoutes from './src/routes/reseniaHabilidadRoutes.js'
import perfilRoutes from './src/routes/perfilRoutes.js'

const app = express()
app.use(cors())
app.use(express.json())

// Rutas principales
app.use('/api/usuarios', usuarioRoutes)
app.use('/api/changas', changaRoutes)
app.use('/api/postulaciones', postulacionRoutes)
app.use('/api/habilidad', habilidadRoutes)
app.use('/api/resenia', reseniaRoutes)
app.use('/api/reseniaHabilidad', reseniaHabilidadRoutes)
app.use('/api/perfil', perfilRoutes)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`))
