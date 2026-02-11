import {
  createPerfilService,
  getPerfilByUsuarioService,
  updatePerfilService,
  updatePerfilFotoByUsuarioService,
  deletePerfilService,
  getGeneralRankingService,
  getGeneralHabilitiesService,
  getTop5SpecificHabilitiesService
} from '../services/perfilService.js'
import { supabase } from '../config/supabaseClient.js'

const MAX_AVATAR_BYTES = 5 * 1024 * 1024
const ALLOWED_AVATAR_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp'
])
const AVATAR_EXTENSION_BY_TYPE = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp'
}

const parseBase64Image = (rawBase64, fallbackContentType) => {
  if (!rawBase64 || typeof rawBase64 !== 'string') {
    throw new Error('Falta la imagen en base64')
  }

  let contentType = fallbackContentType
  let base64Payload = rawBase64

  if (rawBase64.startsWith('data:')) {
    const match = rawBase64.match(/^data:([^;]+);base64,(.+)$/)
    if (!match) {
      throw new Error('Formato de imagen base64 inválido')
    }
    contentType = match[1]
    base64Payload = match[2]
  }

  const normalizedType = contentType || 'image/jpeg'
  if (!ALLOWED_AVATAR_TYPES.has(normalizedType)) {
    throw new Error('Tipo de archivo no permitido')
  }

  const buffer = Buffer.from(base64Payload, 'base64')
  if (!buffer.length) {
    throw new Error('Imagen vacía')
  }

  return { buffer, contentType: normalizedType }
}

export const createPerfil = async (req, res) => {
  try {
    const usuarioID = req.user.id   // ← viene del JWT (seguro)

    const { fotoHash, descripcion } = req.body

    const nuevoPerfil = await createPerfilService({
      usuarioID,
      fotoHash,
      descripcion
    })

    res.status(201).json(nuevoPerfil)

  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

export const getPerfilByUsuario = async (req, res) => {
  try {
    const perfil = await getPerfilByUsuarioService(req.params.id)

    // SI NO EXISTE PERFIL → responder 404
    if (!perfil) {
      return res.status(404).json({ error: "Perfil no encontrado" })
    }

    // Construimos URL SOLO si existe perfil.foto
    const fotoURL = perfil.foto
      ? perfil.foto.startsWith('http')
        ? perfil.foto
        : `${process.env.SUPABASE_URL}/storage/v1/object/public/avatars/${perfil.foto}`
      : null

    res.json({
      ...perfil,
      fotoURL
    })

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const uploadPerfilAvatar = async (req, res) => {
  try {
    const usuarioID = req.user.id
    const { imageBase64, contentType } = req.body

    if (!imageBase64) {
      return res.status(400).json({ error: 'Falta la imagen en base64' })
    }

    const perfil = await getPerfilByUsuarioService(usuarioID)
    if (!perfil) {
      return res.status(404).json({ error: 'Perfil no encontrado' })
    }

    const { buffer, contentType: resolvedType } = parseBase64Image(
      imageBase64,
      contentType
    )

    if (buffer.length > MAX_AVATAR_BYTES) {
      return res.status(413).json({ error: 'La imagen supera el tamaño permitido' })
    }

    const extension = AVATAR_EXTENSION_BY_TYPE[resolvedType]
    const filePath = `${usuarioID}/avatar.${extension}`

    if (perfil.foto && perfil.foto !== filePath) {
      await supabase.storage.from('avatars').remove([perfil.foto])
    }

    const { error: uploadError } = await supabase
      .storage
      .from('avatars')
      .upload(filePath, buffer, { contentType: resolvedType, upsert: true })

    if (uploadError) {
      return res.status(500).json({ error: uploadError.message })
    }

    const updatedPerfil = await updatePerfilFotoByUsuarioService(usuarioID, filePath)
    const fotoURL = `${process.env.SUPABASE_URL}/storage/v1/object/public/avatars/${filePath}`

    res.json({
      ...updatedPerfil,
      fotoURL
    })
  } catch (err) {
    const message = err.message || 'Error al subir avatar'
    const isBadRequest = [
      'Falta la imagen en base64',
      'Formato de imagen base64 inválido',
      'Tipo de archivo no permitido',
      'Imagen vacía'
    ].includes(message)

    res.status(isBadRequest ? 400 : 500).json({ error: message })
  }
}

export const updatePerfil = async (req, res) => {
  try {
    const data = await updatePerfilService(req.params.id, req.body)
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const deletePerfil = async (req, res) => {
  try {
    await deletePerfilService(req.params.id)
    res.json({ message: 'Perfil eliminado correctamente' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

//  1. General Ranking
export const getGeneralRanking = async (req, res) => {
  try {
    const usuarioID = req.params.usuarioID
    const result = await getGeneralRankingService(usuarioID)
    res.json(result)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

//  2. General Habilities
export const getGeneralHabilities = async (req, res) => {
  try {
    const usuarioID = req.params.usuarioID
    const result = await getGeneralHabilitiesService(usuarioID)
    res.json(result)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

//  3. Top 5 Specific Habilities
export const getTop5SpecificHabilities = async (req, res) => {
  try {
    const usuarioID = req.params.usuarioID
    const result = await getTop5SpecificHabilitiesService(usuarioID)
    res.json(result)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}