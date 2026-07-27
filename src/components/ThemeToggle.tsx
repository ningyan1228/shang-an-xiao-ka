import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';
const storageKey = 'shang-an-xiao-ka-theme';

function initialTheme(): Theme {
  const saved = window.localStorage.getItem(storageKey);
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(initialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    window.localStorage.setItem(storageKey, theme);
  }, [theme]);

  const nextTheme = theme === 'dark' ? 'light' : 'dark';
  return <button
    type="button"
    className="theme-toggle"
    onClick={() => setTheme(nextTheme)}
    title={nextTheme === 'dark' ? '切换到深色模式' : '切换到浅色模式'}
    aria-label={nextTheme === 'dark' ? '切换到深色模式' : '切换到浅色模式'}
  >
    {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    <span>{theme === 'dark' ? '浅色' : '深色'}</span>
  </button>;
}
