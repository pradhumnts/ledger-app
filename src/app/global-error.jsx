"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import {
  StatusPrimaryButton,
  StatusScreen,
  StatusSecondaryLink,
} from "@/components/status-screen";
import { applyAppColorScheme } from "@/lib/app-color-scheme";
import { getHtmlLang, normalizeLanguage, translate } from "@/lib/i18n";
import { peekStoredPrefs } from "@/lib/store";
import "./globals.css";

export default function GlobalError({ error, retry, reset }) {
  const recover = retry || reset;
  const [prefs] = useState(() => peekStoredPrefs());
  const language = normalizeLanguage(prefs.language);
  const t = (key) => translate(language, key);

  useEffect(() => {
    console.error(error);
    applyAppColorScheme(prefs.theme);
    document.documentElement.lang = getHtmlLang(language);
  }, [error, language, prefs.theme]);

  return (
    <html
      lang={getHtmlLang(language)}
      className={prefs.theme === "dark" ? "dark h-full" : "h-full"}
      suppressHydrationWarning
      style={{ colorScheme: prefs.theme === "dark" ? "only dark" : "only light" }}
    >
      <body className="min-h-full bg-[var(--app-bg)] font-sans antialiased text-foreground">
        <div className="mx-auto min-h-dvh w-full max-w-md px-5">
          <StatusScreen
            icon={<AlertTriangle className="size-6" />}
            title={t("crash.title")}
            body={t("crash.body")}
            primary={
              <StatusPrimaryButton onClick={() => recover?.()}>
                {t("crash.retry")}
              </StatusPrimaryButton>
            }
            secondary={
              <StatusSecondaryLink href="/">{t("crash.home")}</StatusSecondaryLink>
            }
          />
        </div>
      </body>
    </html>
  );
}
