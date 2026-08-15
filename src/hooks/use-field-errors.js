"use client";

import { useCallback, useState } from "react";
import { focusFirstError } from "@/lib/validation";

export function useFieldErrors() {
  const [errors, setErrors] = useState({});

  const clearField = useCallback((field) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const setField = useCallback((field, message) => {
    setErrors((prev) => {
      if (!message) {
        if (!prev[field]) return prev;
        const next = { ...prev };
        delete next[field];
        return next;
      }
      if (prev[field] === message) return prev;
      return { ...prev, [field]: message };
    });
  }, []);

  const clearAll = useCallback(() => setErrors({}), []);

  const showErrors = useCallback((next, idMap) => {
    setErrors(next);
    if (Object.keys(next).length > 0) {
      focusFirstError(next, idMap);
      return false;
    }
    return true;
  }, []);

  return { errors, clearField, setField, clearAll, showErrors };
}
