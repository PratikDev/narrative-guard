export function formatDate(date: string | number) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function formatScore(score: number) {
  return `${Math.round(score)}`;
}

export function formatUserDisplay(
  user: { name?: string | null; email?: string | null } | null
) {
  return user?.name || user?.email || "Unknown user";
}
