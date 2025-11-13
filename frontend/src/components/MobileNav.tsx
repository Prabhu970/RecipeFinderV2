import { Link, NavLink } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Menu } from 'lucide-react';
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

interface MobileNavProps {
  className?: string;
}

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'block w-full text-left px-3 py-2 rounded-md text-sm font-medium',
    isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
  ].join(' ');

export function MobileNav({ className = '' }: MobileNavProps) {

  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then((res) => {
      setSession(res.data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const isLoggedIn = !!session;

  return (
    <div className={['w-full flex items-center justify-between', className].join(' ')}>
      <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
        <span role="img" aria-label="chef">🧑‍🍳</span>
        <span>Recipe Finder</span>
      </Link>

      <Sheet>
        <SheetTrigger className="inline-flex items-center justify-center rounded-md border px-2 py-1">
          <Menu className="h-5 w-5" />
        </SheetTrigger>

        <SheetContent side="right" className="pt-10">
          <nav className="flex flex-col gap-1">

            <NavLink to="/" className={navLinkClass} end>Home</NavLink>
            <NavLink to="/search" className={navLinkClass}>Search</NavLink>

            {isLoggedIn && (
              <>
                <NavLink to="/favorites" className={navLinkClass}>Favorites</NavLink>
                <NavLink to="/shopping-list" className={navLinkClass}>Shopping List</NavLink>
                <NavLink to="/ai-generator" className={navLinkClass}>AI Generator</NavLink>
                <NavLink to="/profile" className={navLinkClass}>Profile</NavLink>
              </>
            )}

            {!isLoggedIn && (
              <>
                <NavLink to="/login" className={navLinkClass}>Log in</NavLink>
                <NavLink to="/signup" className={navLinkClass}>Sign up</NavLink>
              </>
            )}

          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}
