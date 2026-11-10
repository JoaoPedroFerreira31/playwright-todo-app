// Rotas de apoio aos testes. Só são montadas quando NODE_ENV=test (ver src/app.js).
const express = require('express');
const { resetDatabase, seed } = require('../seed');

const router = express.Router();

// POST /api/test/reset  { seed?: boolean }  — apaga tudo e (por omissão) volta a pôr os dados de exemplo
router.post('/reset', (req, res) => {
  resetDatabase();
  if (req.body?.seed !== false) seed();
  res.status(204).end();
});

module.exports = router;
