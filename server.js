const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Ruta de API para el formulario de contacto/reservas
app.post('/api/contact', (req, res) => {
  const { name, email, phone, date, eventType, message } = req.body;

  // Validación simple de datos
  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: 'Por favor, completa los campos requeridos: Nombre, Correo y Mensaje.'
    });
  }

  // Simulación de envío/guardado de datos
  console.log('=== Nueva Solicitud de Reserva ===');
  console.log(`Nombre: ${name}`);
  console.log(`Correo: ${email}`);
  console.log(`Teléfono: ${phone || 'No especificado'}`);
  console.log(`Fecha del Evento: ${date || 'No especificada'}`);
  console.log(`Tipo de Evento: ${eventType || 'No especificado'}`);
  console.log(`Mensaje: ${message}`);
  console.log('==================================');

  // Responder con éxito al cliente
  return res.status(200).json({
    success: true,
    message: '¡Tu solicitud de reserva ha sido recibida con éxito! Elmer Mercado se pondrá en contacto contigo a la brevedad.'
  });
});

// Ruta comodín para redirigir al index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor de Elmer Mercado corriendo en http://localhost:${PORT}`);
});
