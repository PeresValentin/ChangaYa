import { supabase } from '../config/supabaseClient.js'
import argon2 from 'argon2'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET

// ✅ Obtener todos los usuarios
// ✅ Obtener todos los usuarios
export const getUsuarios = async (req, res) => {
  try {
    // Solo admin puede ver todos los usuarios
    if (req.user.rol !== 'admin') {
      return res.status(403).json({ error: 'Solo los administradores pueden ver todos los usuarios' })
    }

    const { data, error } = await supabase.from('Usuario').select('*')
    if (error) throw error

    res.status(200).json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}



// ✅ Obtener un usuario por ID
export const getUsuarioById = async (req, res) => {
  const { id } = req.params

  // Verificar permisos
  if (req.user.id !== id && req.user.rol !== 'admin') {
    return res.status(403).json({ error: 'No autorizado para modificar este usuario' })
  }

  const { data, error } = await supabase
    .from('Usuario')
    .select('*')
    .eq('usuarioID', id)
    .single()

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
}

// ✅ Crear nuevo usuario
export const createUsuario = async (req, res) => {
  try {
    const { nombreUsuario, clave, nombre, apellido, dni, email, telefono, tipoUsuario } = req.body
    if (!nombreUsuario || !dni || !email || !clave) {
      return res.status(400).json({ error: 'Faltan: nombreUsuario, dni, email o clave.' })
    }

    const passwordHash  = await argon2.hash(clave, {
      type: argon2.argon2id,
      memoryCost: 19456, // ~19MB
      timeCost: 2,
      parallelism: 1
    })

    const { data, error } = await supabase
      .from('Usuario')
      .insert([{
        nombreUsuario,
        nombre,
        apellido,
        dni,          
        email,
        telefono,
        tipoUsuario,
        clave: passwordHash   // 👈 se guarda el hash en la columna 'clave'
      }])
      .select()

    if (error) throw error
    
    const sanitized = data.map(({ clave, ...rest }) => rest)
    res.status(201).json(sanitized)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

// Login: verifica el hash
export const loginUsuario = async (req, res) => {
  try {
    const { email, clave } = req.body
    if (!email || !clave) {
      return res.status(400).json({ error: 'Faltan email o clave.' })
    }

    const { data: user, error } = await supabase
      .from('Usuario')
      .select('usuarioID, nombreUsuario, email, clave, tipoUsuario')
      .eq('email', email)
      .single()

    if (error || !user) {
      return res.status(401).json({ error: 'Usuario no encontrado o credenciales inválidas' })
    }

    const valid = await argon2.verify(user.clave, clave)
    if (!valid) {
      return res.status(401).json({ error: 'Contraseña incorrecta' })
    }

    const { clave: _, ...safeUser } = user

    // ✅ Generar token
    const token = jwt.sign(
      { id: user.usuarioID, email: user.email, rol: user.tipoUsuario },
      JWT_SECRET,
      { expiresIn: '30d' } // token válido por 30 días
    )

    res.json({ message: 'Login exitoso', token, user: safeUser })
  } catch (err) {
    console.error('Error en login:', err)
    res.status(500).json({ error: err.message })
  }
}

// ✅ Actualizar usuario
export const updateUsuario = async (req, res) => {
  const { id } = req.params
  const updates = req.body

  // Verificar permisos
  if (req.user.id !== id && req.user.rol !== 'admin') {
    return res.status(403).json({ error: 'No autorizado para modificar este usuario' })
  }

  const { data, error } = await supabase
    .from('Usuario')
    .update(updates)
    .eq('usuarioID', id)
    .select()

  if (error) return res.status(400).json({ error: error.message })
  res.json(data)
}

// ✅ Eliminar usuario
export const deleteUsuario = async (req, res) => {
  const { id } = req.params
  
  // Verificar permisos
  if (req.user.id !== id && req.user.rol !== 'admin') {
    return res.status(403).json({ error: 'No autorizado para modificar este usuario' })
  }

  const { error } = await supabase
    .from('Usuario')
    .delete()
    .eq('usuarioID', id)

  if (error) return res.status(400).json({ error: error.message })
  res.json({ message: 'Usuario eliminado correctamente' })
}
