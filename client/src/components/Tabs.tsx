import { BroadcastSignal, PlugConnection } from '@gravity-ui/icons';
import { Icon, Tab, TabList, TabProvider } from '@gravity-ui/uikit';
import './Tabs.css';

export type TabValue = 'usb' | 'wifi';

interface TabsProps {
  tab: TabValue;
  onChange: (tab: TabValue) => void;
}

export function Tabs({ tab, onChange }: TabsProps) {
  return (
    <nav className="tabs">
      <div className="tabs-inner">
        <TabProvider value={tab} onUpdate={(value) => onChange(value as TabValue)}>
          <TabList size="l">
            <Tab value="usb" icon={<Icon data={PlugConnection} size={16} />}>
              По USB-кабелю
            </Tab>
            <Tab value="wifi" icon={<Icon data={BroadcastSignal} size={16} />}>
              По Wi-Fi (OTA)
            </Tab>
          </TabList>
        </TabProvider>
      </div>
    </nav>
  );
}
