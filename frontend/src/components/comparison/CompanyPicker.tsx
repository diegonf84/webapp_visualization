import { useState, useMemo } from 'react';
import { Building2, Search, ChevronRight, X } from 'lucide-react';
import { useCompanies } from '@/hooks/useCompanies';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import type { CompanyListItem } from '@/types/api';

const tipoCiaColors: Record<string, string> = {
  Generales: 'bg-blue-100 text-blue-800',
  Vida: 'bg-emerald-100 text-emerald-800',
  ART: 'bg-amber-100 text-amber-800',
  Retiro: 'bg-purple-100 text-purple-800',
};

interface CompanyPickerProps {
  value?: string;
  onSelect: (codCia: string) => void;
}

export function CompanyPicker({ value, onSelect }: CompanyPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const { data, isLoading } = useCompanies();

  const filteredCompanies = useMemo(() => {
    if (!data?.companies) return [];
    if (!searchQuery) return data.companies.slice(0, 10);
    return data.companies
      .filter((c) =>
        c.nombre_corto.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      .slice(0, 15);
  }, [data?.companies, searchQuery]);

  const selectedCompany: CompanyListItem | undefined = useMemo(() => {
    if (!value || !data?.companies) return undefined;
    return data.companies.find((c) => c.cod_cia === value);
  }, [value, data?.companies]);

  const handleSelect = (codCia: string) => {
    setIsOpen(false);
    setSearchQuery('');
    onSelect(codCia);
  };

  const handleClear = () => {
    setSearchQuery('');
    setIsOpen(false);
    onSelect('');
  };

  if (selectedCompany) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Building2 className="h-4 w-4 text-blue-700" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-slate-900 truncate">
            {selectedCompany.nombre_corto}
          </div>
          <div className="text-sm text-slate-500 flex items-center gap-2">
            <Badge
              className={`${tipoCiaColors[selectedCompany.tipo_cia] || 'bg-slate-100 text-slate-800'} text-xs`}
            >
              {selectedCompany.tipo_cia}
            </Badge>
            <span>{formatCurrency(selectedCompany.primas_emitidas)}</span>
          </div>
        </div>
        <button
          onClick={handleClear}
          className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          aria-label="Limpiar seleccion"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar compania..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full h-11 pl-10 pr-4 rounded-lg border border-slate-200 bg-white text-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            placeholder:text-slate-400 transition-all duration-200"
        />
      </div>

      {isOpen && (
        <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-72 overflow-auto">
          {isLoading ? (
            <div className="p-4 text-center text-slate-500 text-sm">
              Cargando companias...
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="p-4 text-center text-slate-500 text-sm">
              No se encontraron companias
            </div>
          ) : (
            <ul>
              {filteredCompanies.map((company) => (
                <li key={company.cod_cia}>
                  <button
                    onClick={() => handleSelect(company.cod_cia)}
                    className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-1.5 bg-slate-100 rounded-lg flex-shrink-0">
                        <Building2 className="h-3.5 w-3.5 text-slate-600" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-slate-900 text-sm truncate">
                          {company.nombre_corto}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1.5">
                          <Badge
                            className={`${tipoCiaColors[company.tipo_cia] || 'bg-slate-100 text-slate-800'} text-xs`}
                          >
                            {company.tipo_cia}
                          </Badge>
                          <span>{formatCurrency(company.primas_emitidas)}</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300 flex-shrink-0" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
