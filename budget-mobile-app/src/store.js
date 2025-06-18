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

// Configuration par défaut de l'application
const defaultAppSettings = {
  theme: 'light',
  currency: 'EUR',
  language: 'fr',
  notifications: {
    budgetAlerts: true,
    billReminders: true,
    savingsGoals: true,
    weeklyReports: true
  },
  privacy: {
    biometricAuth: false,
    autoLock: true,
    dataSharing: false
  },
  display: {
    compactMode: false,
    showPercentages: true,
    defaultView: 'home'
  }
};

// Profil utilisateur par défaut
const defaultUserProfile = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  avatar: '',
  preferences: defaultAppSettings,
  accounts: [],
  createdAt: new Date().toISOString(),
  lastLogin: new Date().toISOString()
};

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
              totalPotentialSavings: state.totalPotentialSavings,
              budgetLimits: state.budgetLimits,
              expenses: state.expenses,
              incomeTransactions: state.incomeTransactions,
              savings: state.savings,
              debts: state.debts,
              bankAccounts: state.bankAccounts,
              transactions: state.transactions,
              userProfile: state.userProfile,
              appSettings: state.appSettings,
              accounts: state.accounts,
              activeAccount: state.activeAccount
            });
            toast.success('Données sauvegardées');
          } catch (error) {
            console.error('Debounced save error:', error);
            set({ error: error.message });
            toast.error('Erreur de sauvegarde');
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
        
        // Données budgétaires
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

        // Nouvelles données pour la persistance complète
        expenses: [],
        incomeTransactions: [],
        savings: [],
        debts: [],
        bankAccounts: [],
        transactions: [],
        
        // Profil et paramètres utilisateur
        userProfile: defaultUserProfile,
        appSettings: defaultAppSettings,
        currentAccountId: null,

        // Gestion des comptes multiples
        accounts: [],
        activeAccount: null,

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
                  budgetLimits: data.budgetLimits || defaultCategoryLimits,
                  expenses: data.expenses || [],
                  incomeTransactions: data.incomeTransactions || [],
                  savings: data.savings || [],
                  debts: data.debts || [],
                  bankAccounts: data.bankAccounts || [],
                  transactions: data.transactions || [],
                  userProfile: data.userProfile || defaultUserProfile,
                  appSettings: data.appSettings || defaultAppSettings,
                  accounts: data.accounts || [],
                  activeAccount: data.activeAccount || null,
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
                  totalPotentialSavings: 0,
                  budgetLimits: defaultCategoryLimits,
                  expenses: [],
                  incomeTransactions: [],
                  savings: [],
                  debts: [],
                  bankAccounts: [],
                  transactions: [],
                  userProfile: { ...defaultUserProfile, email: user.email },
                  appSettings: defaultAppSettings,
                  accounts: [],
                  activeAccount: null
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

        // Gestion du profil utilisateur
        updateUserProfile: (updates) => {
          const state = get();
          const updatedProfile = { ...state.userProfile, ...updates };
          set({ userProfile: updatedProfile });
          scheduleSave();
        },

        updateAppSettings: (updates) => {
          const state = get();
          const updatedSettings = { ...state.appSettings, ...updates };
          set({ appSettings: updatedSettings });
          scheduleSave();
        },

        // Gestion des comptes multiples
        addAccount: (account) => {
          const state = get();
          const newAccount = {
            id: Date.now().toString(),
            name: account.name,
            type: account.type || 'personal',
            balance: account.balance || 0,
            currency: account.currency || 'EUR',
            color: account.color || '#1976d2',
            isActive: account.isActive || false,
            createdAt: new Date().toISOString()
          };
          
          const updatedAccounts = [...state.accounts, newAccount];
          set({ accounts: updatedAccounts });
          
          if (newAccount.isActive) {
            set({ activeAccount: newAccount });
          }
          
          scheduleSave();
        },

        updateAccount: (accountId, updates) => {
          const state = get();
          const updatedAccounts = state.accounts.map(acc => 
            acc.id === accountId ? { ...acc, ...updates } : acc
          );
          set({ accounts: updatedAccounts });
          
          if (state.activeAccount?.id === accountId) {
            set({ activeAccount: { ...state.activeAccount, ...updates } });
          }
          
          scheduleSave();
        },

        deleteAccount: (accountId) => {
          const state = get();
          const updatedAccounts = state.accounts.filter(acc => acc.id !== accountId);
          set({ accounts: updatedAccounts });
          
          if (state.activeAccount?.id === accountId) {
            set({ activeAccount: null });
          }
          
          scheduleSave();
        },

        setActiveAccount: (accountId) => {
          const state = get();
          const account = state.accounts.find(acc => acc.id === accountId);
          if (account) {
            set({ activeAccount: account });
            scheduleSave();
          }
        },

        // Gestion des transactions
        addTransaction: (transaction) => {
          const state = get();
          const newTransaction = {
            id: Date.now().toString(),
            ...transaction,
            accountId: transaction.accountId || state.activeAccount?.id,
            date: transaction.date || new Date().toISOString(),
            createdAt: new Date().toISOString()
          };
          
          const updatedTransactions = [...state.transactions, newTransaction];
          set({ transactions: updatedTransactions });
          scheduleSave();
        },

        updateTransaction: (transactionId, updates) => {
          const state = get();
          const updatedTransactions = state.transactions.map(trans => 
            trans.id === transactionId ? { ...trans, ...updates } : trans
          );
          set({ transactions: updatedTransactions });
          scheduleSave();
        },

        deleteTransaction: (transactionId) => {
          const state = get();
          const updatedTransactions = state.transactions.filter(trans => trans.id !== transactionId);
          set({ transactions: updatedTransactions });
          scheduleSave();
        },

        // Gestion des dépenses
        addExpense: (expense) => {
          const state = get();
          const newExpense = {
            id: Date.now().toString(),
            ...expense,
            accountId: expense.accountId || state.activeAccount?.id,
            date: expense.date || new Date().toISOString(),
            createdAt: new Date().toISOString()
          };
          
          const updatedExpenses = [...state.expenses, newExpense];
          set({ expenses: updatedExpenses });
          scheduleSave();
        },

        updateExpense: (expenseId, updates) => {
          const state = get();
          const updatedExpenses = state.expenses.map(exp => 
            exp.id === expenseId ? { ...exp, ...updates } : exp
          );
          set({ expenses: updatedExpenses });
          scheduleSave();
        },

        deleteExpense: (expenseId) => {
          const state = get();
          const updatedExpenses = state.expenses.filter(exp => exp.id !== expenseId);
          set({ expenses: updatedExpenses });
          scheduleSave();
        },

        // Gestion des revenus
        addIncome: (income) => {
          const state = get();
          const newIncome = {
            id: Date.now().toString(),
            ...income,
            accountId: income.accountId || state.activeAccount?.id,
            date: income.date || new Date().toISOString(),
            createdAt: new Date().toISOString()
          };
          
          const updatedIncomeTransactions = [...state.incomeTransactions, newIncome];
          set({ incomeTransactions: updatedIncomeTransactions });
          scheduleSave();
        },

        updateIncome: (incomeId, updates) => {
          const state = get();
          const updatedIncomeTransactions = state.incomeTransactions.map(inc => 
            inc.id === incomeId ? { ...inc, ...updates } : inc
          );
          set({ incomeTransactions: updatedIncomeTransactions });
          scheduleSave();
        },

        deleteIncome: (incomeId) => {
          const state = get();
          const updatedIncomeTransactions = state.incomeTransactions.filter(inc => inc.id !== incomeId);
          set({ incomeTransactions: updatedIncomeTransactions });
          const updatedIncomes = state.incomes.filter(inc => inc.id !== incomeId);
          set({ incomes: updatedIncomes });
          scheduleSave();
        },

        // Gestion de l'épargne
        addSavingsGoal: (goal) => {
          const state = get();
          const newGoal = {
            id: Date.now().toString(),
            ...goal,
            accountId: goal.accountId || state.activeAccount?.id,
            createdAt: new Date().toISOString(),
            progress: 0
          };
          
          const updatedSavings = [...state.savings, newGoal];
          set({ savings: updatedSavings });
          scheduleSave();
        },

        updateSavingsGoal: (goalId, updates) => {
          const state = get();
          const updatedSavings = state.savings.map(goal => 
            goal.id === goalId ? { ...goal, ...updates } : goal
          );
          set({ savings: updatedSavings });
          scheduleSave();
        },

        deleteSavingsGoal: (goalId) => {
          const state = get();
          const updatedSavings = state.savings.filter(goal => goal.id !== goalId);
          set({ savings: updatedSavings });
          scheduleSave();
        },

        // Gestion des dettes
        addDebt: (debt) => {
          const state = get();
          const newDebt = {
            id: Date.now().toString(),
            ...debt,
            accountId: debt.accountId || state.activeAccount?.id,
            createdAt: new Date().toISOString(),
            paidAmount: 0
          };
          
          const updatedDebts = [...state.debts, newDebt];
          set({ debts: updatedDebts });
          scheduleSave();
        },

        updateDebt: (debtId, updates) => {
          const state = get();
          const updatedDebts = state.debts.map(debt => 
            debt.id === debtId ? { ...debt, ...updates } : debt
          );
          set({ debts: updatedDebts });
          scheduleSave();
        },

        deleteDebt: (debtId) => {
          const state = get();
          const updatedDebts = state.debts.filter(debt => debt.id !== debtId);
          set({ debts: updatedDebts });
          scheduleSave();
        },

        // Gestion des comptes bancaires
        addBankAccount: (account) => {
          const state = get();
          const newBankAccount = {
            id: Date.now().toString(),
            ...account,
            createdAt: new Date().toISOString(),
            balance: account.balance || 0
          };
          
          const updatedBankAccounts = [...state.bankAccounts, newBankAccount];
          set({ bankAccounts: updatedBankAccounts });
          scheduleSave();
        },

        updateBankAccount: (accountId, updates) => {
          const state = get();
          const updatedBankAccounts = state.bankAccounts.map(acc => 
            acc.id === accountId ? { ...acc, ...updates } : acc
          );
          set({ bankAccounts: updatedBankAccounts });
          scheduleSave();
        },

        deleteBankAccount: (accountId) => {
          const state = get();
          const updatedBankAccounts = state.bankAccounts.filter(acc => acc.id !== accountId);
          set({ bankAccounts: updatedBankAccounts });
          scheduleSave();
        },

        // Fonctions existantes avec sauvegarde améliorée
        setValue: (cat, monthIdx, value) => {
          const state = get();
          const newData = { ...state.data };
          newData[cat] = [...newData[cat]];
          newData[cat][monthIdx] = value;
          set({ data: newData });
          scheduleSave();
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
          scheduleSave();
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
            sideByMonth: defaultSideByMonth,
            expenses: [],
            incomeTransactions: [],
            savings: [],
            debts: [],
            bankAccounts: [],
            transactions: [],
            userProfile: defaultUserProfile,
            appSettings: defaultAppSettings,
            accounts: [],
            activeAccount: null
          });
          
          // Rediriger vers la page de connexion
          window.location.href = '/login';
        },

        clearAllData: () => {
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
            sideByMonth: defaultSideByMonth,
            expenses: [],
            incomeTransactions: [],
            savings: [],
            debts: [],
            bankAccounts: [],
            transactions: [],
            userProfile: defaultUserProfile,
            appSettings: defaultAppSettings,
            accounts: [],
            activeAccount: null,
            budgetLimits: {}
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

        // Gestion du tutoriel
        tutorialCompleted: false,
        forceTutorial: false,
        setTutorialCompleted: (completed) => {
          console.log('Tutoriel: setTutorialCompleted appelé avec', completed);
          set({ tutorialCompleted: completed });
          scheduleSave();
        },

        showTutorial: () => {
          console.log('Tutoriel: showTutorial appelé');
          set({ tutorialCompleted: false });
          scheduleSave();
        },

        resetTutorial: () => {
          console.log('Tutoriel: resetTutorial appelé');
          set({ tutorialCompleted: false });
          scheduleSave();
        },

        forceShowTutorial: () => {
          console.log('Tutoriel: forceShowTutorial appelé');
          set({ forceTutorial: true, tutorialCompleted: false });
          scheduleSave();
        },

        clearForceTutorial: () => {
          console.log('Tutoriel: clearForceTutorial appelé');
          set({ forceTutorial: false });
          scheduleSave();
        },
      };
    },
    {
      name: 'budget-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        token: state.token,
        userProfile: state.userProfile,
        appSettings: state.appSettings,
        accounts: state.accounts,
        activeAccount: state.activeAccount,
        tutorialCompleted: state.tutorialCompleted,
        forceTutorial: state.forceTutorial
      })
    }
  )
);

const store = useStore.getState();
if (store.user && store.isAuthenticated) {
  store.setUser(store.user);
}

export { useStore }; 