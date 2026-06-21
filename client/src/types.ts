export type LogLevel = "info" | "error" | "success";

export interface LogLine {
  id: number;
  level: LogLevel;
  text: string;
}

export interface FirmwareSlot {
  id: number;
  file: File | null;
  address: string;
}

export interface FlashProgress {
  fileIndex: number;
  fileCount: number;
  fileName: string;
  written: number;
  total: number;
}
