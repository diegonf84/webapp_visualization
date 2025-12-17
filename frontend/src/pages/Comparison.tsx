import { GitCompare } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';

export function Comparison() {
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
                Comparar multiples aseguradoras lado a lado
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-[1600px] mx-auto px-6 py-6">
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <GitCompare className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-700 mb-2">
              Proximamente
            </h2>
            <p className="text-slate-500 max-w-md mx-auto">
              Aqui podras comparar multiples aseguradoras, ver rankings,
              y analizar diferencias en metricas clave.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
