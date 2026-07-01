export type MonthRef = {
  year: number;
  month: number;
};

export function getMonthRange(year: number, month: number) {
  const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

  return {
    start,
    end,
    year,
    month,
    label: start.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }),
  };
}

export function getLatestBrowsableMonth(referenceDate = new Date()): MonthRef {
  const year = referenceDate.getUTCFullYear();
  const month = referenceDate.getUTCMonth();

  if (month === 0) {
    return { year: year - 1, month: 12 };
  }

  return { year, month };
}

export function shiftMonth(
  { year, month }: MonthRef,
  delta: number,
): MonthRef {
  const date = new Date(Date.UTC(year, month - 1 + delta, 1));

  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
  };
}

export function isAfterLatestBrowsable(
  year: number,
  month: number,
  referenceDate = new Date(),
) {
  const latest = getLatestBrowsableMonth(referenceDate);

  return (
    year > latest.year || (year === latest.year && month > latest.month)
  );
}

export function isLatestBrowsable(
  year: number,
  month: number,
  referenceDate = new Date(),
) {
  const latest = getLatestBrowsableMonth(referenceDate);
  return year === latest.year && month === latest.month;
}

export function parseMonthQuery(
  yearParam: string | null,
  monthParam: string | null,
): MonthRef | { error: string } {
  if (!yearParam && !monthParam) {
    return getLatestBrowsableMonth();
  }

  if (!yearParam || !monthParam) {
    return { error: "Both year and month are required" };
  }

  const year = Number.parseInt(yearParam, 10);
  const month = Number.parseInt(monthParam, 10);

  if (!Number.isInteger(year) || !Number.isInteger(month)) {
    return { error: "Invalid year or month" };
  }

  if (month < 1 || month > 12) {
    return { error: "Month must be between 1 and 12" };
  }

  if (isAfterLatestBrowsable(year, month)) {
    return { error: "That month is not available yet" };
  }

  return { year, month };
}
