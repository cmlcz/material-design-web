export function daysBetween(a: Date, b: Date): number { return Math.round((b.getTime() - a.getTime()) / 86400000); }
export function isWeekend(d: Date): boolean { const day = d.getDay(); return day === 0 || day === 6; }
