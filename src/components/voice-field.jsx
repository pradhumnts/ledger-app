"use client";

import { Mic } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useSpeechToText } from "@/hooks/use-speech-to-text";
import { useTranslation } from "@/hooks/use-translation";
import { getSpeechLang } from "@/lib/i18n";
import { transformSpeech } from "@/lib/speech";
import { cn } from "@/lib/utils";

export function VoiceField({
  kind = "text",
  value,
  onValueChange,
  className,
  disabled,
  ...props
}) {
  const { t, language } = useTranslation();
  const { supported, listening, error, toggle } = useSpeechToText({
    lang: getSpeechLang(language),
    onTranscript: (transcript) => {
      const next = transformSpeech(kind, transcript);
      if (next == null || next === "") return;
      onValueChange(next);
    },
  });

  return (
    <div className="space-y-1.5">
      <div className="relative">
        <Input
          {...props}
          value={value}
          disabled={disabled}
          onChange={(event) => onValueChange(event.target.value)}
          className={cn(supported && "pr-12", className)}
        />
        {supported ? (
          <button
            type="button"
            onClick={toggle}
            disabled={disabled}
            className={cn(
              "absolute top-1/2 right-1.5 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 disabled:opacity-40 dark:hover:bg-white/10 dark:hover:text-zinc-200",
              listening &&
                "bg-[var(--forest)] text-white hover:bg-[var(--forest)] hover:text-white dark:bg-[var(--lime)] dark:text-[var(--forest)] dark:hover:bg-[var(--lime)]"
            )}
            aria-label={listening ? t("voice.stop") : t("voice.start")}
            aria-pressed={listening}
          >
            <Mic className={cn("size-4", listening && "animate-pulse")} />
          </button>
        ) : null}
      </div>
      {listening ? (
        <p className="text-xs font-medium text-[var(--forest)] dark:text-[var(--lime)]">
          {t("voice.listening")}
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="text-xs text-rose-600 dark:text-rose-400">
          {t(`voice.${error}`)}
        </p>
      ) : null}
    </div>
  );
}
