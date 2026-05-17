const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const { prisma } = require('./db');

passport.use(
  new LocalStrategy({ usernameField: 'email', passwordField: 'password' }, async (email, password, done) => {
    try {
      const normalizedEmail = email.toLowerCase().trim();
      const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

      if (!user) {
        return done(null, false, { message: 'Invalid email or password.' });
      }

      if (!user.passwordHash) {
        return done(null, false, { message: 'Use Google login for this account.' });
      }

      if (!user.isVerified) {
        return done(null, false, { message: 'Please verify your email before logging in.' });
      }

      const passwordOk = await bcrypt.compare(password, user.passwordHash);
      if (!passwordOk) {
        return done(null, false, { message: 'Invalid email or password.' });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user || false);
  } catch (error) {
    done(error);
  }
});

module.exports = passport;