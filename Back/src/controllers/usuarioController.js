import { supabase } from '../config/supabaseClient.js'

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

    const password_hash = await argon2.hash(clave, {
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
        dni,          // si vas a cifrar DNI, ver sección 2
        email,
        telefono,
        tipoUsuario,
        password_hash // guarda hash aquí
      }])
      .select()

    if (error) throw error
    // Nunca devuelvas la clave ni el hash
    const sanitized = data.map(({ password_hash, ...rest }) => rest)
    res.status(201).json(sanitized)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

// Login: verifica el hash
export const loginUsuario = async (req, res) => {
  try {
    const { email, clave } = req.body
    if (!email || !clave) return res.status(400).json({ error: 'Email y clave requeridos' })

    const { data: user, error } = await supabase
      .from('Usuario')
      .select('usuarioID, nombreUsuario, email, password_hash, tipoUsuario')
      .eq('email', email)
      .single()

    if (error || !user) return res.status(401).json({ error: 'Credenciales inválidas' })

    const ok = await argon2.verify(user.password_hash, clave)
    if (!ok) return res.status(401).json({ error: 'Credenciales inválidas' })

    // Aquí podrías emitir un JWT si querés
    const { password_hash, ...safe } = user
    res.json({ user: safe })
  } catch (err) {
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
