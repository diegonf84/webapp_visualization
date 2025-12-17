import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Building2,
  ArrowLeft,
  Layers,
  TrendingUp,
  AlertCircle,
  DollarSign,
  PieChart,
  BarChart3,
  Wallet,
  GitCompare,
  Calculator,
  Trophy,
  Calendar,
  Minus,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { ResponsiveBar } from '@nivo/bar';
import { Footer } from '@/components/layout/Footer';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useCompanyProfile } from '@/hooks/useCompanyProfile';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { CHART_COLORS } from '@/lib/constants';

const tipoCiaColors: Record<string, string> = {
  Generales: 'bg-blue-100 text-blue-800',
  Vida: 'bg-emerald-100 text-emerald-800',
  ART: 'bg-amber-100 text-amber-800',
  Retiro: 'bg-purple-100 text-purple-800',
};

// Format period from "202503" to "Septiembre 2025"
const formatPeriodo = (periodo: string): string => {
  if (!periodo || periodo.length !== 6) return periodo;
  const year = periodo.substring(0, 4);
  const quarter = periodo.substring(4, 6);
  const monthNames: Record<string, string> = {
    '01': 'Marzo',
    '02': 'Junio',
    '03': 'Septiembre',
    '04': 'Diciembre',
  };
  return `${monthNames[quarter] || quarter} ${year}`;
};

// Format ranking position with ordinal
const formatRanking = (position: number): string => {
  return `#${position}`;
};

// YoY Variation display component
interface YoYIndicatorProps {
  value: number | null;
  inverted?: boolean; // For metrics where negative is good (like costs)
}

function YoYIndicator({ value, inverted = false }: YoYIndicatorProps) {
  if (value === null) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-slate-400">
        <Minus className="h-3 w-3" />
        N/A
      </span>
    );
  }

  const isPositive = value >= 0;
  const isGood = inverted ? !isPositive : isPositive;

  return (
    <span className={cn(
      'inline-flex items-center gap-0.5 text-xs font-medium',
      isGood ? 'text-emerald-600' : 'text-red-600'
    )}>
      {isPositive ? (
        <ArrowUpRight className="h-3 w-3" />
      ) : (
        <ArrowDownRight className="h-3 w-3" />
      )}
      {isPositive ? '+' : ''}{value.toFixed(1)}%
    </span>
  );
}

type TabId = 'resumen' | 'operaciones' | 'inversiones' | 'comparacion';

const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'resumen', label: 'Resumen', icon: <BarChart3 className="h-4 w-4" /> },
  { id: 'operaciones', label: 'Operaciones', icon: <TrendingUp className="h-4 w-4" /> },
  { id: 'inversiones', label: 'Inversiones', icon: <Wallet className="h-4 w-4" /> },
  { id: 'comparacion', label: 'Comparacion', icon: <GitCompare className="h-4 w-4" /> },
];

export function CompanyProfile() {
  const { codCia } = useParams<{ codCia: string }>();
  const [activeTab, setActiveTab] = useState<TabId>('resumen');

  const { data: profile, isLoading, error } = useCompanyProfile(codCia);

  // Calculate derived metrics
  const siniestralidad = profile && profile.primas_devengadas > 0
    ? (profile.siniestros_devengados / profile.primas_devengadas) * 100
    : 0;
  const gastosPercent = profile && profile.primas_devengadas > 0
    ? (profile.gastos_devengados / profile.primas_devengadas) * 100
    : 0;
  const combinedRatio = siniestralidad + gastosPercent;
  const resultadoTecnico = profile
    ? profile.primas_devengadas - profile.siniestros_devengados - profile.gastos_devengados
    : 0;

  // Helper to get ratio color variant
  const getRatioVariant = (value: number, thresholds: { good: number; warning: number }): 'success' | 'warning' | 'destructive' => {
    if (value <= thresholds.good) return 'success';
    if (value <= thresholds.warning) return 'warning';
    return 'destructive';
  };

  // Prepare bar chart data for portfolio
  const portfolioChartData = useMemo(() => {
    if (!profile?.top_ramos) return [];
    return profile.top_ramos.map((ramo, index) => ({
      ramo: ramo.ramo,
      percentage: ramo.percentage,
      primas: ramo.primas,
      color: CHART_COLORS.ramos[index % CHART_COLORS.ramos.length],
    }));
  }, [profile?.top_ramos]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              to="/compania"
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-slate-600" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-slate-900 to-slate-700 rounded-xl shadow-sm">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  {isLoading ? 'Cargando...' : profile?.nombre_corto || 'Compania'}
                </h1>
                <p className="text-sm text-slate-500">Perfil de Compania</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-[1600px] mx-auto px-6 py-6">
          {isLoading ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto" />
              <p className="mt-4 text-slate-500">Cargando perfil...</p>
            </div>
          ) : error ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-slate-700 mb-2">Error</h2>
              <p className="text-slate-500">No se pudo cargar el perfil de la compania.</p>
              <Link
                to="/compania"
                className="mt-4 inline-block text-blue-600 hover:underline"
              >
                Volver a seleccionar
              </Link>
            </div>
          ) : profile ? (
            <>
              {/* Company Resume Card */}
              <Card className="mb-6 overflow-hidden">
                {/* Context Bar - Period and Ranking */}
                <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {/* Period */}
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-300" />
                        <span className="text-white font-medium">
                          {formatPeriodo(profile.periodo)}
                        </span>
                        <Badge className="bg-slate-600 text-slate-200 text-xs">
                          Acumulado
                        </Badge>
                      </div>
                    </div>
                    {/* Ranking */}
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-amber-400" />
                      <span className="text-white font-medium">
                        {formatRanking(profile.ranking_position)}
                      </span>
                      <span className="text-slate-300 text-sm">
                        de {profile.total_companies} en produccion
                      </span>
                    </div>
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Left: Company Info */}
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-slate-100 rounded-xl">
                        <Building2 className="h-8 w-8 text-slate-600" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-slate-900">
                          {profile.nombre_corto}
                        </h2>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={tipoCiaColors[profile.tipo_cia] || 'bg-slate-100 text-slate-800'}>
                            {profile.tipo_cia}
                          </Badge>
                          <span className="text-sm text-slate-500">
                            Cod: {profile.cod_cia}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Key Metrics */}
                    <div className="flex flex-wrap gap-6">
                      <div className="text-center">
                        <div className="flex items-center gap-1 text-slate-500 text-sm mb-1">
                          <DollarSign className="h-4 w-4" />
                          Primas Emitidas
                        </div>
                        <div className="text-xl font-bold text-slate-900">
                          {formatCurrency(profile.primas_emitidas)}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center gap-1 text-slate-500 text-sm mb-1">
                          <Layers className="h-4 w-4" />
                          Ramos
                        </div>
                        <div className="text-xl font-bold text-slate-900">
                          {profile.ramos_count}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center gap-1 text-slate-500 text-sm mb-1">
                          <PieChart className="h-4 w-4" />
                          Siniestralidad
                        </div>
                        <div className="text-xl font-bold text-slate-900">
                          {siniestralidad.toFixed(1)}%
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center gap-1 text-slate-500 text-sm mb-1">
                          <Calculator className="h-4 w-4" />
                          Gastos %
                        </div>
                        <div className="text-xl font-bold text-slate-900">
                          {gastosPercent.toFixed(1)}%
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center gap-1 text-slate-500 text-sm mb-1">
                          <TrendingUp className="h-4 w-4" />
                          Resultado Tecnico
                        </div>
                        <div className={cn(
                          'text-xl font-bold',
                          resultadoTecnico >= 0 ? 'text-emerald-600' : 'text-red-600'
                        )}>
                          {formatCurrency(resultadoTecnico)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Top 5 Ramos */}
                  {profile.top_ramos && profile.top_ramos.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <p className="text-xs text-slate-500 mb-2 uppercase tracking-wide">Top 5 Ramos:</p>
                      <div className="flex flex-wrap gap-2">
                        {profile.top_ramos.map((ramo, index) => (
                          <Badge
                            key={ramo.ramo}
                            variant="outline"
                            className="text-xs font-medium"
                            style={{
                              borderColor: CHART_COLORS.ramos[index % CHART_COLORS.ramos.length],
                              color: CHART_COLORS.ramos[index % CHART_COLORS.ramos.length],
                            }}
                          >
                            {ramo.ramo}: {ramo.percentage.toFixed(1)}%
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Tabs */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                {/* Tab Navigation */}
                <div className="border-b border-slate-200 px-4">
                  <nav className="flex gap-1 -mb-px">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                          'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                          activeTab === tab.id
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                        )}
                      >
                        {tab.icon}
                        {tab.label}
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                  {activeTab === 'resumen' && (
                    <div className="space-y-8">
                      {/* Section 1: Key Results */}
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-1">
                          Resultados del Ejercicio
                        </h3>
                        <p className="text-sm text-slate-500 mb-4">
                          Valores acumulados con variacion interanual (vs. mismo periodo ano anterior)
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          {/* Primas Emitidas */}
                          <Card>
                            <CardContent className="p-4">
                              <div className="flex items-center gap-2 text-slate-500 text-sm mb-2">
                                <DollarSign className="h-4 w-4" />
                                Primas Emitidas
                              </div>
                              <div className="text-2xl font-bold text-slate-900 mb-1">
                                {formatCurrency(profile.primas_emitidas)}
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-slate-400">vs año ant:</span>
                                <YoYIndicator value={profile.yoy_primas_emitidas} />
                              </div>
                            </CardContent>
                          </Card>

                          {/* Resultado Técnico */}
                          <Card>
                            <CardContent className="p-4">
                              <div className="flex items-center gap-2 text-slate-500 text-sm mb-2">
                                <BarChart3 className="h-4 w-4" />
                                Resultado Tecnico
                              </div>
                              <div className={cn(
                                'text-2xl font-bold mb-1',
                                profile.resultado_tecnico >= 0 ? 'text-slate-900' : 'text-red-600'
                              )}>
                                {formatCurrency(profile.resultado_tecnico)}
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-slate-400">vs año ant:</span>
                                <YoYIndicator value={profile.yoy_resultado_tecnico} />
                              </div>
                            </CardContent>
                          </Card>

                          {/* Resultado Financiero */}
                          <Card>
                            <CardContent className="p-4">
                              <div className="flex items-center gap-2 text-slate-500 text-sm mb-2">
                                <Wallet className="h-4 w-4" />
                                Resultado Financiero
                              </div>
                              <div className={cn(
                                'text-2xl font-bold mb-1',
                                profile.resultado_financiero >= 0 ? 'text-slate-900' : 'text-red-600'
                              )}>
                                {formatCurrency(profile.resultado_financiero)}
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-slate-400">vs año ant:</span>
                                <YoYIndicator value={profile.yoy_resultado_financiero} />
                              </div>
                            </CardContent>
                          </Card>

                          {/* Resultado Final */}
                          <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-slate-300">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-2 text-slate-600 text-sm mb-2">
                                <TrendingUp className="h-4 w-4" />
                                Resultado Final
                              </div>
                              <div className={cn(
                                'text-2xl font-bold mb-1',
                                profile.resultado_final >= 0 ? 'text-emerald-600' : 'text-red-600'
                              )}>
                                {formatCurrency(profile.resultado_final)}
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-slate-400">vs año ant:</span>
                                <YoYIndicator value={profile.yoy_resultado_final} />
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>

                      {/* Section 2: Key Ratios */}
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-1">
                          Ratios Clave
                        </h3>
                        <p className="text-sm text-slate-500 mb-4">
                          Indicadores de desempeno del periodo acumulado
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Card>
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-slate-600">Siniestralidad</span>
                                <Badge variant={getRatioVariant(siniestralidad, { good: 65, warning: 80 })}>
                                  {siniestralidad.toFixed(1)}%
                                </Badge>
                              </div>
                              <p className="text-xs text-slate-500">
                                Siniestros / Primas Devengadas
                              </p>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-slate-600">Gastos %</span>
                                <Badge variant={getRatioVariant(gastosPercent, { good: 25, warning: 35 })}>
                                  {gastosPercent.toFixed(1)}%
                                </Badge>
                              </div>
                              <p className="text-xs text-slate-500">
                                Gastos / Primas Devengadas
                              </p>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-slate-600">Ratio Combinado</span>
                                <Badge variant={getRatioVariant(combinedRatio, { good: 95, warning: 105 })}>
                                  {combinedRatio.toFixed(1)}%
                                </Badge>
                              </div>
                              <p className="text-xs text-slate-500">
                                Siniestralidad + Gastos (rentable si &lt; 100%)
                              </p>
                            </CardContent>
                          </Card>
                        </div>
                      </div>

                      {/* Section 3: Portfolio Breakdown */}
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-1">
                          Composicion de Cartera
                        </h3>
                        <p className="text-sm text-slate-500 mb-4">
                          Distribucion por ramo (Top 5)
                        </p>
                        <Card>
                          <CardContent className="p-4">
                            {portfolioChartData.length > 0 ? (
                              <div style={{ height: 280 }}>
                                <ResponsiveBar
                                  data={portfolioChartData}
                                  keys={['percentage']}
                                  indexBy="ramo"
                                  layout="horizontal"
                                  margin={{ top: 10, right: 30, bottom: 40, left: 120 }}
                                  padding={0.3}
                                  valueScale={{ type: 'linear' }}
                                  colors={(bar) => {
                                    const item = portfolioChartData.find(d => d.ramo === bar.indexValue);
                                    return item?.color || CHART_COLORS.ramos[0];
                                  }}
                                  borderRadius={4}
                                  enableLabel={true}
                                  label={d => `${Number(d.value).toFixed(1)}%`}
                                  labelTextColor="#ffffff"
                                  axisTop={null}
                                  axisRight={null}
                                  axisBottom={{
                                    tickSize: 0,
                                    tickPadding: 8,
                                    legend: 'Porcentaje de Cartera (%)',
                                    legendPosition: 'middle',
                                    legendOffset: 30,
                                  }}
                                  axisLeft={{
                                    tickSize: 0,
                                    tickPadding: 8,
                                  }}
                                  enableGridY={false}
                                  theme={{
                                    axis: {
                                      ticks: { text: { fontSize: 11, fill: '#64748b' } },
                                      legend: { text: { fontSize: 12, fill: '#475569', fontWeight: 500 } },
                                    },
                                  }}
                                  tooltip={({ data }) => (
                                    <div className="bg-slate-900 text-white px-3 py-2 rounded-lg shadow-xl text-sm">
                                      <div className="font-semibold">{data.ramo}</div>
                                      <div className="text-slate-300">
                                        {formatCurrency(data.primas)} ({Number(data.percentage).toFixed(1)}%)
                                      </div>
                                    </div>
                                  )}
                                  animate={true}
                                />
                              </div>
                            ) : (
                              <div className="h-40 flex items-center justify-center text-slate-400">
                                No hay datos de ramos disponibles
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  )}

                  {activeTab === 'operaciones' && (
                    <div className="text-center py-8">
                      <TrendingUp className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-slate-700 mb-2">
                        Operaciones
                      </h3>
                      <p className="text-slate-500">
                        Proximamente: Evolucion de primas, composicion por ramo, siniestralidad, gastos.
                      </p>
                    </div>
                  )}

                  {activeTab === 'inversiones' && (
                    <div className="text-center py-8">
                      <Wallet className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-slate-700 mb-2">
                        Inversiones y Balance
                      </h3>
                      <p className="text-slate-500">
                        Proximamente: Composicion del activo, patrimonio neto, resultados financieros.
                      </p>
                    </div>
                  )}

                  {activeTab === 'comparacion' && (
                    <div className="text-center py-8">
                      <GitCompare className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-slate-700 mb-2">
                        Comparacion con el Mercado
                      </h3>
                      <p className="text-slate-500">
                        Proximamente: Ranking, radar chart, comparacion con peers del mismo tipo.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : null}
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
