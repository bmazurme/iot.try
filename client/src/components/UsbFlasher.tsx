import { useRef, useState } from 'react';
import type { FlashFreqValues, FlashModeValues, FlashSizeValues } from 'esptool-js';
import { Plus, ThunderboltFill, TrashBin } from '@gravity-ui/icons';
import { Alert, Button, Card, Checkbox, Disclosure, Icon, Label, Progress, Select } from '@gravity-ui/uikit';
import { isWebSerialSupported, useUsbFlasher } from '../hooks/useUsbFlasher';
import { useTerminalLog } from '../hooks/useTerminalLog';
import { Console } from './Console';
import { FirmwareFileRow } from './FirmwareFileRow';
import { parseAddress } from '../utils/hex';
import type { FirmwareSlot } from '../types';
import type { FlashFileInput } from '../hooks/useUsbFlasher';

const BAUD_RATES = [115200, 230400, 460800, 921600];

let slotIdCounter = 0;
const createSlot = (address: string): FirmwareSlot => ({ id: slotIdCounter++, file: null, address });

export function UsbFlasher() {
  const { lines, pending, append, clean, terminal } = useTerminalLog();
  const { status, chipName, progress, connect, disconnect, flash, eraseFlash } = useUsbFlasher(terminal);

  const [baudrate, setBaudrate] = useState(115200);
  const [slots, setSlots] = useState<FirmwareSlot[]>([createSlot('0x10000')]);
  const [eraseAll, setEraseAll] = useState(false);
  const [compress, setCompress] = useState(true);
  const [flashMode, setFlashMode] = useState<FlashModeValues>('keep');
  const [flashFreq, setFlashFreq] = useState<FlashFreqValues>('keep');
  const [flashSize, setFlashSize] = useState<FlashSizeValues>('keep');
  const formRef = useRef<HTMLDivElement>(null);

  const connected = status === 'connected' || status === 'busy';
  const busy = status === 'busy' || status === 'connecting';

  const updateSlot = (id: number, next: FirmwareSlot) => {
    setSlots((prev) => prev.map((s) => (s.id === id ? next : s)));
  };

  const removeSlot = (id: number) => {
    setSlots((prev) => prev.filter((s) => s.id !== id));
  };

  const addSlot = (address: string) => {
    setSlots((prev) => [...prev, createSlot(address)]);
  };

  const handleConnect = () => connect(baudrate);

  const handleFlash = async () => {
    const inputs: FlashFileInput[] = [];
    for (const slot of slots) {
      if (!slot.file) continue;
      const address = parseAddress(slot.address);
      if (address === null) {
        append(`Некорректный адрес «${slot.address}» для файла ${slot.file.name}`, 'error');
        return;
      }
      const buffer = await slot.file.arrayBuffer();
      inputs.push({ name: slot.file.name, address, data: new Uint8Array(buffer) });
    }
    if (inputs.length === 0) {
      append('Выберите хотя бы один .bin файл для прошивки', 'error');
      return;
    }
    const ok = await flash(inputs, { eraseAll, compress, flashMode, flashFreq, flashSize });
    if (ok) append('Прошивка успешно записана!', 'success');
  };

  const handleEraseFlash = async () => {
    if (!window.confirm('Полностью очистить flash-память устройства? Это удалит всю прошивку и данные.')) return;
    const ok = await eraseFlash();
    if (ok) append('Flash-память полностью очищена.', 'success');
  };

  const canFlash = connected && status !== 'busy' && slots.some((s) => s.file);

  const overallPercent = progress ? ((progress.fileIndex + progress.written / progress.total) / progress.fileCount) * 100 : 0;

  if (!isWebSerialSupported) {
    return (
      <div className="panel">
        <Alert
          theme="warning"
          title="Web Serial API не поддерживается"
          message="Откройте приложение в Chrome, Edge или другом браузере на основе Chromium (версия 89+) по HTTPS или на localhost."
        />
      </div>
    );
  }

  return (
    <div className="panel" ref={formRef}>
      <Card type="container" view="raised" size="l" className="card">
        <div className="section-head">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="6" stroke="var(--g-color-text-brand)" strokeWidth="1.5" />
            <path d="M4.5 7h5M7 4.5v5" stroke="var(--g-color-text-brand)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span>Подключение</span>
        </div>
        <div className="row">
          <div className="field">
            <span>Скорость (baud)</span>
            <Select
              value={[String(baudrate)]}
              disabled={connected}
              onUpdate={(value) => setBaudrate(Number(value[0]))}
              options={BAUD_RATES.map((rate) => ({ value: String(rate), content: String(rate) }))}
            />
          </div>
          {!connected ? (
            <Button view="action" size="m" loading={status === 'connecting'} disabled={busy} onClick={handleConnect}>
              {status === 'connecting' ? 'Подключение…' : 'Подключить устройство'}
            </Button>
          ) : (
            <Button view="outlined" size="m" disabled={status === 'busy'} onClick={disconnect}>
              Отключить
            </Button>
          )}
          <Label
            className="status-label"
            theme={connected ? 'success' : 'normal'}
            icon={<span className={`status-dot${connected ? ' status-dot-active' : ''}`} />}
          >
            {connected ? `Подключено${chipName ? `: ${chipName}` : ''}` : 'Не подключено'}
          </Label>
        </div>
      </Card>

      <Card type="container" view="raised" size="l" className="card">
        <div className="section-head">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="2" y="1.5" width="7" height="11" rx="1.5" stroke="var(--g-color-text-brand)" strokeWidth="1.4" />
            <path d="M5 1.5v3l2-1 2 1V1.5" stroke="var(--g-color-text-brand)" strokeWidth="1.2" />
            <path d="M4 7.5h6M4 9.5h4" stroke="var(--g-color-text-brand)" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          <span>Файлы прошивки</span>
        </div>
        <div className="firmware-list">
          {slots.map((slot, index) => (
            <FirmwareFileRow
              key={slot.id}
              slot={slot}
              disabled={busy}
              progressPercent={
                status === 'busy' && progress && progress.fileIndex === index ? (progress.written / progress.total) * 100 : undefined
              }
              onChange={(next) => updateSlot(slot.id, next)}
              onRemove={() => removeSlot(slot.id)}
            />
          ))}
        </div>
        <div className="row preset-row">
          <Button view="outlined" size="xs" disabled={busy} onClick={() => addSlot('0x1000')}>
            <Icon data={Plus} size={12} /> Bootloader (0x1000)
          </Button>
          <Button view="outlined" size="xs" disabled={busy} onClick={() => addSlot('0x8000')}>
            <Icon data={Plus} size={12} /> Таблица разделов (0x8000)
          </Button>
          <Button view="outlined" size="xs" disabled={busy} onClick={() => addSlot('0x10000')}>
            <Icon data={Plus} size={12} /> Приложение (0x10000)
          </Button>
          <Button view="outlined" size="xs" disabled={busy} onClick={() => addSlot('')}>
            <Icon data={Plus} size={12} /> Произвольный файл
          </Button>
        </div>
        <p className="hint">
          На чипах ESP32-S2/S3/C2/C3/C6/H2/P4 загрузчик (bootloader) обычно располагается по адресу <code>0x0</code>, а
          не <code>0x1000</code> — уточните адрес в документации вашей прошивки.
        </p>
      </Card>

      <Card type="container" view="raised" size="l" className="card">
        <div className="section-head">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1.5v2M7 10.5v2M1.5 7h2M10.5 7h2" stroke="var(--g-color-text-brand)" strokeWidth="1.4" strokeLinecap="round" />
            <circle cx="7" cy="7" r="3" stroke="var(--g-color-text-brand)" strokeWidth="1.4" />
            <circle cx="7" cy="7" r="1.2" fill="var(--g-color-text-brand)" />
          </svg>
          <span>Параметры записи</span>
        </div>
        <Checkbox size="m" checked={eraseAll} disabled={busy} onUpdate={setEraseAll}>
          Полностью очистить flash перед записью
        </Checkbox>
        <Disclosure summary="Дополнительные параметры" className="advanced">
          <div className="row">
            <Checkbox size="m" checked={compress} disabled={busy} onUpdate={setCompress}>
              Сжатие данных при передаче
            </Checkbox>
          </div>
          <div className="row">
            <div className="field">
              <span>Flash mode</span>
              <Select
                value={[flashMode]}
                disabled={busy}
                onUpdate={(value) => setFlashMode(value[0] as FlashModeValues)}
                options={[
                  { value: 'keep', content: 'keep (из файла)' },
                  { value: 'dio', content: 'dio' },
                  { value: 'qio', content: 'qio' },
                  { value: 'dout', content: 'dout' },
                  { value: 'qout', content: 'qout' },
                ]}
              />
            </div>
            <div className="field">
              <span>Flash frequency</span>
              <Select
                value={[flashFreq]}
                disabled={busy}
                onUpdate={(value) => setFlashFreq(value[0] as FlashFreqValues)}
                options={[
                  { value: 'keep', content: 'keep (из файла)' },
                  { value: '40m', content: '40 МГц' },
                  { value: '80m', content: '80 МГц' },
                ]}
              />
            </div>
            <div className="field">
              <span>Flash size</span>
              <Select
                value={[flashSize]}
                disabled={busy}
                onUpdate={(value) => setFlashSize(value[0] as FlashSizeValues)}
                options={[
                  { value: 'keep', content: 'keep (из файла)' },
                  { value: 'detect', content: 'detect (определить)' },
                  { value: '1MB', content: '1MB' },
                  { value: '2MB', content: '2MB' },
                  { value: '4MB', content: '4MB' },
                  { value: '8MB', content: '8MB' },
                  { value: '16MB', content: '16MB' },
                ]}
              />
            </div>
          </div>
        </Disclosure>
      </Card>

      <Card type="container" view="raised" size="l" className="card">
        <div className="row">
          <Button view="action" size="m" disabled={!canFlash} onClick={handleFlash}>
            <Icon data={ThunderboltFill} size={14} />
            {status === 'busy' ? 'Прошивка…' : 'Прошить'}
          </Button>
          <Button view="outlined-danger" size="m" disabled={!connected || status === 'busy'} onClick={handleEraseFlash}>
            <Icon data={TrashBin} size={14} />
            Полная очистка Flash
          </Button>
        </div>
        {status === 'busy' && progress && (
          <div className="action-progress">
            <div className="progress-head">
              <span className="progress-label">
                Файл {progress.fileIndex + 1}/{progress.fileCount}: {progress.fileName}
              </span>
              <span className="progress-percent">{Math.round(overallPercent)}%</span>
            </div>
            <Progress value={overallPercent} size="s" theme="default" />
          </div>
        )}
      </Card>

      <Console lines={lines} pending={pending} onClear={clean} />
    </div>
  );
}
