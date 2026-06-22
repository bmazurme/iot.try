import { useTheme } from '../hooks/useTheme';
import './Header.css';

export function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="app-header">
      <div className="app-header-inner">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="8" y="8" width="16" height="16" rx="2" fill="var(--accent)" opacity=".15" />
          <rect x="10" y="10" width="12" height="12" rx="1.5" fill="var(--accent)" opacity=".3" />
          <rect x="12" y="12" width="8" height="8" rx="1" fill="var(--accent)" />
          <rect x="4" y="12" width="4" height="2" rx="1" fill="var(--accent)" opacity=".5" />
          <rect x="4" y="16" width="4" height="2" rx="1" fill="var(--accent)" opacity=".5" />
          <rect x="24" y="12" width="4" height="2" rx="1" fill="var(--accent)" opacity=".5" />
          <rect x="24" y="16" width="4" height="2" rx="1" fill="var(--accent)" opacity=".5" />
          <rect x="12" y="4" width="2" height="4" rx="1" fill="var(--accent)" opacity=".5" />
          <rect x="16" y="4" width="2" height="4" rx="1" fill="var(--accent)" opacity=".5" />
          <rect x="12" y="24" width="2" height="4" rx="1" fill="var(--accent)" opacity=".5" />
          <rect x="16" y="24" width="2" height="4" rx="1" fill="var(--accent)" opacity=".5" />
        </svg>
        <div>
          <div className="app-title">ESP32 Flasher</div>
          <div className="app-subtitle">Прошивка из браузера</div>
        </div>
        <div className="app-header-spacer" />
        <div className="badge">
          <span className="badge-dot" />
          Web Serial API
        </div>
        <button
          type="button"
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'}
          title={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
        >
          {theme === 'dark' ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
            </svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          )}
        </button>
      </div>
    </header>
  );
}
