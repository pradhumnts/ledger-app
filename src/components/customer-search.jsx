"use client";

import { useMemo } from "react";
import { Contact, User } from "lucide-react";
import { FieldError } from "@/components/field-error";
import { VoiceField } from "@/components/voice-field";
import { Label } from "@/components/ui/label";
import { useDeviceContacts } from "@/hooks/use-device-contacts";
import { searchBillPeople } from "@/lib/device-contacts";
import { cn } from "@/lib/utils";
import { fieldInvalidClass } from "@/lib/validation";

export function CustomerSearch({
  id = "customer",
  label,
  value,
  error,
  placeholder,
  customers,
  selectedId,
  includeContacts = true,
  onNameChange,
  onPick,
  t,
}) {
  const { contacts, supported, busy, importContacts } = useDeviceContacts();

  const matches = useMemo(
    () =>
      searchBillPeople(
        customers,
        includeContacts ? contacts : [],
        value
      ),
    [customers, contacts, includeContacts, value]
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={id}>{label}</Label>
        {supported && includeContacts ? (
          <button
            type="button"
            onClick={async () => {
              const previousIds = new Set(contacts.map((item) => item.id));
              const merged = await importContacts();
              const added = (merged || []).filter(
                (item) => !previousIds.has(item.id)
              );
              if (added.length === 1 && !value.trim() && !selectedId) {
                onPick({ ...added[0], source: "contact" });
              }
            }}
            disabled={busy}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--forest)] disabled:opacity-50 dark:text-[var(--lime)]"
          >
            <Contact className="size-3.5" />
            {t("contacts.usePhone")}
          </button>
        ) : null}
      </div>
      <VoiceField
        id={id}
        kind="name"
        value={value}
        onValueChange={onNameChange}
        placeholder={placeholder}
        className={cn("h-12 rounded-2xl", fieldInvalidClass(error))}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      <FieldError id={`${id}-error`}>{error ? t(error) : null}</FieldError>
      {supported && includeContacts && !contacts.length ? (
        <p className="text-xs text-zinc-500">{t("contacts.hint")}</p>
      ) : null}

      {matches.length > 0 && !selectedId ? (
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-white/12 dark:bg-[var(--card)]">
          {matches.map((person) => (
            <button
              key={`${person.source}-${person.id}`}
              type="button"
              onClick={() => onPick(person)}
              className="flex w-full items-center justify-between gap-3 border-b border-zinc-100 px-4 py-3 text-left last:border-b-0 hover:bg-zinc-50 dark:border-white/[0.08] dark:hover:bg-white/[0.04]"
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-zinc-900 dark:text-white">
                  {person.name}
                </span>
                {person.source === "contact" ? (
                  <span className="text-[11px] text-zinc-400">
                    {t("contacts.fromPhone")}
                  </span>
                ) : null}
              </span>
              <span className="flex shrink-0 items-center gap-1.5 text-xs text-zinc-500">
                {person.source === "contact" ? (
                  <Contact className="size-3.5" />
                ) : (
                  <User className="size-3.5" />
                )}
                {person.phone || t("customers.noPhone")}
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
