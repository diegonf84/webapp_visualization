import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CompanyPicker } from './CompanyPicker';
import * as useCompaniesModule from '@/hooks/useCompanies';
import type { CompanyListResponse } from '@/types/api';

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
    {
      cod_cia: 'B002',
      nombre_corto: 'Company Beta',
      tipo_cia: 'Vida',
      primas_emitidas: 300_000_000,
      ramos_count: 3,
    },
    {
      cod_cia: 'G003',
      nombre_corto: 'Company Gamma',
      tipo_cia: 'ART',
      primas_emitidas: 200_000_000,
      ramos_count: 2,
    },
  ],
  total: 3,
};

describe('CompanyPicker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
  });

  it('should search and select a company (R1)', async () => {
    const onSelect = vi.fn();
    render(<CompanyPicker value={undefined} onSelect={onSelect} />);

    // Find the search input and type a partial name
    const searchInput = screen.getByPlaceholderText(/buscar compania/i);
    fireEvent.change(searchInput, { target: { value: 'Alpha' } });

    // Wait for the dropdown to appear and click the result
    await waitFor(() => {
      expect(screen.getByText('Company Alpha')).toBeInTheDocument();
    });

    const companyButton = screen.getByText('Company Alpha').closest('button');
    expect(companyButton).toBeTruthy();
    fireEvent.click(companyButton!);

    // Verify onSelect was called with the correct cod_cia
    expect(onSelect).toHaveBeenCalledWith('A001');
  });

  it('should show empty state when no matches found (R1)', async () => {
    const onSelect = vi.fn();
    render(<CompanyPicker value={undefined} onSelect={onSelect} />);

    // Find the search input and type a string with no matches
    const searchInput = screen.getByPlaceholderText(/buscar compania/i);
    fireEvent.change(searchInput, { target: { value: 'NonExistentCompany' } });

    // Verify the empty state message appears
    await waitFor(() => {
      expect(screen.getByText(/no se encontraron companias/i)).toBeInTheDocument();
    });
  });
});
