import { useState } from 'react';
import { ThemeProvider } from '@gravity-ui/uikit';
import { Header } from './components/Header';
import { Tabs, type TabValue } from './components/Tabs';
import { UsbFlasher } from './components/UsbFlasher';
import { WifiFlasher } from './components/WifiFlasher';
import { useTheme } from './hooks/useTheme';
import './App.css';

function App() {
  const [tab, setTab] = useState<TabValue>('usb');
  const { theme, setTheme } = useTheme();

  return (
    <ThemeProvider theme={theme}>
      <Header onThemeChange={setTheme} />
      <Tabs tab={tab} onChange={setTab} />
      <main className="app-main">{tab === 'usb' ? <UsbFlasher /> : <WifiFlasher />}</main>
    </ThemeProvider>
  );
}

export default App;
