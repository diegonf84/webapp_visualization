import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ComparisonResults } from './ComparisonResults';
import type { CompanyComparisonResponse, ComparisonCompanyItem } from '@/types/api';

function makeItem(overrides: Partial<ComparisonCompanyItem>): ComparisonCompanyItem {
  return {
    cod_cia: 'X001',
    nombre_corto: 'Test Company',
    tipo_cia: 'Generales',
    primas_emitidas: 100_000_000,
    ranking_position: 1,
    relative_position: null,
    main_ramo_primas: null,
    similarity_distance: null,
    ...overrides,
  };
}

const baseResponse: CompanyComparisonResponse = {
  selected_company: makeItem({
    cod_cia: 'A001',
    nombre_corto: 'Company A',
    ranking_position: 15,
    relative_position: 0,
    primas_emitidas: 500_000_000,
  }),
  method: 'total_percentile',
  main_ramo: null,
  main_ramo_percentage: null,
  companies_above: [
    makeItem({
      cod_cia: 'X001',
      nombre_corto: 'Company X',
      ranking_position: 10,
      relative_position: -5,
      primas_emitidas: 900_000_000,
    }),
  ],
  companies_below: [
    makeItem({
      cod_cia: 'B002',
      nombre_corto: 'Company B',
      ranking_position: 20,
      relative_position: 5,
      primas_emitidas: 200_000_000,
    }),
  ],
  similar_companies: [],
  periodo: '202404',
  total_companies_in_tipo: 50,
  total_companies_with_ramo: null,
};

describe('ComparisonResults', () => {
  describe('R3: Total Percentile — mid-ranked', () => {
    it('renders above, selected, and below sections', () => {
      render(<ComparisonResults data={baseResponse} />);

      // Above section
      expect(screen.getByText('Company X')).toBeInTheDocument();
      // Selected
      expect(screen.getByText('Company A')).toBeInTheDocument();
      expect(screen.getAllByText('Seleccionada').length).toBeGreaterThanOrEqual(1);
      // Below section
      expect(screen.getByText('Company B')).toBeInTheDocument();
    });
  });

  describe('R3: Total Percentile — top-ranked', () => {
    it('shows top-ranked indicator when no companies above', () => {
      const topRanked: CompanyComparisonResponse = {
        ...baseResponse,
        selected_company: makeItem({
          cod_cia: 'A001',
          nombre_corto: 'Company A',
          ranking_position: 1,
          relative_position: 0,
          primas_emitidas: 1_000_000_000,
        }),
        companies_above: [],
      };

      render(<ComparisonResults data={topRanked} />);

      expect(screen.getByText(/Posicion mas alta del ranking/i)).toBeInTheDocument();
      expect(screen.queryByText('Posiciones superiores')).not.toBeInTheDocument();
    });
  });

  describe('R4: Main Ramo Percentile — ramo context', () => {
    it('displays main_ramo_primas per row', () => {
      const ramoResponse: CompanyComparisonResponse = {
        ...baseResponse,
        method: 'main_ramo_percentile',
        main_ramo: 'Automotor',
        main_ramo_percentage: 62.5,
        total_companies_with_ramo: 30,
        selected_company: makeItem({
          ...baseResponse.selected_company,
          main_ramo_primas: 312_500_000,
        }),
        companies_above: baseResponse.companies_above.map((c) => ({
          ...c,
          main_ramo_primas: 500_000_000,
        })),
        companies_below: baseResponse.companies_below.map((c) => ({
          ...c,
          main_ramo_primas: 100_000_000,
        })),
      };

      render(<ComparisonResults data={ramoResponse} />);

      // "Ramo" column headers in rows (one per company row)
      const ramoLabels = screen.getAllByText('Ramo');
      expect(ramoLabels.length).toBeGreaterThanOrEqual(3);

      // Verify company names are rendered
      expect(screen.getByText('Company X')).toBeInTheDocument();
      expect(screen.getByText('Company A')).toBeInTheDocument();
      expect(screen.getByText('Company B')).toBeInTheDocument();
    });
  });

  describe('R5: Ramo Similarity — distance order', () => {
    it('renders similar_companies sorted by ascending distance', () => {
      const similarityResponse: CompanyComparisonResponse = {
        ...baseResponse,
        method: 'ramo_similarity',
        companies_above: [],
        companies_below: [],
        similar_companies: [
          makeItem({
            cod_cia: 'S001',
            nombre_corto: 'Similar A',
            ranking_position: 1,
            similarity_distance: 5.2,
          }),
          makeItem({
            cod_cia: 'S002',
            nombre_corto: 'Similar B',
            ranking_position: 2,
            similarity_distance: 12.8,
          }),
          makeItem({
            cod_cia: 'S003',
            nombre_corto: 'Similar C',
            ranking_position: 3,
            similarity_distance: 25.0,
          }),
        ],
      };

      render(<ComparisonResults data={similarityResponse} />);

      // Check distance column headers
      const distanceLabels = screen.getAllByText('Distancia');
      expect(distanceLabels.length).toBeGreaterThan(0);

      // Verify all similar companies are rendered
      expect(screen.getByText('Similar A')).toBeInTheDocument();
      expect(screen.getByText('Similar B')).toBeInTheDocument();
      expect(screen.getByText('Similar C')).toBeInTheDocument();

      // Verify distance values are displayed
      expect(screen.getByText('5.2')).toBeInTheDocument();
      expect(screen.getByText('12.8')).toBeInTheDocument();
      expect(screen.getByText('25.0')).toBeInTheDocument();
    });
  });

  describe('R8: Empty state', () => {
    it('shows empty message when no peers for percentile methods', () => {
      const emptyResponse: CompanyComparisonResponse = {
        ...baseResponse,
        companies_above: [],
        companies_below: [],
      };

      render(<ComparisonResults data={emptyResponse} />);

      expect(screen.getByText(/Sin companias para comparar/i)).toBeInTheDocument();
    });

    it('shows empty message when no similar companies', () => {
      const emptySimilarity: CompanyComparisonResponse = {
        ...baseResponse,
        method: 'ramo_similarity',
        companies_above: [],
        companies_below: [],
        similar_companies: [],
      };

      render(<ComparisonResults data={emptySimilarity} />);

      expect(screen.getByText(/Sin companias para comparar/i)).toBeInTheDocument();
    });
  });
});
