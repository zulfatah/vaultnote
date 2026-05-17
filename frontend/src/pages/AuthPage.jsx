import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../api';
import { loginWithEmailPassword, registerWithEmailPassword, resendFirebaseVerification, signInWithGooglePopup } from '../firebase';
import { Spinner } from '../components/Spinner';

export default function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [tab, setTab] = useState('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    apiRequest('/auth/me')
      .then(() => navigate('/dashboard', { replace: true }))
      .catch(() => {});

    const queryErr = new URLSearchParams(window.location.search).get('error');
    if (queryErr) setFeedback({ type: 'error', text: decodeURIComponent(queryErr) });
  }, [navigate]);

  async function onSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setFeedback(null);

    try {
      if (mode === 'register') {
        await registerWithEmailPassword(email.trim(), password);
        setFeedback({ type: 'ok', text: 'Registered in Firebase. Check your email verification link.' });
        setPassword('');
      } else {
        const user = await loginWithEmailPassword(email.trim(), password);
        const idToken = await user.getIdToken();
        await apiRequest('/auth/firebase/email', {
          method: 'POST',
          body: JSON.stringify({ idToken }),
        });
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
      await apiRequest('/auth/google/firebase', {
        method: 'POST',
        body: JSON.stringify({ idToken }),
      });
      navigate('/dashboard', { replace: true });
    } catch (error) {
      const code = error?.code || '';
      if (code === 'auth/popup-closed-by-user') {
        setFeedback({ type: 'error', text: 'Popup ditutup sebelum login selesai. Coba klik Google Login lagi.' });
      } else if (code === 'auth/popup-blocked') {
        setFeedback({ type: 'error', text: 'Popup diblokir browser. Izinkan popup untuk situs ini lalu coba lagi.' });
      } else if (code === 'auth/cancelled-popup-request') {
        setFeedback({ type: 'error', text: 'Permintaan login dibatalkan karena popup lain masih berjalan. Tunggu lalu coba lagi.' });
      } else {
        setFeedback({ type: 'error', text: error.message || 'Google login failed.' });
      }
    } finally {
      setGoogleLoading(false);
    }
  }

  async function onResendVerification() {
    if (!email.trim() || !password) {
      setFeedback({ type: 'error', text: 'Isi email dan password dulu untuk resend verifikasi Firebase.' });
      return;
    }

    setResendLoading(true);
    setFeedback(null);
    try {
      await loginWithEmailPassword(email.trim(), password);
      await resendFirebaseVerification();
      setFeedback({ type: 'ok', text: 'Firebase verification email resent.' });
    } catch (error) {
      setFeedback({ type: 'error', text: error.message });
    } finally {
      setResendLoading(false);
    }
  }

  return (
    <main className="auth-bg auth-wrapper">
      <section className="card auth-card">
        <h1 className="logo">VAULTNOTE</h1>
        <p className="tag">// encrypt. store. retrieve.</p>

        <div className="auth-tabs">
          <button className={`btn tab-btn ${tab === 'email' ? 'active' : ''}`} onClick={() => setTab('email')}>EMAIL LOGIN</button>
          <button className={`btn tab-btn ${tab === 'google' ? 'active' : ''}`} onClick={() => setTab('google')}>GOOGLE LOGIN</button>
        </div>

        {feedback && <div className={`feedback ${feedback.type === 'error' ? 'error' : 'ok'}`}>{feedback.text}</div>}

        {tab === 'email' ? (
          <form className="stack" onSubmit={onSubmit}>
            <input type="email" placeholder="EMAIL" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input type="password" placeholder="PASSWORD" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} maxLength={128} required />
            <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? <Spinner /> : mode === 'login' ? 'LOGIN' : 'REGISTER'}</button>
            {mode === 'login' && (
              <button className="btn" type="button" onClick={onResendVerification} disabled={resendLoading}>
                {resendLoading ? <Spinner /> : 'RESEND FIREBASE VERIFICATION'}
              </button>
            )}
          </form>
        ) : (
          <button className="btn btn-google" type="button" onClick={onGoogleLogin} disabled={googleLoading}>{googleLoading ? <Spinner /> : 'G CONTINUE WITH GOOGLE'}</button>
        )}

        <p className="muted small">
          {mode === 'login' ? "DON'T HAVE ACCOUNT?" : 'ALREADY HAVE ACCOUNT?'}{' '}
          <button className="link-btn" type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
            {mode === 'login' ? 'REGISTER ->' : 'LOGIN ->'}
          </button>
        </p>
      </section>
    </main>
  );
}
