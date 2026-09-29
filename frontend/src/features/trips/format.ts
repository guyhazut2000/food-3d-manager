const dateTime = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" });

export function formatTripDate(isoDate: string): string {
  return dateTime.format(new Date(isoDate));
}
