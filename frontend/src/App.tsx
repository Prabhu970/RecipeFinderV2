import { Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';

import { HomeRoute } from './routes/home';
import { SearchRoute } from './routes/search';
import { RecipeDetailRoute } from './routes/recipe-detail';
import { FavoritesRoute } from './routes/favorites';
import { ShoppingListRoute } from './routes/shopping-list';
import { AIGeneratorRoute } from './routes/ai-generator';
import { ProfileRoute } from './routes/profile';

export default function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<HomeRoute />} />
        <Route path="/search" element={<SearchRoute />} />
        <Route path="/recipes/:id" element={<RecipeDetailRoute />} />
        <Route path="/favorites" element={<FavoritesRoute />} />
        <Route path="/shopping-list" element={<ShoppingListRoute />} />
        <Route path="/ai-generator" element={<AIGeneratorRoute />} />
        <Route path="/profile" element={<ProfileRoute />} />
      </Routes>
    </AppLayout>
  );
}
