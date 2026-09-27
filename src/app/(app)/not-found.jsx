"use client";

import { FileQuestion } from "lucide-react";
import {
  StatusPrimaryButton,
  StatusScreen,
} from "@/components/status-screen";
import { useTranslation } from "@/hooks/use-translation";

export default function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <StatusScreen
      icon={<FileQuestion className="size-6" />}
      title={t("notFoundPage.title")}
      body={t("notFoundPage.body")}
      primary={
        <StatusPrimaryButton href="/">
          {t("notFoundPage.home")}
        </StatusPrimaryButton>
      }
    />
  );
}
