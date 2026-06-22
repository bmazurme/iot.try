import { useCallback, useRef, useState } from 'react';

export type WifiStatus = 'idle' | 'checking' | 'uploading' | 'error';

export interface OtaTarget {
  baseUrl: string;
  path: string;
  fieldName: string;
  username?: string;
  password?: string;
}

function normalizeBaseUrl(input: string): string {
  const trimmed = input.trim();
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `http://${trimmed}`;
  return withScheme.replace(/\/+$/, '');
}

function buildUrl(target: OtaTarget): string {
  const base = normalizeBaseUrl(target.baseUrl);
  const path = target.path.trim().startsWith('/') ? target.path.trim() : `/${target.path.trim()}`;
  return `${base}${path}`;
}

export function useWifiFlasher(append: (text: string, level?: 'info' | 'error' | 'success') => void) {
  const [status, setStatus] = useState<WifiStatus>('idle');
  const [percent, setPercent] = useState(0);
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  const checkDevice = useCallback(
    async (target: OtaTarget) => {
      setStatus('checking');
      const base = normalizeBaseUrl(target.baseUrl);
      try {
        await fetch(base, { mode: 'no-cors', cache: 'no-store' });
        append(`Устройство по адресу ${base} отвечает на запросы.`, 'success');
      } catch (err) {
        append(`Не удалось связаться с ${base}: ${err instanceof Error ? err.message : String(err)}`, 'error');
      } finally {
        setStatus('idle');
      }
    },
    [append],
  );

  const upload = useCallback(
    (target: OtaTarget, file: File) => {
      return new Promise<boolean>((resolve) => {
        const url = buildUrl(target);
        const formData = new FormData();
        formData.append(target.fieldName, file, file.name);

        const xhr = new XMLHttpRequest();
        xhrRef.current = xhr;
        xhr.open('POST', url, true);
        xhr.timeout = 120000;
        if (target.username) {
          xhr.setRequestHeader('Authorization', `Basic ${btoa(`${target.username}:${target.password ?? ''}`)}`);
        }

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setPercent((e.loaded / e.total) * 100);
        };

        xhr.onloadstart = () => {
          setStatus('uploading');
          setPercent(0);
          append(`Отправка ${file.name} (${(file.size / 1024).toFixed(1)} КБ) на ${url}…`);
        };

        xhr.onload = () => {
          xhrRef.current = null;
          const body = xhr.responseText ?? '';
          const failed = xhr.status < 200 || xhr.status >= 300 || /update error/i.test(body);
          if (failed) {
            setStatus('error');
            append(`Устройство сообщило об ошибке (HTTP ${xhr.status}): ${body || 'нет ответа'}`, 'error');
            resolve(false);
          } else {
            setStatus('idle');
            setPercent(100);
            append('Устройство приняло прошивку и перезагружается.', 'success');
            resolve(true);
          }
        };

        xhr.onerror = () => {
          xhrRef.current = null;
          setStatus('error');
          append(
            'Не удалось получить ответ от устройства. Если файл при этом был отправлен полностью, причиной ' +
              'может быть блокировка CORS (устройство не возвращает заголовок Access-Control-Allow-Origin) — ' +
              'сама прошивка при этом могла применится успешно, проверьте устройство.',
            'error',
          );
          resolve(false);
        };

        xhr.ontimeout = () => {
          xhrRef.current = null;
          setStatus('error');
          append('Превышено время ожидания ответа от устройства.', 'error');
          resolve(false);
        };

        xhr.send(formData);
      });
    },
    [append],
  );

  const cancel = useCallback(() => {
    xhrRef.current?.abort();
    xhrRef.current = null;
    setStatus('idle');
  }, []);

  return { status, percent, checkDevice, upload, cancel };
}
