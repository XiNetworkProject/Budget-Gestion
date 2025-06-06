import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { budgetService } from './services/budgetService';

const defaultMonths = [
  'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];
const defaultCategories = [
  'Loyer', 'Électricité', 'Assurance', 'Banque', 'Nourriture', 'Loisirs', 'Voiture'
];

const defaultData = {};
defaultCategories.forEach((cat) => {
  defaultData[cat] = defaultMonths.map(() => 0);
});

const defaultRevenus = defaultMonths.map(() => 300);

const defaultIncomeTypes = ["Salaire", "Aides"];
const defaultIncomes = {};
defaultIncomeTypes.forEach((type) => {
  defaultIncomes[type] = defaultMonths.map(() => 0);
});

const defaultPersons = [
  { name: "Moi", part: 50 },
  { name: "Conjoint", part: 50 }
];
const defaultSaved = {};
defaultPersons.forEach((p) => { defaultSaved[p.name] = 0; });

const defaultSideByMonth = defaultMonths.map(() => 0);

const useStore = create(
  persist(
    (set, get) => ({
      // État initial
      user: null,
      budgets: [],
      currentBudget: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      setUser: (user) => {
        set({ user, isAuthenticated: !!user });
        if (user) {
          get().loadBudgets();
        }
      },

      setBudgets: (budgets) => set({ budgets }),
      setCurrentBudget: (budget) => set({ currentBudget: budget }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      // Actions asynchrones
      loadBudgets: async () => {
        const { user } = get();
        if (!user) return;

        try {
          set({ isLoading: true, error: null });
          const data = await budgetService.getBudget(user.id);
          if (data) {
            set({ budgets: data.budgets || [], currentBudget: data.currentBudget });
          }
        } catch (error) {
          set({ error: error.message });
        } finally {
          set({ isLoading: false });
        }
      },

      saveBudget: async (budget) => {
        const { user } = get();
        if (!user) return;

        try {
          set({ isLoading: true, error: null });
          await budgetService.saveBudget(user.id, {
            budgets: get().budgets,
            currentBudget: budget
          });
          set({ currentBudget: budget });
        } catch (error) {
          set({ error: error.message });
        } finally {
          set({ isLoading: false });
        }
      },

      deleteBudget: async (budgetId) => {
        const { user } = get();
        if (!user) return;

        try {
          set({ isLoading: true, error: null });
          await budgetService.deleteBudget(user.id);
          set((state) => ({
            budgets: state.budgets.filter(b => b.id !== budgetId),
            currentBudget: state.currentBudget?.id === budgetId ? null : state.currentBudget
          }));
        } catch (error) {
          set({ error: error.message });
        } finally {
          set({ isLoading: false });
        }
      },

      logout: () => {
        set({
          user: null,
          budgets: [],
          currentBudget: null,
          isAuthenticated: false,
          error: null
        });
      },

      months: defaultMonths,
      categories: defaultCategories,
      data: defaultData,
      revenus: defaultRevenus,
      incomeTypes: defaultIncomeTypes,
      incomes: defaultIncomes,
      persons: defaultPersons,
      saved: defaultSaved,
      sideByMonth: defaultSideByMonth,
      setRevenu: (monthIdx, value) => {
        set((state) => {
          const newRevenus = [...state.revenus];
          newRevenus[monthIdx] = value;
          return { revenus: newRevenus };
        });
      },
      setValue: async (cat, monthIdx, value) => {
        const state = get();
        const newData = { ...state.data };
        newData[cat] = [...newData[cat]];
        newData[cat][monthIdx] = value;
        set({ data: newData });
        
        if (state.user) {
          await budgetService.saveBudget(state.user.id, {
            budgets: state.budgets,
            currentBudget: state.currentBudget
          });
        }
      },
      addCategory: (cat) => {
        console.log('Adding category:', cat);
        set((state) => {
          if (state.categories.includes(cat)) {
            console.log('Category already exists');
            return state;
          }
          const newData = { ...state.data };
          newData[cat] = state.months.map(() => 0);
          return {
            categories: [...state.categories, cat],
            data: newData,
          };
        });
      },
      removeCategory: (cat) => {
        set((state) => {
          const { [cat]: _, ...rest } = state.data;
          return {
            categories: state.categories.filter((c) => c !== cat),
            data: rest,
          };
        });
      },
      addMonth: (month) => {
        set((state) => {
          if (state.months.includes(month)) return {};
          const newData = { ...state.data };
          const lastIdx = state.months.length - 1;
          Object.keys(newData).forEach((cat) => {
            const lastVal = lastIdx >= 0 ? newData[cat][lastIdx] : 0;
            newData[cat] = [...newData[cat], lastVal];
          });
          const newIncomes = { ...state.incomes };
          Object.keys(newIncomes).forEach((type) => {
            const lastVal = lastIdx >= 0 ? newIncomes[type][lastIdx] : 0;
            newIncomes[type] = [...newIncomes[type], lastVal];
          });
          const newRevenus = state.revenus ? [...state.revenus] : [];
          const lastRev = lastIdx >= 0 ? newRevenus[lastIdx] : 0;
          newRevenus.push(lastRev);
          const newSide = state.sideByMonth ? [...state.sideByMonth] : [];
          const lastSide = newSide.length > 0 ? newSide[newSide.length - 1] : 0;
          newSide.push(lastSide);
          return {
            months: [...state.months, month],
            data: newData,
            revenus: newRevenus,
            incomes: newIncomes,
            sideByMonth: newSide,
          };
        });
      },
      removeMonth: (monthIdx) => {
        set((state) => {
          const newMonths = state.months.filter((_, i) => i !== monthIdx);
          const newData = { ...state.data };
          Object.keys(newData).forEach((cat) => {
            newData[cat] = newData[cat].filter((_, i) => i !== monthIdx);
          });
          return {
            months: newMonths,
            data: newData,
          };
        });
      },
      setIncome: (type, monthIdx, value) => {
        set((state) => {
          const newIncomes = { ...state.incomes };
          newIncomes[type] = [...newIncomes[type]];
          newIncomes[type][monthIdx] = value;
          return { incomes: newIncomes };
        });
      },
      addIncomeType: (type) => {
        console.log('Adding income type:', type);
        set((state) => {
          if (state.incomeTypes.includes(type)) {
            console.log('Income type already exists');
            return state;
          }
          const newIncomes = { ...state.incomes };
          newIncomes[type] = state.months.map(() => 0);
          return {
            incomeTypes: [...state.incomeTypes, type],
            incomes: newIncomes,
          };
        });
      },
      removeIncomeType: (type) => {
        set((state) => {
          const { [type]: _, ...rest } = state.incomes;
          return {
            incomeTypes: state.incomeTypes.filter((t) => t !== type),
            incomes: rest,
          };
        });
      },
      renameIncomeType: (oldType, newType) => {
        set((state) => {
          if (state.incomeTypes.includes(newType)) return {};
          const newIncomeTypes = state.incomeTypes.map((t) => (t === oldType ? newType : t));
          const newIncomes = { ...state.incomes };
          newIncomes[newType] = newIncomes[oldType];
          delete newIncomes[oldType];
          return { incomeTypes: newIncomeTypes, incomes: newIncomes };
        });
      },
      addPerson: (name, part = 0) => {
        set((state) => {
          if (state.persons.find((p) => p.name === name)) return {};
          return {
            persons: [...state.persons, { name, part }],
            saved: { ...state.saved, [name]: 0 },
          };
        });
      },
      removePerson: (name) => {
        set((state) => {
          return {
            persons: state.persons.filter((p) => p.name !== name),
            saved: Object.fromEntries(Object.entries(state.saved).filter(([k]) => k !== name)),
          };
        });
      },
      renamePerson: (oldName, newName) => {
        set((state) => {
          if (state.persons.find((p) => p.name === newName)) return {};
          const newPersons = state.persons.map((p) => p.name === oldName ? { ...p, name: newName } : p);
          const newSaved = { ...state.saved };
          newSaved[newName] = newSaved[oldName];
          delete newSaved[oldName];
          return { persons: newPersons, saved: newSaved };
        });
      },
      setPersonPart: (name, part) => {
        set((state) => {
          return {
            persons: state.persons.map((p) => p.name === name ? { ...p, part } : p),
          };
        });
      },
      addToSaved: (name, amount) => {
        set((state) => {
          return {
            saved: { ...state.saved, [name]: (state.saved[name] || 0) + amount },
          };
        });
      },
      setSideByMonth: (monthIdx, value) => {
        set((state) => {
          const newSide = [...state.sideByMonth];
          newSide[monthIdx] = value;
          return { sideByMonth: newSide };
        });
      },
      renameCategory: (oldName, newName) => {
        set((state) => {
          const newData = { ...state.data };
          const newCategories = [...state.categories];
          const index = newCategories.indexOf(oldName);
          
          if (index !== -1) {
            newCategories[index] = newName;
            newData[newName] = newData[oldName];
            delete newData[oldName];
          }
          
          return {
            categories: newCategories,
            data: newData
          };
        });
      },
    }),
    {
      name: 'budget-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);

export default useStore; 