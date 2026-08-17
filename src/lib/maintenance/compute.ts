import type { MaintenanceEntry, MaintenanceRule } from "@/lib/appwrite/types";

export type DueStatus = "ok" | "soon" | "overdue" | "unknown";

export interface Stats {
  last: MaintenanceEntry;
  kmPerMonth: number;
  kmPerYear: number;
}

export interface DueResult {
  rule: MaintenanceRule;
  unknown: boolean;
  status: DueStatus;
  lastDate?: Date;
  lastKm?: number;
  dueDate?: Date;
  daysRemaining?: number;
  kmRemaining?: number | null;
  progress?: number;
}

export function sortedEntries(entries: MaintenanceEntry[]) {
  return [...entries].sort((a, b) => +new Date(a.date) - +new Date(b.date));
}

function addMonths(date: Date, months: number) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function daysBetween(a: Date, b: Date) {
  return Math.round((+b - +a) / 86400000);
}

export function computeStats(entries: MaintenanceEntry[]): Stats | null {
  const se = sortedEntries(entries);
  if (se.length === 0) return null;
  const first = se[0];
  const last = se[se.length - 1];
  const totalKm = last.km - first.km;
  const totalMonths = Math.max(
    1,
    (+new Date(last.date) - +new Date(first.date)) / (30.44 * 86400000)
  );
  const kmPerMonth = totalKm / totalMonths;
  return { last, kmPerMonth, kmPerYear: kmPerMonth * 12 };
}

interface MatchResult {
  entry: MaintenanceEntry;
  matchedItem: string | null;
}

export function findAllMatches(rule: MaintenanceRule, entries: MaintenanceEntry[]): MatchResult[] {
  const se = [...sortedEntries(entries)].reverse();
  const results: MatchResult[] = [];

  for (const e of se) {
    if (rule.matchType) {
      if (e.type === rule.matchType) results.push({ entry: e, matchedItem: null });
      continue;
    }
    for (const item of e.items || []) {
      const low = item.toLowerCase();
      const hit = (rule.match || []).some((k) => low.includes(k));
      if (hit) {
        if (rule.onlyReplacement && low.includes("appoint")) continue;
        results.push({ entry: e, matchedItem: item });
      }
    }
  }
  return results;
}

function findLastMatch(rule: MaintenanceRule, entries: MaintenanceEntry[]): MatchResult | null {
  return findAllMatches(rule, entries)[0] ?? null;
}

export function computeDue(
  rule: MaintenanceRule,
  entries: MaintenanceEntry[],
  stats: Stats,
  today: Date = new Date()
): DueResult {
  const last = findLastMatch(rule, entries);
  if (!last) return { rule, unknown: true, status: "unknown" };

  const lastDate = new Date(last.entry.date);
  const lastKm = last.entry.km;

  const dueDateByTime = rule.intervalMonths ? addMonths(lastDate, rule.intervalMonths) : null;
  const dueKm = rule.intervalKm ? lastKm + rule.intervalKm : null;

  let dueDateByKm: Date | null = null;
  if (dueKm !== null && stats.kmPerMonth > 0) {
    const kmRemainingFromLatest = dueKm - stats.last.km;
    const monthsFromLatest = kmRemainingFromLatest / stats.kmPerMonth;
    dueDateByKm = addMonths(new Date(stats.last.date), monthsFromLatest);
  }

  let dueDate: Date;
  if (dueDateByTime && dueDateByKm) {
    dueDate = dueDateByTime < dueDateByKm ? dueDateByTime : dueDateByKm;
  } else {
    dueDate = (dueDateByTime || dueDateByKm)!;
  }

  const daysRemaining = daysBetween(today, dueDate);
  const kmRemaining = dueKm !== null ? Math.round(dueKm - stats.last.km) : null;

  let status: DueStatus = "ok";
  if (daysRemaining <= 0 || (kmRemaining !== null && kmRemaining <= 0)) status = "overdue";
  else if (daysRemaining <= 60 || (kmRemaining !== null && kmRemaining <= 2000)) status = "soon";

  let progress = 0;
  if (rule.intervalMonths) {
    const elapsedMonths = (+today - +lastDate) / (30.44 * 86400000);
    progress = Math.max(progress, elapsedMonths / rule.intervalMonths);
  }
  if (rule.intervalKm) {
    const elapsedKm =
      stats.last.km -
      lastKm +
      stats.kmPerMonth * ((+today - +new Date(stats.last.date)) / (30.44 * 86400000));
    progress = Math.max(progress, elapsedKm / rule.intervalKm);
  }
  progress = Math.min(1, Math.max(0, progress));

  return { rule, unknown: false, status, lastDate, lastKm, dueDate, daysRemaining, kmRemaining, progress };
}

export function computeAllDues(
  rules: MaintenanceRule[],
  entries: MaintenanceEntry[],
  today: Date = new Date()
): DueResult[] {
  const stats = computeStats(entries);
  if (!stats) return rules.map((rule) => ({ rule, unknown: true, status: "unknown" as const }));

  return rules
    .map((rule) => computeDue(rule, entries, stats, today))
    .sort((a, b) => {
      if (a.unknown && b.unknown) return 0;
      if (a.unknown) return 1;
      if (b.unknown) return -1;
      return +a.dueDate! - +b.dueDate!;
    });
}

export function miniCheckStatus(lastDone: string | null, intervalDays: number, today: Date = new Date()) {
  if (!lastDone) return { status: "unknown" as const, remaining: null as number | null };
  const days = daysBetween(new Date(lastDone), today);
  const remaining = intervalDays - days;
  if (remaining <= 0) return { status: "overdue" as const, remaining };
  if (remaining <= 10) return { status: "soon" as const, remaining };
  return { status: "ok" as const, remaining };
}
