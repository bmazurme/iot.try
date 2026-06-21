import { useState } from "react";
import { useTerminalLog } from "../hooks/useTerminalLog";
import { useWifiFlasher } from "../hooks/useWifiFlasher";
import { Console } from "./Console";
import { ProgressBar } from "./ProgressBar";
import { ArduinoOtaSnippet } from "./ArduinoOtaSnippet";

export function WifiFlasher() {
  const { lines, append, clean } = useTerminalLog();
  const { status, percent, checkDevice, upload, cancel } = useWifiFlasher(append);

  const [address, setAddress] = useState("");
  const [path, setPath] = useState("/update");
  const [fieldName, setFieldName] = useState("firmware");
  const [file, setFile] = useState<File | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const busy = status === "checking" || status === "uploading";
  const canUpload = address.trim().length > 0 && file !== null && !busy;

  const target = { baseUrl: address, path, fieldName, username: username || undefined, password: password || undefined };

  const handleUpload = async () => {
    if (!file) return;
    await upload(target, file);
  };

  return (
    <div className="panel">
      <section className="card">
        <h3>Устройство в сети Wi-Fi</h3>
        <div className="row">
          <label className="field field-grow">
            <span>Адрес устройства</span>
            <input
              type="text"
              value={address}
              disabled={busy}
              placeholder="192.168.1.50"
              onChange={(e) => setAddress(e.target.value)}
            />
          </label>
          <label className="field">
            <span>Путь</span>
            <input type="text" value={path} disabled={busy} placeholder="/update" onChange={(e) => setPath(e.target.value)} />
          </label>
          <label className="field">
            <span>Имя поля файла</span>
            <input
              type="text"
              list="ota-field-names"
              value={fieldName}
              disabled={busy}
              onChange={(e) => setFieldName(e.target.value)}
            />
            <datalist id="ota-field-names">
              <option value="firmware" />
              <option value="update" />
              <option value="file" />
            </datalist>
          </label>
          <button type="button" className="btn" disabled={busy || !address.trim()} onClick={() => checkDevice(target)}>
            {status === "checking" ? "Проверка…" : "Проверить устройство"}
          </button>
        </div>
        <details className="advanced">
          <summary>Basic-авторизация (если требуется устройством)</summary>
          <p className="hint">
            Заголовок Authorization не входит в безопасный список CORS, поэтому браузер отправит предварительный
            OPTIONS-запрос — устройство должно на него ответить, иначе авторизованная загрузка не сработает.
          </p>
          <div className="row">
            <label className="field">
              <span>Логин</span>
              <input type="text" value={username} disabled={busy} onChange={(e) => setUsername(e.target.value)} />
            </label>
            <label className="field">
              <span>Пароль</span>
              <input type="password" value={password} disabled={busy} onChange={(e) => setPassword(e.target.value)} />
            </label>
          </div>
        </details>
      </section>

      <section className="card">
        <h3>Файл прошивки</h3>
        <label className="firmware-row-file" style={{ width: "100%" }}>
          <input type="file" accept=".bin" disabled={busy} onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          <span className="firmware-row-filename">
            {file ? `${file.name} (${(file.size / 1024).toFixed(1)} КБ)` : "Выбрать .bin файл…"}
          </span>
        </label>
      </section>

      <section className="card">
        <div className="row">
          <button type="button" className="btn btn-primary" disabled={!canUpload} onClick={handleUpload}>
            {status === "uploading" ? "Загрузка…" : "Загрузить и прошить"}
          </button>
          {status === "uploading" && (
            <button type="button" className="btn btn-danger" onClick={cancel}>
              Отменить
            </button>
          )}
        </div>
        {status === "uploading" && <ProgressBar label={file?.name} percent={percent} />}
      </section>

      <Console lines={lines} onClear={clean} />

      <ArduinoOtaSnippet defaultFieldName={fieldName} />
    </div>
  );
}
