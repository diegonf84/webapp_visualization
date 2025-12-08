import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Tailwind class merging utility
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format currency in Argentine style
// Uses "B" for billones (millones de millones, 10^12) and "M" for millones
export function formatCurrency(value: number): string {
  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  // 1 billón = 1,000,000,000,000 (millón de millones)
  if (absValue >= 1_000_000_000_000) {
    const billones = absValue / 1_000_000_000_000;
    const formatted = new Intl.NumberFormat('es-AR', {
      maximumFractionDigits: 1,
      minimumFractionDigits: 1,
    }).format(billones);
    return `${sign}$ ${formatted} B`;
  }

  // Millones
  const millones = absValue / 1_000_000;
  const formatted = new Intl.NumberFormat('es-AR', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(millones);

  return `${sign}$ ${formatted} M`;
}

// Format number with Argentine locale
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('es-AR', {
    maximumFractionDigits: 0,
  }).format(value);
}

// Format percentage
export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

// Get quarter label from period code
export function getQuarterLabel(quarter: string, format: 'short' | 'long' | 'fiscal' = 'long'): string {
  const labels: Record<string, { short: string; long: string; fiscal: string }> = {
    '01': { short: 'Mar', long: 'Marzo', fiscal: 'Q3' },
    '02': { short: 'Jun', long: 'Junio', fiscal: 'Q4' },
    '03': { short: 'Sep', long: 'Septiembre', fiscal: 'Q1' },
    '04': { short: 'Dic', long: 'Diciembre', fiscal: 'Q2' },
  };
  return labels[quarter]?.[format] ?? quarter;
}

// Format period display
export function formatPeriod(year: string | null, quarter: string | null): string {
  if (!year || !quarter) return 'Todos los períodos';
  const fiscalQ = getQuarterLabel(quarter, 'fiscal');
  return `${year} - ${fiscalQ}`;
}

// Group data and limit to top N + Otros
export function groupTopN<T extends Record<string, unknown>>(
  data: T[],
  valueKey: keyof T,
  labelKey: keyof T,
  n: number
): T[] {
  if (data.length <= n) return data;

  // Sort by value descending
  const sorted = [...data].sort((a, b) =>
    (b[valueKey] as number) - (a[valueKey] as number)
  );

  const topN = sorted.slice(0, n);
  const rest = sorted.slice(n);

  if (rest.length === 0) return topN;

  // Aggregate "Otros"
  const otrosValue = rest.reduce((sum, item) => sum + (item[valueKey] as number), 0);
  const otros = {
    ...rest[0],
    [labelKey]: 'Otros',
    [valueKey]: otrosValue,
  } as T;

  return [...topN, otros];
}

// Truncate long text with ellipsis
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3)}...`;
}
