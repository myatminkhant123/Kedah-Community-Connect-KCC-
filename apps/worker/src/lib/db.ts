export function nowIso(): string {
  return new Date().toISOString();
}

export function generateId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, '')}`;
}

export function generateReferenceCode(): string {
  const year = new Date().getUTCFullYear();
  const suffix = crypto.randomUUID().slice(0, 6).toUpperCase();
  return `KCC-${year}-${suffix}`;
}
