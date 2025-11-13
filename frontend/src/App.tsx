import { Routes, Route, NavLink, Link } from 'react-router-dom';
import { HomeRoute } from './routes/home';
import { SearchRoute } from './routes/search';
import { RecipeDetailRoute } from './routes/recipe-detail';
import { FavoritesRoute } from './routes/favorites';
import { ShoppingListRoute } from './routes/shopping-list';
import { AIGeneratorRoute } from './routes/ai-generator';
import { ProfileRoute } from './routes/profile';

const navClass = ({ isActive }: { isActive: boolean }) =>
  ['nav-link', isActive ? 'nav-link-active' : ''].join(' ').trim();

export default function App() {
  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-inner">
          <Link to="/" className="brand">
            <span className="brand-logo">🍲</span>
            <div>
              <div className="brand-title">Recipe Finder</div>
              <div className="brand-subtitle">AI-powered meal ideas</div>
            </div>
          </Link>
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
            <NavLink to="/profile" className={navClass}>
              Profile
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="app-main">
        <div className="app-main-inner">
          <Routes>
            <Route path="/" element={<HomeRoute />} />
            <Route path="/search" element={<SearchRoute />} />
            <Route path="/recipes/:id" element={<RecipeDetailRoute />} />
            <Route path="/favorites" element={<FavoritesRoute />} />
            <Route path="/shopping-list" element={<ShoppingListRoute />} />
            <Route path="/ai-generator" element={<AIGeneratorRoute />} />
            <Route path="/profile" element={<ProfileRoute />} />
          </Routes>
        </div>
      </main>
      <footer className="app-footer">
        Recipe Finder · Supabase · Node API · Python LLM · GitHub Actions CI/CD
      </footer>
    </div>
  );
}
