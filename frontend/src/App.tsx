import { Routes, Route, NavLink, Link, Navigate } from "react-router-dom";

import { HomeRoute } from "./routes/home";
import { SearchRoute } from "./routes/search";
import { RecipeDetailRoute } from "./routes/recipe-detail";
import { FavoritesRoute } from "./routes/favorites";
import { ShoppingListRoute } from "./routes/shopping-list";
import { AIGeneratorRoute } from "./routes/ai-generator";
import { ProfileRoute } from "./routes/profile";

import {SignupForm} from "./routes/auth/SignupForm";
import LoginForm from "./routes/auth/LoginForm";
import { ProfileSetup } from "./routes/profile/ProfileSetup";

import { useAuth } from "./context/AuthContext"; // ⬅ Make sure you have this

// Active class builder
const navClass = ({ isActive }: { isActive: boolean }) =>
  ["nav-link", isActive ? "nav-link-active" : ""].join(" ").trim();

// Protect pages (requires supabase user)
function RequireAuth({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const { user } = useAuth();

  return (
    <div className="app">
      {/* NAVBAR */}
      <header className="app-header">
        <div className="app-header-inner">
          {/* Brand */}
          <Link to="/" className="brand">
            <span className="brand-logo">🍲</span>
            <div>
              <div className="brand-title">Recipe Finder</div>
              <div className="brand-subtitle">AI-powered meal ideas</div>
            </div>
          </Link>

          {/* NAVIGATION LINKS */}
          <nav className="nav-links">
            <NavLink to="/" end className={navClass}>
              Home
            </NavLink>

            <NavLink to="/search" className={navClass}>
              Search
            </NavLink>

            <NavLink to="/favorites" className={navClass}>
              Favorites
            </NavLink>

            <NavLink to="/shopping-list" className={navClass}>
              Shopping
            </NavLink>

            <NavLink to="/ai-generator" className={navClass}>
              AI Chef
            </NavLink>

            {/* ---------- AUTH VISIBILITY ---------- */}
            {!user && (
              <>
                <NavLink to="/login" className={navClass}>
                  Login
                </NavLink>
                <NavLink to="/signup" className={navClass}>
                  Sign Up
                </NavLink>
              </>
            )}

            {user && (
              <NavLink to="/profile" className={navClass}>
                Profile
              </NavLink>
            )}
          </nav>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="app-main w-full">
        <div className="w-full max-w-full px-4 md:px-6 lg:px-8">
          <Routes>
            {/* Public */}
            <Route path="/login" element={<LoginForm />} />
            <Route path="/signup" element={<SignupForm />} />

            {/* Profile setup required after signup */}
            <Route path="/profile-setup" element={<ProfileSetup />} />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <RequireAuth>
                  <HomeRoute />
                </RequireAuth>
              }
            />

            <Route
              path="/search"
              element={
                <RequireAuth>
                  <SearchRoute />
                </RequireAuth>
              }
            />

            <Route
              path="/recipes/:id"
              element={
                <RequireAuth>
                  <RecipeDetailRoute />
                </RequireAuth>
              }
            />

            <Route
              path="/favorites"
              element={
                <RequireAuth>
                  <FavoritesRoute />
                </RequireAuth>
              }
            />

            <Route
              path="/shopping-list"
              element={
                <RequireAuth>
                  <ShoppingListRoute />
                </RequireAuth>
              }
            />

            <Route
              path="/ai-generator"
              element={
                <RequireAuth>
                  <AIGeneratorRoute />
                </RequireAuth>
              }
            />

            <Route
              path="/profile"
              element={
                <RequireAuth>
                  <ProfileRoute />
                </RequireAuth>
              }
            />
          </Routes>
        </div>
      </main>

      <footer className="app-footer">
       · Recipe Finder · 
      </footer>
    </div>
  );
}
