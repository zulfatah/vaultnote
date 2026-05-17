import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../api';
import {
  loginWithEmailPassword,
  registerWithEmailPassword,
  resendFirebaseVerification,
  signInWithGooglePopup,
} from '../firebase';
import { Spinner } from '../components/Spinner';

/* ─── inject fonts + base styles once ──────────────── */
const STYLE_ID = 'vn-auth-styles';
function injectStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const el = document.createElement('style');
  el.id = STYLE_ID;
  el.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@800&display=swap');
    .vn-input:focus{border-color:rgba(0,255,150,0.4)!important;background:rgba(0,255,150,0.05)!important;}
    .vn-btn-primary:hover:not(:disabled){background:#00e587!important;}
    .vn-btn-google:hover:not(:disabled){border-color:rgba(255,255,255,0.28)!important;color:#fff!important;}
  `;
  document.head.appendChild(el);
}

/* ─── static styles ─────────────────────────────────── */
const S = {
  root: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#080a0f', fontFamily: "'Space Mono', monospace", padding: '2rem', position: 'relative', overflow: 'hidden' },
  bgGrid: { position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(0,255,150,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,150,0.03) 1px,transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' },
  card: { position: 'relative', width: '100%', maxWidth: 400, background: '#0d1117', border: '1px solid rgba(0,255,150,0.15)', borderRadius: 4, padding: '2.2rem 2rem', zIndex: 1 },
  topLine: { position: 'absolute', top: -1, left: 20, right: 20, height: 1, background: 'linear-gradient(90deg,transparent,rgba(0,255,150,0.6),transparent)' },
  cTL: { position: 'absolute', top: -1, left: -1, width: 10, height: 10, borderTop: '1px solid rgba(0,255,150,0.5)', borderLeft: '1px solid rgba(0,255,150,0.5)' },
  cTR: { position: 'absolute', top: -1, right: -1, width: 10, height: 10, borderTop: '1px solid rgba(0,255,150,0.5)', borderRight: '1px solid rgba(0,255,150,0.5)' },
  cBL: { position: 'absolute', bottom: -1, left: -1, width: 10, height: 10, borderBottom: '1px solid rgba(0,255,150,0.5)', borderLeft: '1px solid rgba(0,255,150,0.5)' },
  cBR: { position: 'absolute', bottom: -1, right: -1, width: 10, height: 10, borderBottom: '1px solid rgba(0,255,150,0.5)', borderRight: '1px solid rgba(0,255,150,0.5)' },
  logo: { fontFamily: "'Syne',sans-serif", fontSize: 24, fontWeight: 800, letterSpacing: 6, color: '#fff', textAlign: 'center', margin: '0 0 3px' },
  tag: { fontSize: 9, color: 'rgba(0,255,150,0.45)', textAlign: 'center', letterSpacing: 2, margin: '0 0 1.6rem' },
  modeRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.4rem' },
  modeLine: { flex: 1, height: 1, background: 'rgba(0,255,150,0.08)' },
  modeTxt: { fontSize: 9, color: 'rgba(0,255,150,0.5)', letterSpacing: 2, whiteSpace: 'nowrap' },
  label: { display: 'block', fontSize: 9, letterSpacing: 2, color: 'rgba(0,255,150,0.45)', marginBottom: 5 },
  input: { width: '100%', boxSizing: 'border-box', background: 'rgba(0,255,150,0.03)', border: '1px solid rgba(0,255,150,0.12)', borderRadius: 2, padding: '9px 11px', fontSize: 12, color: '#e0ffe8', fontFamily: "'Space Mono',monospace", outline: 'none', transition: 'border-color 0.2s', marginBottom: 11 },
  btnBase: { width: '100%', padding: '10px', fontFamily: "'Space Mono',monospace", fontSize: 11, letterSpacing: 2, border: 'none', borderRadius: 2, cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.15s' },
  btnPrimary: { background: '#00ff96', color: '#050905', border: 'none' },
  btnGoogle: { background: 'transparent', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.12)', marginTop: 9 },
  btnResendBase: { width: '100%', padding: '8px', fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: 1.5, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.15s', marginTop: 8 },
  btnResendLocked: { background: 'transparent', color: 'rgba(0,255,150,0.3)', border: '1px solid rgba(0,255,150,0.08)', cursor: 'not-allowed' },
  btnResendReady: { background: 'transparent', color: 'rgba(0,255,150,0.7)', border: '1px solid rgba(0,255,150,0.25)', cursor: 'pointer' },
  divider: { display: 'flex', alignItems: 'center', gap: 10, margin: '12px 0' },
  dividerLine: { flex: 1, height: 1, background: 'rgba(255,255,255,0.05)' },
  dividerTxt: { fontSize: 9, color: 'rgba(255,255,255,0.18)', letterSpacing: 2 },
  countdown: { fontSize: 9, color: 'rgba(0,255,150,0.4)', textAlign: 'center', marginTop: 6, letterSpacing: 1, minHeight: 14 },
  footer: { textAlign: 'center', fontSize: 10, color: 'rgba(255,255,255,0.2)', marginTop: '1.2rem', letterSpacing: 0.5 },
  footerLink: { color: 'rgba(0,255,150,0.6)', background: 'none', border: 'none', fontFamily: "'Space Mono',monospace", fontSize: 10, cursor: 'pointer', letterSpacing: 0.5 },
  feedback: (type) => ({ fontSize: 10, letterSpacing: 1, padding: '8px 10px', borderRadius: 2, marginBottom: 11, ...(type === 'ok' ? { background: 'rgba(0,255,150,0.08)', border: '1px solid rgba(0,255,150,0.2)', color: '#00ff96' } : { background: 'rgba(255,60,60,0.08)', border: '1px solid rgba(255,60,60,0.2)', color: '#ff6b6b' }) }),
};

function GoogleIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

const RESEND_WAIT = 30;

export default function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    injectStyles();
    apiRequest('/auth/me')
      .then(() => navigate('/dashboard', { replace: true }))
      .catch(() => {});
    const queryErr = new URLSearchParams(window.location.search).get('error');
    if (queryErr) setFeedback({ type: 'error', text: decodeURIComponent(queryErr) });
    return () => clearInterval(timerRef.current);
  }, [navigate]);

  function startCountdown() {
    clearInterval(timerRef.current);
    setCountdown(RESEND_WAIT);
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(timerRef.current); return 0; }
        return c - 1;
      });
    }, 1000);
  }

  function switchMode(next) {
    setMode(next);
    setFeedback(null);
    setShowResend(false);
    setCountdown(0);
    clearInterval(timerRef.current);
  }

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);
    try {
      if (mode === 'register') {
        await registerWithEmailPassword(email.trim(), password);
        setFeedback({ type: 'ok', text: 'Registered. Check your email for the verification link.' });
        setPassword('');
        setShowResend(true);
        startCountdown();
      } else {
        const user = await loginWithEmailPassword(email.trim(), password);
        const idToken = await user.getIdToken();
        await apiRequest('/auth/firebase/email', { method: 'POST', body: JSON.stringify({ idToken }) });
        navigate('/dashboard', { replace: true });
      }
    } catch (error) {
      setFeedback({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  }

  async function onGoogleLogin() {
    setGoogleLoading(true);
    setFeedback(null);
    try {
      const idToken = await signInWithGooglePopup();
      await apiRequest('/auth/google/firebase', { method: 'POST', body: JSON.stringify({ idToken }) });
      navigate('/dashboard', { replace: true });
    } catch (error) {
      const code = error?.code || '';
      if (code === 'auth/popup-closed-by-user') {
        setFeedback({ type: 'error', text: 'Popup ditutup sebelum login selesai. Coba klik Google Login lagi.' });
      } else if (code === 'auth/popup-blocked') {
        setFeedback({ type: 'error', text: 'Popup diblokir browser. Izinkan popup untuk situs ini lalu coba lagi.' });
      } else if (code === 'auth/cancelled-popup-request') {
        setFeedback({ type: 'error', text: 'Permintaan login dibatalkan. Tunggu lalu coba lagi.' });
      } else {
        setFeedback({ type: 'error', text: error.message || 'Google login failed.' });
      }
    } finally {
      setGoogleLoading(false);
    }
  }

  async function onResendVerification() {
    if (countdown > 0) return;
    if (!email.trim() || !password) {
      setFeedback({ type: 'error', text: 'Isi email dan password dulu.' });
      return;
    }
    setResendLoading(true);
    setFeedback(null);
    try {
      await loginWithEmailPassword(email.trim(), password);
      await resendFirebaseVerification();
      setFeedback({ type: 'ok', text: 'Verification email resent.' });
      startCountdown();
    } catch (error) {
      setFeedback({ type: 'error', text: error.message });
    } finally {
      setResendLoading(false);
    }
  }

  const isLogin = mode === 'login';
  const resendReady = countdown === 0;

  return (
    <main style={S.root}>
      <div style={S.bgGrid} />

      <section style={S.card}>
        <div style={S.topLine} />
        <div style={S.cTL} /><div style={S.cTR} />
        <div style={S.cBL} /><div style={S.cBR} />

        <h1 style={S.logo}>Z<span style={{ color: '#00ff96' }}>NOTE</span></h1>
        <p style={S.tag}>// encrypt. store. retrieve.</p>

        <div style={S.modeRow}>
          <div style={S.modeLine} />
          <span style={S.modeTxt}>{isLogin ? 'LOGIN TO YOUR VAULT' : 'CREATE YOUR VAULT'}</span>
          <div style={S.modeLine} />
        </div>

        {feedback && <div style={S.feedback(feedback.type)}>{feedback.text}</div>}

        <form onSubmit={onSubmit}>
          <label style={S.label}>EMAIL ADDRESS</label>
          <input className="vn-input" style={S.input} type="email" placeholder="user@domain.com"
            value={email} onChange={(e) => setEmail(e.target.value)} required />

          <label style={S.label}>PASSWORD</label>
          <input className="vn-input" style={S.input} type="password" placeholder="••••••••••••"
            value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} maxLength={128} required />

          <button className="vn-btn-primary" style={{ ...S.btnBase, ...S.btnPrimary }} type="submit" disabled={loading}>
            {loading ? <Spinner /> : isLogin ? 'LOGIN' : 'REGISTER'}
          </button>
        </form>

        <div style={S.divider}>
          <div style={S.dividerLine} />
          <span style={S.dividerTxt}>OR</span>
          <div style={S.dividerLine} />
        </div>

        <button className="vn-btn-google" style={{ ...S.btnBase, ...S.btnGoogle }} type="button"
          onClick={onGoogleLogin} disabled={googleLoading}>
          {googleLoading ? <Spinner /> : <><GoogleIcon />CONTINUE WITH GOOGLE</>}
        </button>

        {showResend && (
          <>
            <button
              style={{ ...S.btnResendBase, ...(resendReady ? S.btnResendReady : S.btnResendLocked) }}
              type="button"
              onClick={onResendVerification}
              disabled={!resendReady || resendLoading}
            >
              {resendLoading ? <Spinner /> : 'RESEND VERIFICATION EMAIL'}
            </button>
            {countdown > 0 && (
              <div style={S.countdown}>RESEND AVAILABLE IN {countdown}s</div>
            )}
          </>
        )}

        <div style={S.footer}>
          <span style={{ marginRight: 6 }}>
            {isLogin ? "DON'T HAVE AN ACCOUNT?" : 'ALREADY HAVE AN ACCOUNT?'}
          </span>
          <button style={S.footerLink} type="button" onClick={() => switchMode(isLogin ? 'register' : 'login')}>
            {isLogin ? 'REGISTER ->' : 'LOGIN ->'}
          </button>
        </div>
      </section>
    </main>
  );
}