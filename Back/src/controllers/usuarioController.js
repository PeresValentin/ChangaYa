import { supabase } from '../config/supabaseClient.js'
import argon2 from 'argon2'
import jwt from 'jsonwebtoken'
import { transporter } from '../config/mailer.js'

const JWT_EMAIL_SECRET = process.env.JWT_EMAIL_SECRET
const JWT_SECRET = process.env.JWT_SECRET

const capitalize = (str = "") =>
  str
    .toLowerCase()
    .trim()
    .replace(/^\w/, c => c.toUpperCase());


// Obtener todos los usuarios
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

// Obtener un usuario por ID
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

// Obtener un usuario para vista pública (solo lectura)
export const getUsuarioPublicProfile = async (req, res) => {
  try {
    const { id } = req.params

    const { data, error } = await supabase
      .from('Usuario')
      .select('*')
      .eq('usuarioID', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Usuario no encontrado' })
      }
      throw error
    }

    if (!data) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }

    const { clave, dni, ...publicUser } = data
    return res.status(200).json(publicUser)
  } catch (err) {
    console.error('Error en getUsuarioPublicProfile:', err)
    return res.status(500).json({ error: err.message })
  }
}


const getSuccessHtml = () => {
    // Es la misma función que te pasé antes
    const FRONTEND_LOGIN_URL = process.env.FRONTEND_LOGIN_URL || '#';
    return `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>¡Cuenta Verificada!</title>
            <style>
                /* Estilos copiados del mail para coherencia */
                body { margin:0; padding:0; background-color:#f5f7f2; font-family:'Helvetica Neue',Arial,sans-serif; color:#1f2a24; display:flex; justify-content:center; align-items:center; min-height:100vh; box-sizing:border-box; }
                .container { max-width:600px; width:90%; background-color:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 8px 24px rgba(20,34,25,0.08); }
                .header { background:linear-gradient(120deg,#5f7c4b,#7ea463); padding:32px 40px; text-align:left; }
                .header p { margin:0; font-size:14px; letter-spacing:1px; text-transform:uppercase; color:#e8f2dc; font-weight:600; }
                .header h1 { margin:8px 0 0; font-size:26px; line-height:1.3; color:#ffffff; font-weight:700; }
                .content { padding:32px 40px; text-align:center; }
                .content h2 { color:#5f7c4b; font-size:28px; margin-bottom:20px; }
                .content p { font-size:18px; line-height:1.6; color:#2f3a32; margin-bottom:24px; }
                .footer { padding:24px 40px; border-top:1px solid #e6ebdf; background-color:#f9faf6; text-align:center; }
                .footer p { margin:0; font-size:12px; color:#8b9689; }
                .button { display:inline-block; padding:14px 32px; font-size:16px; font-weight:600; color:#ffffff; text-decoration:none; background-color:#5f7c4b; border-radius:999px; transition:background-color 0.3s; }
                .button:hover { background-color:#4b633d; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <p>ChangaYa!</p>
                    <h1>¡Cuenta Activada con Éxito!</h1>
                </div>
                <div class="content">
                    <h2>🎉 ¡Verificación Completa!</h2>
                    <p>
                        Tu cuenta en <strong>ChangaYa!</strong> ha sido verificada y activada correctamente. 
                        Ya puedes iniciar sesión en la aplicación y comenzar a usar el servicio.
                    </p>
                </div>
                <div class="footer">
                    <p>© ${new Date().getFullYear()} ChangaYa! · ¡A buscar changas!</p>
                </div>
            </div>
        </body>
        </html>
    `;
};

const getErrorHtml = (errorMessage = 'El enlace de verificación ha caducado o es inválido.') => {
    // Usamos colores de error (rojo/naranja) pero mantenemos la estructura
    const FRONTEND_REGISTRO_URL = process.env.FRONTEND_REGISTRO_URL || '#';
    return `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Error de Verificación</title>
            <style>
                /* Estilos base */
                body { margin:0; padding:0; background-color:#f5f7f2; font-family:'Helvetica Neue',Arial,sans-serif; color:#1f2a24; display:flex; justify-content:center; align-items:center; min-height:100vh; box-sizing:border-box; }
                .container { max-width:600px; width:90%; background-color:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 8px 24px rgba(20,34,25,0.08); }
                .header { background:linear-gradient(120deg, #bb3737, #d45e5e); padding:32px 40px; text-align:left; } /* Color de Error */
                .header p { margin:0; font-size:14px; letter-spacing:1px; text-transform:uppercase; color:#f0d7d7; font-weight:600; }
                .header h1 { margin:8px 0 0; font-size:26px; line-height:1.3; color:#ffffff; font-weight:700; }
                .content { padding:32px 40px; text-align:center; }
                .content h2 { color:#bb3737; font-size:28px; margin-bottom:20px; } /* Color de Error */
                .content p { font-size:18px; line-height:1.6; color:#2f3a32; margin-bottom:24px; }
                .footer { padding:24px 40px; border-top:1px solid #e6ebdf; background-color:#f9faf6; text-align:center; }
                .footer p { margin:0; font-size:12px; color:#8b9689; }
                .button { display:inline-block; padding:14px 32px; font-size:16px; font-weight:600; color:#ffffff; text-decoration:none; background-color:#bb3737; border-radius:999px; transition:background-color 0.3s; } /* Color de Error */
                .button:hover { background-color:#9e2a2a; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <p>ChangaYa!</p>
                    <h1>Error de Verificación</h1>
                </div>
                <div class="content">
                    <h2>⚠️ ¡Algo Salió Mal!</h2>
                    <p>
                        ${errorMessage}
                    </p>
                    <p>
                        Por favor, intentá registrarte nuevamente.
                    </p>
                    <a href="${FRONTEND_REGISTRO_URL}" class="button">
                        Ir a Registro
                    </a>
                </div>
                <div class="footer">
                    <p>© ${new Date().getFullYear()} ChangaYa!</p>
                </div>
            </div>
        </body>
        </html>
    `;
};


// Crear nuevo usuario
export const createUsuario = async (req, res) => {
  try {
    let { nombreUsuario, clave, nombre, apellido, dni, email, telefono, tipoUsuario } = req.body;

    // Normalizar nombre y apellido
    nombre = capitalize(nombre);
    apellido = capitalize(apellido);

    if (!nombreUsuario || !dni || !email || !clave) {
      return res.status(400).json({ error: 'Faltan: nombreUsuario, dni, email o clave.' })
    }

    // Hashear la clave (como antes)
    const passwordHash = await argon2.hash(clave, {
      type: argon2.argon2id,
      memoryCost: 19456,
      timeCost: 2,
      parallelism: 1
    })

    const API_BASE_URL = process.env.API_BASE_URL

    // Generar token de verificación por 30 minutos
    const verificationToken = jwt.sign(
      { nombreUsuario, passwordHash, nombre, apellido, dni, email, telefono, tipoUsuario },
      JWT_EMAIL_SECRET,
      { expiresIn: '30m' }
    )

    // Link de verificación (podés reemplazar localhost por tu dominio)
    const verificationLink = `${API_BASE_URL}/api/usuarios/verificar?token=${verificationToken}`

    const displayName = nombre || nombreUsuario || 'Changayer'

    // Enviar el mail
    await transporter.sendMail({
      from: `"ChangaYa!" <${process.env.MAIL_USER}>`,
      to: email,
      subject: 'Verificá tu cuenta en ChangaYa!',
       html: `<!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Verificación de cuenta</title>
        </head>
        <body style="margin:0;padding:0;background-color:#f5f7f2;font-family:'Helvetica Neue',Arial,sans-serif;color:#1f2a24;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f5f7f2;padding:24px 0;">
            <tr>
              <td align="center">
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 24px rgba(20,34,25,0.08);">
                  <tr>
                    <td style="background:linear-gradient(120deg,#5f7c4b,#7ea463);padding:32px 40px;text-align:left;">
                      <p style="margin:0;font-size:14px;letter-spacing:1px;text-transform:uppercase;color:#e8f2dc;font-weight:600;">ChangaYa!</p>
                      <h1 style="margin:8px 0 0;font-size:26px;line-height:1.3;color:#ffffff;font-weight:700;">Confirmá tu cuenta</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:32px 40px;">
                      <p style="margin:0 0 16px;font-size:16px;">Hola <strong>${displayName}</strong>,</p>
                      <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#2f3a32;">
                        ¡Gracias por unirte a <strong>ChangaYa!</strong> Solo falta un paso para activar tu cuenta.
                        Por favor verificá tu correo haciendo clic en el botón inferior. El enlace caduca en 30 minutos.
                      </p>
                      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:32px 0;">
                        <tr>
                          <td align="center" bgcolor="#5f7c4b" style="border-radius:999px;">
                            <a href="${verificationLink}" target="_blank" style="display:inline-block;padding:14px 32px;font-size:16px;font-weight:600;color:#ffffff;text-decoration:none;font-family:'Helvetica Neue',Arial,sans-serif;">
                              Verificar cuenta
                            </a>
                          </td>
                        </tr>
                      </table>
                      <p style="margin:0 0 8px;font-size:14px;color:#566354;">Si el botón no funciona, copiá y pegá este enlace en tu navegador:</p>
                      <p style="margin:0;font-size:13px;word-break:break-all;color:#7b8979;"><a href="${verificationLink}" target="_blank" style="color:#5f7c4b;text-decoration:none;">${verificationLink}</a></p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:24px 40px;border-top:1px solid #e6ebdf;background-color:#f9faf6;text-align:center;">
                      <p style="margin:0 0 4px;font-size:12px;color:#8b9689;">Este correo se envió automáticamente, por favor no respondas.</p>
                      <p style="margin:0;font-size:12px;color:#8b9689;">© ${new Date().getFullYear()} ChangaYa! · Todos los derechos reservados</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>`
    })

    res.status(200).json({
      message: 'Correo de verificación enviado. Tenés 30 minutos para confirmarlo.'
    })

  } catch (err) {
    console.error('Error en registro temporal:', err)
    res.status(400).json({ error: err.message })
  }
}

export const verificarUsuario = async (req, res) => {
  try {
    const { token } = req.query
    if (!token) {
        // En lugar de JSON, enviamos la vista de error
        res.setHeader('Content-Type', 'text/html');
        return res.status(400).send(getErrorHtml('Falta el token de verificación.'));
    }

    // Verificar token de 30 minutos
    const decoded = jwt.verify(token, JWT_EMAIL_SECRET)

    // Crear usuario definitivo
    const { data: usuarioInsertado, error } = await supabase
      .from('Usuario')
      .insert([{
        nombreUsuario: decoded.nombreUsuario,
        nombre: decoded.nombre,
        apellido: decoded.apellido,
        dni: decoded.dni,
        email: decoded.email,
        telefono: decoded.telefono,
        tipoUsuario: decoded.tipoUsuario,
        clave: decoded.passwordHash
      }])
      .select()

    if (error) throw error

    const nuevoUsuario = usuarioInsertado[0]

    /* ---------------------------------------------
       🟢 CREAR PERFIL AUTOMÁTICO PARA EL USUARIO
       --------------------------------------------- */

    const descripcionPlaceholder = `
      ¡Hola! Soy ${nuevoUsuario.nombre} ${nuevoUsuario.apellido}.
      Este es mi perfil de usuario en ChangaYa.
      Pronto voy a completarlo con más información 😊
    `.trim()

    const { error: perfilError } = await supabase
      .from('Perfil')
      .insert([{
        usuarioID: nuevoUsuario.usuarioID,
        descripcion: descripcionPlaceholder,
        foto: null  // todavía no tiene foto
      }])

    if (perfilError) {
      console.error("❌ Error creando perfil automático:", perfilError.message)
      // no tiramos error porque el usuario ya fue creado
    }

    // Respuesta final de ÉXITO: Enviamos la vista HTML
    res.setHeader('Content-Type', 'text/html');
    res.status(201).send(getSuccessHtml())

  } catch (err) {
    console.error('❌ Error en verificación:', err)

    let customMessage = 'El enlace de verificación ha caducado o es inválido.';
    
    // Si el error es específicamente por JWT (token expirado o inválido)
    if (err.name === 'TokenExpiredError') {
        customMessage = 'El enlace de verificación ha caducado. Por favor, volvé a registrarte.';
    } else if (err.name === 'JsonWebTokenError') {
        customMessage = 'El enlace de verificación es inválido.';
    } else if (err.message && err.message.includes('duplicate key')) {
        // Manejar el caso de que el usuario ya se creó (ej: si hacen doble clic en el link)
        customMessage = 'Parece que tu cuenta ya fue verificada. Ya puedes iniciar sesión.';
    }
    
    // Respuesta de ERROR: Enviamos la vista HTML con el mensaje personalizado
    res.setHeader('Content-Type', 'text/html');
    res.status(400).send(getErrorHtml(customMessage))
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

    // Generar token
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

// Actualizar usuario
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

// Eliminar usuario
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
