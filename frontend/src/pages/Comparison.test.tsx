import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Comparison } from './Comparison';
import * as useCompanyComparisonModule from '@/hooks/useCompanyComparison';
import * as useCompaniesModule from '@/hooks/useCompanies';
import type { CompanyListResponse } from '@/types/api';

vi.mock('@/hooks/useCompanyComparison');
vi.mock('@/hooks/useCompanies');

const mockCompanies: CompanyListResponse = {
  companies: [
    {
      cod_cia: 'A001',
      nombre_corto: 'Company Alpha',
      tipo_cia: 'Generales',
      primas_emitidas: 500_000_000,
      ramos_count: 5,
    },
  ],
  total: 1,
};

function mockUseCompanies() {
  vi.mocked(useCompaniesModule.useCompanies).mockReturnValue({
    data: mockCompanies,
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

describe('Comparison Page - Error States (R7)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseCompanies();
  });

  it('should render 400 error message (no comparable data)', () => {
    const mockError = { response: { status: 400 } };
    vi.mocked(useCompanyComparisonModule.useCompanyComparison).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: mockError,
      isSuccess: false,
      status: 'error',
      isFetching: false,
      isStale: false,
      refetch: vi.fn(),
    } as any);

    render(<Comparison />);

    expect(
      screen.getByText(/no se encontraron datos comparables para esta compañía/i),
    ).toBeInTheDocument();
  });

  it('should render 404 error message (company not found)', () => {
    const mockError = { response: { status: 404 } };
    vi.mocked(useCompanyComparisonModule.useCompanyComparison).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: mockError,
      isSuccess: false,
      status: 'error',
      isFetching: false,
      isStale: false,
      refetch: vi.fn(),
    } as any);

    render(<Comparison />);

    expect(screen.getByText(/compañía no encontrada/i)).toBeInTheDocument();
  });

  it('should render 422 error message (invalid method)', () => {
    const mockError = { response: { status: 422 } };
    vi.mocked(useCompanyComparisonModule.useCompanyComparison).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: mockError,
      isSuccess: false,
      status: 'error',
      isFetching: false,
      isStale: false,
      refetch: vi.fn(),
    } as any);

    render(<Comparison />);

    expect(screen.getByText(/método de comparación inválido/i)).toBeInTheDocument();
  });

  it('should render retry button on network/5xx error and call refetch on click (R7)', async () => {
    const mockRefetch = vi.fn();
    const mockError = { response: { status: 500 } };
    vi.mocked(useCompanyComparisonModule.useCompanyComparison).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: mockError,
      isSuccess: false,
      status: 'error',
      isFetching: false,
      isStale: false,
      refetch: mockRefetch,
    } as any);

    render(<Comparison />);

    // Verify retry message appears
    expect(screen.getByText(/no se pudo completar la comparación/i)).toBeInTheDocument();

    // Find and click the retry button
    const retryButton = screen.getByRole('button', { name: /reintentar/i });
    expect(retryButton).toBeInTheDocument();
    fireEvent.click(retryButton);

    // Verify refetch was called
    expect(mockRefetch).toHaveBeenCalled();
  });
});

describe('Comparison Page - Loading State (R6)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseCompanies();
  });

  it('should render loading skeleton when loading and company is selected (R6)', async () => {
    vi.mocked(useCompanyComparisonModule.useCompanyComparison).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      isSuccess: false,
      status: 'loading',
      isFetching: true,
      isStale: false,
      refetch: vi.fn(),
    } as any);

    render(<Comparison />);

    // Type in the picker search input to open the dropdown
    const searchInput = screen.getByPlaceholderText(/buscar compania/i);
    fireEvent.change(searchInput, { target: { value: 'Alpha' } });

    // Wait for the dropdown to appear and click the company
    await waitFor(() => {
      expect(screen.getByText('Company Alpha')).toBeInTheDocument();
    });

    const companyButton = screen.getByText('Company Alpha').closest('button');
    expect(companyButton).toBeTruthy();
    fireEvent.click(companyButton!);

    // Now that a company is selected and isLoading is true, the skeleton should render
    await waitFor(() => {
      expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
    });

    // Verify no stale data is shown (no comparison results)
    expect(screen.queryByText(/posición en el ranking/i)).not.toBeInTheDocument();
  });

  it('should not show loading skeleton when no company is selected', () => {
    vi.mocked(useCompanyComparisonModule.useCompanyComparison).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
      isSuccess: false,
      status: 'idle',
      isFetching: false,
      isStale: false,
      refetch: vi.fn(),
    } as any);

    render(<Comparison />);

    // Should show empty state instead of loading
    expect(
      screen.getByText(/selecciona una compania para comparar/i),
    ).toBeInTheDocument();
  });
});
