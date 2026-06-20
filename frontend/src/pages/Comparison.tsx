import { useState } from 'react';
import { GitCompare, AlertCircle, RefreshCw } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  CompanyPicker,
  MethodToggle,
  ComparisonContextHeader,
  ComparisonResults,
} from '@/components/comparison';
import { useCompanyComparison } from '@/hooks/useCompanyComparison';
import type { ComparisonMethod } from '@/types/api';

function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const status = (error as { response?: { status?: number } }).response?.status;
    if (status === 400) {
      return 'No se encontraron datos comparables para esta compañía. Seleccioná otra.';
    }
    if (status === 404) {
      return 'Compañía no encontrada. Seleccioná otra.';
    }
    if (status === 422) {
      return 'Método de comparación inválido.';
    }
  }
  return 'No se pudo completar la comparación. Reintentá.';
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="h-4 bg-slate-200 rounded w-1/3" />
      <div className="h-12 bg-slate-100 rounded" />
      <div className="h-12 bg-slate-100 rounded" />
      <div className="h-12 bg-slate-100 rounded" />
      <div className="h-12 bg-slate-100 rounded" />
    </div>
  );
}

export function Comparison() {
  const [selectedCompany, setSelectedCompany] = useState<string | undefined>(undefined);
  const [method, setMethod] = useState<ComparisonMethod>('total_percentile');

  const { data, isLoading, isError, error, refetch } = useCompanyComparison(
    selectedCompany,
    method,
  );

  const handleCompanySelect = (codCia: string) => {
    setSelectedCompany(codCia || undefined);
  };

  const hasCompany = Boolean(selectedCompany);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-slate-900 to-slate-700 rounded-xl shadow-sm">
              <GitCompare className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Comparar Companias
              </h1>
              <p className="text-sm text-slate-500">
                Selecciona una compania y un metodo para comparar con pares del mercado
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-[1200px] mx-auto px-6 py-6 space-y-6">
          {/* Controls */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  1. Selecciona una compania
                </label>
                <CompanyPicker value={selectedCompany} onSelect={handleCompanySelect} />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  2. Elegi el metodo de comparacion
                </label>
                <MethodToggle
                  value={method}
                  onChange={setMethod}
                  disabled={!hasCompany}
                />
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {isLoading && hasCompany && (
            <Card>
              <CardContent className="p-6">
                <LoadingSkeleton />
              </CardContent>
            </Card>
          )}

          {isError && (
            <Card className="border-red-200">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-red-800 font-medium mb-1">
                      Error en la comparacion
                    </p>
                    <p className="text-sm text-red-600">
                      {getErrorMessage(error)}
                    </p>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="mt-3"
                      onClick={() => refetch()}
                    >
                      <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                      Reintentar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {data && (
            <Card>
              <CardContent className="p-6 space-y-4">
                <ComparisonContextHeader data={data} />
                <ComparisonResults data={data} />
              </CardContent>
            </Card>
          )}

          {/* Empty state when nothing is selected */}
          {!hasCompany && !isLoading && (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <GitCompare className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-slate-700 mb-2">
                Selecciona una compania para comparar
              </h2>
              <p className="text-slate-500 max-w-md mx-auto">
                Busca una aseguradora y elegi un metodo de comparacion para ver como se posiciona respecto a sus pares.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
