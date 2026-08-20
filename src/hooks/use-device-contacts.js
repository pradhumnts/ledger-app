"use client";

import { useCallback, useEffect, useState } from "react";
import {
  hasPromptedContacts,
  isContactPickerSupported,
  loadDeviceContacts,
  markContactsPrompted,
  mergeDeviceContacts,
  pickDeviceContacts,
  saveDeviceContacts,
} from "@/lib/device-contacts";

export function useDeviceContacts({ enabled = true } = {}) {
  const [contacts, setContacts] = useState([]);
  const [supported, setSupported] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setSupported(false);
      setContacts([]);
      return;
    }
    setSupported(isContactPickerSupported());
    setContacts(loadDeviceContacts());
  }, [enabled]);

  const importContacts = useCallback(async () => {
    if (!enabled || !isContactPickerSupported() || busy) return loadDeviceContacts();
    setBusy(true);
    try {
      const picked = await pickDeviceContacts();
      markContactsPrompted();
      const merged = mergeDeviceContacts(loadDeviceContacts(), picked);
      saveDeviceContacts(merged);
      setContacts(merged);
      return merged;
    } catch (error) {
      if (error?.name === "AbortError") {
        markContactsPrompted();
      }
      return loadDeviceContacts();
    } finally {
      setBusy(false);
    }
  }, [busy, enabled]);

  const requestAccess = useCallback(async () => {
    if (!enabled) return;
    if (!isContactPickerSupported()) return;
    if (hasPromptedContacts()) return;
    if (loadDeviceContacts().length) {
      markContactsPrompted();
      return;
    }
    await importContacts();
  }, [enabled, importContacts]);

  return {
    contacts,
    supported,
    busy,
    requestAccess,
    importContacts,
  };
}
