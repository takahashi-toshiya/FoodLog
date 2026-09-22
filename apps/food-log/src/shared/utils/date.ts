const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

export function addDays(date: Date, amount: number): Date {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + amount);
  return nextDate;
}

export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatLongDate(date: Date): string {
  return `${date.getMonth() + 1}月${date.getDate()}日 ${WEEKDAY_LABELS[date.getDay()]}曜日`;
}

export function formatShortDate(date: Date): string {
  return `${WEEKDAY_LABELS[date.getDay()]} ${date.getDate()}`;
}
