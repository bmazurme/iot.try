import { useState } from 'react';
import { Header } from './components/Header';
import { Tabs, type Tab } from './components/Tabs';
import { UsbFlasher } from './components/UsbFlasher';
import { WifiFlasher } from './components/WifiFlasher';
import './App.css';

function App() {
  const [tab, setTab] = useState<Tab>('usb');

  return (
    <>
      <Header />
      <Tabs tab={tab} onChange={setTab} />
      <main className="app-main">{tab === 'usb' ? <UsbFlasher /> : <WifiFlasher />}</main>
    </>
  );
}

export default App;
