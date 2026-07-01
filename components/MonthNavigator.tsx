"use client";

import { shiftMonth, type MonthRef } from "@/lib/month-range";

type MonthNavigatorProps = {
  year: number;
  month: number;
  monthLabel: string;
  canGoForward: boolean;
  disabled?: boolean;
  onChange: (next: MonthRef) => void;
};

export function MonthNavigator({
  year,
  month,
  monthLabel,
  canGoForward,
  disabled = false,
  onChange,
}: MonthNavigatorProps) {
  const current = { year, month };

  return (
    <div className="flex items-center justify-between gap-4">
      <button
        type="button"
        onClick={() => onChange(shiftMonth(current, -1))}
        disabled={disabled}
        aria-label="Previous month"
        className="flex h-8 w-8 shrink-0 items-center justify-center border border-[var(--border-strong)] bg-[var(--surface-raised)] text-[var(--text)] transition hover:border-[var(--text)] disabled:cursor-not-allowed disabled:opacity-40"
      >
        ‹
      </button>

      <div className="min-w-0 text-center">
        <p className="text-[0.625rem] uppercase tracking-[0.2em] text-[var(--text-muted)]">
          Top albums
        </p>
        <h2 className="mt-1 text-lg font-medium tracking-tight text-[var(--text)] sm:text-xl">
          {monthLabel}
        </h2>
      </div>

      <button
        type="button"
        onClick={() => onChange(shiftMonth(current, 1))}
        disabled={disabled || !canGoForward}
        aria-label="Next month"
        className="flex h-8 w-8 shrink-0 items-center justify-center border border-[var(--border-strong)] bg-[var(--surface-raised)] text-[var(--text)] transition hover:border-[var(--text)] disabled:cursor-not-allowed disabled:opacity-40"
      >
        ›
      </button>
    </div>
  );
}
