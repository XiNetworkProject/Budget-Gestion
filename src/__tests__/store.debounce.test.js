import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useStore } from '../store';
import { budgetService } from '../services/budgetService';
import { act } from 'react-dom/test-utils';

vi.useFakeTimers();

describe('scheduleSave debounce', () => {
  beforeEach(() => {
    // Initialisation minimale de l'état
    useStore.setState({
      user: { id: 'user-test' },
      months: ['Janvier'],
      categories: ['Cat1'],
      data: { Cat1: [0] },
      revenus: [0],
      incomeTypes: ['T1'],
      incomes: { T1: [0] },
      persons: [],
      saved: {},
      sideByMonth: [0],
      totalPotentialSavings: 0
    });
    // Stub saveBudget
    vi.spyOn(budgetService, 'saveBudget').mockResolvedValue({});
  });

  it('appelle saveBudget après debounce sur setValue', async () => {
    act(() => {
      useStore.getState().setValue('Cat1', 0, 42);
    });
    // Pas encore appelé avant debounce
    expect(budgetService.saveBudget).not.toHaveBeenCalled();

    // Avance de 500ms
    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(budgetService.saveBudget).toHaveBeenCalledTimes(1);
    expect(budgetService.saveBudget).toHaveBeenCalledWith('user-test', expect.objectContaining({ data: { Cat1: [42] } }));
  });

  it('appelle saveBudget après debounce sur setIncome', async () => {
    act(() => {
      useStore.getState().setIncome('T1', 0, 100);
    });
    expect(budgetService.saveBudget).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(budgetService.saveBudget).toHaveBeenCalledTimes(1);
    expect(budgetService.saveBudget).toHaveBeenCalledWith('user-test', expect.objectContaining({ incomes: { T1: [100] } }));
  });
}); 