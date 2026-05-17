import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../api';
import { Spinner } from '../components/Spinner';

function escapeHtml(value) {
  return value.replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}

function highlight(text, query) {
  if (!query) return escapeHtml(text);
  const safe = escapeHtml(text);
  const rx = new RegExp(`(${query.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')})`, 'gi');
  return safe.replace(rx, '<mark>$1</mark>');
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
  const [copiedId, setCopiedId] = useState('');

  useEffect(() => {
    apiRequest('/auth/me')
      .then((me) => setUser(me))
      .catch(() => navigate('/', { replace: true }));
  }, [navigate]);

  useEffect(() => {
    const t = setTimeout(() => {
      loadNotes(query);
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    loadNotes('');
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  async function loadNotes(q) {
    setLoadingList(true);
    try {
      const data = q ? await apiRequest(`/notes/search?q=${encodeURIComponent(q)}`) : await apiRequest('/notes');
      setNotes(data);
    } catch (error) {
      setToast(error.message);
    } finally {
      setLoadingList(false);
    }
  }

  async function saveNote() {
    if (!noteInput.trim()) {
      setToast('Note cannot be empty');
      return;
    }

    setSaving(true);
    try {
      await apiRequest('/notes', { method: 'POST', body: JSON.stringify({ text: noteInput.trim() }) });
      setNoteInput('');
      setToast('Note saved');
      await loadNotes(query);
    } catch (error) {
      setToast(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteNote(id) {
    try {
      await apiRequest(`/notes/${id}`, { method: 'DELETE' });
      setToast('Note deleted');
      await loadNotes(query);
    } catch (error) {
      setToast(error.message);
    }
  }

  async function copyText(note) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
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
      setToast('Copy failed');
    }
  }

  async function logout() {
    await apiRequest('/auth/logout', { method: 'POST' }).catch(() => {});
    navigate('/', { replace: true });
  }

  const searchMeta = useMemo(() => (query ? `SHOWING ${notes.length} RESULTS FOR "${query}"` : ''), [notes.length, query]);

  return (
    <div className="dashboard-bg">
      <header className="topbar card">
        <div className="logo-sm">VAULTNOTE</div>
        <div className="search-wrap"><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="SEARCH NOTES" /></div>
        <div className="user-wrap">
          <span>{user?.email || ''}</span>
          <button className="btn btn-danger" onClick={logout}>LOGOUT</button>
        </div>
      </header>

      <main className="dashboard-grid">
        <aside className="card sidebar">
          <h2>NEW NOTE +</h2>
          <textarea maxLength={5000} value={noteInput} onChange={(e) => setNoteInput(e.target.value)} placeholder="// type your note here..." />
          <p className="small">{noteInput.length} / 5000</p>
          <button className="btn btn-accent" onClick={saveNote} disabled={saving}>{saving ? <Spinner /> : 'SAVE NOTE ?'}</button>
          <div className="stats">TOTAL NOTES: {notes.length}</div>
        </aside>

        <section className="card vault-main">
          <div className="vault-header"><h2>YOUR VAULT</h2><span className="badge">{notes.length}</span></div>
          <p className="small muted">{searchMeta}</p>
          {loadingList ? (
            <>
              <div className="skeleton" />
              <div className="skeleton" />
              <div className="skeleton" />
            </>
          ) : notes.length === 0 ? (
            <div className="empty"><pre>{`// VAULT IS EMPTY\n  .----.\n / .--. \\\n| |    | |\n| |.-\"\"-.|\n| /_====_\\\\\n|_________|`}</pre></div>
          ) : (
            notes.map((note) => {
              const preview = note.text.length > 200 ? `${note.text.slice(0, 200)}...` : note.text;
              return (
                <article key={note.id} className="note-card">
                  <div className="note-text" dangerouslySetInnerHTML={{ __html: highlight(preview, query) }} />
                  <div className="note-meta">
                    <span className="small muted">{new Date(note.createdAt).toLocaleString()}</span>
                    <div className="note-actions">
                      <button className={`btn note-copy ${copiedId === note.id ? 'note-copied' : ''}`} onClick={() => copyText(note)}>
                        {copiedId === note.id ? 'COPIED ?' : 'COPY'}
                      </button>
                      <button className="btn note-delete" onClick={() => deleteNote(note.id)}>DELETE</button>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </section>
      </main>

      <div className="toast-root">{toast && <div className="toast">{toast}</div>}</div>
    </div>
  );
}