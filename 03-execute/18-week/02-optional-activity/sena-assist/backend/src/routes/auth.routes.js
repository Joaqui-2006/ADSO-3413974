const express = require('express');
const router = express.Router();
const { login, perfil } = require('../controllers/auth.controller');
const { verificarToken } = require('../middleware/auth');

router.post('/login', login);
router.get('/perfil', verificarToken, perfil);

module.exports = router;
