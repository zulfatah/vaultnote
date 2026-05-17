import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../api';
import { Spinner } from '../components/Spinner';

/* ─── inject styles once ───────────────────────────── */
const STYLE_ID = 'vn-dash-styles';
function injectStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const el = document.createElement('style');
  el.id = STYLE_ID;
  el.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@800&display=swap');

    html, body, #root { background: #080a0f !important; min-height: 100%; }

    .vn-root { background: #080a0f; min-height: 100vh; display: flex; flex-direction: column; font-family: 'Space Mono', monospace; color: #e0ffe8; }

    .vn-topbar { display: flex; align-items: center; gap: 10px; padding: 10px 20px; background: #0d1117; border-bottom: 1px solid rgba(0,255,150,0.12); position: sticky; top: 0; z-index: 100; }
    .vn-logo { font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 800; letter-spacing: 4px; color: #fff; flex-shrink: 0; }
    .vn-logo span { color: #00ff96; }
    .vn-search { flex: 1; display: flex; align-items: center; gap: 7px; background: rgba(0,255,150,0.03); border: 1px solid rgba(0,255,150,0.12); border-radius: 2px; padding: 6px 10px; transition: border-color 0.2s; min-width: 0; }
    .vn-search:focus-within { border-color: rgba(0,255,150,0.4); }
    .vn-search input { background: none; border: none; outline: none; color: #e0ffe8; font-family: 'Space Mono', monospace; font-size: 11px; letter-spacing: 1px; width: 100%; min-width: 0; }
    .vn-search input::placeholder { color: rgba(0,255,150,0.22); }
    .vn-user { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
    .vn-email { font-size: 10px; color: rgba(0,255,150,0.4); letter-spacing: 1px; }
    .vn-btn-logout { background: transparent; color: rgba(255,255,255,0.35); border: 1px solid rgba(255,255,255,0.1); font-size: 10px; padding: 5px 11px; letter-spacing: 1.5px; font-family: 'Space Mono', monospace; font-weight: 700; cursor: pointer; border-radius: 2px; transition: all 0.15s; white-space: nowrap; }
    .vn-btn-logout:hover { border-color: rgba(255,60,60,0.45); color: #ff6b6b; }

    .vn-main { flex: 1; padding: 16px 20px; display: flex; flex-direction: column; gap: 14px; width: 100%; }

    .vn-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
    .vn-stat { background: #0d1117; border: 1px solid rgba(0,255,150,0.12); border-radius: 2px; padding: 12px 14px; position: relative; }
    .vn-stat-val { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 20px; color: #00ff96; line-height: 1; }
    .vn-stat-key { font-size: 9px; color: rgba(0,255,150,0.35); letter-spacing: 1.5px; margin-top: 4px; }

    .vn-card { position: relative; background: #0d1117; border: 1px solid rgba(0,255,150,0.15); border-radius: 4px; padding: 16px 18px; }
    .vn-topline { position: absolute; top: -1px; left: 18px; right: 18px; height: 1px; background: linear-gradient(90deg,transparent,rgba(0,255,150,0.5),transparent); }
    .vn-c-tl { position: absolute; top: -1px; left: -1px; width: 10px; height: 10px; border-top: 1px solid rgba(0,255,150,0.55); border-left: 1px solid rgba(0,255,150,0.55); }
    .vn-c-tr { position: absolute; top: -1px; right: -1px; width: 10px; height: 10px; border-top: 1px solid rgba(0,255,150,0.55); border-right: 1px solid rgba(0,255,150,0.55); }
    .vn-c-bl { position: absolute; bottom: -1px; left: -1px; width: 10px; height: 10px; border-bottom: 1px solid rgba(0,255,150,0.55); border-left: 1px solid rgba(0,255,150,0.55); }
    .vn-c-br { position: absolute; bottom: -1px; right: -1px; width: 10px; height: 10px; border-bottom: 1px solid rgba(0,255,150,0.55); border-right: 1px solid rgba(0,255,150,0.55); }

    .vn-section { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
    .vn-section-line { flex: 1; height: 1px; background: rgba(0,255,150,0.08); }
    .vn-section-txt { font-size: 9px; color: rgba(0,255,150,0.45); letter-spacing: 2px; white-space: nowrap; }

    .vn-textarea { width: 100%; background: rgba(0,255,150,0.03); border: 1px solid rgba(0,255,150,0.12); border-radius: 2px; padding: 10px 12px; font-size: 12px; color: #e0ffe8; font-family: 'Space Mono', monospace; resize: none; height: 82px; line-height: 1.65; outline: none; transition: border-color 0.2s; }
    .vn-textarea:focus { border-color: rgba(0,255,150,0.4); background: rgba(0,255,150,0.05); }
    .vn-textarea::placeholder { color: rgba(0,255,150,0.2); }
    .vn-composer-foot { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; gap: 10px; }
    .vn-charcount { font-size: 9px; color: rgba(0,255,150,0.28); letter-spacing: 1px; }
    .vn-btn-save { background: #00ff96; color: #050905; font-family: 'Space Mono', monospace; font-size: 10px; letter-spacing: 2px; font-weight: 700; border: none; border-radius: 2px; padding: 8px 16px; cursor: pointer; transition: background 0.15s; white-space: nowrap; display: flex; align-items: center; gap: 6px; }
    .vn-btn-save:hover:not(:disabled) { background: #00e587; }
    .vn-btn-save:disabled { opacity: 0.5; cursor: not-allowed; }

    .vn-vault-head { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .vn-vault-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 13px; letter-spacing: 3px; color: #e0ffe8; }
    .vn-badge { font-size: 9px; background: rgba(0,255,150,0.08); color: rgba(0,255,150,0.65); border: 1px solid rgba(0,255,150,0.2); border-radius: 2px; padding: 2px 8px; letter-spacing: 1px; }
    .vn-search-meta { font-size: 9px; color: rgba(0,255,150,0.3); letter-spacing: 1px; margin-bottom: 10px; }

    .vn-note { border: 1px solid rgba(0,255,150,0.1); background: rgba(0,255,150,0.012); border-radius: 2px; padding: 11px 13px; position: relative; margin-bottom: 7px; overflow: hidden; transition: border-color 0.15s; }
    .vn-note:hover { border-color: rgba(0,255,150,0.3); }
    .vn-note:hover .vn-accent { opacity: 1; }
    .vn-accent { position: absolute; top: 0; left: 0; width: 2px; height: 100%; background: #00ff96; opacity: 0; transition: opacity 0.15s; }
    .vn-note-text { font-size: 12px; line-height: 1.65; color: #e0ffe8; margin-bottom: 9px; word-break: break-word; }
    .vn-note-foot { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(0,255,150,0.07); padding-top: 7px; gap: 8px; flex-wrap: wrap; }
    .vn-note-time { font-size: 9px; color: rgba(0,255,150,0.28); letter-spacing: 1px; }
    .vn-note-acts { display: flex; gap: 5px; flex-shrink: 0; }
    .vn-btn-copy { background: transparent; color: rgba(0,255,150,0.65); border: 1px solid rgba(0,255,150,0.22); font-family: 'Space Mono', monospace; font-size: 9px; letter-spacing: 1.5px; font-weight: 700; border-radius: 2px; padding: 4px 9px; cursor: pointer; transition: all 0.15s; }
    .vn-btn-copy:hover { border-color: rgba(0,255,150,0.5); color: #00ff96; }
    .vn-btn-copied { background: #00ff96 !important; color: #050905 !important; border-color: #00ff96 !important; }
    .vn-btn-del { background: transparent; color: rgba(255,90,90,0.65); border: 1px solid rgba(255,60,60,0.22); font-family: 'Space Mono', monospace; font-size: 9px; letter-spacing: 1.5px; font-weight: 700; border-radius: 2px; padding: 4px 9px; cursor: pointer; transition: all 0.15s; }
    .vn-btn-del:hover { background: rgba(255,60,60,0.08); border-color: rgba(255,60,60,0.45); }

    .vn-skel { height: 66px; background: rgba(0,255,150,0.03); border: 1px solid rgba(0,255,150,0.07); border-radius: 2px; margin-bottom: 7px; position: relative; overflow: hidden; }
    .vn-skel::after { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg,transparent 20%,rgba(0,255,150,0.07) 50%,transparent 80%); animation: vn-scan 1.8s infinite; }
    @keyframes vn-scan { from { transform: translateX(-100%); } to { transform: translateX(100%); } }

    .vn-empty { text-align: center; padding: 36px 0; color: rgba(0,255,150,0.2); font-size: 11px; line-height: 2; letter-spacing: 1px; }
    .vn-empty pre { font-family: 'Space Mono', monospace; font-size: 10px; color: rgba(0,255,150,0.15); display: inline-block; text-align: left; }

    .vn-feedback { font-size: 10px; letter-spacing: 1px; padding: 8px 10px; border-radius: 2px; margin-bottom: 10px; }
    .vn-feedback.ok { background: rgba(0,255,150,0.08); border: 1px solid rgba(0,255,150,0.2); color: #00ff96; }
    .vn-feedback.err { background: rgba(255,60,60,0.08); border: 1px solid rgba(255,60,60,0.2); color: #ff6b6b; }

    .vn-toast-root { position: fixed; bottom: 24px; right: 24px; z-index: 200; }
    .vn-toast { background: #0d1117; border: 1px solid rgba(0,255,150,0.4); color: #00ff96; font-family: 'Space Mono', monospace; font-size: 10px; letter-spacing: 1.5px; padding: 10px 16px; border-radius: 2px; animation: vn-toast-in 0.15s ease; }
    @keyframes vn-toast-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }

    @media (max-width: 540px) {
      .vn-email { display: none; }
      .vn-topbar { padding: 9px 14px; gap: 8px; }
      .vn-main { padding: 12px 14px; gap: 12px; }
      .vn-stat { padding: 10px 10px; }
      .vn-stat-val { font-size: 16px; }
      .vn-stat-key { font-size: 8px; letter-spacing: 1px; }
      .vn-card { padding: 13px 14px; }
      .vn-note-text { font-size: 11px; }
      .vn-vault-title { font-size: 12px; letter-spacing: 2px; }
      .vn-note-foot { flex-direction: column; align-items: flex-start; gap: 6px; }
      .vn-note-acts { width: 100%; justify-content: flex-end; }
      .vn-toast-root { bottom: 14px; right: 14px; left: 14px; }
      .vn-toast { display: block; text-align: center; }
    }

    @media (min-width: 860px) {
      .vn-topbar { padding: 10px 32px; }
      .vn-main { max-width: 960px; margin-left: auto; margin-right: auto; padding: 20px 32px; }
    }
  `;
  document.head.appendChild(el);
}

function escapeHtml(v) {
  return v.replace(/[&<>'"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));
}
function highlight(text, query) {
  if (!query) return escapeHtml(text);
  const safe = escapeHtml(text);
  const rx = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return safe.replace(rx, '<mark style="background:rgba(0,255,150,0.2);color:#00ff96;padding:0 2px;">$1</mark>');
}

function Corners() {
  return (
    <>
      <div className="vn-topline" />
      <div className="vn-c-tl" /><div className="vn-c-tr" />
      <div className="vn-c-bl" /><div className="vn-c-br" />
    </>
  );
}

function SectionLabel({ children }) {
  return (
    <div className="vn-section">
      <div className="vn-section-line" />
      <span className="vn-section-txt">{children}</span>
      <div className="vn-section-line" />
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [notes, setNotes] = useState([]);
  const [noteInput, setNoteInput] = useState('');
  const [query, setQuery] = useState('');
  const [loadingList, setLoadingList] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [copiedId, setCopiedId] = useState('');
  const toastRef = useRef(null);

  useEffect(() => {
    injectStyles();
    apiRequest('/auth/me')
      .then((me) => setUser(me))
      .catch(() => navigate('/', { replace: true }));
  }, [navigate]);

  useEffect(() => { loadNotes(''); }, []);

  useEffect(() => {
    const t = setTimeout(() => loadNotes(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (!toast) return;
    clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setToast(''), 2200);
    return () => clearTimeout(toastRef.current);
  }, [toast]);

  async function loadNotes(q) {
    setLoadingList(true);
    try {
      const data = q
        ? await apiRequest(`/notes/search?q=${encodeURIComponent(q)}`)
        : await apiRequest('/notes');
      setNotes(data);
    } catch (err) {
      setFeedback({ type: 'err', text: err.message });
    } finally {
      setLoadingList(false);
    }
  }

  async function saveNote() {
    if (!noteInput.trim()) { setFeedback({ type: 'err', text: 'Note cannot be empty.' }); return; }
    setSaving(true);
    setFeedback(null);
    try {
      await apiRequest('/notes', { method: 'POST', body: JSON.stringify({ text: noteInput.trim() }) });
      setNoteInput('');
      setToast('Note saved');
      await loadNotes(query);
    } catch (err) {
      setFeedback({ type: 'err', text: err.message });
    } finally {
      setSaving(false);
    }
  }

  async function deleteNote(id) {
    try {
      await apiRequest(`/notes/${id}`, { method: 'DELETE' });
      setToast('Note deleted');
      await loadNotes(query);
    } catch (err) {
      setFeedback({ type: 'err', text: err.message });
    }
  }

  async function copyText(note) {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(note.text);
      } else {
        const t = document.createElement('textarea');
        t.value = note.text;
        document.body.appendChild(t);
        t.select();
        document.execCommand('copy');
        t.remove();
      }
      setCopiedId(note.id);
      setTimeout(() => setCopiedId(''), 2000);
    } catch {
      setFeedback({ type: 'err', text: 'Copy failed.' });
    }
  }

  async function logout() {
    await apiRequest('/auth/logout', { method: 'POST' }).catch(() => {});
    navigate('/', { replace: true });
  }

  const thisWeek = useMemo(
    () => notes.filter((n) => Date.now() - new Date(n.createdAt) < 7 * 86400000).length,
    [notes],
  );
  const totalChars = useMemo(
    () => notes.reduce((acc, n) => acc + n.text.length, 0).toLocaleString(),
    [notes],
  );
  const searchMeta = useMemo(
    () => (query ? `// ${notes.length} RESULT${notes.length !== 1 ? 'S' : ''} FOR "${query}"` : ''),
    [notes.length, query],
  );

  return (
    <div className="vn-root">

      <header className="vn-topbar">
        <div className="vn-logo">Z<span>NOTE</span></div>
        <div className="vn-search">
          <span style={{ color: 'rgba(0,255,150,0.4)', fontSize: 12, userSelect: 'none' }}>_</span>
          <input
            placeholder="SEARCH NOTES..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="vn-user">
          <span className="vn-email">{user?.email || ''}</span>
          <button className="vn-btn-logout" onClick={logout}>LOGOUT</button>
        </div>
      </header>

      <main className="vn-main">

        <div className="vn-stats">
          {[
            { val: notes.length, key: 'TOTAL NOTES' },
            { val: thisWeek,     key: 'THIS WEEK' },
            { val: totalChars,   key: 'CHARS STORED' },
          ].map(({ val, key }) => (
            <div key={key} className="vn-stat">
              <div className="vn-c-tl" /><div className="vn-c-br" />
              <div className="vn-stat-val">{val}</div>
              <div className="vn-stat-key">{key}</div>
            </div>
          ))}
        </div>

        <div className="vn-card">
          <Corners />
          <SectionLabel>// NEW NOTE</SectionLabel>
          {feedback && <div className={`vn-feedback ${feedback.type}`}>{feedback.text}</div>}
          <textarea
            className="vn-textarea"
            maxLength={5000}
            value={noteInput}
            placeholder="// type your note here..."
            onChange={(e) => { setNoteInput(e.target.value); setFeedback(null); }}
          />
          <div className="vn-composer-foot">
            <span className="vn-charcount">{noteInput.length} / 5000 CHARS</span>
            <button className="vn-btn-save" onClick={saveNote} disabled={saving}>
              {saving ? <Spinner /> : 'SAVE NOTE ->'}
            </button>
          </div>
        </div>

        <div className="vn-card">
          <Corners />
          <div className="vn-vault-head">
            <span className="vn-vault-title">YOUR VAULT</span>
            <span className="vn-badge">{notes.length} ENTRIES</span>
          </div>
          {searchMeta && <div className="vn-search-meta">{searchMeta}</div>}

          {loadingList ? (
            <>
              <div className="vn-skel" />
              <div className="vn-skel" style={{ opacity: 0.6 }} />
              <div className="vn-skel" style={{ opacity: 0.35 }} />
            </>
          ) : notes.length === 0 ? (
            <div className="vn-empty">
              <pre>{`// VAULT IS EMPTY\n  .----.\n / .--. \\\n| |    | |\n| |.-""-.|\n| /_====_\\\n|_________|`}</pre>
            </div>
          ) : (
            notes.map((note) => {
              const preview = note.text.length > 200 ? `${note.text.slice(0, 200)}...` : note.text;
              const isCopied = copiedId === note.id;
              return (
                <div key={note.id} className="vn-note">
                  <div className="vn-accent" />
                  <div
                    className="vn-note-text"
                    dangerouslySetInnerHTML={{ __html: highlight(preview, query) }}
                  />
                  <div className="vn-note-foot">
                    <span className="vn-note-time">{new Date(note.createdAt).toLocaleString()}</span>
                    <div className="vn-note-acts">
                      <button
                        className={`vn-btn-copy${isCopied ? ' vn-btn-copied' : ''}`}
                        onClick={() => copyText(note)}
                      >
                        {isCopied ? 'COPIED ✓' : 'COPY'}
                      </button>
                      <button className="vn-btn-del" onClick={() => deleteNote(note.id)}>
                        DELETE
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </main>

      {toast && (
        <div className="vn-toast-root">
          <div className="vn-toast">{'> '}{toast}</div>
        </div>
      )}
    </div>
  );
}