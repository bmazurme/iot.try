import { useState } from 'react';
import { FileArrowUp } from '@gravity-ui/icons';
import { Button, Card, Disclosure, Icon, PasswordInput, Progress, TextInput } from '@gravity-ui/uikit';
import { useTerminalLog } from '../hooks/useTerminalLog';
import { useWifiFlasher } from '../hooks/useWifiFlasher';
import { Console } from './Console';
import { ArduinoOtaSnippet } from './ArduinoOtaSnippet';

export function WifiFlasher() {
  const { lines, append, clean } = useTerminalLog();
  const { status, percent, checkDevice, upload, cancel } = useWifiFlasher(append);

  const [address, setAddress] = useState('');
  const [path, setPath] = useState('/update');
  const [fieldName, setFieldName] = useState('firmware');
  const [file, setFile] = useState<File | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const busy = status === 'checking' || status === 'uploading';
  const canUpload = address.trim().length > 0 && file !== null && !busy;

  const target = { baseUrl: address, path, fieldName, username: username || undefined, password: password || undefined };

  const handleUpload = async () => {
    if (!file) return;
    await upload(target, file);
  };

  return (
    <div className="panel">
      <Card type="container" view="raised" size="l" className="card">
        <div className="section-head">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 5C3.2 2.8 5.4 1.8 7 1.8s3.8 1 6 3.2" stroke="var(--g-color-text-brand)" strokeWidth="1.3" strokeLinecap="round" />
            <path d="M3 7.5C4.3 6.2 5.6 5.5 7 5.5s2.7.7 4 2" stroke="var(--g-color-text-brand)" strokeWidth="1.3" strokeLinecap="round" />
            <path d="M5 10C5.8 9.2 6.3 8.8 7 8.8s1.2.4 2 1.2" stroke="var(--g-color-text-brand)" strokeWidth="1.3" strokeLinecap="round" />
            <circle cx="7" cy="12" r=".9" fill="var(--g-color-text-brand)" />
          </svg>
          <span>Устройство в сети Wi-Fi</span>
        </div>
        <div className="row">
          <div className="field field-grow">
            <span>Адрес устройства</span>
            <TextInput value={address} disabled={busy} placeholder="192.168.1.50" onUpdate={setAddress} />
          </div>
          <div className="field">
            <span>Путь</span>
            <TextInput value={path} disabled={busy} placeholder="/update" onUpdate={setPath} />
          </div>
          <div className="field">
            <span>Имя поля файла</span>
            <TextInput
              value={fieldName}
              disabled={busy}
              onUpdate={setFieldName}
              controlProps={{ list: 'ota-field-names' }}
            />
            <datalist id="ota-field-names">
              <option value="firmware" />
              <option value="update" />
              <option value="file" />
            </datalist>
          </div>
          <Button view="outlined" size="m" disabled={busy || !address.trim()} loading={status === 'checking'} onClick={() => checkDevice(target)}>
            Проверить устройство
          </Button>
        </div>
        <Disclosure summary="Basic-авторизация (если требуется устройством)" className="advanced">
          <p className="hint">
            Заголовок <code>Authorization</code> не входит в безопасный список CORS, поэтому браузер отправит
            предварительный OPTIONS-запрос — устройство должно на него ответить, иначе авторизованная загрузка не
            сработает.
          </p>
          <div className="row">
            <div className="field">
              <span>Логин</span>
              <TextInput value={username} disabled={busy} onUpdate={setUsername} />
            </div>
            <div className="field">
              <span>Пароль</span>
              <PasswordInput value={password} disabled={busy} onUpdate={setPassword} />
            </div>
          </div>
        </Disclosure>
      </Card>

      <Card type="container" view="raised" size="l" className="card">
        <div className="section-head">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="2" y="1.5" width="7" height="11" rx="1.5" stroke="var(--g-color-text-brand)" strokeWidth="1.4" />
            <path d="M5 1.5v3l2-1 2 1V1.5" stroke="var(--g-color-text-brand)" strokeWidth="1.2" />
          </svg>
          <span>Файл прошивки</span>
        </div>
        <label className="dropzone">
          <input type="file" accept=".bin" disabled={busy} onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          <svg className="dropzone-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect x="3" y="2" width="10" height="14" rx="2" stroke="currentColor" strokeWidth="1.4" />
            <path d="M7 2v4l3-1.5 3 1.5V2" stroke="currentColor" strokeWidth="1.2" />
            <path d="M13 10l4 0M15 8l2 2-2 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div>
            <div className="dropzone-title">
              {file ? `${file.name} (${(file.size / 1024).toFixed(1)} КБ)` : 'Выбрать .bin файл…'}
            </div>
            <div className="dropzone-subtitle">Или перетащите файл сюда</div>
          </div>
        </label>
      </Card>

      <Card type="container" view="raised" size="l" className="card">
        <div className="row">
          <Button view="action" size="m" disabled={!canUpload} loading={status === 'uploading'} onClick={handleUpload}>
            <Icon data={FileArrowUp} size={14} />
            {status === 'uploading' ? 'Загрузка…' : 'Загрузить и прошить'}
          </Button>
          {status === 'uploading' && (
            <Button view="outlined-danger" size="m" onClick={cancel}>
              Отменить
            </Button>
          )}
        </div>
        {status === 'uploading' && (
          <div className="action-progress">
            <div className="progress-head">
              <span className="progress-label">{file?.name}</span>
              <span className="progress-percent">{Math.round(percent)}%</span>
            </div>
            <Progress value={percent} size="s" theme="default" />
          </div>
        )}
      </Card>

      <Console lines={lines} onClear={clean} />

      <ArduinoOtaSnippet defaultFieldName={fieldName} />
    </div>
  );
}
