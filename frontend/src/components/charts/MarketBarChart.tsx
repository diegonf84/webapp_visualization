import { useMemo, useState, useEffect } from 'react';
import { ResponsiveBar } from '@nivo/bar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TopNSelector } from '@/components/filters/TopNSelector';
import { CHART_COLORS, CHART_CONFIG } from '@/lib/constants';
import { formatCurrency, truncate } from '@/lib/utils';
import type { CompanyRankingItem } from '@/types/api';

interface MarketBarChartProps {
  data: CompanyRankingItem[] | undefined;
  isLoading: boolean;
  hasRamoFilter: boolean;
  topN: number;
  onTopNChange: (value: number) => void;
}

interface BarDataItem {
  company: string;
  [key: string]: string | number;
}

// Hook to detect mobile screen
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < breakpoint);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [breakpoint]);

  return isMobile;
}

export function MarketBarChart({
  data,
  isLoading,
  hasRamoFilter,
  topN,
  onTopNChange,
}: MarketBarChartProps) {
  const isMobile = useIsMobile();

  // Transform data for Nivo bar chart
  const { chartData, keys, colors, isSimple } = useMemo(() => {
    if (!data || data.length === 0) {
      return { chartData: [], keys: [], colors: {}, isSimple: true };
    }

    // SIMPLE VIEW: when no ramo filter, show a single solid bar per company
    if (!hasRamoFilter) {
      const companyTotals = new Map<string, number>();
      data.forEach((item) => {
        const current = companyTotals.get(item.nombre_corto) || 0;
        companyTotals.set(item.nombre_corto, current + item.primas_emitidas);
      });

      const sorted: BarDataItem[] = Array.from(companyTotals.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([company, total]) => ({
          company: truncate(company, isMobile ? 12 : 20),
          total: total / 1_000_000_000_000, // Convert to billones
        }));

      const simpleColors: Record<string, string> = { total: CHART_COLORS.corporate };
      return {
        // Reverse so the smallest company is first (renders at the bottom);
        // with horizontal layout the biggest (last) ends up on top.
        chartData: sorted.reverse(),
        keys: ['total'],
        colors: simpleColors,
        isSimple: true,
      };
    }

    // STACKED VIEW: existing grouped-by-category logic
    // Group by company
    const companyMap = new Map<string, Map<string, number>>();
    const categorySet = new Set<string>();

    data.forEach((item) => {
      const category = hasRamoFilter
        ? item.subramo_nombre_corto || 'Sin subramo'
        : item.ramo_nombre_corto || 'Sin ramo';

      categorySet.add(category);

      if (!companyMap.has(item.nombre_corto)) {
        companyMap.set(item.nombre_corto, new Map());
      }
      const companyData = companyMap.get(item.nombre_corto)!;
      const currentValue = companyData.get(category) || 0;
      companyData.set(category, currentValue + item.primas_emitidas);
    });

    // Calculate company totals for sorting
    const companyTotals: Array<{ company: string; total: number }> = [];
    companyMap.forEach((categories, company) => {
      let total = 0;
      categories.forEach((value) => (total += value));
      companyTotals.push({ company, total });
    });

    // Sort by total descending
    companyTotals.sort((a, b) => b.total - a.total);

    // Get all categories sorted by total
    const categoryTotals = new Map<string, number>();
    data.forEach((item) => {
      const category = hasRamoFilter
        ? item.subramo_nombre_corto || 'Sin subramo'
        : item.ramo_nombre_corto || 'Sin ramo';
      const current = categoryTotals.get(category) || 0;
      categoryTotals.set(category, current + item.primas_emitidas);
    });

    const sortedCategories = Array.from(categoryTotals.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, CHART_CONFIG.maxCategories)
      .map(([name]) => name);

    // Build chart data
    const chartData: BarDataItem[] = companyTotals.map(({ company }) => {
      const categories = companyMap.get(company)!;
      const item: BarDataItem = { company: truncate(company, isMobile ? 12 : 20) };

      sortedCategories.forEach((category) => {
        item[category] = (categories.get(category) || 0) / 1_000_000_000_000; // Convert to billones
      });

      // Aggregate remaining categories into "Otros Ramos" or "Otros Subramos"
      const otrosLabel = hasRamoFilter
        ? CHART_CONFIG.otrosSubramosLabel
        : CHART_CONFIG.otrosRamosLabel;

      let otros = 0;
      categories.forEach((value, category) => {
        if (!sortedCategories.includes(category)) {
          otros += value;
        }
      });
      if (otros > 0) {
        item[otrosLabel] = otros / 1_000_000_000_000;
      }

      return item;
    });

    // Label for aggregated "otros" category
    const otrosLabel = hasRamoFilter
      ? CHART_CONFIG.otrosSubramosLabel
      : CHART_CONFIG.otrosRamosLabel;

    // Build color mapping FIRST based on sorted order (biggest = first color)
    // This must match the donut chart's color assignment
    const palette = hasRamoFilter ? CHART_COLORS.subramos : CHART_COLORS.ramos;
    const colors: Record<string, string> = {};
    let paletteIndex = 0;
    sortedCategories.forEach((category) => {
      // Check if this subramo has a fixed color (RC, Cascos)
      if (hasRamoFilter && CHART_COLORS.fixedSubramos[category]) {
        colors[category] = CHART_COLORS.fixedSubramos[category];
      } else {
        colors[category] = palette[paletteIndex % palette.length];
        paletteIndex++;
      }
    });

    // Build keys (categories) for the chart - reversed so biggest shows first in legend
    const keys = [...sortedCategories].reverse();
    if (chartData.some((d) => d[otrosLabel])) {
      keys.unshift(otrosLabel); // Otros at the beginning (bottom of reversed legend)
      colors[otrosLabel] = CHART_COLORS.otros;
    }

    return { chartData: [...chartData].reverse(), keys, colors, isSimple: false };
  }, [data, hasRamoFilter, isMobile]);

  // Responsive chart configuration
  // Format helpers for axis tick labels
  const formatBillon = (v: number) =>
    v.toLocaleString('es-AR', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    });
  // v is in billones; convert to millones (*1000) and show as integer
  const formatMillon = (v: number) =>
    (v * 1000).toLocaleString('es-AR', { maximumFractionDigits: 0 });

  const chartConfig = useMemo(() => {
    // Determine the axis scale: simple view always uses Billones.
    // Stacked view switches to Millones when the max value is < 1 billón
    // (e.g. when filtering by a specific ramo the per-company totals are
    // much smaller and the B scale would round to 0,0).
    let formatAxisValue: (v: number) => string;
    let axisLegend: string;
    if (isSimple) {
      formatAxisValue = formatBillon;
      axisLegend = 'Valores en Billones de $';
    } else {
      const maxValue = chartData.length > 0
        ? Math.max(
            ...chartData.map((d) =>
              keys.reduce((sum, k) => sum + (Number(d[k]) || 0), 0),
            ),
          )
        : 0;
      const useBillon = maxValue >= 1;
      formatAxisValue = useBillon ? formatBillon : formatMillon;
      axisLegend = useBillon
        ? 'Valores en Billones de $'
        : 'Valores en Millones de $';
    }

    // MOBILE
    if (isMobile) {
      return {
        layout: 'horizontal' as const,
        margin: isSimple
          ? { top: 10, right: 20, bottom: 50, left: 90 }
          : { top: 10, right: 20, bottom: 60, left: 90 },
        height: Math.max(400, chartData.length * 35),
        axisBottom: {
          tickSize: 0,
          tickPadding: 8,
          tickRotation: 0,
          legend: axisLegend,
          legendPosition: 'middle' as const,
          legendOffset: 45,
          format: formatAxisValue,
        },
        axisLeft: {
          tickSize: 0,
          tickPadding: 8,
          tickRotation: 0,
          truncateTickAt: 12,
        },
        legends: isSimple
          ? []
          : [
              {
                dataFrom: 'keys' as const,
                anchor: 'bottom' as const,
                direction: 'row' as const,
                justify: false,
                translateX: 0,
                translateY: 55,
                itemsSpacing: 3,
                itemWidth: 65,
                itemHeight: 14,
                itemDirection: 'left-to-right' as const,
                itemOpacity: 1,
                symbolSize: 8,
                symbolShape: 'circle' as const,
              },
            ],
      };
    }

    // DESKTOP - SIMPLE VIEW (no ramo filter)
    if (isSimple) {
      return {
        layout: 'horizontal' as const,
        margin: { top: 20, right: 30, bottom: 60, left: 150 },
        height: Math.max(500, chartData.length * 32),
        axisBottom: {
          tickSize: 0,
          tickPadding: 10,
          tickRotation: 0,
          legend: axisLegend,
          legendPosition: 'middle' as const,
          legendOffset: 50,
          format: formatAxisValue,
        },
        axisLeft: {
          tickSize: 0,
          tickPadding: 10,
          tickRotation: 0,
          truncateTickAt: 20,
        },
        legends: [],
      };
    }

    // DESKTOP - STACKED VIEW (ramo filter active)
    return {
      layout: 'horizontal' as const,
      margin: { top: 20, right: 190, bottom: 60, left: 150 },
      height: Math.max(500, chartData.length * 32),
      axisBottom: {
        tickSize: 0,
        tickPadding: 10,
        tickRotation: 0,
        legend: axisLegend,
        legendPosition: 'middle' as const,
        legendOffset: 50,
        format: formatAxisValue,
      },
      axisLeft: {
        tickSize: 0,
        tickPadding: 10,
        tickRotation: 0,
        truncateTickAt: 20,
      },
      legends: [
        {
          dataFrom: 'keys' as const,
          anchor: 'right' as const,
          direction: 'column' as const,
          justify: false,
          translateX: 180,
          translateY: 0,
          itemsSpacing: 6,
          itemWidth: 160,
          itemHeight: 20,
          itemDirection: 'left-to-right' as const,
          itemOpacity: 1,
          symbolSize: 11,
          symbolShape: 'circle' as const,
        },
      ],
    };
  }, [isMobile, chartData.length, isSimple, keys]);

  return (
    <Card className="h-full">
      <CardHeader className="border-b-2 border-slate-900 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-center justify-between">
          <CardTitle className="text-slate-900 font-bold tracking-tight">
            TOTAL DEL MERCADO
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0 overflow-visible">
        <div style={{ height: chartConfig.height }} className="px-2 pt-4 pb-2">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900" />
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-400">
              No hay datos disponibles
            </div>
          ) : (
            <ResponsiveBar
              data={chartData}
              keys={keys}
              indexBy="company"
              layout={chartConfig.layout}
              margin={chartConfig.margin}
              padding={0.4}
              valueScale={{ type: 'linear' }}
              indexScale={{ type: 'band', round: true }}
              colors={(bar) => colors[bar.id as string] || '#94a3b8'}
              borderRadius={2}
              borderWidth={0}
              enableLabel={false}
              axisTop={null}
              axisRight={null}
              axisBottom={chartConfig.axisBottom}
              axisLeft={chartConfig.axisLeft}
              theme={{
                axis: {
                  ticks: {
                    text: {
                      fontSize: isMobile ? 9 : 11,
                      fill: '#64748b',
                    },
                  },
                  legend: {
                    text: {
                      fontSize: isMobile ? 10 : 12,
                      fill: '#475569',
                      fontWeight: 500,
                    },
                  },
                },
                grid: {
                  line: {
                    stroke: '#e2e8f0',
                    strokeWidth: 1,
                  },
                },
                legends: {
                  text: {
                    fontSize: isMobile ? 8 : 11,
                    fill: '#475569',
                  },
                },
              }}
              legends={chartConfig.legends}
              tooltip={({ id, value, indexValue, color }) => (
                <div className="bg-slate-900 text-white px-3 py-2 rounded-lg shadow-xl text-sm">
                  <div className="font-semibold mb-1">{indexValue}</div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-slate-300">{id}:</span>
                    <span className="font-medium">
                      {formatCurrency(Number(value) * 1_000_000_000_000)}
                    </span>
                  </div>
                </div>
              )}
              animate={true}
              motionConfig="gentle"
            />
          )}
        </div>
        <div className="px-4 pb-4 border-t border-slate-100 pt-4">
          <TopNSelector value={topN} onChange={onTopNChange} />
        </div>
      </CardContent>
    </Card>
  );
}
