import { ResponsiveLine } from '@nivo/line';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { RatioEvolutionChartProps } from '@/types/operations';

export function RatioEvolutionChart({ data, isLoading }: RatioEvolutionChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">
            Evolucion de Ratios
            <span className="ml-2 text-sm font-normal text-slate-500">(Datos de Balance)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-pulse text-slate-400">Cargando...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Main line: Ratio Combinado (prominent)
  // Secondary lines: Siniestralidad & Gastos (lighter/thinner)
  // Market line: Market ratio (dashed, gray)
  const chartData = [
    {
      id: 'Ratio Combinado',
      data: data.map(d => ({ x: d.periodoLabel, y: d.ratioCombinado })),
    },
    {
      id: 'Mercado',
      data: data.map(d => ({ x: d.periodoLabel, y: d.marketRatioCombinado })),
    },
    {
      id: 'Siniestralidad',
      data: data.map(d => ({ x: d.periodoLabel, y: d.ratioSiniestralidad })),
    },
    {
      id: 'Gastos',
      data: data.map(d => ({ x: d.periodoLabel, y: d.ratioGastos })),
    },
  ];

  const allValues = data.flatMap(d => [d.ratioCombinado, d.ratioSiniestralidad, d.ratioGastos, d.marketRatioCombinado]);
  const minY = Math.min(...allValues);
  const maxY = Math.max(...allValues);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          Evolucion de Ratios
          <span className="ml-2 text-sm font-normal text-slate-500">(Datos de Balance)</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveLine
            data={chartData}
            margin={{ top: 20, right: 120, bottom: 50, left: 60 }}
            xScale={{ type: 'point' }}
            yScale={{
              type: 'linear',
              min: Math.floor(minY / 10) * 10 - 10,
              max: Math.ceil(maxY / 10) * 10 + 10,
              stacked: false,
            }}
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: -45,
              legendOffset: 40,
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: '%',
              legendOffset: -45,
              legendPosition: 'middle',
              format: v => `${v}%`,
            }}
            colors={[
              '#dc2626', // Ratio Combinado - strong red (principal)
              '#64748b', // Mercado - slate gray (reference)
              '#93c5fd', // Siniestralidad - light blue (secondary)
              '#fcd34d', // Gastos - light amber (secondary)
            ]}
            lineWidth={3}
            layers={[
              'grid',
              'markers',
              'axes',
              'areas',
              'crosshair',
              // Custom layer to style lines differently
              ({ series, lineGenerator, xScale, yScale }) => {
                const lineWidths: Record<string, number> = {
                  'Ratio Combinado': 4,
                  'Mercado': 2.5,
                  'Siniestralidad': 1.5,
                  'Gastos': 1.5,
                };
                return series.map(({ id, data, color }) => (
                  <path
                    key={id}
                    d={lineGenerator(
                      data.map(d => ({
                        x: xScale(d.data.x),
                        y: yScale(d.data.y as number),
                      }))
                    ) || ''}
                    fill="none"
                    stroke={color}
                    strokeWidth={lineWidths[id as string] || 2}
                    style={{ opacity: id === 'Siniestralidad' || id === 'Gastos' ? 0.7 : 1 }}
                  />
                ));
              },
              'points',
              'slices',
              'mesh',
              'legends',
            ]}
            pointSize={8}
            pointColor={{ theme: 'background' }}
            pointBorderWidth={2}
            pointBorderColor={{ from: 'serieColor' }}
            pointLabelYOffset={-12}
            enableSlices="x"
            sliceTooltip={({ slice }) => (
              <div className="bg-white px-3 py-2 rounded-lg shadow-lg border border-slate-200">
                <div className="font-medium text-sm text-slate-700 mb-1">
                  {slice.points[0].data.xFormatted}
                </div>
                {slice.points.map(point => (
                  <div key={point.id} className="flex items-center gap-2 text-sm">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: point.seriesColor }}
                    />
                    <span className="text-slate-600">{point.seriesId}:</span>
                    <span className="font-medium">{point.data.yFormatted}%</span>
                  </div>
                ))}
              </div>
            )}
            useMesh={true}
            legends={[
              {
                anchor: 'bottom-right',
                direction: 'column',
                justify: false,
                translateX: 110,
                translateY: 0,
                itemsSpacing: 2,
                itemDirection: 'left-to-right',
                itemWidth: 100,
                itemHeight: 20,
                itemOpacity: 0.85,
                symbolSize: 12,
                symbolShape: 'circle',
              },
            ]}
            markers={[
              {
                axis: 'y',
                value: 100,
                lineStyle: {
                  stroke: '#94a3b8',
                  strokeWidth: 2,
                  strokeDasharray: '6 4',
                },
                legend: 'Equilibrio',
                legendPosition: 'top-left',
                textStyle: {
                  fill: '#64748b',
                  fontSize: 11,
                },
              },
            ]}
            theme={{
              axis: {
                ticks: {
                  text: { fontSize: 11, fill: '#64748b' },
                },
                legend: {
                  text: { fontSize: 12, fill: '#475569' },
                },
              },
              grid: {
                line: { stroke: '#e2e8f0', strokeWidth: 1 },
              },
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
