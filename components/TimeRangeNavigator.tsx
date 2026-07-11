"use client";

import {
  canShiftTimeRange,
  getTimeRangeLabel,
  shiftTimeRange,
  type TimeRange,
} from "@/lib/time-range";

type TimeRangeNavigatorProps = {
  timeRange: TimeRange;
  periodLabel: string;
  disabled?: boolean;
  onChange: (next: TimeRange) => void;
};

export function TimeRangeNavigator({
  timeRange,
  periodLabel,
  disabled = false,
  onChange,
}: TimeRangeNavigatorProps) {
  const canGoBack = canShiftTimeRange(timeRange, -1);
  const canGoForward = canShiftTimeRange(timeRange, 1);

  return (
    <div className="flex items-center justify-between gap-4">
      <button
        type="button"
        onClick={() => {
          const next = shiftTimeRange(timeRange, -1);
          if (next) {
            onChange(next);
          }
        }}
        disabled={disabled || !canGoBack}
        aria-label="Previous time range"
        className="flex h-8 w-8 shrink-0 items-center justify-center border border-[var(--border-strong)] bg-[var(--surface-raised)] text-[var(--text)] transition hover:border-[var(--text)] disabled:cursor-not-allowed disabled:opacity-40"
      >
        ‹
      </button>

      <div className="min-w-0 text-center">
        <p className="text-[0.625rem] uppercase tracking-[0.2em] text-[var(--text-muted)]">
          Top albums
        </p>
        <h2 className="mt-1 text-lg font-medium tracking-tight text-[var(--text)] sm:text-xl">
          {periodLabel || getTimeRangeLabel(timeRange)}
        </h2>
      </div>

      <button
        type="button"
        onClick={() => {
          const next = shiftTimeRange(timeRange, 1);
          if (next) {
            onChange(next);
          }
        }}
        disabled={disabled || !canGoForward}
        aria-label="Next time range"
        className="flex h-8 w-8 shrink-0 items-center justify-center border border-[var(--border-strong)] bg-[var(--surface-raised)] text-[var(--text)] transition hover:border-[var(--text)] disabled:cursor-not-allowed disabled:opacity-40"
      >
        ›
      </button>
    </div>
  );
}
