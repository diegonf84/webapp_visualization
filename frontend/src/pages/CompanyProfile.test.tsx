import { render, screen, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { CompanyProfile } from './CompanyProfile';
import * as useCompanyProfileModule from '@/hooks/useCompanyProfile';
import type { CompanyProfileResponse } from '@/types/api';

vi.mock('@/hooks/useCompanyProfile');
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useParams: () => ({ codCia: 'TEST' }) };
});

// --- Fixtures ---

function makeRamo(
  ramo: string,
  primas: number,
  primas_devengadas: number,
  siniestros_devengados: number,
  gastos_devengados: number,
  percentage: number,
): CompanyProfileResponse['top_ramos'][0] {
  return {
    ramo,
    primas,
    primas_devengadas,
    siniestros_devengados,
    gastos_devengados,
    siniestralidad: (siniestros_devengados / primas_devengadas) * 100,
    gastos_percent: (gastos_devengados / primas_devengadas) * 100,
    combined_ratio:
      ((siniestros_devengados + gastos_devengados) / primas_devengadas) * 100,
    percentage,
  };
}

const BASE = {
  cod_cia: 'TEST',
  nombre_corto: 'Test Company',
  tipo_cia: 'Generales',
  periodo: '202503',
  ramos_count: 4,
  ranking_position: 5,
  total_companies: 30,
  primas_emitidas: 1_000_000,
  primas_devengadas: 900_000,
  siniestros_devengados: 540_000,
  gastos_devengados: 270_000,
  resultado_tecnico: 90_000,
  resultado_financiero: 50_000,
  resultado_final: 140_000,
  yoy_primas_emitidas: 5.0,
  yoy_resultado_tecnico: -2.0,
  yoy_resultado_financiero: 3.0,
  yoy_resultado_final: 1.0,
  primas_emitidas_current: 300_000,
  primas_devengadas_current: 270_000,
  siniestros_devengados_current: 162_000,
  gastos_devengados_current: 81_000,
  market_siniestralidad: 62.0,
  market_gastos_percent: 28.0,
  market_combined_ratio: 90.0,
  market_companies_count: 30,
};

// 4 ramos with ICs: 80 (green), 95 (green), 110 (yellow), 145 (red)
const STD: CompanyProfileResponse = {
  ...BASE,
  ramos_count: 4,
  top_ramos: [
    makeRamo('Ramo A', 300_000, 300_000, 180_000, 60_000, 33.3),
    makeRamo('Ramo B', 250_000, 250_000, 162_500, 75_000, 27.8),
    makeRamo('Ramo C', 200_000, 200_000, 150_000, 70_000, 22.2),
    makeRamo('Ramo D', 150_000, 150_000, 141_750, 75_750, 16.7),
  ],
};

// 7 ramos — forces top-5 + "Otros" aggregation.
// Tail primas_devengadas: [100, 200, 50], siniestros: [60, 120, 0], gastos: [40, 60, 50]
// Otros IC (value-weighted) = (180+150)/350*100 = 94.286
// Otros simple average = (100+90+100)/3 = 96.667
const OVR: CompanyProfileResponse = {
  ...BASE,
  ramos_count: 7,
  top_ramos: [
    makeRamo('Alpha', 500_000, 500_000, 300_000, 100_000, 25.0),
    makeRamo('Beta', 400_000, 400_000, 280_000, 80_000, 20.0),
    makeRamo('Gamma', 300_000, 300_000, 210_000, 60_000, 15.0),
    makeRamo('Delta', 200_000, 200_000, 140_000, 40_000, 10.0),
    makeRamo('Epsilon', 150_000, 150_000, 105_000, 30_000, 7.5),
    makeRamo('Zeta', 100_000, 100, 60, 40, 5.0),
    makeRamo('Eta', 200_000, 200, 120, 60, 3.0),
    makeRamo('Theta', 50_000, 50, 0, 50, 2.5),
  ],
};

const EMPTY: CompanyProfileResponse = {
  ...BASE,
  ramos_count: 0,
  top_ramos: [],
};

// Boundary IC values: 100 (green), 100.001 (yellow), 129.999 (yellow), 130 (red)
const BOUNDARY: CompanyProfileResponse = {
  ...BASE,
  ramos_count: 4,
  top_ramos: [
    makeRamo('IC100', 250_000, 100_000, 60_000, 40_000, 25),
    makeRamo('IC100j', 250_000, 100_000, 60_001, 40_000, 25),
    makeRamo('IC130j', 250_000, 100_000, 89_999, 39_999, 25),
    makeRamo('IC130', 250_000, 100_000, 90_000, 40_000, 25),
  ],
};

// --- Helpers ---

function mockProfile(fixture: CompanyProfileResponse) {
  vi.mocked(useCompanyProfileModule.useCompanyProfile).mockReturnValue({
    data: fixture,
    isLoading: false,
    isError: false,
    isSuccess: true,
    error: null,
    status: 'success',
    isFetching: false,
    isStale: false,
    refetch: vi.fn(),
  } as any);
}

function renderProfile() {
  return render(
    <MemoryRouter>
      <CompanyProfile />
    </MemoryRouter>,
  );
}

// --- Tests ---

describe('CompanyProfile — Resumen Redesign', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the company name in the page heading', () => {
    mockProfile(STD);
    renderProfile();
    const headings = screen.getAllByRole('heading', { name: 'Test Company' });
    expect(headings.length).toBeGreaterThanOrEqual(1);
  });
});
