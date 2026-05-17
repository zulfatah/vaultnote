const express = require('express');
const { body, query } = require('express-validator');
const { authLimiter } = require('../middleware/rateLimiter');
const authController = require('../controllers/authController');

const router = express.Router();

router.post(
  '/register',
  authLimiter,
  [body('email').isEmail().normalizeEmail(), body('password').isLength({ min: 8, max: 128 }).trim()],
  authController.register
);

router.get('/verify-email', [query('token').isString().isLength({ min: 20, max: 256 }).trim()], authController.verifyEmail);
router.post('/resend-verification', authLimiter, [body('email').isEmail().normalizeEmail()], authController.resendVerification);
router.post('/dev/manual-verification-link', authLimiter, [body('email').isEmail().normalizeEmail()], authController.devManualVerificationLink);

router.post(
  '/login',
  authLimiter,
  [body('email').isEmail().normalizeEmail(), body('password').isLength({ min: 8, max: 128 }).trim()],
  authController.login
);

router.post('/google/firebase', authLimiter, [body('idToken').isString().isLength({ min: 100, max: 5000 })], authController.firebaseGoogleLogin);

router.post('/logout', authController.logout);
router.get('/me', authController.me);

module.exports = router;
