import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { budgetService } from './services/budgetService';
import toast from 'react-hot-toast';

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
const defaultCategoryLimits = {};
defaultCategories.forEach(cat => { defaultCategoryLimits[cat] = 0; });

const useStore = create(
  persist(
    (set, get) => {
      let saveTimeout = null;
      const SAVE_DEBOUNCE_MS = 500;

      function scheduleSave() {
        if (saveTimeout) clearTimeout(saveTimeout);
        saveTimeout = setTimeout(async () => {
          const state = get();
          if (!state.user) return;
          set({ isSaving: true });
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
              sideByMonth: state.sideByMonth,
              totalPotentialSavings: state.totalPotentialSavings
            });
            toast.success('Budget sauvegardé');
          } catch (error) {
            console.error('Debounced save error:', error);
            set({ error: error.message });
            toast.error(error.message);
          } finally {
            set({ isSaving: false });
          }
        }, SAVE_DEBOUNCE_MS);
      }

      return {
        isSaving: false,
        user: null,
        token: null,
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
        budgetLimits: defaultCategoryLimits,
        totalPotentialSavings: 0,

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

        setToken: (token) => set({ token }),

        setValue: (cat, monthIdx, value) => {
          const state = get();
          const newData = { ...state.data };
          newData[cat] = [...newData[cat]];
          newData[cat][monthIdx] = value;
          set({ data: newData });
          if (state.user) scheduleSave();
        },

        addCategory: (cat) => {
          const state = get();
          if (state.categories.includes(cat)) return;

          const newData = { ...state.data };
          newData[cat] = state.months.map(() => 0);
          const newCategories = [...state.categories, cat];
          const newLimits = { ...state.budgetLimits, [cat]: 0 };
          
          set({ categories: newCategories, data: newData, budgetLimits: newLimits });
          scheduleSave();
        },

        removeCategory: (cat) => {
          const state = get();
          const { [cat]: _, ...rest } = state.data;
          const newCategories = state.categories.filter((c) => c !== cat);
          const { [cat]: __, ...newLimits } = state.budgetLimits;
          
          set({ categories: newCategories, data: rest, budgetLimits: newLimits });
          scheduleSave();
        },

        addMonth: (month) => {
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
          scheduleSave();
        },

        removeMonth: (month) => {
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
          scheduleSave();
        },

        setIncome: (type, monthIdx, value) => {
          const state = get();
          const newIncomes = { ...state.incomes };
          newIncomes[type] = [...newIncomes[type]];
          newIncomes[type][monthIdx] = value;

          set({ incomes: newIncomes });
          if (state.user) scheduleSave();
        },

        addIncomeType: (type) => {
          const state = get();
          if (state.incomeTypes.includes(type)) return;

          const newIncomes = { ...state.incomes };
          newIncomes[type] = state.months.map(() => 0);
          const newIncomeTypes = [...state.incomeTypes, type];
          
          set({ incomeTypes: newIncomeTypes, incomes: newIncomes });
          scheduleSave();
        },

        removeIncomeType: (type) => {
          const state = get();
          const { [type]: _, ...rest } = state.incomes;
          const newIncomeTypes = state.incomeTypes.filter((t) => t !== type);
          
          set({ incomeTypes: newIncomeTypes, incomes: rest });
          scheduleSave();
        },

        renameIncomeType: (oldType, newType) => {
          const state = get();
          if (state.incomeTypes.includes(newType)) return;

          const newIncomeTypes = state.incomeTypes.map((t) => (t === oldType ? newType : t));
          const newIncomes = { ...state.incomes };
          newIncomes[newType] = newIncomes[oldType];
          delete newIncomes[oldType];
          
          set({ incomeTypes: newIncomeTypes, incomes: newIncomes });
          scheduleSave();
        },

        setSideByMonth: (monthIdx, value) => {
          const state = get();
          const newSide = [...state.sideByMonth];
          newSide[monthIdx] = value;
          
          set({ sideByMonth: newSide });
          scheduleSave();
        },

        renameCategory: (oldName, newName) => {
          const state = get();
          const newData = { ...state.data };
          const newCategories = [...state.categories];
          const index = newCategories.indexOf(oldName);
          
          if (index !== -1) {
            newCategories[index] = newName;
            newData[newName] = newData[oldName];
            delete newData[oldName];
          }
          
          set({ categories: newCategories, data: newData });
          scheduleSave();
        },

        logout: () => {
          set({
            user: null,
            token: null,
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

        renameMonth: (oldMonth, newMonth) => {
          const state = get();
          const monthIdx = state.months.indexOf(oldMonth);
          if (monthIdx === -1) return;

          const newMonths = [...state.months];
          newMonths[monthIdx] = newMonth;

          set({ months: newMonths });
          scheduleSave();
        },

        reorderCategories: (sourceIdx, destIdx) => {
          const state = get();
          const newCategories = Array.from(state.categories);
          const [moved] = newCategories.splice(sourceIdx, 1);
          newCategories.splice(destIdx, 0, moved);
          set({ categories: newCategories });
          scheduleSave();
        },

        reorderIncomeTypes: (sourceIdx, destIdx) => {
          const state = get();
          const newIncomeTypes = Array.from(state.incomeTypes);
          const [moved] = newIncomeTypes.splice(sourceIdx, 1);
          newIncomeTypes.splice(destIdx, 0, moved);
          set({ incomeTypes: newIncomeTypes });
          scheduleSave();
        },

        setCategoryLimit: (cat, value) => {
          const state = get();
          const newLimits = { ...state.budgetLimits, [cat]: value };
          set({ budgetLimits: newLimits });
          scheduleSave();
        },
      };
    },
    {
      name: 'budget-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        token: state.token
      })
    }
  )
);

const store = useStore.getState();
if (store.user && store.isAuthenticated) {
  store.setUser(store.user);
}

export { useStore }; 