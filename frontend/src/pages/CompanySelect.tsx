import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Search, ChevronRight } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import { useCompanies } from '@/hooks/useCompanies';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const tipoCiaColors: Record<string, string> = {
  Generales: 'bg-blue-100 text-blue-800',
  Vida: 'bg-emerald-100 text-emerald-800',
  ART: 'bg-amber-100 text-amber-800',
  Retiro: 'bg-purple-100 text-purple-800',
};

export function CompanySelect() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const { data, isLoading } = useCompanies();

  // Filter companies based on search
  const filteredCompanies = useMemo(() => {
    if (!data?.companies) return [];
    if (!searchQuery) return data.companies.slice(0, 10); // Show top 10 by default

    return data.companies.filter((company) =>
      company.nombre_corto.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 15); // Limit results
  }, [data?.companies, searchQuery]);

  const handleSelect = (codCia: string) => {
    setIsOpen(false);
    navigate(`/compania/${codCia}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-slate-900 to-slate-700 rounded-xl shadow-sm">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Seleccionar Compania
              </h1>
              <p className="text-sm text-slate-500">
                Busca y selecciona una aseguradora para ver su perfil
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-[800px] mx-auto px-6 py-12">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Buscar compania
            </label>

            {/* Search Input */}
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Escribi el nombre de la compania..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsOpen(true);
                  }}
                  onFocus={() => setIsOpen(true)}
                  className="w-full h-12 pl-10 pr-4 rounded-lg border border-slate-200 bg-white text-base
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                    placeholder:text-slate-400 transition-all duration-200"
                />
              </div>

              {/* Dropdown Results */}
              {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-80 overflow-auto">
                  {isLoading ? (
                    <div className="p-4 text-center text-slate-500">
                      Cargando companias...
                    </div>
                  ) : filteredCompanies.length === 0 ? (
                    <div className="p-4 text-center text-slate-500">
                      No se encontraron companias
                    </div>
                  ) : (
                    <ul>
                      {filteredCompanies.map((company) => (
                        <li key={company.cod_cia}>
                          <button
                            onClick={() => handleSelect(company.cod_cia)}
                            className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-slate-100 rounded-lg">
                                <Building2 className="h-4 w-4 text-slate-600" />
                              </div>
                              <div>
                                <div className="font-medium text-slate-900">
                                  {company.nombre_corto}
                                </div>
                                <div className="text-sm text-slate-500 flex items-center gap-2">
                                  <Badge className={`${tipoCiaColors[company.tipo_cia] || 'bg-slate-100 text-slate-800'} text-xs`}>
                                    {company.tipo_cia}
                                  </Badge>
                                  <span>•</span>
                                  <span>{formatCurrency(company.primas_emitidas)}</span>
                                </div>
                              </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-slate-300" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}

                  {!searchQuery && data?.total && (
                    <div className="px-4 py-2 text-xs text-slate-400 border-t border-slate-100">
                      Mostrando top 10 de {data.total} companias. Escribi para buscar.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Click outside to close */}
            {isOpen && (
              <div
                className="fixed inset-0 z-0"
                onClick={() => setIsOpen(false)}
              />
            )}
          </div>

          {/* Help text */}
          <p className="mt-4 text-sm text-slate-500 text-center">
            Selecciona una compania para ver sus metricas, tendencias y comparaciones.
          </p>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
