/**
 * Format a number as Brazilian Real: R$ 1.234,56
 */
export function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
