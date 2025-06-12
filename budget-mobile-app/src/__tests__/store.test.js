import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useStore } from '../store';
import { act } from 'react-dom/test-utils';

// Simule le debounce timer
vi.useFakeTimers();

describe('useStore actions', () => {
  beforeEach(() => {
    // Réinitialise le state du store avant chaque test
    useStore.setState({
      categories: ['A', 'B'],
      data: { A: [0], B: [0] },
      months: ['Janvier'],
      revenus: [0],
      incomeTypes: [],
      incomes: {},
      persons: [],
      saved: {},
      sideByMonth: [0],
      totalPotentialSavings: 0,
      user: { id: 'test-user' },
      token: 'token',
    });
  });

  it('ajoute une catégorie et schedule la sauvegarde', () => {
    const initialLength = useStore.getState().categories.length;
    act(() => {
      useStore.getState().addCategory('C');
      // Advance fake timers pour exécuter scheduleSave
      vi.advanceTimersByTime(500);
    });
    expect(useStore.getState().categories).toHaveLength(initialLength + 1);
    expect(useStore.getState().categories).toContain('C');
  });

  it('supprime une catégorie et schedule la sauvegarde', () => {
    act(() => {
      useStore.getState().removeCategory('A');
      vi.advanceTimersByTime(500);
    });
    expect(useStore.getState().categories).not.toContain('A');
  });
}); 