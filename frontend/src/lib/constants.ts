// Color Palettes for Charts

export const CHART_COLORS = {
  // Ramos palette - Modern, cohesive blues with accents
  ramos: [
    '#1e40af', // Deep blue
    '#3b82f6', // Bright blue
    '#0891b2', // Cyan
    '#6366f1', // Indigo
    '#8b5cf6', // Purple
    '#f59e0b', // Amber
    '#10b981', // Emerald
    '#f97316', // Orange
    '#ec4899', // Pink
    '#64748b', // Slate
  ],

  // Subramos palette - Vibrant, high-contrast
  subramos: [
    '#ef4444', // Red
    '#3b82f6', // Blue
    '#22c55e', // Green
    '#f59e0b', // Amber
    '#8b5cf6', // Purple
    '#06b6d4', // Cyan
    '#f97316', // Orange
    '#64748b', // Slate
    '#14b8a6', // Teal
    '#e11d48', // Rose
  ],

  // Otros category - always last (black for clear distinction)
  otros: '#1e1e1e',
} as const;

// Quarter mappings (Argentine fiscal calendar)
export const QUARTER_LABELS: Record<string, { short: string; long: string; fiscal: string }> = {
  '01': { short: 'Mar', long: 'Marzo', fiscal: 'Q3' },
  '02': { short: 'Jun', long: 'Junio', fiscal: 'Q4' },
  '03': { short: 'Sep', long: 'Septiembre', fiscal: 'Q1' },
  '04': { short: 'Dic', long: 'Diciembre', fiscal: 'Q2' },
};

// View mode options
export const VIEW_MODES = {
  accumulated: { label: 'Acumulado', description: 'Datos acumulados desde inicio del ejercicio' },
  current: { label: 'Corriente', description: 'Datos del período actual' },
} as const;

// Top N options
export const TOP_N_OPTIONS = [10, 15, 20, 50] as const;

// KPI Labels (Spanish)
export const KPI_LABELS = {
  entities_count: 'Entidades con Emisión',
  primas_emitidas: 'Total de Producción',
  primas_devengadas: 'Primas Devengadas',
  gastos_devengados: 'Total Gastos',
  siniestros_devengados: 'Siniestros Devengados',
  resultado_tecnico: 'Resultado Técnico',
} as const;

// Chart constants
export const CHART_CONFIG = {
  maxCategories: 10, // Max categories before grouping
  otrosRamosLabel: 'Otros Ramos', // Aggregated ramos (black)
  otrosSubramosLabel: 'Otros Subramos', // Aggregated subramos (black)
  donutHoleRatio: 0.4,
} as const;
