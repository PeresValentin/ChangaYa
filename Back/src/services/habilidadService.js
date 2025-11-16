import { supabase } from '../config/supabaseClient.js'

export const createHabilidadService = async ({ nombre, esGeneral, descripcion }) => {
  const { data, error } = await supabase
    .from('Habilidad')
    .insert([{ nombre, esGeneral, descripcion }])
    .select()

  if (error) throw new Error(error.message)
  return data[0]
}

export const getHabilidadesService = async () => {
  const { data, error } = await supabase.from('Habilidad').select('*')
  if (error) throw new Error(error.message)
  return data
}

export const getHabilidadByIdService = async (id) => {
  const { data, error } = await supabase
    .from('Habilidad')
    .select('*')
    .eq('habilidadID', id)
    .single()

  if (error) throw new Error(error.message)
  return data
}

export const updateHabilidadService = async (id, campos) => {
  const { data, error } = await supabase
    .from('Habilidad')
    .update(campos)
    .eq('habilidadID', id)
    .select()

  if (error) throw new Error(error.message)
  return data[0]
}

export const deleteHabilidadService = async (id) => {
  const { error } = await supabase
    .from('Habilidad')
    .delete()
    .eq('habilidadID', id)

  if (error) throw new Error(error.message)
  return true
}
