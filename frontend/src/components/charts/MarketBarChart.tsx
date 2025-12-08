import { useMemo } from 'react';
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

export function MarketBarChart({
  data,
  isLoading,
  hasRamoFilter,
  topN,
  onTopNChange,
}: MarketBarChartProps) {
  // Transform data for Nivo stacked bar chart
  const { chartData, keys, colors } = useMemo(() => {
    if (!data || data.length === 0) {
      return { chartData: [], keys: [], colors: {} };
    }

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
      const item: BarDataItem = { company: truncate(company, 14) };

      sortedCategories.forEach((category) => {
        item[category] = (categories.get(category) || 0) / 1_000_000; // Convert to millions
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
        item[otrosLabel] = otros / 1_000_000;
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
    sortedCategories.forEach((category, index) => {
      colors[category] = palette[index % palette.length];
    });

    // Build keys (categories) for the chart - reversed so biggest shows first in legend
    const keys = [...sortedCategories].reverse();
    if (chartData.some((d) => d[otrosLabel])) {
      keys.unshift(otrosLabel); // Otros at the beginning (bottom of reversed legend)
      colors[otrosLabel] = CHART_COLORS.otros;
    }

    return { chartData, keys, colors };
  }, [data, hasRamoFilter]);

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
        <div className="h-[480px] px-2 pt-4 pb-2">
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
              margin={{ top: 10, right: 150, bottom: 100, left: 70 }}
              padding={0.3}
              valueScale={{ type: 'linear' }}
              indexScale={{ type: 'band', round: true }}
              colors={(bar) => colors[bar.id as string] || '#94a3b8'}
              borderRadius={2}
              borderWidth={0}
              enableLabel={false}
              axisTop={null}
              axisRight={null}
              axisBottom={{
                tickSize: 0,
                tickPadding: 10,
                tickRotation: -45,
                legendPosition: 'middle',
                legendOffset: 60,
                truncateTickAt: 0,
              }}
              axisLeft={{
                tickSize: 0,
                tickPadding: 8,
                tickRotation: 0,
                legend: 'Millones $',
                legendPosition: 'middle',
                legendOffset: -60,
                format: (v) => `${v.toLocaleString('es-AR')}`,
              }}
              theme={{
                axis: {
                  ticks: {
                    text: {
                      fontSize: 11,
                      fill: '#64748b',
                    },
                  },
                  legend: {
                    text: {
                      fontSize: 12,
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
                    fontSize: 11,
                    fill: '#475569',
                  },
                },
              }}
              legends={[
                {
                  dataFrom: 'keys',
                  anchor: 'right',
                  direction: 'column',
                  justify: false,
                  translateX: 145,
                  translateY: 0,
                  itemsSpacing: 2,
                  itemWidth: 130,
                  itemHeight: 18,
                  itemDirection: 'left-to-right',
                  itemOpacity: 1,
                  symbolSize: 10,
                  symbolShape: 'circle',
                },
              ]}
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
                      {formatCurrency(Number(value) * 1_000_000)}
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
