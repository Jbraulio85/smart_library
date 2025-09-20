import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { getAccessToken } from "./gmailOAuth.js";
dotenv.config();




export async function sendNotificationCourse  (email, courseName, fileName)  {
  const accessToken = await getAccessToken();
  const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
          type: 'OAuth2',
          user: process.env.GMAIL_USER,
          clientId: process.env.GMAIL_CLIENT_ID,
          clientSecret: process.env.GMAIL_CLIENT_SECRET,
          refreshToken: process.env.GMAIL_REFRESH_TOKEN,
          accessToken: accessToken
      }
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `Nuevo archivo agregado en ${courseName}`,
    html: `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <title>Nuevo Documento</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #bcddff;
            margin: 0;
            padding: 0;
          }
          .container {
            background-color: #ffffff;
            max-width: 600px;
            margin: 30px auto;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          }
          .header {
            background-color: #bcddff;
            color: #1e3169;
            text-align: center;
            padding: 20px;
          }
          .content {
            padding: 20px;
            color:rgb(0, 0, 0);
          }
          .content p {
            color:rgb(0, 0, 0);
          }
          .footer {
            background-color: #bcddff;
            text-align: center;
            padding: 15px;
            font-size: 12px;
            color: #566681;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="https://siemprehaciaadelanteguate.com/wp-content/uploads/2025/03/fundacion-kinal-logo.webp" alt="Kinal Logo" style="max-width: 80px;" />
            <h2>Nuevo Documento Disponible</h2>
          </div>
          <div class="content">
            <p>Se ha agregado un nuevo documento al curso <strong>${courseName}</strong>.</p>
            <p><strong>Archivo:</strong> ${fileName}</p>
            <p>Ingresa a la plataforma para revisarlo.</p>
          </div>
          <div class="footer">
            © 2025 ByteForce. Todos los derechos reservados.
          </div>
        </div>
      </body>
      </html>
    `,
  };
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Correo enviado correctamente:', info.response);
    return email;
  } catch (error) {
    console.error('Error al enviar el correo:', error);
    throw error;
  }

};