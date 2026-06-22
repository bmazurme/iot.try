import { Moon, Sun } from '@gravity-ui/icons';
import { Button, Icon, Label, type Theme, useThemeType } from '@gravity-ui/uikit';
import './Header.css';

interface HeaderProps {
  onThemeChange: (theme: Theme) => void;
}

export function Header({ onThemeChange }: HeaderProps) {
  const themeType = useThemeType();
  const toggleTheme = () => onThemeChange(themeType === 'dark' ? 'light' : 'dark');

  return (
    <header className="app-header">
      <div className="app-header-inner">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="8" y="8" width="16" height="16" rx="2" fill="var(--g-color-text-brand)" opacity=".15" />
          <rect x="10" y="10" width="12" height="12" rx="1.5" fill="var(--g-color-text-brand)" opacity=".3" />
          <rect x="12" y="12" width="8" height="8" rx="1" fill="var(--g-color-text-brand)" />
          <rect x="4" y="12" width="4" height="2" rx="1" fill="var(--g-color-text-brand)" opacity=".5" />
          <rect x="4" y="16" width="4" height="2" rx="1" fill="var(--g-color-text-brand)" opacity=".5" />
          <rect x="24" y="12" width="4" height="2" rx="1" fill="var(--g-color-text-brand)" opacity=".5" />
          <rect x="24" y="16" width="4" height="2" rx="1" fill="var(--g-color-text-brand)" opacity=".5" />
          <rect x="12" y="4" width="2" height="4" rx="1" fill="var(--g-color-text-brand)" opacity=".5" />
          <rect x="16" y="4" width="2" height="4" rx="1" fill="var(--g-color-text-brand)" opacity=".5" />
          <rect x="12" y="24" width="2" height="4" rx="1" fill="var(--g-color-text-brand)" opacity=".5" />
          <rect x="16" y="24" width="2" height="4" rx="1" fill="var(--g-color-text-brand)" opacity=".5" />
        </svg>
        <div>
          <div className="app-title">ESP32 Flasher</div>
          <div className="app-subtitle">Прошивка из браузера</div>
        </div>
        <div className="app-header-spacer" />
        <Label theme="success" icon={<span className="badge-dot" />}>
          Web Serial API
        </Label>
        <Button
          view="outlined"
          size="m"
          onClick={toggleTheme}
          aria-label={themeType === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'}
          title={themeType === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
        >
          <Icon data={themeType === 'dark' ? Sun : Moon} size={16} />
        </Button>
      </div>
    </header>
  );
}
