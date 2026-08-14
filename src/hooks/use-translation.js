"use client";

import { useCallback } from "react";
import { useApp } from "@/context/app-provider";
import {
  DEFAULT_LANGUAGE,
  getHtmlLang,
  getIntlLocale,
  normalizeLanguage,
  themeLabel,
  translate,
  websitePlanLabel,
} from "@/lib/i18n";

export function useTranslation() {
  const { settings } = useApp();
  const language = normalizeLanguage(settings.language || DEFAULT_LANGUAGE);

  const t = useCallback(
    (key, vars) => translate(language, key, vars),
    [language]
  );

  return {
    t,
    language,
    htmlLang: getHtmlLang(language),
    intlLocale: getIntlLocale(language),
    themeLabel: (kind, id, field) => themeLabel(language, kind, id, field),
    websitePlanLabel: (planId, field) => websitePlanLabel(language, planId, field),
  };
}
