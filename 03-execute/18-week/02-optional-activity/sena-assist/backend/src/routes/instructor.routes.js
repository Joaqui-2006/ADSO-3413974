const express = require('express');
const router = express.Router();
const { verificarToken, soloRol } = require('../middleware/auth');
const instructorCtrl = require('../controllers/instructor.controller');
const sessionCtrl = require('../controllers/session.controller');
const attendanceCtrl = require('../controllers/attendance.controller');

router.use(verificarToken, soloRol('Instructor'));

router.get('/clases', instructorCtrl.misClases);
router.get('/clases/:idClase/horarios', instructorCtrl.horariosDeClase);
router.get('/historial', instructorCtrl.historial);

router.post('/horarios/:idHorario/qr', sessionCtrl.generarQR);
router.put('/horarios/:idHorario/cerrar', sessionCtrl.cerrarAsistencia);
router.get('/horarios/:idHorario/asistencia', sessionCtrl.listaAsistencia);

router.put('/asistencia/:idAsistencia', attendanceCtrl.editarAsistencia);
router.post('/horarios/:idHorario/asistencia-manual', attendanceCtrl.marcarManual);

module.exports = router;
