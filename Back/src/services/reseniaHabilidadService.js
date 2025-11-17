import { supabase } from '../config/supabaseClient.js'
import { calcularPuntajeResenia } from "./reseniaService.js"

export const createReseniaHabilidadService = async ({
  reseñaID,
  habilidadID,
  calificacion
}) => {
  // 1) Crear la reseña-habilidad
  const { data, error } = await supabase
    .from('ReseñaHabilidad')
    .insert([{ reseñaID, habilidadID, calificacion }])
    .select()

  if (error) throw new Error(error.message)

  // 2) Recalcular puntaje automáticamente
  await calcularPuntajeResenia(reseñaID)

  return data[0]
}

export const getReseniaHabilidadesByReseniaService = async (reseñaID) => {
  const { data, error } = await supabase
    .from('ReseñaHabilidad')
    .select('*, Habilidad(*)')
    .eq('reseñaID', reseñaID)

  if (error) throw new Error(error.message)
  return data
}

export const deleteReseniaHabilidadService = async (id) => {
  const { error } = await supabase
    .from('ReseñaHabilidad')
    .delete()
    .eq('reseñaHabilidadID', id)

  if (error) throw new Error(error.message)
  return true
}
