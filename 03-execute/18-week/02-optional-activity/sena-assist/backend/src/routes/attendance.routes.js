const express = require('express');
const router = express.Router();
const { escanearQR } = require('../controllers/attendance.controller');

router.post('/escanear', escanearQR);

module.exports = router;
