import { useEffect, useRef, useState } from 'react';
import { apiRequest } from '../api';

export default function VerifyPage() {
  const [state, setState] = useState({ status: 'loading', title: 'VERIFYING EMAIL', message: 'Please wait...' });
  const requestedRef = useRef(false);

  useEffect(() => {
    if (requestedRef.current) {
      return;
    }
    requestedRef.current = true;

    const token = new URLSearchParams(window.location.search).get('token');
    if (!token) {
      setState({ status: 'error', title: 'INVALID TOKEN', message: 'No token found in URL.' });
      return;
    }

    apiRequest(`/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then((data) => setState({ status: 'success', title: 'EMAIL VERIFIED', message: data.message }))
      .catch((error) => setState({ status: 'error', title: 'VERIFICATION FAILED', message: error.message }));
  }, []);

  return (
    <main className="auth-bg auth-wrapper">
      <section className={`card verify-card ${state.status === 'success' ? 'success-state' : ''} ${state.status === 'error' ? 'error-state' : ''}`}>
        <div className="verify-icon">{state.status === 'loading' ? '...' : state.status === 'success' ? '?' : 'x'}</div>
        <h1>{state.title}</h1>
        <p>{state.message}</p>
        <a className="btn btn-primary" href="/">BACK TO LOGIN</a>
      </section>
    </main>
  );
}
