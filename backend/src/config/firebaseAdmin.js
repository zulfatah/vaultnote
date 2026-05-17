const admin = require('firebase-admin');

let initialized = false;

function getPrivateKey() {
  if (!process.env.FIREBASE_PRIVATE_KEY) {
    return null;
  }
  return process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
}

function initFirebaseAdmin() {
  if (initialized) {
    return admin;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = getPrivateKey();

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Firebase Admin env missing: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY');
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });

  initialized = true;
  return admin;
}

module.exports = { initFirebaseAdmin };