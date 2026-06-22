/** Parses an address string like "0x10000", "10000" (hex) or "65536" (decimal) into a number. */
export function parseAddress(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const hex = trimmed.toLowerCase().startsWith('0x') ? trimmed.slice(2) : trimmed;
  if (!/^[0-9a-f]+$/i.test(hex)) return null;
  const parsed = Number.parseInt(hex, 16);
  return Number.isFinite(parsed) ? parsed : null;
}

export function formatAddress(value: number): string {
  return `0x${value.toString(16).padStart(4, '0')}`;
}
