import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { FilterBar } from '@/components/filters/FilterBar';
import { KPIRow } from '@/components/kpis/KPIRow';
import { MarketBarChart } from '@/components/charts/MarketBarChart';
import { RamoDonutChart } from '@/components/charts/RamoDonutChart';
import { useFilters } from '@/hooks/useFilters';
import { useKPIs } from '@/hooks/useKPIs';
import { useCompanyRanking } from '@/hooks/useCompanyRanking';
import { useDistribution } from '@/hooks/useDistribution';
import type { FilterParams } from '@/types/api';

function App() {
  // Filter state
  const [year, setYear] = useState<string | null>(null);
  const [quarter, setQuarter] = useState<string | null>(null);
  const [ramo, setRamo] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'accumulated' | 'current'>('accumulated');
  const [topN, setTopN] = useState(15);

  // Fetch filter options
  const { data: filters, isLoading: filtersLoading } = useFilters();

  // Initialize filters with first available options
  useEffect(() => {
    if (filters && !year && filters.years.length > 0) {
      setYear(filters.years[0]);
    }
    if (filters && !quarter && filters.quarters.length > 0) {
      setQuarter(filters.quarters[0]);
    }
  }, [filters, year, quarter]);

  // Build query params
  const queryParams: FilterParams = {
    year: year || undefined,
    quarter: quarter || undefined,
    ramo: ramo || undefined,
    view_mode: viewMode,
  };

  // Fetch data
  const { data: kpis, isLoading: kpisLoading } = useKPIs(queryParams);
  const { data: ranking, isLoading: rankingLoading } = useCompanyRanking({
    ...queryParams,
    top_n: topN,
  });
  const distributionType = ramo ? 'subramos' : 'ramos';
  const { data: distribution, isLoading: distributionLoading } = useDistribution(
    queryParams,
    distributionType
  );

  const hasRamoFilter = Boolean(ramo);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <Header
        year={year}
        quarter={quarter}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-[1600px] mx-auto px-6 py-6">
          {/* Filters */}
          <FilterBar
            filters={filters}
            isLoading={filtersLoading}
            year={year}
            quarter={quarter}
            ramo={ramo}
            onYearChange={setYear}
            onQuarterChange={setQuarter}
            onRamoChange={setRamo}
          />

          {/* KPIs */}
          <KPIRow data={kpis} isLoading={kpisLoading} />

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Bar Chart - 8 columns on large screens */}
            <div className="lg:col-span-8">
              <MarketBarChart
                data={ranking?.companies}
                isLoading={rankingLoading}
                hasRamoFilter={hasRamoFilter}
                topN={topN}
                onTopNChange={setTopN}
              />
            </div>

            {/* Donut Chart - 4 columns on large screens */}
            <div className="lg:col-span-4">
              <RamoDonutChart
                data={distribution?.items}
                isLoading={distributionLoading}
                hasRamoFilter={hasRamoFilter}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;
