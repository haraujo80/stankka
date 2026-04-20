/**
 * Format a number as Brazilian Real: R$ 1.234.567,00
 */
export function formatBRL(value: number | null | undefined): string {
  if (value == null || isNaN(value)) return "R$ 0,00";
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/**
 * Format percentage with comma decimal: 14,50%
 */
export function formatPct(value: number | null | undefined, digits = 2): string {
  if (value == null || isNaN(value)) return "—";
  return value.toLocaleString("pt-BR", { minimumFractionDigits: digits, maximumFractionDigits: digits }) + "%";
}

/**
 * Parse a BR-formatted currency string to number. "1.234,56" -> 1234.56
 */
export function parseBRL(input: string): number {
  if (!input) return 0;
  const cleaned = input.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".");
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}
