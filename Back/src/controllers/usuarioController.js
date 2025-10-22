import { supabase } from '../config/supabaseClient.js'
import argon2 from 'argon2'

// ✅ Obtener todos los usuarios
export const getUsuarios = async (req, res) => {
  const { data, error } = await supabase.from('Usuario').select('*')
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
}

// ✅ Obtener un usuario por ID
export const getUsuarioById = async (req, res) => {
  const { id } = req.params
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

    // Buscar usuario por email
    const { data: user, error } = await supabase
      .from('Usuario')
      .select('usuarioID, nombreUsuario, email, clave, tipoUsuario')
      .eq('email', email)
      .single()

    if (error || !user) {
      return res.status(401).json({ error: 'Usuario no encontrado o credenciales inválidas' })
    }

    // Verificar hash de la clave
    const valid = await argon2.verify(user.clave, clave)
    if (!valid) {
      return res.status(401).json({ error: 'Contraseña incorrecta' })
    }

    // ✅ Si pasa, devolvemos datos básicos (sin la clave)
    const { clave: _, ...safeUser } = user
    res.json({ message: 'Login exitoso', user: safeUser })

  } catch (err) {
    console.error('Error en login:', err)
    res.status(500).json({ error: err.message })
  }
}

// ✅ Actualizar usuario
export const updateUsuario = async (req, res) => {
  const { id } = req.params
  const updates = req.body

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

  const { error } = await supabase
    .from('Usuario')
    .delete()
    .eq('usuarioID', id)

  if (error) return res.status(400).json({ error: error.message })
  res.json({ message: 'Usuario eliminado correctamente' })
}
