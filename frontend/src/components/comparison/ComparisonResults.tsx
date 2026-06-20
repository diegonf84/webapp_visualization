import { Award, TrendingUp, TrendingDown, Minus, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import type { CompanyComparisonResponse, ComparisonCompanyItem, ComparisonMethod } from '@/types/api';

interface ComparisonResultsProps {
  data: CompanyComparisonResponse;
}

function CompanyRow({
  company,
  is_selected,
  method,
  rank_label,
}: {
  company: ComparisonCompanyItem;
  is_selected: boolean;
  method: ComparisonMethod;
  rank_label?: string;
}) {
  return (
    <div
      className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-colors ${
        is_selected
          ? 'bg-blue-50 border border-blue-200'
          : 'hover:bg-slate-50'
      }`}
    >
      {/* Rank badge */}
      <div className="w-8 flex-shrink-0 text-center">
        {rank_label ? (
          <span className="text-xs font-medium text-slate-500">{rank_label}</span>
        ) : (
          <span className="text-xs font-bold text-slate-700">
            #{company.ranking_position}
          </span>
        )}
      </div>

      {/* Company info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`font-medium text-sm truncate ${is_selected ? 'text-blue-900' : 'text-slate-900'}`}>
            {company.nombre_corto}
          </span>
          {is_selected && (
            <Badge className="bg-blue-100 text-blue-800 text-xs">Seleccionada</Badge>
          )}
        </div>
        <div className="text-xs text-slate-500">
          {company.tipo_cia}
        </div>
      </div>

      {/* Primas emitidas */}
      <div className="text-right flex-shrink-0">
        <div className="text-sm font-semibold text-slate-900">
          {formatCurrency(company.primas_emitidas)}
        </div>
      </div>

      {/* Method-specific columns */}
      {method !== 'ramo_similarity' && company.relative_position != null && (
        <div className="w-20 flex-shrink-0 text-right">
          {company.relative_position === 0 ? (
            <span className="inline-flex items-center gap-1 text-xs text-blue-700 font-medium">
              <Minus className="h-3 w-3" />
              Ref.
            </span>
          ) : company.relative_position < 0 ? (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-700">
              <TrendingUp className="h-3 w-3" />
              {Math.abs(company.relative_position)} pos.
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs text-amber-700">
              <TrendingDown className="h-3 w-3" />
              {company.relative_position} pos.
            </span>
          )}
        </div>
      )}

      {method === 'main_ramo_percentile' && company.main_ramo_primas != null && (
        <div className="w-28 flex-shrink-0 text-right">
          <div className="text-xs text-slate-500">Ramo</div>
          <div className="text-sm text-slate-700">{formatCurrency(company.main_ramo_primas)}</div>
        </div>
      )}

      {method === 'ramo_similarity' && company.similarity_distance != null && (
        <div className="w-24 flex-shrink-0 text-right">
          <div className="text-xs text-slate-500">Distancia</div>
          <div className="text-sm font-medium text-slate-700">
            {company.similarity_distance.toFixed(1)}
          </div>
        </div>
      )}
    </div>
  );
}

function PercentileResults({ data }: { data: CompanyComparisonResponse }) {
  const { selected_company, companies_above, companies_below, method } = data;
  const is_top_ranked = companies_above.length === 0;

  return (
    <div className="space-y-2">
      {/* Section header */}
      <div className="flex items-center gap-2 px-4 py-2">
        <Award className="h-4 w-4 text-slate-400" />
        <span className="text-sm font-medium text-slate-700">
          Ranking por {method === 'total_percentile' ? 'primas totales' : 'ramo principal'}
        </span>
      </div>

      {/* Above section */}
      {!is_top_ranked && (
        <div className="space-y-1">
          <div className="px-4 py-1.5 text-xs font-medium text-slate-500 uppercase tracking-wide">
            Posiciones superiores
          </div>
          {companies_above.map((c) => (
            <CompanyRow key={c.cod_cia} company={c} is_selected={false} method={method} />
          ))}
        </div>
      )}

      {is_top_ranked && (
        <div className="px-4 py-2 text-sm text-emerald-700 bg-emerald-50 rounded-lg flex items-center gap-2">
          <Award className="h-4 w-4" />
          Posicion mas alta del ranking
        </div>
      )}

      {/* Selected company */}
      <div className="space-y-1">
        <div className="px-4 py-1.5 text-xs font-medium text-blue-600 uppercase tracking-wide">
          Seleccionada
        </div>
        <CompanyRow company={selected_company} is_selected={true} method={method} rank_label="#" />
      </div>

      {/* Below section */}
      {companies_below.length > 0 && (
        <div className="space-y-1">
          <div className="px-4 py-1.5 text-xs font-medium text-slate-500 uppercase tracking-wide">
            Posiciones inferiores
          </div>
          {companies_below.map((c) => (
            <CompanyRow key={c.cod_cia} company={c} is_selected={false} method={method} />
          ))}
        </div>
      )}
    </div>
  );
}

function SimilarityResults({ data }: { data: CompanyComparisonResponse }) {
  const { selected_company, similar_companies, method } = data;

  return (
    <div className="space-y-2">
      {/* Section header */}
      <div className="flex items-center gap-2 px-4 py-2">
        <Award className="h-4 w-4 text-slate-400" />
        <span className="text-sm font-medium text-slate-700">
          Companias con distribucion de ramo similar
        </span>
      </div>

      {/* Selected company as reference */}
      <div className="space-y-1">
        <div className="px-4 py-1.5 text-xs font-medium text-blue-600 uppercase tracking-wide">
          Referencia
        </div>
        <CompanyRow company={selected_company} is_selected={true} method={method} rank_label="Ref" />
      </div>

      {/* Similar companies sorted by distance */}
      {similar_companies.length > 0 && (
        <div className="space-y-1">
          <div className="px-4 py-1.5 text-xs font-medium text-slate-500 uppercase tracking-wide">
            Mas similares
          </div>
          {[...similar_companies]
            .sort((a, b) => (a.similarity_distance ?? 0) - (b.similarity_distance ?? 0))
            .map((c, idx) => (
              <CompanyRow
                key={c.cod_cia}
                company={c}
                is_selected={false}
                method={method}
                rank_label={`#${idx + 1}`}
              />
            ))}
        </div>
      )}
    </div>
  );
}

function EmptyState({ method }: { method: ComparisonMethod }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Users className="h-12 w-12 text-slate-300 mb-3" />
      <h3 className="text-lg font-medium text-slate-700 mb-1">
        Sin companias para comparar
      </h3>
      <p className="text-sm text-slate-500 max-w-md">
        {method === 'ramo_similarity'
          ? 'No se encontraron companias con distribucion de ramo similar.'
          : 'No hay companias en posiciones cercanas para comparar en este momento.'}
      </p>
    </div>
  );
}

function isEmpty(data: CompanyComparisonResponse): boolean {
  if (data.method === 'ramo_similarity') {
    return data.similar_companies.length === 0;
  }
  return data.companies_above.length === 0 && data.companies_below.length === 0;
}

export function ComparisonResults({ data }: ComparisonResultsProps) {
  if (isEmpty(data)) {
    return <EmptyState method={data.method} />;
  }

  if (data.method === 'ramo_similarity') {
    return <SimilarityResults data={data} />;
  }

  return <PercentileResults data={data} />;
}
