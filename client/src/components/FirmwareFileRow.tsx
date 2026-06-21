import type { ChangeEvent } from "react";
import type { FirmwareSlot } from "../types";
import { ProgressBar } from "./ProgressBar";
import "./FirmwareFileRow.css";

interface FirmwareFileRowProps {
  slot: FirmwareSlot;
  disabled: boolean;
  progressPercent?: number;
  onChange: (next: FirmwareSlot) => void;
  onRemove: () => void;
}

export function FirmwareFileRow({ slot, disabled, progressPercent, onChange, onRemove }: FirmwareFileRowProps) {
  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    onChange({ ...slot, file: e.target.files?.[0] ?? null });
  };

  return (
    <div className="firmware-row">
      <input
        className="firmware-row-address"
        type="text"
        value={slot.address}
        placeholder="0x10000"
        disabled={disabled}
        onChange={(e) => onChange({ ...slot, address: e.target.value })}
      />
      <label className="firmware-row-file">
        <input type="file" accept=".bin" disabled={disabled} onChange={handleFile} />
        <span className="firmware-row-filename">
          {slot.file ? `${slot.file.name} (${(slot.file.size / 1024).toFixed(1)} КБ)` : "Выбрать .bin файл…"}
        </span>
      </label>
      <button type="button" className="firmware-row-remove" disabled={disabled} onClick={onRemove} aria-label="Удалить файл">
        ×
      </button>
      {progressPercent !== undefined && (
        <div className="firmware-row-progress">
          <ProgressBar percent={progressPercent} />
        </div>
      )}
    </div>
  );
}
