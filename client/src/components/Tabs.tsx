import './Tabs.css';

export type Tab = 'usb' | 'wifi';

interface TabsProps {
  tab: Tab;
  onChange: (tab: Tab) => void;
}

export function Tabs({ tab, onChange }: TabsProps) {
  return (
    <nav className="tabs">
      <div className="tabs-inner">
        <button type="button" className={`tab ${tab === 'usb' ? 'tab-active' : ''}`} onClick={() => onChange('usb')}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="3" y="6" width="10" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
            <path d="M6 6V4.5a2 2 0 014 0V6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            <circle cx="6.5" cy="9" r="1" fill="currentColor" />
            <circle cx="9.5" cy="9" r="1" fill="currentColor" />
          </svg>
          По USB-кабелю
        </button>
        <button type="button" className={`tab ${tab === 'wifi' ? 'tab-active' : ''}`} onClick={() => onChange('wifi')}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M1.5 6C3.3 4.2 5.5 3.2 8 3.2s4.7 1 6.5 2.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            <path d="M3.5 8.5C4.8 7.2 6.3 6.5 8 6.5s3.2.7 4.5 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            <path d="M5.5 11C6.3 10.2 7.1 9.8 8 9.8s1.7.4 2.5 1.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            <circle cx="8" cy="13.2" r="1.1" fill="currentColor" />
          </svg>
          По Wi-Fi (OTA)
        </button>
      </div>
    </nav>
  );
}
