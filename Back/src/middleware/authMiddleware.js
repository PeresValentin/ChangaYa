import jwt from 'jsonwebtoken'
const JWT_SECRET = process.env.JWT_SECRET 

// Middleware para validar el token
export const verificarToken = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return res.status(401).json({ error: 'Falta el encabezado Authorization' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded // { id, email, rol }
    next()
  } catch (err) {
    res.status(401).json({ error: 'Token inválido o expirado' })
  }
}
