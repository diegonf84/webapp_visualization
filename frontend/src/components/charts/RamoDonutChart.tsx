import { useMemo } from 'react';
import { ResponsivePie } from '@nivo/pie';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CHART_COLORS, CHART_CONFIG } from '@/lib/constants';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import type { DistributionItem } from '@/types/api';

interface RamoDonutChartProps {
  data: DistributionItem[] | undefined;
  isLoading: boolean;
  hasRamoFilter: boolean;
}

interface PieDataItem {
  id: string;
  label: string;
  value: number;
  percentage: number;
  color: string;
}

export function RamoDonutChart({
  data,
  isLoading,
  hasRamoFilter,
}: RamoDonutChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      return [];
    }

    const palette = hasRamoFilter ? CHART_COLORS.subramos : CHART_COLORS.ramos;

    // Sort by value descending
    const sorted = [...data].sort((a, b) => b.value - a.value);

    // Limit to max categories + Otros
    const topItems = sorted.slice(0, CHART_CONFIG.maxCategories);
    const otrosItems = sorted.slice(CHART_CONFIG.maxCategories);

    const pieData: PieDataItem[] = topItems.map((item, index) => ({
      id: item.name,
      label: item.name,
      value: item.value / 1_000_000, // Convert to millions
      percentage: item.percentage,
      color: palette[index % palette.length],
    }));

    // Aggregate remaining into "Otros Ramos" or "Otros Subramos"
    if (otrosItems.length > 0) {
      const otrosLabel = hasRamoFilter
        ? CHART_CONFIG.otrosSubramosLabel
        : CHART_CONFIG.otrosRamosLabel;
      const otrosValue = otrosItems.reduce((sum, item) => sum + item.value, 0);
      const otrosPercentage = otrosItems.reduce((sum, item) => sum + item.percentage, 0);
      pieData.push({
        id: otrosLabel,
        label: otrosLabel,
        value: otrosValue / 1_000_000,
        percentage: otrosPercentage,
        color: CHART_COLORS.otros,
      });
    }

    return pieData;
  }, [data, hasRamoFilter]);

  const title = hasRamoFilter ? 'SUBRAMOS' : 'RAMOS';

  return (
    <Card className="h-full">
      <CardHeader className="border-b-2 border-slate-900 bg-gradient-to-r from-slate-50 to-white">
        <CardTitle className="text-slate-900 font-bold tracking-tight">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[450px] p-4">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900" />
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-400">
              No hay datos disponibles
            </div>
          ) : (
            <ResponsivePie
              data={chartData}
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              innerRadius={0.5}
              padAngle={1}
              cornerRadius={4}
              activeOuterRadiusOffset={8}
              colors={(d) => d.data.color}
              borderWidth={0}
              enableArcLinkLabels={false}
              arcLabelsSkipAngle={15}
              arcLabelsTextColor="#ffffff"
              arcLabel={(d) => formatPercentage(d.data.percentage)}
              theme={{
                labels: {
                  text: {
                    fontSize: 12,
                    fontWeight: 600,
                  },
                },
                legends: {
                  text: {
                    fontSize: 11,
                    fill: '#475569',
                  },
                },
              }}
              legends={[]}
              tooltip={({ datum }) => (
                <div className="bg-slate-900 text-white px-3 py-2 rounded-lg shadow-xl text-sm">
                  <div className="font-semibold mb-1">{datum.label}</div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: datum.color }}
                    />
                    <span className="font-medium">
                      {formatCurrency(datum.value * 1_000_000)}
                    </span>
                    <span className="text-slate-400">
                      ({formatPercentage(datum.data.percentage)})
                    </span>
                  </div>
                </div>
              )}
              animate={true}
              motionConfig="gentle"
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
