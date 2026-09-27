"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  FileText,
  IndianRupee,
  Loader2,
  MessageCircle,
} from "lucide-react";
import { MoneyKitLogo } from "@/components/moneykit-logo";
import { FieldError } from "@/components/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApp } from "@/context/app-provider";
import { useFieldErrors } from "@/hooks/use-field-errors";
import { useSubmitting } from "@/hooks/use-submitting";
import { useTranslation } from "@/hooks/use-translation";
import { BUSINESS_TYPES, isValidBusinessType } from "@/lib/business-types";
import { LANGUAGES } from "@/lib/i18n";
import {
  ONBOARDING_COVER_COLUMNS,
  ONBOARDING_COVER_IMAGES,
} from "@/lib/onboarding-covers";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { authErrorKey } from "@/lib/supabase/sign-in";
import { cn } from "@/lib/utils";
import {
  collectErrors,
  fieldInvalidClass,
  validateOtp,
  validateRequiredPhone,
} from "@/lib/validation";

const STEPS = 6;

function ProgressBar({ step }) {
  const total = STEPS - 1;
  const current = Math.max(0, step - 1);
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: total }).map((_, index) => (
        <div
          key={index}
          className={cn(
            "h-[3px] flex-1 rounded-full transition-all duration-500 ease-out",
            index <= current
              ? "bg-[var(--forest)] dark:bg-[var(--lime)]"
              : "bg-[var(--forest)]/12 dark:bg-white/12"
          )}
        />
      ))}
    </div>
  );
}

function PrimaryButton({
  children,
  disabled,
  loading,
  onClick,
  className,
  type = "button",
}) {
  return (
    <button
      type={type}
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
      <MoneyKitLogo
        variant="badge"
        badgeSize="lg"
        priority
        className="size-[3.75rem] rounded-[1.15rem] border-0 shadow-none"
      />
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

      <form
        className="flex flex-1 flex-col"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          if (!loading) onCta?.();
        }}
      >
        <div className="flex flex-1 flex-col">{children}</div>

        <PrimaryButton
          type="submit"
          loading={loading}
          className="onboard-fade-up onboard-delay-4 mt-10"
        >
          {cta}
          {loading ? null : <ArrowRight className="size-5" />}
        </PrimaryButton>
      </form>
    </div>
  );
}

function FormBlock({ title, body, children, delayClass = "onboard-delay-2", align = "left" }) {
  const centered = align === "center";
  return (
    <div className={cn("pt-2", centered && "text-center")}>
      <h1
        className={cn(
          "onboard-fade-up text-[2rem] leading-tight font-semibold tracking-tight text-zinc-950 dark:text-white",
          centered && "mx-auto max-w-[18rem]",
          delayClass
        )}
      >
        {title}
      </h1>
      <p
        className={cn(
          "onboard-fade-up mt-3 text-[15px] leading-relaxed text-zinc-500 dark:text-zinc-400",
          centered && "mx-auto max-w-[20rem]",
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

function BusinessTypePicker({ value, onChange, error, t }) {
  return (
    <div className="space-y-3">
      <div
        className="flex flex-wrap justify-center gap-3"
        role="radiogroup"
        aria-label={t("onboarding.typeTitle")}
        aria-describedby={error ? "onboard-type-error" : undefined}
      >
        {BUSINESS_TYPES.map((type) => {
          const selected = value === type.id;
          const Icon = type.Icon;
          return (
            <button
              key={type.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(type.id)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-5 py-3 text-[15px] font-medium transition-[background-color,border-color,color,transform] duration-200 active:scale-[0.97]",
                selected
                  ? "border-[var(--forest)] bg-[var(--forest)] text-white shadow-sm dark:border-[var(--lime)] dark:bg-[var(--lime)] dark:text-[var(--forest)]"
                  : "border-zinc-200 bg-white text-zinc-800 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-600"
              )}
            >
              <Icon className="size-[1.05rem]" strokeWidth={2} />
              {t(type.labelKey)}
            </button>
          );
        })}
      </div>
      <FieldError id="onboard-type-error" className="text-center">
        {error ? t(error) : null}
      </FieldError>
    </div>
  );
}

function LanguagePicker({ value, onChange, t }) {
  return (
    <div
      className="space-y-3 text-left"
      role="radiogroup"
      aria-label={t("onboarding.languageTitle")}
    >
      {LANGUAGES.map((lang) => {
        const selected = value === lang.id;
        return (
          <button
            key={lang.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(lang.id)}
            className={cn(
              "flex w-full items-center gap-4 rounded-[1.75rem] border px-5 py-4 text-left transition-[transform,box-shadow,border-color] duration-200 active:scale-[0.99]",
              selected
                ? "border-[var(--forest)]/25 bg-white shadow-[0_10px_40px_rgba(11,48,31,0.08)] dark:border-[var(--lime)]/25 dark:bg-zinc-900"
                : "border-black/[0.04] bg-white shadow-[0_10px_40px_rgba(0,0,0,0.04)] dark:border-white/10 dark:bg-zinc-900"
            )}
          >
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-semibold text-zinc-950 dark:text-white">
                {t(lang.labelKey)}
              </p>
              <p className="mt-0.5 text-sm text-zinc-500">{t(lang.descKey)}</p>
            </div>
            {selected ? (
              <span className="flex size-8 items-center justify-center rounded-full bg-[var(--forest)] text-white dark:bg-[var(--lime)] dark:text-[var(--forest)]">
                <Check className="size-4" />
              </span>
            ) : (
              <span className="size-8 rounded-full border border-zinc-200 dark:border-zinc-700" />
            )}
          </button>
        );
      })}
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const { completeOnboarding, sendPhoneOtp, confirmPhoneOtp, setLanguage, settings } = useApp();
  const { t } = useTranslation();
  const { errors, clearField, clearAll, showErrors } = useFieldErrors();
  const { submitting, start, stop } = useSubmitting();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpReqId, setOtpReqId] = useState("");
  const [resendIn, setResendIn] = useState(0);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [businessType, setBusinessType] = useState("");
  const cloudAuth = isSupabaseConfigured();

  useEffect(() => {
    if (resendIn <= 0) return;
    const id = window.setTimeout(() => setResendIn((n) => n - 1), 1000);
    return () => window.clearTimeout(id);
  }, [resendIn]);

  function validateStep(currentStep) {
    if (currentStep === 1) {
      if (otpSent) {
        return collectErrors({
          "onboard-otp": validateOtp(otp),
        });
      }
      return collectErrors({
        "onboard-phone": validateRequiredPhone(phone),
      });
    }
    if (currentStep === 3) {
      return collectErrors({
        "onboard-type": isValidBusinessType(businessType)
          ? ""
          : "validation.businessTypeRequired",
      });
    }
    if (currentStep === 4) {
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

  async function goNext() {
    if (submitting) return;
    const nextErrors = validateStep(step);
    if (!showErrors(nextErrors)) return;

    if (step === 1) {
      if (!start()) return;
      try {
        if (otpSent) {
          const result = await confirmPhoneOtp(phone, otp, otpReqId);
          if (result.restored) {
            router.replace("/");
            return;
          }
        } else {
          const result = await sendPhoneOtp(phone);
          if (result.restored) {
            router.replace("/");
            return;
          }
          if (!result.skipped && !result.alreadyVerified) {
            setOtpReqId(result.reqId || "");
            setOtpSent(true);
            setResendIn(30);
            stop();
            return;
          }
        }
      } catch (error) {
        showErrors({
          [otpSent ? "onboard-otp" : "onboard-phone"]: authErrorKey(
            error,
            otpSent ? "auth.otpInvalid" : "auth.otpSendFailed"
          ),
        });
        stop();
        return;
      }
      stop();
    }

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
      type: businessType,
    });
    router.replace("/");
  }

  async function resendOtp() {
    if (resendIn > 0 || submitting) return;
    if (!start()) return;
    try {
      const result = await sendPhoneOtp(phone);
      setOtpReqId(result.reqId || "");
      setOtp("");
      setResendIn(30);
      clearField("onboard-otp");
    } catch (error) {
      showErrors({
        "onboard-otp": authErrorKey(error, "auth.otpSendFailed"),
      });
    }
    stop();
  }

  function goBack() {
    if (step === 1 && otpSent) {
      clearAll();
      setOtpSent(false);
      setOtp("");
      setOtpReqId("");
      return;
    }
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
    const phoneCta = otpSent
      ? t("onboarding.verifyOtp")
      : cloudAuth
        ? t("onboarding.sendOtp")
        : t("onboarding.next");

    return (
      <StepShell
        step={step}
        direction={direction}
        onBack={goBack}
        t={t}
        cta={phoneCta}
        onCta={goNext}
        loading={submitting}
      >
        {otpSent ? (
          <FormBlock
            title={t("onboarding.otpTitle")}
            body={t("onboarding.otpBody", { phone })}
          >
            <div className="space-y-2">
              <Label htmlFor="onboard-otp">{t("onboarding.otpLabel")}</Label>
              <Input
                id="onboard-otp"
                type="tel"
                inputMode="numeric"
                enterKeyHint="done"
                autoComplete="one-time-code"
                autoFocus
                maxLength={6}
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                  clearField("onboard-otp");
                }}
                placeholder={t("onboarding.otpPlaceholder")}
                className={cn(
                  "h-[3.25rem] rounded-2xl border-[var(--border)] bg-white text-center text-xl tracking-[0.4em] tabular-nums shadow-none transition-[border-color,box-shadow] duration-200 focus-visible:border-[var(--forest)] focus-visible:ring-[var(--forest)]/15 dark:bg-zinc-900 dark:focus-visible:border-[var(--lime)] dark:focus-visible:ring-[var(--lime)]/15",
                  fieldInvalidClass(errors["onboard-otp"])
                )}
                aria-invalid={Boolean(errors["onboard-otp"])}
                aria-describedby={
                  errors["onboard-otp"] ? "onboard-otp-error" : undefined
                }
              />
              <FieldError id="onboard-otp-error">
                {errors["onboard-otp"] ? t(errors["onboard-otp"]) : null}
              </FieldError>
              <button
                type="button"
                onClick={resendOtp}
                disabled={resendIn > 0 || submitting}
                className="text-sm font-semibold text-[var(--forest)] disabled:text-zinc-400 dark:text-[var(--lime)] dark:disabled:text-zinc-500"
              >
                {resendIn > 0
                  ? t("onboarding.resendIn", { seconds: String(resendIn) })
                  : t("onboarding.resendOtp")}
              </button>
            </div>
          </FormBlock>
        ) : (
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
                  enterKeyHint="send"
                  autoComplete="tel"
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
              {!cloudAuth ? (
                <p className="text-xs leading-relaxed text-zinc-500">
                  {t("onboarding.phoneLocalHint")}
                </p>
              ) : null}
            </div>
          </FormBlock>
        )}
      </StepShell>
    );
  }

  if (step === 2) {
    const currentLanguage = settings.language || "en";
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
          title={t("onboarding.languageTitle")}
          body={t("onboarding.languageBody")}
        >
          <LanguagePicker
            value={currentLanguage}
            onChange={setLanguage}
            t={t}
          />
        </FormBlock>
      </StepShell>
    );
  }

  if (step === 3) {
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
          title={t("onboarding.typeTitle")}
          body={t("onboarding.typeBody")}
          align="center"
        >
          <BusinessTypePicker
            value={businessType}
            onChange={(id) => {
              setBusinessType(id);
              clearField("onboard-type");
            }}
            error={errors["onboard-type"]}
            t={t}
          />
        </FormBlock>
      </StepShell>
    );
  }

  if (step === 4) {
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
                enterKeyHint="next"
                autoComplete="organization"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  clearField("onboard-name");
                }}
                onKeyDown={(e) => {
                  if (e.key !== "Enter") return;
                  e.preventDefault();
                  document.getElementById("onboard-address")?.focus();
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
                enterKeyHint="done"
                autoComplete="street-address"
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
