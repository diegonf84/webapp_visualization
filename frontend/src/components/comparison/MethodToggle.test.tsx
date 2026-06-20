import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { MethodToggle } from './MethodToggle';

describe('MethodToggle', () => {
  it('renders all three method options', () => {
    render(<MethodToggle value="total_percentile" onChange={vi.fn()} />);

    expect(screen.getByText('Percentil Total')).toBeInTheDocument();
    expect(screen.getByText('Percentil Ramo')).toBeInTheDocument();
    expect(screen.getByText('Similitud de Ramo')).toBeInTheDocument();
  });

  it('disables all items when disabled prop is true (R2)', () => {
    render(<MethodToggle value="total_percentile" onChange={vi.fn()} disabled />);

    const buttons = screen.getAllByRole('radio');
    buttons.forEach((button) => {
      expect(button).toBeDisabled();
    });
  });

  it('calls onChange when a different method is clicked (R2)', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<MethodToggle value="total_percentile" onChange={onChange} />);

    await user.click(screen.getByText('Percentil Ramo'));

    expect(onChange).toHaveBeenCalledWith('main_ramo_percentile');
  });
});
