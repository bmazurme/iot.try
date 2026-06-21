import { useRef, useState } from "react";
import type { FlashFreqValues, FlashModeValues, FlashSizeValues } from "esptool-js";
import { isWebSerialSupported, useUsbFlasher } from "../hooks/useUsbFlasher";
import { useTerminalLog } from "../hooks/useTerminalLog";
import { Console } from "./Console";
import { ProgressBar } from "./ProgressBar";
import { FirmwareFileRow } from "./FirmwareFileRow";
import { parseAddress } from "../utils/hex";
import type { FirmwareSlot } from "../types";
import type { FlashFileInput } from "../hooks/useUsbFlasher";

const BAUD_RATES = [115200, 230400, 460800, 921600];

let slotIdCounter = 0;
const createSlot = (address: string): FirmwareSlot => ({ id: slotIdCounter++, file: null, address });

export function UsbFlasher() {
  const { lines, pending, append, clean, terminal } = useTerminalLog();
  const { status, chipName, progress, connect, disconnect, flash, eraseFlash } = useUsbFlasher(terminal);

  const [baudrate, setBaudrate] = useState(115200);
  const [slots, setSlots] = useState<FirmwareSlot[]>([createSlot("0x10000")]);
  const [eraseAll, setEraseAll] = useState(false);
  const [compress, setCompress] = useState(true);
  const [flashMode, setFlashMode] = useState<FlashModeValues>("keep");
  const [flashFreq, setFlashFreq] = useState<FlashFreqValues>("keep");
  const [flashSize, setFlashSize] = useState<FlashSizeValues>("keep");
  const formRef = useRef<HTMLDivElement>(null);

  const connected = status === "connected" || status === "busy";
  const busy = status === "busy" || status === "connecting";

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
        append(`Некорректный адрес «${slot.address}» для файла ${slot.file.name}`, "error");
        return;
      }
      const buffer = await slot.file.arrayBuffer();
      inputs.push({ name: slot.file.name, address, data: new Uint8Array(buffer) });
    }
    if (inputs.length === 0) {
      append("Выберите хотя бы один .bin файл для прошивки", "error");
      return;
    }
    const ok = await flash(inputs, { eraseAll, compress, flashMode, flashFreq, flashSize });
    if (ok) append("Прошивка успешно записана!", "success");
  };

  const handleEraseFlash = async () => {
    if (!window.confirm("Полностью очистить flash-память устройства? Это удалит всю прошивку и данные.")) return;
    const ok = await eraseFlash();
    if (ok) append("Flash-память полностью очищена.", "success");
  };

  const canFlash = connected && status !== "busy" && slots.some((s) => s.file);

  const overallPercent = progress ? ((progress.fileIndex + progress.written / progress.total) / progress.fileCount) * 100 : 0;

  if (!isWebSerialSupported) {
    return (
      <div className="panel">
        <div className="warning-box">
          Web Serial API не поддерживается в этом браузере. Откройте приложение в Chrome, Edge или другом браузере на
          основе Chromium (версия 89+) по HTTPS или на localhost.
        </div>
      </div>
    );
  }

  return (
    <div className="panel" ref={formRef}>
      <section className="card">
        <h3>Подключение</h3>
        <div className="row">
          <label className="field">
            <span>Скорость (baud)</span>
            <select value={baudrate} disabled={connected} onChange={(e) => setBaudrate(Number(e.target.value))}>
              {BAUD_RATES.map((rate) => (
                <option key={rate} value={rate}>
                  {rate}
                </option>
              ))}
            </select>
          </label>
          {!connected ? (
            <button type="button" className="btn btn-primary" disabled={busy} onClick={handleConnect}>
              {status === "connecting" ? "Подключение…" : "Подключить устройство"}
            </button>
          ) : (
            <button type="button" className="btn" disabled={status === "busy"} onClick={disconnect}>
              Отключить
            </button>
          )}
          <span className={`status-badge status-${connected ? "ok" : "off"}`}>
            {connected ? `Подключено${chipName ? `: ${chipName}` : ""}` : "Не подключено"}
          </span>
        </div>
      </section>

      <section className="card">
        <h3>Файлы прошивки</h3>
        <div className="firmware-list">
          {slots.map((slot, index) => (
            <FirmwareFileRow
              key={slot.id}
              slot={slot}
              disabled={busy}
              progressPercent={
                status === "busy" && progress && progress.fileIndex === index ? (progress.written / progress.total) * 100 : undefined
              }
              onChange={(next) => updateSlot(slot.id, next)}
              onRemove={() => removeSlot(slot.id)}
            />
          ))}
        </div>
        <div className="row preset-row">
          <button type="button" className="btn btn-ghost" disabled={busy} onClick={() => addSlot("0x1000")}>
            + Bootloader (0x1000)
          </button>
          <button type="button" className="btn btn-ghost" disabled={busy} onClick={() => addSlot("0x8000")}>
            + Таблица разделов (0x8000)
          </button>
          <button type="button" className="btn btn-ghost" disabled={busy} onClick={() => addSlot("0x10000")}>
            + Приложение (0x10000)
          </button>
          <button type="button" className="btn btn-ghost" disabled={busy} onClick={() => addSlot("")}>
            + Произвольный файл
          </button>
        </div>
        <p className="hint">
          На чипах ESP32-S2/S3/C2/C3/C6/H2/P4 загрузчик (bootloader) обычно располагается по адресу 0x0, а не 0x1000 —
          уточните адрес в документации вашей прошивки.
        </p>
      </section>

      <section className="card">
        <h3>Параметры записи</h3>
        <label className="checkbox">
          <input type="checkbox" checked={eraseAll} disabled={busy} onChange={(e) => setEraseAll(e.target.checked)} />
          Полностью очистить flash перед записью
        </label>
        <details className="advanced">
          <summary>Дополнительные параметры</summary>
          <div className="row">
            <label className="checkbox">
              <input type="checkbox" checked={compress} disabled={busy} onChange={(e) => setCompress(e.target.checked)} />
              Сжатие данных при передаче
            </label>
          </div>
          <div className="row">
            <label className="field">
              <span>Flash mode</span>
              <select value={flashMode} disabled={busy} onChange={(e) => setFlashMode(e.target.value as FlashModeValues)}>
                <option value="keep">keep (из файла)</option>
                <option value="dio">dio</option>
                <option value="qio">qio</option>
                <option value="dout">dout</option>
                <option value="qout">qout</option>
              </select>
            </label>
            <label className="field">
              <span>Flash frequency</span>
              <select value={flashFreq} disabled={busy} onChange={(e) => setFlashFreq(e.target.value as FlashFreqValues)}>
                <option value="keep">keep (из файла)</option>
                <option value="40m">40 МГц</option>
                <option value="80m">80 МГц</option>
              </select>
            </label>
            <label className="field">
              <span>Flash size</span>
              <select value={flashSize} disabled={busy} onChange={(e) => setFlashSize(e.target.value as FlashSizeValues)}>
                <option value="keep">keep (из файла)</option>
                <option value="detect">detect (определить)</option>
                <option value="1MB">1MB</option>
                <option value="2MB">2MB</option>
                <option value="4MB">4MB</option>
                <option value="8MB">8MB</option>
                <option value="16MB">16MB</option>
              </select>
            </label>
          </div>
        </details>
      </section>

      <section className="card">
        <div className="row">
          <button type="button" className="btn btn-primary" disabled={!canFlash} onClick={handleFlash}>
            {status === "busy" ? "Прошивка…" : "Прошить"}
          </button>
          <button type="button" className="btn btn-danger" disabled={!connected || status === "busy"} onClick={handleEraseFlash}>
            Полная очистка Flash
          </button>
        </div>
        {status === "busy" && progress && (
          <ProgressBar label={`Файл ${progress.fileIndex + 1}/${progress.fileCount}: ${progress.fileName}`} percent={overallPercent} />
        )}
      </section>

      <Console lines={lines} pending={pending} onClear={clean} />
    </div>
  );
}
