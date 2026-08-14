"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  FileText,
  IndianRupee,
  Loader2,
  MessageCircle,
  Wallet,
} from "lucide-react";
import { FieldError } from "@/components/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApp } from "@/context/app-provider";
import { useFieldErrors } from "@/hooks/use-field-errors";
import { useSubmitting } from "@/hooks/use-submitting";
import { useTranslation } from "@/hooks/use-translation";
import {
  ONBOARDING_COVER_COLUMNS,
  ONBOARDING_COVER_IMAGES,
} from "@/lib/onboarding-covers";
import { cn } from "@/lib/utils";
import {
  collectErrors,
  fieldInvalidClass,
  validateRequiredPhone,
} from "@/lib/validation";

const STEPS = 4;

function ProgressBar({ step }) {
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: STEPS }).map((_, index) => (
        <div
          key={index}
          className={cn(
            "h-[3px] flex-1 rounded-full transition-all duration-500 ease-out",
            index <= step
              ? "bg-[var(--forest)] dark:bg-[var(--lime)]"
              : "bg-[var(--forest)]/12 dark:bg-white/12"
          )}
        />
      ))}
    </div>
  );
}

function StepDots({ step }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-2 dark:bg-zinc-800/80">
      {Array.from({ length: STEPS }).map((_, index) => (
        <span
          key={index}
          className={cn(
            "rounded-full transition-all duration-400 ease-out",
            index === step
              ? "h-2 w-5 bg-[var(--forest)] dark:bg-[var(--lime)]"
              : "size-2 bg-zinc-300 dark:bg-zinc-600"
          )}
        />
      ))}
    </div>
  );
}

function PrimaryButton({ children, disabled, loading, onClick, className }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading}
      className={cn(
        "flex h-14 w-full items-center justify-center gap-2 rounded-full text-base font-semibold transition-[opacity,transform,box-shadow] duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45",
        "bg-[var(--forest)] text-white shadow-[0_8px_28px_rgba(11,48,31,0.22)] dark:bg-[var(--lime)] dark:text-[var(--forest)] dark:shadow-[0_8px_28px_rgba(200,232,106,0.18)]",
        className
      )}
    >
      {loading ? <Loader2 className="size-5 animate-spin" /> : null}
      {children}
    </button>
  );
}

function AppLogo({ className }) {
  return (
    <div
      className={cn(
        "flex size-[5.25rem] items-center justify-center rounded-full bg-white shadow-[0_12px_40px_rgba(11,48,31,0.14)] ring-[6px] ring-white dark:bg-zinc-900 dark:ring-zinc-900",
        className
      )}
    >
      <div className="flex size-[3.75rem] items-center justify-center rounded-[1.15rem] bg-[var(--lime)]">
        <Wallet className="size-7 text-[var(--forest)]" strokeWidth={2.2} />
      </div>
    </div>
  );
}

function CoverGrid() {
  return (
    <div className="relative h-[44vh] min-h-[17.5rem] overflow-hidden bg-white dark:bg-zinc-950">
      <div className="grid h-full grid-cols-3 gap-2.5 px-3 pt-3">
        {ONBOARDING_COVER_COLUMNS.map((indices, colIndex) => (
          <div
            key={colIndex}
            className={cn(
              "flex flex-col gap-2.5 onboard-grid-col",
              colIndex === 0 && "onboard-delay-1 -mt-2",
              colIndex === 1 && "onboard-delay-3 -mt-8",
              colIndex === 2 && "onboard-delay-2 -mt-4"
            )}
          >
            {indices.map((imageIndex) => {
              const image = ONBOARDING_COVER_IMAGES[imageIndex];
              if (!image) return null;
              return (
                <div
                  key={`${colIndex}-${imageIndex}`}
                  className="relative aspect-[3/4] overflow-hidden rounded-2xl shadow-[0_4px_20px_rgba(11,48,31,0.08)]"
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover"
                    sizes="120px"
                    priority={imageIndex < 3}
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-white via-white/95 to-transparent dark:from-zinc-950 dark:via-zinc-950/95"
      />
    </div>
  );
}

function ReadyIllustration() {
  const portraits = [
    { top: "8%", left: "14%", h: "5.5rem", bg: "from-[#d4e8a8] to-[#c8e86a]" },
    { top: "4%", left: "42%", h: "6.5rem", bg: "from-[#b8d4a8] to-[#8fb87a]" },
    { top: "10%", left: "68%", h: "5rem", bg: "from-[#c5dcc0] to-[#9fbf98]" },
    { top: "42%", left: "8%", h: "6rem", bg: "from-[#dce8c8] to-[#b5cf8a]" },
    { top: "38%", left: "38%", h: "7rem", bg: "from-[#e8f0c4] to-[#c8e86a]" },
    { top: "44%", left: "66%", h: "5.75rem", bg: "from-[#c8dcc0] to-[#94b890]" },
  ];

  const icons = [
    { top: "28%", left: "32%", Icon: CalendarDays },
    { top: "52%", left: "24%", Icon: IndianRupee },
    { top: "34%", left: "58%", Icon: FileText },
    { top: "58%", left: "52%", Icon: MessageCircle },
  ];

  return (
    <div className="onboard-scale-in relative mx-auto aspect-[4/5] w-full max-w-[17rem] overflow-hidden rounded-[2rem] bg-gradient-to-b from-[var(--lime)]/25 via-[#f4f5f3] to-white dark:from-[var(--lime)]/10 dark:via-zinc-900 dark:to-zinc-950">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(200,232,106,0.35),transparent_58%)]"
      />
      {portraits.map((item, index) => (
        <div
          key={index}
          aria-hidden
          className={cn(
            "absolute w-[3.1rem] rounded-full bg-gradient-to-b shadow-[0_8px_24px_rgba(11,48,31,0.1)]",
            item.bg
          )}
          style={{
            top: item.top,
            left: item.left,
            height: item.h,
          }}
        />
      ))}
      {icons.map(({ top, left, Icon }, index) => (
        <div
          key={index}
          aria-hidden
          className="absolute flex size-9 items-center justify-center rounded-full bg-[var(--forest)] text-white shadow-md dark:bg-[var(--lime)] dark:text-[var(--forest)]"
          style={{ top, left }}
        >
          <Icon className="size-4" strokeWidth={2.2} />
        </div>
      ))}
    </div>
  );
}

function WelcomeStep({ onContinue, t }) {
  return (
    <div className="flex min-h-dvh flex-col bg-white dark:bg-zinc-950">
      <CoverGrid />

      <div className="relative z-10 -mt-12 flex flex-1 flex-col px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <div className="flex flex-col items-center text-center">
          <AppLogo className="onboard-scale-in mb-6" />

          <h1 className="onboard-fade-up onboard-delay-2 max-w-[16rem] text-[2rem] leading-[1.12] font-semibold tracking-tight text-zinc-950 dark:text-white">
            {t("onboarding.welcomeTitle")}
          </h1>
          <p className="onboard-fade-up onboard-delay-3 mx-auto mt-3 max-w-[19rem] text-[15px] leading-relaxed text-zinc-500 dark:text-zinc-400">
            {t("onboarding.welcomeBody")}
          </p>

          <div className="onboard-fade-up onboard-delay-4 mt-7">
            <StepDots step={0} />
          </div>
        </div>

        <PrimaryButton
          onClick={onContinue}
          className="onboard-fade-up onboard-delay-5 mt-auto"
        >
          {t("onboarding.welcomeCta")}
        </PrimaryButton>
      </div>
    </div>
  );
}

function StepShell({
  step,
  direction,
  onBack,
  t,
  children,
  cta,
  onCta,
  loading,
}) {
  return (
    <div
      key={step}
      className={cn(
        "flex min-h-dvh flex-col bg-[var(--app-bg)] px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(0.85rem,env(safe-area-inset-top))] dark:bg-zinc-950",
        direction >= 0 ? "onboard-step-forward" : "onboard-step-back"
      )}
    >
      <div className="onboard-fade-up mb-8 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-black/5 bg-white text-[var(--forest)] shadow-sm transition-transform duration-200 active:scale-95 disabled:opacity-45 dark:border-white/10 dark:bg-zinc-900 dark:text-[var(--lime)]"
          aria-label={t("onboarding.back")}
        >
          <ArrowLeft className="size-5" />
        </button>
        <div className="min-w-0 flex-1">
          <ProgressBar step={step} />
        </div>
      </div>

      <div className="flex flex-1 flex-col">{children}</div>

      <PrimaryButton
        onClick={onCta}
        loading={loading}
        className="onboard-fade-up onboard-delay-4 mt-10"
      >
        {cta}
        {loading ? null : <ArrowRight className="size-5" />}
      </PrimaryButton>
    </div>
  );
}

function FormBlock({ title, body, children, delayClass = "onboard-delay-2" }) {
  return (
    <div className="pt-2">
      <h1
        className={cn(
          "onboard-fade-up text-[2rem] leading-tight font-semibold tracking-tight text-zinc-950 dark:text-white",
          delayClass
        )}
      >
        {title}
      </h1>
      <p
        className={cn(
          "onboard-fade-up mt-3 text-[15px] leading-relaxed text-zinc-500 dark:text-zinc-400",
          delayClass
        )}
      >
        {body}
      </p>
      <div className={cn("onboard-fade-up onboard-delay-3 mt-10", delayClass)}>
        {children}
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const { completeOnboarding } = useApp();
  const { t } = useTranslation();
  const { errors, clearField, clearAll, showErrors } = useFieldErrors();
  const { submitting, start } = useSubmitting();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");

  function validateStep(currentStep) {
    if (currentStep === 1) {
      return collectErrors({
        "onboard-phone": validateRequiredPhone(phone),
      });
    }
    if (currentStep === 2) {
      const trimmed = name.trim();
      let nameError = "";
      if (!trimmed) nameError = "validation.businessNameRequired";
      else if (trimmed.length < 2) nameError = "validation.nameTooShort";
      return collectErrors({
        "onboard-name": nameError,
      });
    }
    return {};
  }

  function goNext() {
    if (submitting) return;
    const nextErrors = validateStep(step);
    if (!showErrors(nextErrors)) return;

    if (step < STEPS - 1) {
      clearAll();
      setDirection(1);
      setStep((prev) => prev + 1);
      return;
    }
    if (!start()) return;
    completeOnboarding({
      phone: phone.trim(),
      name: name.trim(),
      address: address.trim(),
    });
    router.replace("/");
  }

  function goBack() {
    if (step > 0) {
      clearAll();
      setDirection(-1);
      setStep((prev) => prev - 1);
    }
  }

  if (step === 0) {
    return (
      <WelcomeStep
        onContinue={() => {
          setDirection(1);
          setStep(1);
        }}
        t={t}
      />
    );
  }

  if (step === 1) {
    return (
      <StepShell
        step={step}
        direction={direction}
        onBack={goBack}
        t={t}
        cta={t("onboarding.next")}
        onCta={goNext}
        loading={submitting}
      >
        <FormBlock
          title={t("onboarding.phoneTitle")}
          body={t("onboarding.phoneBody")}
        >
          <div className="space-y-2">
            <Label htmlFor="onboard-phone">{t("onboarding.phoneLabel")}</Label>
            <div className="flex gap-3">
              <div className="flex h-[3.25rem] w-[4.75rem] shrink-0 items-center justify-center rounded-2xl border border-[var(--border)] bg-white text-sm font-semibold text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                +91
              </div>
              <Input
                id="onboard-phone"
                type="tel"
                inputMode="numeric"
                autoFocus
                maxLength={10}
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value.replace(/\D/g, "").slice(0, 10));
                  clearField("onboard-phone");
                }}
                placeholder={t("onboarding.phonePlaceholder")}
                className={cn(
                  "h-[3.25rem] rounded-2xl border-[var(--border)] bg-white text-base tabular-nums shadow-none transition-[border-color,box-shadow] duration-200 focus-visible:border-[var(--forest)] focus-visible:ring-[var(--forest)]/15 dark:bg-zinc-900 dark:focus-visible:border-[var(--lime)] dark:focus-visible:ring-[var(--lime)]/15",
                  fieldInvalidClass(errors["onboard-phone"])
                )}
                aria-invalid={Boolean(errors["onboard-phone"])}
                aria-describedby={
                  errors["onboard-phone"] ? "onboard-phone-error" : undefined
                }
              />
            </div>
            <FieldError id="onboard-phone-error">
              {errors["onboard-phone"] ? t(errors["onboard-phone"]) : null}
            </FieldError>
          </div>
        </FormBlock>
      </StepShell>
    );
  }

  if (step === 2) {
    return (
      <StepShell
        step={step}
        direction={direction}
        onBack={goBack}
        t={t}
        cta={t("onboarding.next")}
        onCta={goNext}
        loading={submitting}
      >
        <FormBlock
          title={t("onboarding.businessTitle")}
          body={t("onboarding.businessBody")}
        >
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="onboard-name">
                {t("onboarding.businessNameLabel")}
              </Label>
              <Input
                id="onboard-name"
                autoFocus
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  clearField("onboard-name");
                }}
                placeholder={t("business.namePlaceholder")}
                className={cn(
                  "h-[3.25rem] rounded-2xl border-[var(--border)] bg-white shadow-none transition-[border-color,box-shadow] duration-200 focus-visible:border-[var(--forest)] focus-visible:ring-[var(--forest)]/15 dark:bg-zinc-900 dark:focus-visible:border-[var(--lime)] dark:focus-visible:ring-[var(--lime)]/15",
                  fieldInvalidClass(errors["onboard-name"])
                )}
                aria-invalid={Boolean(errors["onboard-name"])}
                aria-describedby={
                  errors["onboard-name"] ? "onboard-name-error" : undefined
                }
              />
              <FieldError id="onboard-name-error">
                {errors["onboard-name"] ? t(errors["onboard-name"]) : null}
              </FieldError>
            </div>
            <div className="space-y-2">
              <Label htmlFor="onboard-address">
                {t("onboarding.businessAddressLabel")}
              </Label>
              <Input
                id="onboard-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={t("business.addressPlaceholder")}
                className="h-[3.25rem] rounded-2xl border-[var(--border)] bg-white shadow-none transition-[border-color,box-shadow] duration-200 focus-visible:border-[var(--forest)] focus-visible:ring-[var(--forest)]/15 dark:bg-zinc-900 dark:focus-visible:border-[var(--lime)] dark:focus-visible:ring-[var(--lime)]/15"
              />
            </div>
          </div>
        </FormBlock>
      </StepShell>
    );
  }

  return (
    <StepShell
      step={step}
      direction={direction}
      onBack={goBack}
      t={t}
      cta={t("onboarding.getStarted")}
      onCta={goNext}
      loading={submitting}
    >
      <div className="flex flex-1 flex-col justify-center gap-8">
        <ReadyIllustration />
        <div className="onboard-fade-up onboard-delay-2 text-center">
          <h1 className="text-[1.85rem] leading-tight font-semibold tracking-tight text-zinc-950 dark:text-white">
            {t("onboarding.readyTitle")}
          </h1>
          <p className="mx-auto mt-3 max-w-[20rem] text-[15px] leading-relaxed text-zinc-500 dark:text-zinc-400">
            {t("onboarding.readyBody")}
          </p>
          <p className="mx-auto mt-4 max-w-[21rem] rounded-2xl bg-[var(--secondary)] px-4 py-3 text-xs leading-relaxed text-zinc-600 dark:bg-zinc-800/70 dark:text-zinc-400">
            {t("onboarding.readyHint")}
          </p>
        </div>
      </div>
    </StepShell>
  );
}
