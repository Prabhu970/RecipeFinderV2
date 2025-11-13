import { FormEvent, useEffect, useState, ChangeEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { supabase } from '../lib/supabaseClient';

export function ProfileRoute() {
  const { user, loading, signInWithEmail, signOut } = useAuth();
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [diet, setDiet] = useState('');
  const [allergies, setAllergies] = useState('');
  const [favoriteCuisines, setFavoriteCuisines] = useState('');
  const [cookingSkill, setCookingSkill] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSignIn(e: FormEvent) {
    e.preventDefault();
    if (!email) return;
    await signInWithEmail(email);
    alert('Check your email for a magic link to sign in.');
  }

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) return;
      const profile = await api.getProfile(token);
      if (profile) {
        setDisplayName(profile.display_name ?? '');
        setAvatarUrl(profile.avatar_url ?? '');
        setDiet(profile.diet ?? '');
        setAllergies((profile.allergies ?? []).join(', '));
        setFavoriteCuisines((profile.favorite_cuisines ?? []).join(', '));
        setCookingSkill(profile.cooking_skill ?? '');
      }
    }
    fetchProfile();
  }, [user]);

  async function handleSaveProfile() {
    if (!user) return;
    setSaving(true);
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) return;
      const payload = {
        display_name: displayName,
        avatar_url: avatarUrl,
        diet,
        allergies: allergies
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        favorite_cuisines: favoriteCuisines
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        cooking_skill: cookingSkill
      };
      await api.updateProfile(token, payload);
      alert('Profile saved.');
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarChange(e: ChangeEvent<HTMLInputElement>) {
    if (!user) return;
    const file = e.target.files?.[0];
    if (!file) return;
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) {
      alert('Please sign in again.');
      return;
    }
    const url = await api.uploadAvatar(file, user.id);
    setAvatarUrl(url);
    await api.updateProfile(token, { avatar_url: url });
  }

  if (loading) {
    return (
      <section className="stack">
        <p>Loading...</p>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="stack">
        <div className="page-header">
          <h1 className="page-title">Your profile</h1>
          <p className="page-subtitle">
            Sign in to save favorites, preferences, and your shopping list.
          </p>
        </div>
        <form className="stack" onSubmit={handleSignIn} style={{ maxWidth: 360 }}>
          <div className="form-row">
            <label className="label">Email</label>
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
      </section>
    );
  }

  return (
    <section className="stack" style={{ maxWidth: 520, margin: '0 auto' }}>
      <div className="page-header">
        <h1 className="page-title">Your profile</h1>
        <p className="page-subtitle">Control how recipes are personalized for you.</p>
      </div>

      <div className="flex-row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="flex-row" style={{ gap: '0.75rem', alignItems: 'center' }}>
          <img
            src={avatarUrl || 'https://placehold.co/96x96?text=Avatar'}
            alt="Avatar"
            style={{
              width: 80,
              height: 80,
              borderRadius: '999px',
              objectFit: 'cover',
              border: '2px solid rgba(30,64,175,1)'
            }}
          />
          <div className="stack">
            <strong>{displayName || user.email || 'Unnamed cook'}</strong>
            <label className="btn btn-ghost btn-sm">
              Change avatar
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleAvatarChange}
              />
            </label>
          </div>
        </div>
        <button className="btn btn-ghost btn-sm" type="button" onClick={signOut}>
          Sign out
        </button>
      </div>

      <div className="stack">
        <div className="form-row">
          <label className="label">Display name</label>
          <input
            className="input"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="How should we call you?"
          />
        </div>

        <div className="form-row">
          <label className="label">Diet preference</label>
          <select
            className="select"
            value={diet}
            onChange={(e) => setDiet(e.target.value)}
          >
            <option value="">None</option>
            <option value="vegan">Vegan</option>
            <option value="vegetarian">Vegetarian</option>
            <option value="gluten-free">Gluten-free</option>
            <option value="keto">Keto</option>
            <option value="paleo">Paleo</option>
          </select>
        </div>

        <div className="form-row">
          <label className="label">Allergies (comma separated)</label>
          <input
            className="input"
            value={allergies}
            onChange={(e) => setAllergies(e.target.value)}
            placeholder="peanuts, shellfish, gluten..."
          />
        </div>

        <div className="form-row">
          <label className="label">Favorite cuisines (comma separated)</label>
          <input
            className="input"
            value={favoriteCuisines}
            onChange={(e) => setFavoriteCuisines(e.target.value)}
            placeholder="italian, mexican, indian..."
          />
        </div>

        <div className="form-row">
          <label className="label">Cooking skill</label>
          <select
            className="select"
            value={cookingSkill}
            onChange={(e) => setCookingSkill(e.target.value)}
          >
            <option value="">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        <button
          className="btn btn-primary"
          type="button"
          disabled={saving}
          onClick={handleSaveProfile}
        >
          {saving ? 'Saving...' : 'Save profile'}
        </button>
      </div>
    </section>
  );
}
