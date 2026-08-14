"use client";

import { useCallback, useRef, useState } from "react";

export function useSubmitting() {
  const lock = useRef(false);
  const [submitting, setSubmitting] = useState(false);

  const start = useCallback(() => {
    if (lock.current) return false;
    lock.current = true;
    setSubmitting(true);
    return true;
  }, []);

  const stop = useCallback(() => {
    lock.current = false;
    setSubmitting(false);
  }, []);

  return { submitting, start, stop };
}
