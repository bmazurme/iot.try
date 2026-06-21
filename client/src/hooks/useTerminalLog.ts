import { useCallback, useMemo, useRef, useState } from "react";
import type { IEspLoaderTerminal } from "esptool-js";
import type { LogLevel, LogLine } from "../types";

const MAX_LINES = 1000;

/** Log store that doubles as an esptool-js IEspLoaderTerminal sink. */
export function useTerminalLog() {
  const [lines, setLines] = useState<LogLine[]>([]);
  const [pending, setPending] = useState("");
  const idRef = useRef(0);
  const pendingRef = useRef("");

  const append = useCallback((text: string, level: LogLevel = "info") => {
    setLines((prev) => {
      const next = [...prev, { id: idRef.current++, level, text }];
      return next.length > MAX_LINES ? next.slice(next.length - MAX_LINES) : next;
    });
  }, []);

  const clean = useCallback(() => {
    pendingRef.current = "";
    setPending("");
    setLines([]);
  }, []);

  // esptool-js calls write() for text without a trailing newline (e.g. progress
  // updates), so we buffer it and only commit a finished line on writeLine().
  const write = useCallback((text: string) => {
    pendingRef.current += text;
    setPending(pendingRef.current);
  }, []);

  const writeLine = useCallback(
    (text: string) => {
      const full = pendingRef.current + text;
      pendingRef.current = "";
      setPending("");
      append(full);
    },
    [append],
  );

  const terminal: IEspLoaderTerminal = useMemo(() => ({ clean, write, writeLine }), [clean, write, writeLine]);

  return { lines, pending, append, clean, terminal };
}
