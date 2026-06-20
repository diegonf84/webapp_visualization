import { render, screen, within, waitFor } from '@testing-library/react';
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
// Top 5 by primas: Alpha(1M), Beta(800K), Gamma(600K), Delta(400K), Epsilon(300K)
// Tail: Zeta(primas_dev=100, siniestros=60, gastos=40),
//        Eta(primas_dev=200, siniestros=120, gastos=60),
//        Theta(primas_dev=50, siniestros=0, gastos=50)
// Otros IC (value-weighted) = (180+150)/350*100 = 94.286
// Otros simple average = (100+90+100)/3 = 96.667
const OVR: CompanyProfileResponse = {
  ...BASE,
  ramos_count: 8,
  top_ramos: [
    makeRamo('Alpha', 1_000_000, 500_000, 300_000, 100_000, 25.0),
    makeRamo('Beta', 800_000, 400_000, 280_000, 80_000, 20.0),
    makeRamo('Gamma', 600_000, 300_000, 210_000, 60_000, 15.0),
    makeRamo('Delta', 400_000, 200_000, 140_000, 40_000, 10.0),
    makeRamo('Epsilon', 300_000, 150_000, 105_000, 30_000, 7.5),
    makeRamo('Zeta', 100, 100, 60, 40, 5.0),
    makeRamo('Eta', 200, 200, 120, 60, 3.0),
    makeRamo('Theta', 50, 50, 0, 50, 2.5),
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

/** Wait for nivo ResponsiveTreeMap to render SVG cells (ResizeObserver callback). */
async function waitForTreemap(container: HTMLElement) {
  await waitFor(
    () => {
      const svg = container.querySelector('svg');
      expect(svg).not.toBeNull();
      const cells = container.querySelectorAll('rect[data-testid^="node."]');
      expect(cells.length).toBeGreaterThan(0);
    },
    { timeout: 3000 },
  );
}

/** Get cell rects only (excludes the transparent background rect). */
function getCellRects(container: HTMLElement) {
  return container.querySelectorAll('rect[data-testid^="node."]');
}

// --- Constants ---
const TREEMAP_LEGEND = 'Verde: IC 0–100% · Amarillo: IC 100–130% · Rojo: IC> 130%';

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

  // --- Phase 2: Metrics & Labels ---

  describe('Top-right metrics reduced to three', () => {
    it('shows Siniestralidad, Gastos %, and Cantidad de Ramos', () => {
      mockProfile(STD);
      renderProfile();
      const row = screen.getByTestId('top-metrics-row');
      expect(within(row).getByText('Siniestralidad')).toBeInTheDocument();
      expect(within(row).getByText('Gastos %')).toBeInTheDocument();
      expect(within(row).getByText('Cantidad de Ramos')).toBeInTheDocument();
    });

    it('does NOT show Primas Emitidas or Resultado Técnico', () => {
      mockProfile(STD);
      renderProfile();
      const row = screen.getByTestId('top-metrics-row');
      expect(within(row).queryByText('Primas Emitidas')).not.toBeInTheDocument();
      expect(within(row).queryByText('Resultado Tecnico')).not.toBeInTheDocument();
    });
  });

  describe('Top 5 Ramos title removed', () => {
    it('does NOT render "Top 5 Ramos:" title text', () => {
      mockProfile(STD);
      renderProfile();
      expect(screen.queryByText(/top 5 ramos/i)).not.toBeInTheDocument();
    });

    it('still renders ramos badges', () => {
      mockProfile(STD);
      renderProfile();
      expect(screen.getByText(/Ramo A:/)).toBeInTheDocument();
    });
  });

  describe('Section subtitle rename', () => {
    it('renders "Indicadores generales de desempeño"', () => {
      mockProfile(STD);
      renderProfile();
      expect(screen.getByText('Indicadores generales de desempeño')).toBeInTheDocument();
    });
  });

  describe('Índice Combinado / IC rename', () => {
    it('renders "Índice Combinado" label and "IC" abbreviation', () => {
      mockProfile(STD);
      renderProfile();
      expect(screen.getByText('Índice Combinado')).toBeInTheDocument();
      expect(screen.getByText('IC')).toBeInTheDocument();
    });

    it('does NOT render "Ratio Combinado" in Resumen tab', () => {
      mockProfile(STD);
      renderProfile();
      expect(screen.queryByText('Ratio Combinado')).not.toBeInTheDocument();
    });
  });

  describe('Legend text', () => {
    it('renders exact legend with 3-color scheme', () => {
      mockProfile(STD);
      renderProfile();
      expect(screen.getByText(TREEMAP_LEGEND, { exact: true })).toBeInTheDocument();
    });
  });

  // --- Phase 3: Treemap Redesign ---

  describe('Treemap fixed height', () => {
    it('has fixed height of 240px', async () => {
      mockProfile(STD);
      renderProfile();
      const tm = screen.getByTestId('treemap-container');
      await waitForTreemap(tm);
      // The height is on the inner wrapper div inside the Card
      const heightWrapper = tm.querySelector('[style*="height"]');
      expect(heightWrapper).toHaveStyle({ height: '240px' });
    });
  });

  describe('Treemap cells show only ramo name', () => {
    it('renders ramo names without ratio percentages inside cells', async () => {
      mockProfile(STD);
      renderProfile();
      const tm = screen.getByTestId('treemap-container');
      await waitForTreemap(tm);
      const texts = tm.querySelectorAll('text');
      expect(texts.length).toBeGreaterThan(0);
      const textContents = Array.from(texts).map((t) => t.textContent);
      const hasPercentInCell = textContents.some(
        (t) => t && /\d+\.\d+%/.test(t),
      );
      expect(hasPercentInCell).toBe(false);
    });
  });

  describe('3-color coding', () => {
    it('applies correct colors for STD ICs [80, 95, 110, 145]', async () => {
      mockProfile(STD);
      renderProfile();
      const tm = screen.getByTestId('treemap-container');
      await waitForTreemap(tm);
      const rects = getCellRects(tm);
      expect(rects.length).toBe(4);
      const fills = Array.from(rects).map((r) => r.getAttribute('fill'));
      expect(fills[0]).toBe('#065f46'); // IC 80 → green
      expect(fills[1]).toBe('#065f46'); // IC 95 → green
      expect(fills[2]).toBe('#ca8a04'); // IC 110 → yellow
      expect(fills[3]).toBe('#991b1b'); // IC 145 → red
    });

    it('handles boundary values [100, 100.001, 129.999, 130]', async () => {
      mockProfile(BOUNDARY);
      renderProfile();
      const tm = screen.getByTestId('treemap-container');
      await waitForTreemap(tm);
      const rects = getCellRects(tm);
      expect(rects.length).toBe(4);
      const fills = Array.from(rects).map((r) => r.getAttribute('fill'));
      expect(fills[0]).toBe('#065f46'); // 100 → green
      expect(fills[1]).toBe('#ca8a04'); // 100.001 → yellow
      expect(fills[2]).toBe('#ca8a04'); // 129.999 → yellow
      expect(fills[3]).toBe('#991b1b'); // 130 → red
    });
  });

  describe('6-cell cap with Otros', () => {
    it('caps at 6 cells when >6 ramos', async () => {
      mockProfile(OVR);
      renderProfile();
      const tm = screen.getByTestId('treemap-container');
      await waitForTreemap(tm);
      const rects = getCellRects(tm);
      expect(rects.length).toBe(6);
    });

    it('renders "Otros" cell name', async () => {
      mockProfile(OVR);
      renderProfile();
      const tm = screen.getByTestId('treemap-container');
      await waitForTreemap(tm);
      const texts = Array.from(tm.querySelectorAll('text')).map(
        (t) => t.textContent,
      );
      expect(texts).toContain('Otros');
    });

    it('computes Otros IC as value-weighted (94.3), NOT simple average (96.7)', async () => {
      mockProfile(OVR);
      renderProfile();
      const tm = screen.getByTestId('treemap-container');
      await waitForTreemap(tm);
      // Find the "Otros" group by its data-ic attribute
      const allGroups = document.querySelectorAll('[data-ic]');
      let otrosIc: string | null = null;
      allGroups.forEach((g) => {
        const textEls = g.querySelectorAll('text');
        const hasOtros = Array.from(textEls).some(
          (t) => t.textContent === 'Otros',
        );
        if (hasOtros) {
          otrosIc = g.getAttribute('data-ic');
        }
      });
      expect(otrosIc).not.toBeNull();
      const icValue = parseFloat(otrosIc!);
      expect(icValue).toBeCloseTo(94.3, 0); // within 0.1 of 94.286
      expect(icValue).not.toBeCloseTo(96.7, 0); // NOT simple average
    });

    it('"Otros" cell has non-zero area', async () => {
      mockProfile(OVR);
      renderProfile();
      const tm = screen.getByTestId('treemap-container');
      await waitForTreemap(tm);
      const rects = Array.from(getCellRects(tm));
      expect(rects.length).toBe(6);
      // All cells have non-zero area
      rects.forEach((r) => {
        const w = parseFloat(r.getAttribute('width') || '0');
        const h = parseFloat(r.getAttribute('height') || '0');
        expect(w * h).toBeGreaterThan(0);
      });
    });
  });

  describe('Shows all ramos when ≤6', () => {
    it('renders 4 cells for STD (4 ramos), no "Otros"', async () => {
      mockProfile(STD);
      renderProfile();
      const tm = screen.getByTestId('treemap-container');
      await waitForTreemap(tm);
      const rects = getCellRects(tm);
      expect(rects.length).toBe(4);
      const texts = Array.from(tm.querySelectorAll('text')).map(
        (t) => t.textContent,
      );
      expect(texts).not.toContain('Otros');
    });
  });

  describe('Empty state for zero ramos', () => {
    it('renders "Sin datos de ramos"', () => {
      mockProfile(EMPTY);
      renderProfile();
      expect(screen.getByText('Sin datos de ramos')).toBeInTheDocument();
    });

    it('does NOT render old empty message', () => {
      mockProfile(EMPTY);
      renderProfile();
      expect(
        screen.queryByText('No hay datos de ramos disponibles'),
      ).not.toBeInTheDocument();
    });
  });
});
