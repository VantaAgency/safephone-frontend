"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Input } from "@/components/ui/form-field";
import { cn } from "@/lib/utils";

interface ModelComboboxProps {
  value: string;
  onChange: (next: string) => void;
  /** Human brand label used in the Groq prompt, e.g. "Apple", "Samsung". */
  brandLabel: string;
  /** Static-fallback key, e.g. "iphone", "samsung". */
  brandSlug?: string;
  /** Only fetch suggestions once a brand is chosen. */
  brandReady: boolean;
  placeholder?: string;
  inputId?: string;
  disabled?: boolean;
  error?: boolean;
}

interface SuggestResponse {
  models?: string[];
}

async function fetchModels(
  brandLabel: string,
  brandSlug: string | undefined,
  query: string,
  signal: AbortSignal,
): Promise<string[]> {
  const res = await fetch("/api/device-models", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ brand: brandLabel, brandSlug, query }),
    signal,
  });
  if (!res.ok) return [];
  const data = (await res.json()) as SuggestResponse;
  return Array.isArray(data.models) ? data.models : [];
}

// Editable select: the user can pick a suggestion OR type their own
// model if it isn't listed. Suggestions come from the Groq-backed
// /api/device-models route (with a static fallback), refreshed when the
// brand changes and refined as the user types (debounced).
export function ModelCombobox({
  value,
  onChange,
  brandLabel,
  brandSlug,
  brandReady,
  placeholder,
  inputId,
  disabled,
  error,
}: ModelComboboxProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  // Each result set is tagged with the key it was fetched for, so stale
  // data from a previous brand/query is ignored without a synchronous
  // reset setState in the effect body.
  const [base, setBase] = useState<{ key: string; models: string[] }>({
    key: "",
    models: [],
  });
  const [queried, setQueried] = useState<{ key: string; models: string[] }>({
    key: "",
    models: [],
  });
  const [activeIndex, setActiveIndex] = useState(-1);

  // Base list — refetched when the brand changes.
  useEffect(() => {
    if (!brandReady || !brandLabel) return;
    const ctrl = new AbortController();
    fetchModels(brandLabel, brandSlug, "", ctrl.signal)
      .then((models) => setBase({ key: brandLabel, models }))
      .catch(() => {});
    return () => ctrl.abort();
  }, [brandReady, brandLabel, brandSlug]);

  // Query-refined list — debounced, only for longer inputs.
  useEffect(() => {
    const q = value.trim();
    if (!brandReady || !brandLabel || q.length < 2) return;
    const ctrl = new AbortController();
    const timer = setTimeout(() => {
      fetchModels(brandLabel, brandSlug, q, ctrl.signal)
        .then((models) =>
          setQueried({ key: `${brandLabel}::${q.toLowerCase()}`, models }),
        )
        .catch(() => {});
    }, 350);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [value, brandReady, brandLabel, brandSlug]);

  // Merge, dedupe (case-insensitive), then filter by what's typed.
  // Stale result sets (whose tag no longer matches the current brand /
  // query) contribute nothing.
  const suggestions = useMemo(() => {
    const q = value.trim();
    const baseModels =
      brandReady && base.key === brandLabel ? base.models : [];
    const queryModels =
      brandReady && queried.key === `${brandLabel}::${q.toLowerCase()}`
        ? queried.models
        : [];
    const merged: string[] = [];
    const seen = new Set<string>();
    for (const m of [...queryModels, ...baseModels]) {
      const key = m.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        merged.push(m);
      }
    }
    const ql = q.toLowerCase();
    const filtered = ql
      ? merged.filter((m) => m.toLowerCase().includes(ql))
      : merged;
    return filtered.slice(0, 10);
  }, [base, queried, value, brandReady, brandLabel]);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const pick = useCallback(
    (model: string) => {
      onChange(model);
      setOpen(false);
      setActiveIndex(-1);
    },
    [onChange],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setOpen(true);
      return;
    }
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      if (activeIndex >= 0 && activeIndex < suggestions.length) {
        e.preventDefault();
        pick(suggestions[activeIndex]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  const showDropdown = open && suggestions.length > 0;

  return (
    <div ref={wrapperRef} className="relative">
      <Input
        id={inputId}
        value={value}
        error={error}
        disabled={disabled}
        autoComplete="off"
        role="combobox"
        aria-expanded={showDropdown}
        aria-autocomplete="list"
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setActiveIndex(-1);
        }}
        onFocus={() => {
          if (brandReady) setOpen(true);
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
      />

      {showDropdown && (
        <ul
          className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
          role="listbox"
        >
          {suggestions.map((model, idx) => (
            <li
              key={model}
              role="option"
              aria-selected={idx === activeIndex}
              // onMouseDown (not onClick) so the pick fires before the
              // input's blur closes the dropdown.
              onMouseDown={(e) => {
                e.preventDefault();
                pick(model);
              }}
              onMouseEnter={() => setActiveIndex(idx)}
              className={cn(
                "cursor-pointer px-4 py-2 text-sm",
                idx === activeIndex
                  ? "bg-indigo-50 text-indigo-900"
                  : "text-indigo-950 hover:bg-slate-50",
              )}
            >
              {model}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
