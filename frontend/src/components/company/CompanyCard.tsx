import { Link } from 'react-router-dom';
import { Building2, ChevronRight, Layers } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import type { CompanyListItem } from '@/types/api';

interface CompanyCardProps {
  company: CompanyListItem;
}

const tipoCiaColors: Record<string, string> = {
  Generales: 'bg-blue-100 text-blue-800',
  Vida: 'bg-emerald-100 text-emerald-800',
  ART: 'bg-amber-100 text-amber-800',
  Retiro: 'bg-purple-100 text-purple-800',
};

export function CompanyCard({ company }: CompanyCardProps) {
  const badgeColor = tipoCiaColors[company.tipo_cia] || 'bg-slate-100 text-slate-800';

  return (
    <Link to={`/compania/${company.cod_cia}`}>
      <Card className="h-full hover:shadow-md hover:border-blue-300 transition-all duration-200 cursor-pointer group">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-blue-100 transition-colors">
                <Building2 className="h-5 w-5 text-slate-600 group-hover:text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                  {company.nombre_corto}
                </h3>
                <Badge className={`${badgeColor} text-xs font-medium`}>
                  {company.tipo_cia}
                </Badge>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-blue-500 transition-colors flex-shrink-0" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Primas Emitidas</span>
              <span className="font-semibold text-slate-900">
                {formatCurrency(company.primas_emitidas)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500 flex items-center gap-1">
                <Layers className="h-3.5 w-3.5" />
                Ramos
              </span>
              <span className="font-medium text-slate-700">
                {company.ramos_count}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
