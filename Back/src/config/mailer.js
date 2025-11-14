import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
dotenv.config()

export const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: false, // Gmail usa STARTTLS, NO SSL directo
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  },
  tls: {
    rejectUnauthorized: false // ← **CLAVE PARA ELIMINAR EL ERROR**
  }
})

// Verificar conexión
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Error con el servidor SMTP:', error)
  } else {
    console.log('✅ Servidor de correo listo para enviar')
  }
})
