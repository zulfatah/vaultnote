const passport = require('passport');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const { prisma } = require('../config/db');
const { initFirebaseAdmin } = require('../config/firebaseAdmin');
const { generateToken } = require('../utils/generateToken');
const { sendVerificationEmail } = require('../services/emailService');

function fail(res, code, error) {
  return res.status(code).json({ success: false, error });
}

async function register(req, res) {
  return fail(res, 410, 'Local register disabled. Use Firebase email/password flow.');
  /*
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return fail(res, 400, errors.array()[0].msg);
    }

    const email = req.body.email.toLowerCase().trim();
    const password = req.body.password;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return fail(res, 400, 'Email already registered.');
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const verifyToken = generateToken();
    const verifyTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.user.create({
      data: { email, passwordHash, verifyToken, verifyTokenExpiry, isVerified: false },
    });

    if (process.env.NODE_ENV !== 'production') {
      console.log(`DEV_VERIFY_URL (${email}): ${process.env.FRONTEND_URL}/verify?token=${verifyToken}`);
    }

    try {
      await sendVerificationEmail(email, verifyToken);
    } catch (mailError) {
      if (process.env.NODE_ENV === 'production') {
        throw mailError;
      }
      console.error('Verification email send failed (dev mode):', mailError.message);
      console.error(`Manual verify URL: ${process.env.FRONTEND_URL}/verify?token=${verifyToken}`);
    }

    return res.status(201).json({ success: true, data: { message: 'Registered. Check email for verification link.' } });
  } catch (_error) {
    return fail(res, 500, 'Failed to register user.');
  }
  */
}

async function verifyEmail(req, res) {
  return fail(res, 410, 'Local verify-email disabled. Use Firebase email verification.');
  /*
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return fail(res, 400, errors.array()[0].msg);
    }

    const { token } = req.query;
    const user = await prisma.user.findFirst({ where: { verifyToken: token } });

    if (!user) {
      return fail(res, 404, 'Invalid verification token.');
    }

    if (!user.verifyTokenExpiry || user.verifyTokenExpiry < new Date()) {
      return fail(res, 400, 'Verification token expired.');
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true, verifyToken: null, verifyTokenExpiry: null },
    });

    return res.json({ success: true, data: { message: 'Email verified successfully.' } });
  } catch (_error) {
    return fail(res, 500, 'Failed to verify email.');
  }
  */
}

async function resendVerification(req, res) {
  return fail(res, 410, 'Local resend verification disabled. Use Firebase verification email.');
  /*
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return fail(res, 400, errors.array()[0].msg);
    }

    const email = req.body.email.toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return fail(res, 404, 'User not found.');
    }

    if (user.isVerified) {
      return fail(res, 400, 'Email already verified.');
    }

    const verifyToken = generateToken();
    const verifyTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { verifyToken, verifyTokenExpiry },
    });

    if (process.env.NODE_ENV !== 'production') {
      console.log(`DEV_VERIFY_URL (${email}): ${process.env.FRONTEND_URL}/verify?token=${verifyToken}`);
    }

    try {
      await sendVerificationEmail(email, verifyToken);
    } catch (mailError) {
      if (process.env.NODE_ENV === 'production') {
        throw mailError;
      }
      console.error('Resend verification email failed (dev mode):', mailError.message);
      console.error(`Manual verify URL: ${process.env.FRONTEND_URL}/verify?token=${verifyToken}`);
    }

    return res.json({ success: true, data: { message: 'Verification email resent.' } });
  } catch (_error) {
    return fail(res, 500, 'Failed to resend verification email.');
  }
  */
}

async function devManualVerificationLink(req, res) {
  return fail(res, 410, 'Local manual verification disabled. Use Firebase email verification.');
  /*
  try {
    if (process.env.NODE_ENV === 'production') {
      return fail(res, 403, 'Manual verification endpoint disabled in production.');
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return fail(res, 400, errors.array()[0].msg);
    }

    const email = req.body.email.toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return fail(res, 404, 'User not found.');
    }

    if (user.isVerified) {
      return fail(res, 400, 'Email already verified.');
    }

    const verifyToken = generateToken();
    const verifyTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { verifyToken, verifyTokenExpiry },
    });

    const verifyUrl = `${process.env.FRONTEND_URL}/verify?token=${verifyToken}`;
    return res.json({
      success: true,
      data: {
        message: 'Manual verification link generated.',
        verifyToken,
        verifyUrl,
        verifyTokenExpiry,
      },
    });
  } catch (_error) {
    return fail(res, 500, 'Failed to generate manual verification link.');
  }
  */
}

function login(req, res, next) {
  return fail(res, 410, 'Local login disabled. Use Firebase email/password flow.');
  /*
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return fail(res, 400, errors.array()[0].msg);
  }

  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return fail(res, 500, 'Login failed.');
    }
    if (!user) {
      return fail(res, 401, info?.message || 'Invalid credentials.');
    }

    req.logIn(user, (loginErr) => {
      if (loginErr) {
        return fail(res, 500, 'Login session failed.');
      }
      return res.json({ success: true, data: { id: user.id, email: user.email } });
    });
  })(req, res, next);
  */
}

async function firebaseEmailLogin(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return fail(res, 400, errors.array()[0].msg);
    }

    const { idToken } = req.body;
    const firebaseAdmin = initFirebaseAdmin();
    const decoded = await firebaseAdmin.auth().verifyIdToken(idToken);

    const email = (decoded.email || '').toLowerCase().trim();
    const firebaseUid = decoded.uid;
    const emailVerified = Boolean(decoded.email_verified);

    if (!email || !firebaseUid) {
      return fail(res, 401, 'Invalid Firebase token payload.');
    }
    if (!emailVerified) {
      return fail(res, 403, 'Please verify your email before logging in.');
    }

    let user = await prisma.user.findFirst({
      where: {
        OR: [{ googleId: firebaseUid }, { email }],
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          googleId: firebaseUid,
          isVerified: true,
        },
      });
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: user.googleId || firebaseUid,
          isVerified: true,
        },
      });
    }

    req.logIn(user, (loginErr) => {
      if (loginErr) {
        return fail(res, 500, 'Login session failed.');
      }
      return res.json({ success: true, data: { id: user.id, email: user.email } });
    });
  } catch (_error) {
    return fail(res, 401, 'Firebase authentication failed.');
  }
}

async function firebaseGoogleLogin(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return fail(res, 400, errors.array()[0].msg);
    }

    const { idToken } = req.body;
    const firebaseAdmin = initFirebaseAdmin();
    const decoded = await firebaseAdmin.auth().verifyIdToken(idToken);

    const email = (decoded.email || '').toLowerCase().trim();
    const googleId = decoded.uid;

    if (!email || !googleId) {
      return fail(res, 401, 'Invalid Firebase token payload.');
    }

    let user = await prisma.user.findFirst({
      where: {
        OR: [{ googleId }, { email }],
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          googleId,
          isVerified: true,
        },
      });
    } else if (!user.googleId) {
      user = await prisma.user.update({ where: { id: user.id }, data: { googleId } });
    }

    req.logIn(user, (loginErr) => {
      if (loginErr) {
        return fail(res, 500, 'Login session failed.');
      }
      return res.json({ success: true, data: { id: user.id, email: user.email } });
    });
  } catch (_error) {
    return fail(res, 401, 'Firebase authentication failed.');
  }
}

function logout(req, res) {
  req.logout((err) => {
    if (err) {
      return fail(res, 500, 'Logout failed.');
    }
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      return res.json({ success: true, data: { message: 'Logged out.' } });
    });
  });
}

function me(req, res) {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return fail(res, 401, 'Unauthorized');
  }

  return res.json({ success: true, data: { id: req.user.id, email: req.user.email } });
}

module.exports = { register, verifyEmail, resendVerification, devManualVerificationLink, login, firebaseEmailLogin, firebaseGoogleLogin, logout, me };
