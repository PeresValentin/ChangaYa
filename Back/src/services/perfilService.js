import { supabase } from '../config/supabaseClient.js'

export const createPerfilService = async ({ usuarioID, fotoHash, descripcion }) => {

  // 1️Validación: un usuario no puede tener más de un perfil
  const { data: existing, error: existingError } = await supabase
    .from("Perfil")
    .select("perfilID")
    .eq("usuarioID", usuarioID)
    .maybeSingle()

  if (existingError) throw new Error(existingError.message)

  if (existing) {
    throw new Error("El usuario ya tiene un perfil creado.")
  }

  // 2️Crear perfil
  const { data, error } = await supabase
    .from("Perfil")
    .insert([{
      usuarioID,
      foto: fotoHash,
      descripcion
    }])
    .select()

  if (error) throw new Error(error.message)

  return data[0]
}

export const getPerfilByUsuarioService = async (usuarioID) => {
  const { data, error } = await supabase
    .from('Perfil')
    .select('*')
    .eq('usuarioID', usuarioID)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data
}

export const updatePerfilService = async (perfilID, fields) => {
  const { data, error } = await supabase
    .from('Perfil')
    .update(fields)
    .eq('perfilID', perfilID)
    .select()

  if (error) throw new Error(error.message)
  return data[0]
}

export const deletePerfilService = async (perfilID) => {
  const { error } = await supabase
    .from('Perfil')
    .delete()
    .eq('perfilID', perfilID)

  if (error) throw new Error(error.message)
  return true
}
