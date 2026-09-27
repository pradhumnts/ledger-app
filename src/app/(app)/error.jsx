"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import {
  StatusPrimaryButton,
  StatusScreen,
  StatusSecondaryLink,
} from "@/components/status-screen";
import { useTranslation } from "@/hooks/use-translation";

export default function ErrorPage({ error, retry, reset }) {
  const { t } = useTranslation();
  const recover = retry || reset;

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
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
  );
}
