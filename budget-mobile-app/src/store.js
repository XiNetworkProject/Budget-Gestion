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
      isAuthenticated: false,
      isLoading: false,
      error: null,
      months: defaultMonths,
      categories: defaultCategories,
      data: defaultData,
      revenus: defaultRevenus,
      incomeTypes: defaultIncomeTypes,
      incomes: defaultIncomes,
      persons: defaultPersons,
      saved: defaultSaved,
      sideByMonth: defaultSideByMonth,
      totalPotentialSavings: 0,

      // Actions
      setUser: async (user) => {
        set({ user, isAuthenticated: !!user });
        if (user) {
          try {
            set({ isLoading: true });
            const data = await budgetService.getBudget(user.id);
            if (data) {
              set({
                months: data.months || defaultMonths,
                categories: data.categories || defaultCategories,
                data: data.data || defaultData,
                revenus: data.revenus || defaultRevenus,
                incomeTypes: data.incomeTypes || defaultIncomeTypes,
                incomes: data.incomes || defaultIncomes,
                persons: data.persons || defaultPersons,
                saved: data.saved || defaultSaved,
                sideByMonth: data.sideByMonth || defaultSideByMonth,
                totalPotentialSavings: data.totalPotentialSavings || 0,
                isLoading: false
              });
            } else {
              const defaultBudget = {
                months: defaultMonths,
                categories: defaultCategories,
                data: defaultData,
                revenus: defaultRevenus,
                incomeTypes: defaultIncomeTypes,
                incomes: defaultIncomes,
                persons: defaultPersons,
                saved: defaultSaved,
                sideByMonth: defaultSideByMonth,
                totalPotentialSavings: 0
              };
              set({ ...defaultBudget, isLoading: false });
              await budgetService.saveBudget(user.id, defaultBudget);
            }
          } catch (error) {
            console.error('Error loading budget:', error);
            set({ error: error.message, isLoading: false });
          }
        }
      },

      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      // Actions de mise à jour des données
      setValue: async (cat, monthIdx, value) => {
        const state = get();
        const newData = { ...state.data };
        newData[cat] = [...newData[cat]];
        newData[cat][monthIdx] = value;
        set({ data: newData });
        
        if (state.user) {
          try {
            await budgetService.saveBudget(state.user.id, {
              months: state.months,
              categories: state.categories,
              data: newData,
              revenus: state.revenus,
              incomeTypes: state.incomeTypes,
              incomes: state.incomes,
              persons: state.persons,
              saved: state.saved,
              sideByMonth: state.sideByMonth
            });
          } catch (error) {
            console.error('Error saving budget:', error);
            set({ error: error.message });
          }
        }
      },

      addCategory: async (cat) => {
        const state = get();
        if (state.categories.includes(cat)) return;

        const newData = { ...state.data };
        newData[cat] = state.months.map(() => 0);
        const newCategories = [...state.categories, cat];
        
        set({
          categories: newCategories,
          data: newData,
        });

        if (state.user) {
          try {
            await budgetService.saveBudget(state.user.id, {
              months: state.months,
              categories: newCategories,
              data: newData,
              revenus: state.revenus,
              incomeTypes: state.incomeTypes,
              incomes: state.incomes,
              persons: state.persons,
              saved: state.saved,
              sideByMonth: state.sideByMonth
            });
          } catch (error) {
            console.error('Error saving budget:', error);
            set({ error: error.message });
          }
        }
      },

      removeCategory: async (cat) => {
        const state = get();
        const { [cat]: _, ...rest } = state.data;
        const newCategories = state.categories.filter((c) => c !== cat);
        
        set({
          categories: newCategories,
          data: rest,
        });

        if (state.user) {
          try {
            await budgetService.saveBudget(state.user.id, {
              months: state.months,
              categories: newCategories,
              data: rest,
              revenus: state.revenus,
              incomeTypes: state.incomeTypes,
              incomes: state.incomes,
              persons: state.persons,
              saved: state.saved,
              sideByMonth: state.sideByMonth
            });
          } catch (error) {
            console.error('Error saving budget:', error);
            set({ error: error.message });
          }
        }
      },

      addMonth: async (month) => {
        const state = get();
        if (state.months.includes(month)) return;

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

        const newRevenus = [...state.revenus];
        const lastRev = lastIdx >= 0 ? newRevenus[lastIdx] : 0;
        newRevenus.push(lastRev);

        const newSide = [...state.sideByMonth];
        const lastSide = newSide.length > 0 ? newSide[newSide.length - 1] : 0;
        newSide.push(lastSide);

        const newMonths = [...state.months, month];

        set({
          months: newMonths,
          data: newData,
          revenus: newRevenus,
          incomes: newIncomes,
          sideByMonth: newSide,
        });

        if (state.user) {
          try {
            await budgetService.saveBudget(state.user.id, {
              months: newMonths,
              categories: state.categories,
              data: newData,
              revenus: newRevenus,
              incomeTypes: state.incomeTypes,
              incomes: newIncomes,
              persons: state.persons,
              saved: state.saved,
              sideByMonth: newSide
            });
          } catch (error) {
            console.error('Error saving budget:', error);
            set({ error: error.message });
          }
        }
      },

      removeMonth: async (month) => {
        const currentMonth = new Date().toLocaleString('fr-FR', { month: 'long' });
        if (month === currentMonth) {
          alert("Impossible de supprimer le mois en cours");
          return;
        }

        const state = get();
        const monthIdx = state.months.indexOf(month);
        if (monthIdx === -1) return;

        const newData = { ...state.data };
        Object.keys(newData).forEach((cat) => {
          newData[cat] = newData[cat].filter((_, idx) => idx !== monthIdx);
        });

        const newIncomes = { ...state.incomes };
        Object.keys(newIncomes).forEach((type) => {
          newIncomes[type] = newIncomes[type].filter((_, idx) => idx !== monthIdx);
        });

        const newRevenus = state.revenus.filter((_, idx) => idx !== monthIdx);
        const newSideByMonth = state.sideByMonth.filter((_, idx) => idx !== monthIdx);
        const newMonths = state.months.filter((m) => m !== month);

        set({
          months: newMonths,
          data: newData,
          incomes: newIncomes,
          revenus: newRevenus,
          sideByMonth: newSideByMonth,
        });

        if (state.user) {
          try {
            await budgetService.saveBudget(state.user.id, {
              months: newMonths,
              categories: state.categories,
              data: newData,
              revenus: newRevenus,
              incomeTypes: state.incomeTypes,
              incomes: newIncomes,
              persons: state.persons,
              saved: state.saved,
              sideByMonth: newSideByMonth,
              totalPotentialSavings: state.totalPotentialSavings
            });
          } catch (error) {
            console.error('Error saving budget:', error);
            set({ error: error.message });
          }
        }
      },

      setIncome: async (type, monthIdx, value) => {
        const state = get();
        const newIncomes = { ...state.incomes };
        newIncomes[type] = [...newIncomes[type]];
        newIncomes[type][monthIdx] = value;
        
        set({ incomes: newIncomes });

        if (state.user) {
          try {
            await budgetService.saveBudget(state.user.id, {
              months: state.months,
              categories: state.categories,
              data: state.data,
              revenus: state.revenus,
              incomeTypes: state.incomeTypes,
              incomes: newIncomes,
              persons: state.persons,
              saved: state.saved,
              sideByMonth: state.sideByMonth
            });
          } catch (error) {
            console.error('Error saving budget:', error);
            set({ error: error.message });
          }
        }
      },

      addIncomeType: async (type) => {
        const state = get();
        if (state.incomeTypes.includes(type)) return;

        const newIncomes = { ...state.incomes };
        newIncomes[type] = state.months.map(() => 0);
        const newIncomeTypes = [...state.incomeTypes, type];
        
        set({
          incomeTypes: newIncomeTypes,
          incomes: newIncomes,
        });

        if (state.user) {
          try {
            await budgetService.saveBudget(state.user.id, {
              months: state.months,
              categories: state.categories,
              data: state.data,
              revenus: state.revenus,
              incomeTypes: newIncomeTypes,
              incomes: newIncomes,
              persons: state.persons,
              saved: state.saved,
              sideByMonth: state.sideByMonth
            });
          } catch (error) {
            console.error('Error saving budget:', error);
            set({ error: error.message });
          }
        }
      },

      removeIncomeType: async (type) => {
        const state = get();
        const { [type]: _, ...rest } = state.incomes;
        const newIncomeTypes = state.incomeTypes.filter((t) => t !== type);
        
        set({
          incomeTypes: newIncomeTypes,
          incomes: rest,
        });

        if (state.user) {
          try {
            await budgetService.saveBudget(state.user.id, {
              months: state.months,
              categories: state.categories,
              data: state.data,
              revenus: state.revenus,
              incomeTypes: newIncomeTypes,
              incomes: rest,
              persons: state.persons,
              saved: state.saved,
              sideByMonth: state.sideByMonth
            });
          } catch (error) {
            console.error('Error saving budget:', error);
            set({ error: error.message });
          }
        }
      },

      renameIncomeType: async (oldType, newType) => {
        const state = get();
        if (state.incomeTypes.includes(newType)) return;

        const newIncomeTypes = state.incomeTypes.map((t) => (t === oldType ? newType : t));
        const newIncomes = { ...state.incomes };
        newIncomes[newType] = newIncomes[oldType];
        delete newIncomes[oldType];
        
        set({ incomeTypes: newIncomeTypes, incomes: newIncomes });

        if (state.user) {
          try {
            await budgetService.saveBudget(state.user.id, {
              months: state.months,
              categories: state.categories,
              data: state.data,
              revenus: state.revenus,
              incomeTypes: newIncomeTypes,
              incomes: newIncomes,
              persons: state.persons,
              saved: state.saved,
              sideByMonth: state.sideByMonth
            });
          } catch (error) {
            console.error('Error saving budget:', error);
            set({ error: error.message });
          }
        }
      },

      setSideByMonth: async (monthIdx, value) => {
        const state = get();
        const newSide = [...state.sideByMonth];
        newSide[monthIdx] = value;
        
        set({ sideByMonth: newSide });

        if (state.user) {
          try {
            await budgetService.saveBudget(state.user.id, {
              months: state.months,
              categories: state.categories,
              data: state.data,
              revenus: state.revenus,
              incomeTypes: state.incomeTypes,
              incomes: state.incomes,
              persons: state.persons,
              saved: state.saved,
              sideByMonth: newSide
            });
          } catch (error) {
            console.error('Error saving budget:', error);
            set({ error: error.message });
          }
        }
      },

      renameCategory: async (oldName, newName) => {
        const state = get();
        const newData = { ...state.data };
        const newCategories = [...state.categories];
        const index = newCategories.indexOf(oldName);
        
        if (index !== -1) {
          newCategories[index] = newName;
          newData[newName] = newData[oldName];
          delete newData[oldName];
        }
        
        set({
          categories: newCategories,
          data: newData
        });

        if (state.user) {
          try {
            await budgetService.saveBudget(state.user.id, {
              months: state.months,
              categories: newCategories,
              data: newData,
              revenus: state.revenus,
              incomeTypes: state.incomeTypes,
              incomes: state.incomes,
              persons: state.persons,
              saved: state.saved,
              sideByMonth: state.sideByMonth
            });
          } catch (error) {
            console.error('Error saving budget:', error);
            set({ error: error.message });
          }
        }
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          error: null,
          months: defaultMonths,
          categories: defaultCategories,
          data: defaultData,
          revenus: defaultRevenus,
          incomeTypes: defaultIncomeTypes,
          incomes: defaultIncomes,
          persons: defaultPersons,
          saved: defaultSaved,
          sideByMonth: defaultSideByMonth
        });
      },

      renameMonth: async (oldMonth, newMonth) => {
        const state = get();
        const monthIdx = state.months.indexOf(oldMonth);
        if (monthIdx === -1) return;

        const newMonths = [...state.months];
        newMonths[monthIdx] = newMonth;

        set({
          months: newMonths
        });

        if (state.user) {
          try {
            await budgetService.saveBudget(state.user.id, {
              months: newMonths,
              categories: state.categories,
              data: state.data,
              revenus: state.revenus,
              incomeTypes: state.incomeTypes,
              incomes: state.incomes,
              persons: state.persons,
              saved: state.saved,
              sideByMonth: state.sideByMonth,
              totalPotentialSavings: state.totalPotentialSavings
            });
          } catch (error) {
            console.error('Error saving budget:', error);
            set({ error: error.message });
          }
        }
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

// Charger les données au démarrage si l'utilisateur est authentifié
const store = useStore.getState();
if (store.user && store.isAuthenticated) {
  store.setUser(store.user);
}

export { useStore }; 