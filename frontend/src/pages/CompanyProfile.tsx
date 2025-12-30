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
import { ResponsiveTreeMap } from '@nivo/treemap';
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

  // Calculate derived metrics (allow negative values, only protect against division by zero)
  const siniestralidad = profile && profile.primas_devengadas !== 0
    ? (profile.siniestros_devengados / profile.primas_devengadas) * 100
    : 0;
  const gastosPercent = profile && profile.primas_devengadas !== 0
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

  // Type for treemap node data
  interface TreemapNodeData {
    name: string;
    value: number;
    primas: number;
    percentage: number;
    combined_ratio: number;
    siniestralidad: number;
    gastos_percent: number;
  }

  // Prepare treemap data for portfolio
  const treemapData = useMemo(() => {
    if (!profile?.top_ramos || profile.top_ramos.length === 0) return null;

    // Calculate minimum value for small ramos (ensure visibility)
    const maxPrimas = Math.max(...profile.top_ramos.map(r => Math.abs(r.primas)));
    const minVisibleValue = maxPrimas * 0.05; // At least 5% of max for visibility

    return {
      name: 'portfolio',
      children: profile.top_ramos.map((ramo): TreemapNodeData => ({
        name: ramo.ramo,
        // Use absolute value for size, ensure minimum visibility
        value: Math.max(Math.abs(ramo.primas), minVisibleValue),
        primas: ramo.primas,
        percentage: ramo.percentage,
        combined_ratio: ramo.combined_ratio,
        siniestralidad: ramo.siniestralidad,
        gastos_percent: ramo.gastos_percent,
      })),
    };
  }, [profile?.top_ramos]);

  // Format combined ratio for display (cap extreme values)
  const formatRatio = (ratio: number): string => {
    if (ratio > 999) return '>999%';
    if (ratio < -999) return '<-999%';
    return `${ratio.toFixed(1)}%`;
  };

  // Get color for treemap tile based on combined ratio
  const getTreemapColor = (ratio: number): string => {
    // Distinctive colors - forest green and crimson, different from other UI elements
    if (ratio <= 100) return '#065f46'; // Deep forest green
    return '#991b1b'; // Deep crimson red
  };

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
                                <span className="text-sm font-medium text-slate-600">Ratio Combinado</span>
                                <Badge variant={getRatioVariant(combinedRatio, { good: 95, warning: 105 })}>
                                  {combinedRatio.toFixed(1)}%
                                </Badge>
                              </div>
                              <p className="text-xs text-slate-500 mb-2">
                                Siniestralidad + Gastos (rentable si &lt; 100%)
                              </p>
                              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                                <span className="text-xs text-slate-400">
                                  Mercado {profile.tipo_cia}
                                </span>
                                <span className="text-xs font-medium text-slate-500">
                                  {profile.market_combined_ratio.toFixed(1)}%
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-slate-600">Siniestralidad</span>
                                <Badge variant={getRatioVariant(siniestralidad, { good: 65, warning: 80 })}>
                                  {siniestralidad.toFixed(1)}%
                                </Badge>
                              </div>
                              <p className="text-xs text-slate-500 mb-2">
                                Siniestros / Primas Devengadas
                              </p>
                              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                                <span className="text-xs text-slate-400">
                                  Mercado {profile.tipo_cia}
                                </span>
                                <span className="text-xs font-medium text-slate-500">
                                  {profile.market_siniestralidad.toFixed(1)}%
                                </span>
                              </div>
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
                              <p className="text-xs text-slate-500 mb-2">
                                Gastos / Primas Devengadas
                              </p>
                              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                                <span className="text-xs text-slate-400">
                                  Mercado {profile.tipo_cia}
                                </span>
                                <span className="text-xs font-medium text-slate-500">
                                  {profile.market_gastos_percent.toFixed(1)}%
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>

                      {/* Section 3: Portfolio Breakdown - Treemap */}
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-1">
                          Composicion de Cartera
                        </h3>
                        <p className="text-sm text-slate-500 mb-4">
                          Tamano segun primas emitidas • <span className="font-semibold" style={{ color: '#065f46' }}>Verde</span> si RC ≤ 100% • <span className="font-semibold" style={{ color: '#991b1b' }}>Rojo</span> si RC &gt; 100%
                        </p>
                        <Card>
                          <CardContent className="p-4">
                            {treemapData ? (
                              <div style={{ height: Math.max(300, profile.top_ramos.length * 40) }}>
                                <ResponsiveTreeMap
                                  data={treemapData}
                                  identity="name"
                                  value="value"
                                  tile="squarify"
                                  leavesOnly={true}
                                  innerPadding={4}
                                  outerPadding={4}
                                  margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                                  colors={(node) => {
                                    const data = node.data as unknown as TreemapNodeData;
                                    return getTreemapColor(data.combined_ratio);
                                  }}
                                  borderWidth={3}
                                  borderColor="#f1f5f9"
                                  enableLabel={false}
                                  layers={[
                                    'nodes',
                                    ({ nodes }) => {
                                      const maxValue = Math.max(...(treemapData?.children.map(c => c.value) || [1]));

                                      // Helper function to wrap text into multiple lines
                                      const wrapText = (text: string, maxWidth: number, fontSize: number): string[] => {
                                        // Approximate character width (0.6 of font size is a good estimate)
                                        const charWidth = fontSize * 0.6;
                                        const maxCharsPerLine = Math.floor(maxWidth / charWidth);

                                        if (maxCharsPerLine <= 0 || text.length <= maxCharsPerLine) {
                                          return [text];
                                        }

                                        const words = text.split(' ');
                                        const lines: string[] = [];
                                        let currentLine = '';

                                        words.forEach(word => {
                                          const testLine = currentLine ? `${currentLine} ${word}` : word;
                                          if (testLine.length <= maxCharsPerLine) {
                                            currentLine = testLine;
                                          } else {
                                            if (currentLine) {
                                              lines.push(currentLine);
                                            }
                                            currentLine = word;
                                          }
                                        });

                                        if (currentLine) {
                                          lines.push(currentLine);
                                        }

                                        return lines.length > 0 ? lines : [text];
                                      };

                                      return (
                                        <g>
                                          {nodes
                                            .filter(node => node.width > 30 && node.height > 30)
                                            .map((node) => {
                                              const data = node.data as unknown as TreemapNodeData;
                                              const sizeRatio = data.value / maxValue;

                                              // Dynamic font sizes based on box size
                                              const nameFontSize = Math.max(10, Math.min(18, 10 + (sizeRatio * 8)));
                                              const ratioFontSize = Math.max(14, Math.min(24, 14 + (sizeRatio * 10)));

                                              // Wrap text with padding (use 85% of width to leave margins)
                                              const availableWidth = node.width * 0.85;
                                              const nameLines = wrapText(String(node.id), availableWidth, nameFontSize);

                                              // Calculate vertical spacing
                                              const lineHeight = nameFontSize * 1.2;
                                              const totalNameHeight = nameLines.length * lineHeight;
                                              const nameStartY = -(totalNameHeight / 2) - (ratioFontSize / 2) - 4;

                                              return (
                                                <g key={node.path} transform={`translate(${node.x + node.width / 2}, ${node.y + node.height / 2})`}>
                                                  {/* Multi-line ramo name */}
                                                  <text
                                                    textAnchor="middle"
                                                    style={{
                                                      fill: '#fffbeb',
                                                      fontSize: `${nameFontSize}px`,
                                                      fontWeight: 600,
                                                      filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.4))',
                                                      pointerEvents: 'none',
                                                    }}
                                                  >
                                                    {nameLines.map((line, index) => (
                                                      <tspan
                                                        key={index}
                                                        x={0}
                                                        y={nameStartY + (index * lineHeight)}
                                                        dominantBaseline="central"
                                                      >
                                                        {line}
                                                      </tspan>
                                                    ))}
                                                  </text>

                                                  {/* Ratio percentage - positioned below name */}
                                                  <text
                                                    textAnchor="middle"
                                                    dominantBaseline="central"
                                                    style={{
                                                      fill: '#fffbeb',
                                                      fontSize: `${ratioFontSize}px`,
                                                      fontWeight: 800,
                                                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
                                                      pointerEvents: 'none',
                                                    }}
                                                    y={nameStartY + totalNameHeight + (ratioFontSize / 2) + 4}
                                                  >
                                                    {formatRatio(data.combined_ratio)}
                                                  </text>
                                                </g>
                                              );
                                            })}
                                        </g>
                                      );
                                    }
                                  ]}
                                  tooltip={({ node }) => {
                                    const data = node.data as unknown as TreemapNodeData;
                                    const isGood = data.combined_ratio <= 100;
                                    return (
                                      <div
                                        className="px-5 py-4 rounded-2xl shadow-2xl border-2"
                                        style={{
                                          background: 'rgba(15, 23, 42, 0.97)',
                                          backdropFilter: 'blur(12px)',
                                          borderColor: isGood ? '#065f46' : '#991b1b',
                                        }}
                                      >
                                        <div className="font-bold text-lg mb-3" style={{ color: '#fffbeb' }}>
                                          {node.id}
                                        </div>
                                        <div className="space-y-2.5">
                                          <div className="flex justify-between items-baseline gap-8">
                                            <span className="text-xs uppercase tracking-wider" style={{ color: '#94a3b8' }}>
                                              Primas
                                            </span>
                                            <span className="font-semibold text-sm" style={{ color: '#fffbeb' }}>
                                              {formatCurrency(data.primas)}
                                            </span>
                                          </div>
                                          <div className="flex justify-between items-baseline gap-8">
                                            <span className="text-xs uppercase tracking-wider" style={{ color: '#94a3b8' }}>
                                              % Cartera
                                            </span>
                                            <span className="font-semibold text-sm" style={{ color: '#fffbeb' }}>
                                              {data.percentage.toFixed(1)}%
                                            </span>
                                          </div>
                                          <div
                                            className="pt-2.5 mt-1"
                                            style={{ borderTop: '1px solid rgba(148, 163, 184, 0.3)' }}
                                          >
                                            <div className="flex justify-between items-baseline gap-8">
                                              <span className="text-xs uppercase tracking-wider" style={{ color: '#94a3b8' }}>
                                                Ratio Combinado
                                              </span>
                                              <span
                                                className="font-bold text-lg"
                                                style={{ color: isGood ? '#10b981' : '#f87171' }}
                                              >
                                                {formatRatio(data.combined_ratio)}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  }}
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
