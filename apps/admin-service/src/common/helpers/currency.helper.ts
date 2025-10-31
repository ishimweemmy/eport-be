/**
 * Format currency amount to 2 decimal places
 * @param amount - The amount to format
 * @returns Formatted amount with 2 decimal places
 */
export function formatCurrency(amount: number): number {
  return Math.round(amount * 100) / 100;
}

/**
 * Format multiple currency amounts to 2 decimal places
 * @param amounts - Object with amounts to format
 * @returns Object with formatted amounts
 */
export function formatCurrencyObject<T extends Record<string, number>>(
  amounts: T,
): T {
  const formatted = {} as T;
  for (const key in amounts) {
    formatted[key] = formatCurrency(amounts[key]) as T[Extract<
      keyof T,
      string
    >];
  }
  return formatted;
}
