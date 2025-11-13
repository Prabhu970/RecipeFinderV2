import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "../lib/supabaseClient";
import { api } from "../lib/api";

interface FavoritesContextValue {
  favorites: string[];
  toggleFavorite: (id: string) => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const session = data.session;
      if (session?.access_token) {
        setToken(session.access_token);
        loadFavorites(session.access_token);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.access_token) {
        setToken(session.access_token);
        loadFavorites(session.access_token);
      } else {
        setToken(null);
        setFavorites([]);
      }
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  async function loadFavorites(tok: string) {
    try {
      const favIds = await api.getFavorites(tok);
      setFavorites(favIds);
    } catch (err) {
      console.warn("Failed to load favorites", err);
    }
  }

  async function toggleFavorite(id: string) {
    if (!token) {
      alert("Please sign in to save favorites.");
      return;
    }
    const isFav = favorites.includes(id);
    try {
      if (isFav) {
        await api.removeFavorite(id, token);
        setFavorites((prev) => prev.filter((x) => x !== id));
      } else {
        await api.addFavorite(id, token);
        setFavorites((prev) => [...prev, id]);
      }
    } catch (err) {
      console.error("Failed to toggle favorite", err);
    }
  }

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavoritesContext() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavoritesContext must be used within FavoritesProvider");
  return ctx;
}
