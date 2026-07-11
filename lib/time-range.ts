export const TIME_RANGES = ["short_term", "medium_term", "long_term"] as const;

export type TimeRange = (typeof TIME_RANGES)[number];

const TIME_RANGE_LABELS: Record<TimeRange, string> = {
  short_term: "Last 4 weeks",
  medium_term: "Last 6 months",
  long_term: "All time",
};

/** Ordered from oldest window → most recent (default). */
const TIME_RANGE_ORDER: TimeRange[] = [
  "long_term",
  "medium_term",
  "short_term",
];

export function getDefaultTimeRange(): TimeRange {
  return "short_term";
}

export function getTimeRangeLabel(timeRange: TimeRange) {
  return TIME_RANGE_LABELS[timeRange];
}

export function isTimeRange(value: string): value is TimeRange {
  return (TIME_RANGES as readonly string[]).includes(value);
}

export function shiftTimeRange(
  timeRange: TimeRange,
  delta: number,
): TimeRange | null {
  const index = TIME_RANGE_ORDER.indexOf(timeRange);
  const nextIndex = index + delta;

  if (nextIndex < 0 || nextIndex >= TIME_RANGE_ORDER.length) {
    return null;
  }

  return TIME_RANGE_ORDER[nextIndex];
}

export function canShiftTimeRange(timeRange: TimeRange, delta: number) {
  return shiftTimeRange(timeRange, delta) !== null;
}

export function parseTimeRangeQuery(
  timeRangeParam: string | null,
): TimeRange | { error: string } {
  if (!timeRangeParam) {
    return getDefaultTimeRange();
  }

  if (!isTimeRange(timeRangeParam)) {
    return {
      error: "time_range must be short_term, medium_term, or long_term",
    };
  }

  return timeRangeParam;
}
