import { FormEvent, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export function ProfileRoute() {
  const { user, loading, signInWithEmail, signOut } = useAuth();
  const [email, setEmail] = useState('');

  if (loading) {
    return <p className="text-sm text-muted-foreground">Checking your session...</p>;
  }

  async function handleSignIn(e: FormEvent) {
    e.preventDefault();
    if (!email) return;
    await signInWithEmail(email);
    alert('Check your email for a magic link to sign in.');
  }

  return (
    <section className="space-y-4 max-w-md">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to sync your favorites and settings across devices.
        </p>
      </header>

      {user ? (
        <div className="space-y-3">
          <p className="text-sm">
            Signed in as <span className="font-medium">{user.email ?? user.id}</span>
          </p>
          <button
            type="button"
            onClick={signOut}
            className="inline-flex h-9 items-center rounded-md border px-3 text-sm font-medium hover:bg-muted"
          >
            Sign out
          </button>
        </div>
      ) : (
        <form className="space-y-3" onSubmit={handleSignIn}>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full h-9 rounded-md border px-2 text-sm bg-background"
              required
            />
          </div>
          <button
            type="submit"
            className="inline-flex h-9 items-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Send magic link
          </button>
        </form>
      )}
    </section>
  );
}
