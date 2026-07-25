const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

// Genera un token único para una sesión de asistencia
function generarTokenSesion() {
  return uuidv4();
}

// Construye la URL que el aprendiz abrirá al escanear el QR
// y devuelve tanto la URL como la imagen en base64 (Data URL) del QR.
async function generarImagenQR(token, frontendUrl) {
  const url = `${frontendUrl}/scan.html?token=${token}`;
  const dataUrl = await QRCode.toDataURL(url, {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 320
  });
  return { url, dataUrl };
}

module.exports = { generarTokenSesion, generarImagenQR };
