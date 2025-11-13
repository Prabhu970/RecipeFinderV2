import { ReactNode } from 'react';
import { DesktopNav } from '../DesktopNav';
import { MobileNav } from '../MobileNav';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b sticky top-0 z-40 bg-background/90 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <DesktopNav className="hidden md:flex" />
          <MobileNav className="md:hidden" />
        </div>
      </header>

      <main className="flex-1">
        <div className="container mx-auto px-4 py-6">{children}</div>
      </main>

      <footer className="border-t py-4 text-center text-sm text-muted-foreground">
        Recipe Finder · Built with Supabase, Node & Python
      </footer>
    </div>
  );
}
