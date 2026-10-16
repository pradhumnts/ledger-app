"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { QrThemeDragCanvas } from "@/components/admin/qr-theme-drag-canvas";
import {
  adminJson,
  adminUpload,
} from "@/lib/admin/qr-theme-admin-client";
import {
  QR_THEME_BUSINESS_TYPES,
  defaultThemeStyle,
  slugifyThemeId,
} from "@/lib/qr-theme-catalog";
import { cn } from "@/lib/utils";

const EMPTY = {
  id: "",
  name: "",
  tagline: "",
  status: "draft",
  free: false,
  priceInr: 40,
  businessTypes: [],
  posterUrl: "",
  previewUrl: "",
  style: defaultThemeStyle(),
};

export function QrThemeEditor({ themeId }) {
  const router = useRouter();
  const isNew = themeId === "new";
  const [theme, setTheme] = useState(EMPTY);
  const [fonts, setFonts] = useState([]);
  const [customFonts, setCustomFonts] = useState([]);
  const [showAmount, setShowAmount] = useState(false);
  const [selectedLayer, setSelectedLayer] = useState("businessName");
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const fontsPayload = await adminJson("/api/admin/qr-fonts");
        if (cancelled) return;
        setFonts(fontsPayload.fonts || []);
        setCustomFonts(fontsPayload.custom || []);
        if (!isNew) {
          const { theme: row } = await adminJson(`/api/admin/qr-themes/${themeId}`);
          if (cancelled) return;
          setTheme({
            ...EMPTY,
            ...row,
            style:
              row.style && Object.keys(row.style).length ? row.style : defaultThemeStyle(),
          });
        }
        setError("");
      } catch (err) {
        if (!cancelled) setError(err.message || "loadFailed");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isNew, themeId]);

  const patchStyle = useCallback((updater) => {
    setTheme((prev) => ({
      ...prev,
      style:
        typeof updater === "function" ? updater(prev.style || defaultThemeStyle()) : updater,
    }));
  }, []);

  const layer = theme.style?.[selectedLayer] || {};

  async function save(status) {
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const id = isNew ? slugifyThemeId(theme.id || theme.name) : theme.id;
      const payload = {
        ...theme,
        id,
        status: status || theme.status,
        style: theme.style || defaultThemeStyle(),
      };
      if (isNew) {
        const { theme: created } = await adminJson("/api/admin/qr-themes", {
          method: "POST",
          body: payload,
        });
        setMessage("Created as draft");
        router.replace(`/admin/qr-themes/${created.id}`);
        return;
      }
      const { theme: saved } = await adminJson(`/api/admin/qr-themes/${theme.id}`, {
        method: "PATCH",
        body: payload,
      });
      setTheme((prev) => ({ ...prev, ...saved }));
      setMessage(status === "published" ? "Published" : "Saved");
    } catch (err) {
      setError(err.message || "saveFailed");
    } finally {
      setSaving(false);
    }
  }

  async function onUpload(kind, file) {
    if (!file) return;
    setError("");
    try {
      const id = slugifyThemeId(theme.id || theme.name || "theme");
      const { url } = await adminUpload({ kind, file, themeId: id });
      if (kind === "poster") setTheme((t) => ({ ...t, posterUrl: url, previewUrl: t.previewUrl || url }));
      if (kind === "preview") setTheme((t) => ({ ...t, previewUrl: url }));
      setMessage(kind === "poster" ? "Poster uploaded" : "Preview uploaded");
    } catch (err) {
      setError(err.message || "uploadFailed");
    }
  }

  async function onFontUpload(file) {
    if (!file) return;
    setError("");
    try {
      const fontId = slugifyThemeId(file.name.replace(/\.[^.]+$/, "")) || `font-${Date.now().toString(36)}`;
      const { url } = await adminUpload({ kind: "font", file, fontId });
      const name = file.name.replace(/\.[^.]+$/, "");
      const { font } = await adminJson("/api/admin/qr-fonts", {
        method: "POST",
        body: { id: fontId, name, family: name, fileUrl: url },
      });
      setFonts((list) => [...list.filter((f) => f.id !== font.id), font]);
      setCustomFonts((list) => [...list.filter((f) => f.id !== font.id), font]);
      patchStyle((style) => ({ ...style, font: font.id }));
      setMessage(`Font “${font.name}” ready`);
    } catch (err) {
      setError(err.message || "uploadFailed");
    }
  }

  const fontOptions = useMemo(() => fonts, [fonts]);

  if (loading) {
    return <p className="p-8 text-sm text-zinc-500">Loading theme…</p>;
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex flex-wrap items-center gap-3 border-b border-zinc-200 bg-white px-5 py-3">
        <Link href="/admin/qr-themes" className="text-sm font-medium text-zinc-500 hover:text-zinc-900">
          ← Themes
        </Link>
        <h1 className="text-lg font-semibold tracking-tight">
          {isNew ? "New QR theme" : theme.name || theme.id}
        </h1>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase",
            theme.status === "published"
              ? "bg-emerald-100 text-emerald-800"
              : "bg-amber-100 text-amber-800"
          )}
        >
          {theme.status}
        </span>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-zinc-600">
            <input
              type="checkbox"
              checked={showAmount}
              onChange={(e) => setShowAmount(e.target.checked)}
            />
            Edit with amount
          </label>
          <button
            type="button"
            disabled={saving}
            onClick={() => save("draft")}
            className="rounded-full border border-zinc-300 px-3 py-1.5 text-sm font-semibold"
          >
            Save draft
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => save("published")}
            className="rounded-full bg-[#0b301f] px-3 py-1.5 text-sm font-semibold text-white"
          >
            Publish
          </button>
        </div>
      </header>

      {(message || error) && (
        <div
          className={cn(
            "px-5 py-2 text-sm",
            error ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-800"
          )}
        >
          {error || message}
        </div>
      )}

      <div className="grid flex-1 gap-0 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-h-[32rem] p-4 lg:p-6">
          <QrThemeDragCanvas
            posterUrl={theme.posterUrl}
            style={theme.style}
            customFonts={customFonts}
            showAmount={showAmount}
            selectedLayer={selectedLayer}
            onSelectLayer={setSelectedLayer}
            onChangeStyle={patchStyle}
          />
          <p className="mt-3 text-center text-xs text-zinc-500">
            Drag Name, Amount, QR, or UPI. Use the lime handle on the QR to resize. Toggle “Edit
            with amount” to set the alternate layout.
          </p>
        </div>

        <aside className="max-h-dvh space-y-5 overflow-y-auto border-t border-zinc-200 bg-white p-5 lg:border-l lg:border-t-0">
          <Field label="Theme id" hint={isNew ? "slug, e.g. beauty-rose" : "locked after create"}>
            <input
              className={inputClass}
              value={theme.id}
              disabled={!isNew}
              onChange={(e) => setTheme((t) => ({ ...t, id: slugifyThemeId(e.target.value) }))}
              placeholder="beauty-rose"
            />
          </Field>
          <Field label="Display name">
            <input
              className={inputClass}
              value={theme.name}
              onChange={(e) => setTheme((t) => ({ ...t, name: e.target.value }))}
            />
          </Field>
          <Field label="Tagline">
            <input
              className={inputClass}
              value={theme.tagline}
              onChange={(e) => setTheme((t) => ({ ...t, tagline: e.target.value }))}
            />
          </Field>

          <Field label="Poster background">
            <input
              type="file"
              accept="image/webp,image/jpeg,image/png"
              onChange={(e) => onUpload("poster", e.target.files?.[0])}
            />
          </Field>
          <Field label="Preview thumbnail (optional)">
            <input
              type="file"
              accept="image/webp,image/jpeg,image/png"
              onChange={(e) => onUpload("preview", e.target.files?.[0])}
            />
          </Field>

          <Field label="Business types">
            <div className="flex flex-wrap gap-1.5">
              {QR_THEME_BUSINESS_TYPES.map((type) => {
                const on = theme.businessTypes.includes(type.id);
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() =>
                      setTheme((t) => ({
                        ...t,
                        businessTypes: on
                          ? t.businessTypes.filter((id) => id !== type.id)
                          : [...t.businessTypes, type.id],
                      }))
                    }
                    className={cn(
                      "rounded-full px-2.5 py-1 text-xs font-semibold",
                      on ? "bg-[#0b301f] text-white" : "bg-zinc-100 text-zinc-600"
                    )}
                  >
                    {type.label}
                  </button>
                );
              })}
            </div>
          </Field>

          <div className="flex gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={theme.free}
                onChange={(e) => setTheme((t) => ({ ...t, free: e.target.checked }))}
              />
              Free
            </label>
            <Field label="Price ₹" className="flex-1">
              <input
                type="number"
                className={inputClass}
                value={theme.priceInr}
                onChange={(e) =>
                  setTheme((t) => ({ ...t, priceInr: Number(e.target.value) || 0 }))
                }
              />
            </Field>
          </div>

          <Field label="Font">
            <select
              className={inputClass}
              value={theme.style?.font || "dm-sans"}
              onChange={(e) => patchStyle((s) => ({ ...s, font: e.target.value }))}
            >
              {fontOptions.map((font) => (
                <option key={font.id} value={font.id}>
                  {font.name}
                  {font.source === "file" ? " (custom)" : ""}
                </option>
              ))}
            </select>
            <label className="mt-2 block text-xs text-zinc-500">
              Upload custom font (.ttf / .otf / .woff2)
              <input
                type="file"
                accept=".ttf,.otf,.woff,.woff2,font/ttf,font/otf"
                className="mt-1 block w-full"
                onChange={(e) => onFontUpload(e.target.files?.[0])}
              />
            </label>
          </Field>

          <Field label={`Selected layer: ${selectedLayer}`}>
            <div className="grid grid-cols-2 gap-2">
              <label className="text-xs text-zinc-500">
                Colour
                <input
                  type="color"
                  className="mt-1 h-9 w-full"
                  value={normalizeColor(layer.color)}
                  onChange={(e) =>
                    patchStyle((s) => ({
                      ...s,
                      [selectedLayer]: { ...(s[selectedLayer] || {}), color: e.target.value },
                    }))
                  }
                />
              </label>
              {selectedLayer === "businessName" || selectedLayer === "amount" ? (
                <label className="text-xs text-zinc-500">
                  Size (rem)
                  <input
                    className={cn(inputClass, "mt-1")}
                    value={String(layer.fontSize || "").replace("rem", "")}
                    onChange={(e) =>
                      patchStyle((s) => ({
                        ...s,
                        [selectedLayer]: {
                          ...(s[selectedLayer] || {}),
                          fontSize: `${e.target.value}rem`,
                        },
                      }))
                    }
                  />
                </label>
              ) : null}
            </div>
            {selectedLayer === "businessName" ? (
              <div className="mt-2 flex flex-wrap gap-3 text-sm">
                <label className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={Boolean(layer.uppercase)}
                    onChange={(e) =>
                      patchStyle((s) => ({
                        ...s,
                        businessName: { ...(s.businessName || {}), uppercase: e.target.checked },
                      }))
                    }
                  />
                  Uppercase
                </label>
                <label className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={Boolean(layer.stacked)}
                    onChange={(e) =>
                      patchStyle((s) => ({
                        ...s,
                        businessName: { ...(s.businessName || {}), stacked: e.target.checked },
                      }))
                    }
                  />
                  Stacked lines
                </label>
              </div>
            ) : null}
            {selectedLayer === "upi" ? (
              <label className="mt-2 flex items-center gap-1.5 text-sm">
                <input
                  type="checkbox"
                  checked={layer.variant === "pill"}
                  onChange={(e) =>
                    patchStyle((s) => ({
                      ...s,
                      upi: {
                        ...(s.upi || {}),
                        variant: e.target.checked ? "pill" : "plain",
                      },
                    }))
                  }
                />
                Pill background
              </label>
            ) : null}
          </Field>

          <Field label="Pay chrome">
            <select
              className={inputClass}
              value={theme.style?.chrome || "dark"}
              onChange={(e) => patchStyle((s) => ({ ...s, chrome: e.target.value }))}
            >
              <option value="dark">Dark (light text on glass)</option>
              <option value="light">Light (dark text on frost)</option>
            </select>
          </Field>
        </aside>
      </div>
    </div>
  );
}

const inputClass =
  "mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#0b301f]";

function Field({ label, hint, className, children }) {
  return (
    <div className={className}>
      <p className="text-xs font-semibold tracking-wide text-zinc-500 uppercase">{label}</p>
      {hint ? <p className="text-[11px] text-zinc-400">{hint}</p> : null}
      <div className="mt-1">{children}</div>
    </div>
  );
}

function normalizeColor(value) {
  const raw = String(value || "#ffffff").trim();
  if (/^#[0-9a-fA-F]{6}$/.test(raw)) return raw;
  return "#ffffff";
}
