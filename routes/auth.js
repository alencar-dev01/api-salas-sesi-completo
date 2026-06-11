// routes/auth.js
const router = require('express').Router();
const { login, register, me } = require('../controllers/authController');
const { autenticar } = require('../middleware/auth');

router.post('/login', login);
router.post('/register', register);
router.get('/me', autenticar, me);

module.exports = router;