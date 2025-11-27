export function msToSeconds(ms: number) {
  return Math.round((ms / 1000) * 100) / 100;
}

export function nowIso() {
  return new Date().toISOString();
}