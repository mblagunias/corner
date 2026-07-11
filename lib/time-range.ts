export const TIME_RANGES = ["short_term"] as const;

export type TimeRange = (typeof TIME_RANGES)[number];

/** Spotify short_term ≈ past month; label it as the previous calendar month. */
export function getPreviousMonthLabel(date = new Date()): string {
  const previous = new Date(date.getFullYear(), date.getMonth() - 1, 1);
  return previous.toLocaleString("en-US", { month: "long" });
}

export function getDefaultTimeRange(): TimeRange {
  return "short_term";
}

export function getTimeRangeLabel(_timeRange?: TimeRange) {
  return getPreviousMonthLabel();
}

export function isTimeRange(value: string): value is TimeRange {
  return (TIME_RANGES as readonly string[]).includes(value);
}

export function parseTimeRangeQuery(
  timeRangeParam: string | null,
): TimeRange | { error: string } {
  if (!timeRangeParam) {
    return getDefaultTimeRange();
  }

  if (!isTimeRange(timeRangeParam)) {
    return {
      error: "time_range must be short_term",
    };
  }

  return timeRangeParam;
}
