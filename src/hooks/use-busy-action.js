"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const SETTLE_MS = 800;

/**
 * Guards slow tap actions (WhatsApp share, PDF, notify me) so a second tap
 * cannot fire while the first is still building a link or handing off.
 */
export function useBusyAction() {
  const [busy, setBusy] = useState(false);
  const [busyKey, setBusyKey] = useState(null);
  const busyRef = useRef(false);
  const timerRef = useRef(0);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const run = useCallback(async (fn, key = true) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setBusyKey(key);
    try {
      await fn?.();
    } finally {
      window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        busyRef.current = false;
        setBusy(false);
        setBusyKey(null);
      }, SETTLE_MS);
    }
  }, []);

  return { busy, busyKey, run };
}
