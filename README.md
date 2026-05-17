# VaultNote

Secure full-stack text vault. Email/password auth + email verification, Google login via Firebase Authentication, encrypted-at-rest notes.

## Stack

- Backend: Node.js, Express, Prisma, MySQL, Passport Local, Firebase Admin
- Frontend: React (Vite) + PWA + Firebase Web SDK
- Security: Helmet, CORS allowlist, rate-limit, bcryptjs, AES-256-GCM

## Env Files

Backend env example: [backend/.env.example](C:\Users\muham\Desktop\webcopypast\vaultnote\backend\.env.example)
Frontend env example: [frontend/.env.example](C:\Users\muham\Desktop\webcopypast\vaultnote\frontend\.env.example)

## Google Auth Flow (Firebase)

1. Frontend opens Google popup via Firebase Auth.
2. Frontend gets Firebase `idToken`.
3. Frontend sends token to `POST /api/auth/google/firebase`.
4. Backend verifies token using Firebase Admin.
5. Backend creates/updates user, then creates session cookie.

## Required Firebase Config

### Frontend (`frontend/.env`)

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_API_BASE_URL`

### Backend (`backend/.env`)

- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY` (keep `\n` escaped)

## Run

```bash
cd vaultnote/backend
npm install
npm run dev
```

```bash
cd vaultnote/frontend
npm install
npm run dev
```

Open `http://localhost:3000`.