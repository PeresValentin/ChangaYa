import { supabase } from '../config/supabaseClient.js'
import { createReseniaService } from './reseniaService.js'

export const finalizarChangaService = async (changaID, userID) => {

  // 1) Obtener changa
  const { data: changa, error: chErr } = await supabase
    .from("Changa")
    .select("*")
    .eq("changaID", changaID)
    .single();

  if (chErr) throw new Error("No se pudo obtener la changa.");

  // 2) Validar que quien cierra sea el contratante
  if (changa.contratanteID !== userID) {
    throw new Error("Solo el contratante puede finalizar la changa.");
  }

  // 3) Validar estado actual
  if (changa.estado !== "enProceso") {
    throw new Error("La changa debe estar en estado 'enProceso'.");
  }

  // 4) Validar trabajadores asociados
  const trabajadores = Array.isArray(changa.trabajadores) ? changa.trabajadores : [];

  if (trabajadores.length === 0) {
    throw new Error("No se puede finalizar la changa sin trabajadores asignados.");
  }

  // 5) Crear reseñas pendientes
  const reseniasCreadas = [];

  // ---- A) Reseñas del CONTRATANTE hacia cada trabajador ----
  for (const trabajadorID of trabajadores) {
    const resenia = await createReseniaService({
      comentario: null,
      changaID,
      usuarioID: userID,            // CONTRATANTE califica
      destinatarioID: trabajadorID  // trabajador recibido
    });
    reseniasCreadas.push(resenia);
  }

  // ---- B) Reseña del TRABAJADOR hacia CONTRATANTE ----
  for (const trabajadorID of trabajadores) {
    const resenia = await createReseniaService({
      comentario: null,
      changaID,
      usuarioID: trabajadorID,     // trabajador califica
      destinatarioID: userID       // contratante recibe
    });
    reseniasCreadas.push(resenia);
  }

  // 6) Actualizar estado de la changa
  const { error: updError } = await supabase
    .from("Changa")
    .update({ estado: "finalizada" })
    .eq("changaID", changaID);

  if (updError) throw new Error("No se pudo actualizar la changa.");

  return {
    message: "Changa finalizada correctamente.",
    reseniasGeneradas: reseniasCreadas.length,
    resenias: reseniasCreadas
  };
};
