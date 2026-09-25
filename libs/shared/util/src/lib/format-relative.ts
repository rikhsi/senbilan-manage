/**
 * Lightweight relative-time stub. Full ICU / Transloco locale formatting
 * belongs in the i18n layer; this helper is for pure-TS / tests / logging.
 *
 * Returns short English labels (`just now`, `5m ago`, `in 2h`, …).
 */
export const formatRelative = (date: Date | number | string, now: Date = new Date()): string => {
  const target = typeof date === 'number' || typeof date === 'string' ? new Date(date) : date;
  const diffMs = target.getTime() - now.getTime();
  const absMs = Math.abs(diffMs);
  const past = diffMs < 0;

  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;

  if (absMs < minute) {
    return 'just now';
  }

  const format = (count: number, unit: string): string =>
    past ? `${count}${unit} ago` : `in ${count}${unit}`;

  if (absMs < hour) {
    return format(Math.round(absMs / minute), 'm');
  }
  if (absMs < day) {
    return format(Math.round(absMs / hour), 'h');
  }
  if (absMs < week) {
    return format(Math.round(absMs / day), 'd');
  }
  return format(Math.round(absMs / week), 'w');
};
