import { useCallback, useState } from 'react';
import type { Theme } from '@gravity-ui/uikit';

const STORAGE_KEY = 'esp32-flasher-theme';

function readStoredTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === 'light' || stored === 'dark' ? stored : 'system';
}

/** Theme follows the OS preference (Gravity UI's ThemeProvider handles that) until the user picks one explicitly. */
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(readStoredTheme);

  const setTheme = useCallback((next: Theme) => {
    localStorage.setItem(STORAGE_KEY, next);
    setThemeState(next);
  }, []);

  return { theme, setTheme };
}
