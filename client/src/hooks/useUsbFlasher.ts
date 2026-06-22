import { useCallback, useRef, useState } from 'react';
import { ESPLoader, Transport } from 'esptool-js';
import type { FlashFreqValues, FlashModeValues, FlashOptions, FlashSizeValues, IEspLoaderTerminal } from 'esptool-js';
import type { FlashProgress } from '../types';

export type UsbStatus = 'idle' | 'connecting' | 'connected' | 'busy' | 'error';

export interface FlashFileInput {
  name: string;
  address: number;
  data: Uint8Array;
}

export interface FlashSettings {
  eraseAll: boolean;
  compress: boolean;
  flashMode: FlashModeValues;
  flashFreq: FlashFreqValues;
  flashSize: FlashSizeValues;
}

export const isWebSerialSupported = typeof navigator !== 'undefined' && 'serial' in navigator;

export function useUsbFlasher(terminal: IEspLoaderTerminal) {
  const [status, setStatus] = useState<UsbStatus>('idle');
  const [chipName, setChipName] = useState<string | null>(null);
  const [progress, setProgress] = useState<FlashProgress | null>(null);

  const transportRef = useRef<Transport | null>(null);
  const loaderRef = useRef<ESPLoader | null>(null);

  const resetConnectionState = useCallback(() => {
    transportRef.current = null;
    loaderRef.current = null;
    setChipName(null);
    setStatus('idle');
    setProgress(null);
  }, []);

  const connect = useCallback(
    async (baudrate: number) => {
      setStatus('connecting');
      try {
        const port = await navigator.serial.requestPort();
        const transport = new Transport(port, true);
        const loader = new ESPLoader({ transport, baudrate, terminal });
        const detected = await loader.main();
        transport.setDeviceLostCallback(() => {
          terminal.writeLine('Устройство отключено.');
          resetConnectionState();
        });
        transportRef.current = transport;
        loaderRef.current = loader;
        setChipName(detected);
        setStatus('connected');
      } catch (err) {
        if (!(err instanceof Error && err.name === 'NotFoundError')) {
          terminal.writeLine(`Ошибка подключения: ${err instanceof Error ? err.message : String(err)}`);
        }
        setStatus('idle');
      }
    },
    [terminal, resetConnectionState],
  );

  const disconnect = useCallback(async () => {
    const transport = transportRef.current;
    if (!transport) return;
    try {
      await transport.disconnect();
    } finally {
      resetConnectionState();
    }
  }, [resetConnectionState]);

  const flash = useCallback(
    async (files: FlashFileInput[], settings: FlashSettings) => {
      const loader = loaderRef.current;
      if (!loader || files.length === 0) return false;
      setStatus('busy');
      setProgress(null);
      try {
        const options: FlashOptions = {
          fileArray: files.map((f) => ({ data: f.data, address: f.address })),
          flashMode: settings.flashMode,
          flashFreq: settings.flashFreq,
          flashSize: settings.flashSize,
          eraseAll: settings.eraseAll,
          compress: settings.compress,
          reportProgress: (fileIndex, written, total) => {
            setProgress({
              fileIndex,
              fileCount: files.length,
              fileName: files[fileIndex]?.name ?? '',
              written,
              total,
            });
          },
        };
        await loader.writeFlash(options);
        await loader.after('hard_reset');
        terminal.writeLine('Прошивка завершена, устройство перезагружено.');
        setStatus('connected');
        return true;
      } catch (err) {
        terminal.writeLine(`Ошибка прошивки: ${err instanceof Error ? err.message : String(err)}`);
        setStatus('connected');
        return false;
      }
    },
    [terminal],
  );

  const eraseFlash = useCallback(async () => {
    const loader = loaderRef.current;
    if (!loader) return false;
    setStatus('busy');
    try {
      await loader.eraseFlash();
      setStatus('connected');
      return true;
    } catch (err) {
      terminal.writeLine(`Ошибка очистки памяти: ${err instanceof Error ? err.message : String(err)}`);
      setStatus('connected');
      return false;
    }
  }, [terminal]);

  return { status, chipName, progress, connect, disconnect, flash, eraseFlash };
}
