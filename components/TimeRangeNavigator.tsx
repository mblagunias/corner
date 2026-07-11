type TimeRangeNavigatorProps = {
  periodLabel: string;
};

export function TimeRangeNavigator({ periodLabel }: TimeRangeNavigatorProps) {
  return (
    <div className="text-center">
      <p className="text-[0.625rem] uppercase tracking-[0.2em] text-[var(--text-muted)]">
        Top albums
      </p>
      <h2 className="mt-1 text-lg font-medium tracking-tight text-[var(--text)] sm:text-xl">
        {periodLabel}
      </h2>
    </div>
  );
}
