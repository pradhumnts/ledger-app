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

export function useDeviceContacts() {
  const [contacts, setContacts] = useState([]);
  const [supported, setSupported] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setSupported(isContactPickerSupported());
    setContacts(loadDeviceContacts());
  }, []);

  const importContacts = useCallback(async () => {
    if (!isContactPickerSupported() || busy) return loadDeviceContacts();
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
  }, [busy]);

  const requestAccess = useCallback(async () => {
    if (!isContactPickerSupported()) return;
    if (hasPromptedContacts()) return;
    if (loadDeviceContacts().length) {
      markContactsPrompted();
      return;
    }
    await importContacts();
  }, [importContacts]);

  return {
    contacts,
    supported,
    busy,
    requestAccess,
    importContacts,
  };
}
