"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getSpeechRecognition } from "@/lib/speech";

let activeStop = null;

export function useSpeechToText({ lang = "en-IN", onTranscript } = {}) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState("");
  const recRef = useRef(null);
  const onTranscriptRef = useRef(onTranscript);
  onTranscriptRef.current = onTranscript;

  useEffect(() => {
    setSupported(Boolean(getSpeechRecognition()));
  }, []);

  const stop = useCallback(() => {
    try {
      recRef.current?.stop();
    } catch {
      /* already stopped */
    }
    recRef.current = null;
    if (activeStop === stop) activeStop = null;
    setListening(false);
  }, []);

  const start = useCallback(() => {
    const Recognition = getSpeechRecognition();
    if (!Recognition) return;

    if (activeStop && activeStop !== stop) activeStop();
    setError("");

    const rec = new Recognition();
    rec.lang = lang;
    rec.interimResults = true;
    rec.continuous = true;
    rec.maxAlternatives = 1;

    rec.onresult = (event) => {
      let text = "";
      for (let i = 0; i < event.results.length; i += 1) {
        text += event.results[i][0]?.transcript || "";
      }
      onTranscriptRef.current?.(text, event.results[event.results.length - 1]?.isFinal);
    };

    rec.onerror = (event) => {
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setError("permission");
      } else if (event.error === "network") {
        setError("network");
      } else if (event.error !== "no-speech" && event.error !== "aborted") {
        setError("failed");
      }
      setListening(false);
    };

    rec.onend = () => {
      if (recRef.current === rec) {
        recRef.current = null;
        if (activeStop === stop) activeStop = null;
        setListening(false);
      }
    };

    recRef.current = rec;
    activeStop = stop;
    try {
      rec.start();
      setListening(true);
    } catch {
      setError("failed");
      recRef.current = null;
      if (activeStop === stop) activeStop = null;
    }
  }, [lang, stop]);

  useEffect(() => () => stop(), [stop]);

  const toggle = useCallback(() => {
    if (listening) stop();
    else start();
  }, [listening, start, stop]);

  return { supported, listening, error, toggle, stop };
}
