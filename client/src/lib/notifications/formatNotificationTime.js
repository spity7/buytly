const UNITS = [
  ["year", 60 * 60 * 24 * 365],
  ["month", 60 * 60 * 24 * 30],
  ["week", 60 * 60 * 24 * 7],
  ["day", 60 * 60 * 24],
  ["hour", 60 * 60],
  ["minute", 60],
  ["second", 1],
];

export function formatNotificationTime(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const secondsAgo = Math.round((date.getTime() - Date.now()) / 1000);
  const formatter = new Intl.RelativeTimeFormat(undefined, {
    numeric: "auto",
  });

  for (const [unit, secondsInUnit] of UNITS) {
    if (Math.abs(secondsAgo) >= secondsInUnit || unit === "second") {
      const valueInUnit = Math.round(secondsAgo / secondsInUnit);
      return formatter.format(valueInUnit, unit);
    }
  }

  return "";
}
