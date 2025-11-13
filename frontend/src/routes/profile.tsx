import { FormEvent, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export function ProfileRoute() {
  const { user, loading, signInWithEmail, signOut } = useAuth();
  const [email, setEmail] = useState('');

  async function handleSignIn(e: FormEvent) {
    e.preventDefault();
    if (!email) return;
    await signInWithEmail(email);
    alert('Check your email for a magic link to sign in.');
  }

  if (loading) {
    return (
      <section className="stack">
        <p className="muted" style={{ fontSize: '0.8rem' }}>
          Checking your session...
        </p>
      </section>
    );
  }

  return (
    <section className="stack" style={{ maxWidth: 360 }}>
      <div className="page-header">
        <h1 className="page-title">Profile</h1>
        <p className="page-subtitle">
          Sign in to sync your experience across devices.
        </p>
      </div>
      {user ? (
        <>
          <p style={{ fontSize: '0.85rem' }}>
            Signed in as <strong>{user.email ?? user.id}</strong>
          </p>
          <button className="btn btn-ghost btn-sm" type="button" onClick={signOut}>
            Sign out
          </button>
        </>
      ) : (
        <form className="stack" onSubmit={handleSignIn}>
          <div className="form-row">
            <span className="label">Email</span>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <button className="btn btn-primary" type="submit">
            Send magic link
          </button>
        </form>
      )}
    </section>
  );
}
