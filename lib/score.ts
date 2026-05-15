import type { Verdict } from "./types";

export function getVerdictForScore(score: number): Verdict {
  if (score >= 85) return "on_brand";
  if (score >= 65) return "needs_review";
  return "off_brand";
}

export function getScoreTone(score: number) {
  if (score >= 85) return "text-emerald-700";
  if (score >= 65) return "text-amber-700";
  return "text-red-700";
}

export function getVerdictBadgeClass(verdict: Verdict) {
  if (verdict === "on_brand") {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }
  if (verdict === "needs_review") {
    return "border-amber-200 bg-amber-50 text-amber-800";
  }
  return "border-red-200 bg-red-50 text-red-800";
}

export function getSeverityClass(severity: "low" | "medium" | "high") {
  if (severity === "low") return "border-primary/40 bg-primary/15";
  if (severity === "medium") return "border-amber-200 bg-amber-50";
  return "border-red-200 bg-red-50";
}
