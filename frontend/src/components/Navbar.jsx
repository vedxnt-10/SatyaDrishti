import { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, Scan, ChartLineUp, Sun, Moon } from '@phosphor-icons/react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ThemeContext } from '../App';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function Navbar() {
  const location = useLocation();
  const { theme, toggleTheme } = useContext(ThemeContext);

  const navItems = [
    { name: 'Scanner', path: '/scan', icon: Scan },
    { name: 'Analytics', path: '/dashboard', icon: ChartLineUp },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4 pointer-events-none">
      <nav className="pointer-events-auto flex items-center gap-1 h-12 px-1.5 bg-bg-secondary/70 backdrop-blur-2xl border border-border-subtle rounded-full shadow-[0_4px_24px_rgba(0,0,0,0.25)] transition-colors duration-500">
        {/* Brand */}
        <Link
          to="/"
          className="flex items-center gap-2 px-4 h-9 transition-opacity hover:opacity-80"
        >
          <ShieldCheck weight="fill" className="h-[18px] w-[18px] text-accent-primary" />
          <span className="font-semibold text-[13px] tracking-[-0.01em] text-text-primary">
            SatyaDrishti
          </span>
        </Link>

        {/* Separator */}
        <div className="w-px h-5 bg-border-subtle mx-0.5 flex-shrink-0 transition-colors duration-500" />

        {/* Nav links */}
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-2 px-4 h-9 text-[13px] font-medium rounded-full transition-all duration-300',
                isActive
                  ? 'bg-text-primary/10 text-text-primary'
                  : 'text-text-secondary hover:text-text-primary hover:bg-text-primary/5'
              )}
            >
              <Icon weight={isActive ? 'fill' : 'regular'} className="h-[15px] w-[15px]" />
              {item.name}
            </Link>
          );
        })}

        {/* Separator */}
        <div className="w-px h-5 bg-border-subtle mx-0.5 flex-shrink-0 transition-colors duration-500" />

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center justify-center w-9 h-9 rounded-full text-text-secondary hover:text-text-primary hover:bg-text-primary/5 transition-all duration-300"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun weight="bold" className="h-[15px] w-[15px]" />
          ) : (
            <Moon weight="bold" className="h-[15px] w-[15px]" />
          )}
        </button>
      </nav>
    </header>
  );
}
