"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, ImagePlus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { SoftCard } from "@/components/ui-kit";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApp } from "@/context/app-provider";
import { useTranslation } from "@/hooks/use-translation";
import { initials } from "@/lib/format";

const MAX_LOGO_BYTES = 2.5 * 1024 * 1024;
const LOGO_SIZE = 512;

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Could not read image"));
    reader.readAsDataURL(file);
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load image"));
    img.src = src;
  });
}

async function compressLogo(file) {
  const raw = await readFileAsDataUrl(file);
  const img = await loadImage(raw);
  const scale = Math.min(1, LOGO_SIZE / Math.max(img.width, img.height));
  const width = Math.max(1, Math.round(img.width * scale));
  const height = Math.max(1, Math.round(img.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return raw;
  ctx.drawImage(img, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", 0.86);
}

export default function BusinessProfilePage() {
  const router = useRouter();
  const { business, updateBusiness } = useApp();
  const { t } = useTranslation();
  const fileRef = useRef(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [logo, setLogo] = useState("");
  const [upiId, setUpiId] = useState("");
  const [logoError, setLogoError] = useState("");
  const [logoBusy, setLogoBusy] = useState(false);

  useEffect(() => {
    setName(business.name || "");
    setPhone(business.phone || "");
    setAddress(business.address || "");
    setLogo(business.logo || "");
    setUpiId(business.upiId || "");
  }, [business]);

  async function onLogoPick(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setLogoError(t("business.imageTypeError"));
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      setLogoError(t("business.logoFileTooLarge"));
      return;
    }

    setLogoBusy(true);
    setLogoError("");
    try {
      const dataUrl = await compressLogo(file);
      setLogo(dataUrl);
    } catch {
      setLogoError(t("business.logoReadError"));
    } finally {
      setLogoBusy(false);
    }
  }

  function onSubmit(e) {
    e.preventDefault();
    updateBusiness({
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      logo: logo || "",
      upiId: upiId.trim(),
    });
    router.push("/settings");
  }

  return (
    <>
      <PageHeader
        title={t("business.title")}
        subtitle={t("business.subtitle")}
        backHref="/settings"
        backLabel={t("settings.title")}
      />

      <SoftCard className="p-5">
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="space-y-3">
            <Label>{t("business.logo")}</Label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={logoBusy}
                className="relative shrink-0 rounded-full outline-none transition-[transform,opacity] duration-200 active:scale-[0.98] disabled:opacity-60"
                aria-label={logo ? t("business.changeLogo") : t("business.uploadLogo")}
              >
                <Avatar className="size-20 data-[size=default]:size-20">
                  {logo ? <AvatarImage src={logo} alt="Business logo" /> : null}
                  <AvatarFallback className="bg-[var(--forest)] text-lg font-semibold text-white dark:bg-[var(--lime)] dark:text-[var(--forest)]">
                    {logoBusy ? (
                      <Camera className="size-5 animate-pulse" />
                    ) : (
                      initials(name || "LB")
                    )}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute -right-0.5 -bottom-0.5 flex size-8 items-center justify-center rounded-full border border-black/5 bg-white text-zinc-700 shadow-sm dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-200">
                  <ImagePlus className="size-3.5" />
                </span>
              </button>

              <div className="min-w-0 flex-1 space-y-2">
                <p className="text-sm text-zinc-500">{t("business.logoHint")}</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={logoBusy}
                    onClick={() => fileRef.current?.click()}
                    className="h-10 rounded-full px-4"
                  >
                    {logo ? t("business.changeLogo") : t("business.upload")}
                  </Button>
                  {logo ? (
                    <Button
                      type="button"
                      variant="ghost"
                      disabled={logoBusy}
                      onClick={() => {
                        setLogo("");
                        setLogoError("");
                      }}
                      className="h-10 rounded-full px-3 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/40"
                    >
                      <Trash2 className="size-4" />
                      {t("business.removeLogo")}
                    </Button>
                  ) : null}
                </div>
                {logoError ? (
                  <p className="text-xs text-rose-600 dark:text-rose-400">
                    {logoError}
                  </p>
                ) : null}
              </div>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onLogoPick}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="biz-name">{t("business.name")}</Label>
            <Input
              id="biz-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("business.namePlaceholder")}
              className="h-12 rounded-2xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="biz-phone">{t("business.phone")}</Label>
            <Input
              id="biz-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t("business.phonePlaceholder")}
              className="h-12 rounded-2xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="biz-upi">{t("business.upi")}</Label>
            <Input
              id="biz-upi"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder={t("business.upiPlaceholder")}
              className="h-12 rounded-2xl"
              autoCapitalize="none"
              autoCorrect="off"
            />
            <p className="text-xs text-zinc-500">{t("business.upiHint")}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="biz-address">{t("business.address")}</Label>
            <Input
              id="biz-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={t("business.addressPlaceholder")}
              className="h-12 rounded-2xl"
            />
          </div>
          <Button
            type="submit"
            disabled={logoBusy}
            className="h-12 w-full rounded-full bg-[var(--forest)] text-base font-semibold text-white hover:bg-[var(--forest-soft)] dark:bg-[var(--lime)] dark:text-[var(--forest)]"
          >
            {t("business.save")}
          </Button>
        </form>
      </SoftCard>
    </>
  );
}
