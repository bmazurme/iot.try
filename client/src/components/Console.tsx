import { useEffect, useRef } from "react";
import type { LogLine } from "../types";
import "./Console.css";

interface ConsoleProps {
  lines: LogLine[];
  pending?: string;
  onClear?: () => void;
}

export function Console({ lines, pending, onClear }: ConsoleProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines, pending]);

  return (
    <div className="console">
      <div className="console-bar">
        <span className="console-title">Журнал</span>
        {onClear && (
          <button type="button" className="console-clear" onClick={onClear}>
            Очистить
          </button>
        )}
      </div>
      <div className="console-body" ref={scrollRef}>
        {lines.length === 0 && !pending && <div className="console-placeholder">Здесь появятся сообщения…</div>}
        {lines.map((line) => (
          <div key={line.id} className={`console-line console-${line.level}`}>
            {line.text}
          </div>
        ))}
        {pending && <div className="console-line console-pending">{pending}</div>}
      </div>
    </div>
  );
}
