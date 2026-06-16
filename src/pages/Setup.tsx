import { useState } from 'react';
import { setSecret } from '../api/client';

export default function Setup({ onUnlock }: { onUnlock: () => void }) {
  const [secret, setSecretVal] = useState('');
  const [err, setErr] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!secret.trim()) { setErr('Enter the API secret.'); return; }
    setSecret(secret.trim());
    onUnlock();
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="card w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🔐</div>
          <h1 className="text-xl font-bold text-teal">StashPass Admin</h1>
          <p className="text-sm text-muted mt-1">Enter your API secret to continue</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">API Secret</label>
            <input
              type="password"
              className="input"
              placeholder="CIRCLES_API_SECRET value"
              value={secret}
              onChange={e => { setSecretVal(e.target.value); setErr(''); }}
              autoFocus
            />
            {err && <p className="text-red-400 text-xs mt-1">{err}</p>}
          </div>
          <button type="submit" className="btn-primary w-full">Unlock Dashboard</button>
        </form>
        <p className="text-xs text-muted text-center mt-4">
          Secret is stored only in your browser's localStorage.
        </p>
      </div>
    </div>
  );
}
