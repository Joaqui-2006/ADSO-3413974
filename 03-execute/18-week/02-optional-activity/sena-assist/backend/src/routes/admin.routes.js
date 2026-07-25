const express = require('express');
const router = express.Router();
const { verificarToken, soloRol } = require('../middleware/auth');
const adminCtrl = require('../controllers/admin.controller');

router.use(verificarToken, soloRol('Administrador'));

router.get('/usuarios', adminCtrl.listarUsuarios);
router.post('/usuarios', adminCtrl.crearUsuario);
router.put('/usuarios/:id/estado', adminCtrl.cambiarEstadoUsuario);

router.get('/:tabla', adminCtrl.listar);
router.post('/:tabla', adminCtrl.crear);
router.put('/:tabla/:id', adminCtrl.actualizar);
router.delete('/:tabla/:id', adminCtrl.eliminar);

module.exports = router;
