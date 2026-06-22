import type { ChangeEvent } from 'react';
import { Xmark } from '@gravity-ui/icons';
import { Button, Icon, Progress, TextInput } from '@gravity-ui/uikit';
import type { FirmwareSlot } from '../types';
import './FirmwareFileRow.css';

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
      <div className="firmware-row-main">
        <TextInput
          className="firmware-row-address"
          value={slot.address}
          placeholder="0x10000"
          disabled={disabled}
          onUpdate={(address) => onChange({ ...slot, address })}
        />
        <label className="firmware-row-file">
          <input type="file" accept=".bin" disabled={disabled} onChange={handleFile} />
          <svg className="firmware-row-file-icon" width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 10v1.5A.5.5 0 002.5 12h9a.5.5 0 00.5-.5V10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            <path
              d="M7 2v7M4.5 4.5L7 2l2.5 2.5"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="firmware-row-filename">
            {slot.file ? `${slot.file.name} (${(slot.file.size / 1024).toFixed(1)} КБ)` : 'Выбрать .bin файл…'}
          </span>
        </label>
        <Button view="outlined" size="m" disabled={disabled} onClick={onRemove} aria-label="Удалить файл">
          <Icon data={Xmark} size={14} />
        </Button>
      </div>
      {progressPercent !== undefined && (
        <div className="firmware-row-progress">
          <Progress value={progressPercent} size="s" theme="default" />
        </div>
      )}
    </div>
  );
}
