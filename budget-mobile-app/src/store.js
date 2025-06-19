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
          
          // Diagnostic : vérifier l'état de l'authentification
          console.log('=== DIAGNOSTIC SAUVEGARDE ===');
          console.log('User:', state.user);
          console.log('Token:', state.token ? 'Présent' : 'Manquant');
          console.log('IsAuthenticated:', state.isAuthenticated);
          console.log('ServerConnected:', state.serverConnected);
          
          if (!state.user) {
            console.warn('Pas d\'utilisateur connecté - sauvegarde locale uniquement');
            return;
          }
          
          set({ isSaving: true });
          try {
            console.log('Tentative de sauvegarde pour userId:', state.user.id);
            
            const result = await budgetService.saveBudget(state.user.id, {
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
            
            // Afficher un message différent selon le type de sauvegarde
            if (result.local) {
              console.log('Sauvegarde locale:', result.message);
              set({ serverConnected: false }); // Marquer comme déconnecté
              // Ne pas afficher de toast pour les sauvegardes locales silencieuses
            } else {
              console.log('Sauvegarde serveur réussie');
            toast.success('Données sauvegardées');
              set({ serverConnected: true }); // Marquer comme connecté
            }
          } catch (error) {
            console.error('Erreur de sauvegarde:', error);
            console.error('Détails de l\'erreur:', {
              message: error.message,
              stack: error.stack,
              user: state.user,
              token: state.token ? 'Présent' : 'Manquant'
            });
            
            // Ne pas afficher d'erreur à l'utilisateur car la sauvegarde locale fonctionne
            // set({ error: error.message });
            // toast.error('Erreur de sauvegarde');
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
        serverConnected: true,
        
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
        selectedMonth: new Date().getMonth(), // Mois actuel par défaut
        selectedYear: new Date().getFullYear(), // Année actuelle par défaut

        // Fonction pour valider et nettoyer les dates
        validateAndCleanDates: () => {
          const state = get();
          
          // Nettoyer les dates invalides dans les dépenses
          const cleanedExpenses = state.expenses.map(exp => ({
            ...exp,
            date: exp.date && !isNaN(new Date(exp.date).getTime()) 
              ? exp.date 
              : new Date().toISOString()
          }));
          
          // Nettoyer les dates invalides dans les revenus
          const cleanedIncomeTransactions = state.incomeTransactions.map(inc => ({
            ...inc,
            date: inc.date && !isNaN(new Date(inc.date).getTime()) 
              ? inc.date 
              : new Date().toISOString()
          }));
          
          // Nettoyer les dates invalides dans les transactions
          const cleanedTransactions = state.transactions.map(trans => ({
            ...trans,
            date: trans.date && !isNaN(new Date(trans.date).getTime()) 
              ? trans.date 
              : new Date().toISOString()
          }));
          
                set({
            expenses: cleanedExpenses,
            incomeTransactions: cleanedIncomeTransactions,
            transactions: cleanedTransactions
          });
          
          // Sauvegarder les données nettoyées
          scheduleSave();
        },

        // Fonction pour synchroniser les dépenses entre les deux systèmes
        syncExpensesWithCategories: () => {
          const state = get();
          
          // Créer un objet pour stocker les totaux par catégorie et par mois
          const categoryTotals = {};
          
          // Calculer les totaux des transactions individuelles par catégorie et par mois
          state.expenses.forEach(expense => {
            if (expense.date && !isNaN(new Date(expense.date).getTime())) {
              const date = new Date(expense.date);
              const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
              
              if (!categoryTotals[expense.category]) {
                categoryTotals[expense.category] = {};
              }
              
              if (!categoryTotals[expense.category][monthKey]) {
                categoryTotals[expense.category][monthKey] = 0;
              }
              
              categoryTotals[expense.category][monthKey] += expense.amount || 0;
            }
          });
          
          // Mettre à jour les données par catégorie avec les totaux des transactions
          const newData = { ...state.data };
          Object.keys(categoryTotals).forEach(category => {
            if (!newData[category]) {
              // Si la catégorie n'existe pas, l'ajouter
              newData[category] = state.months.map(() => 0);
              const newCategories = [...state.categories, category];
              const newLimits = { ...state.budgetLimits, [category]: 0 };
              set({ categories: newCategories, budgetLimits: newLimits });
          }
          
            // Mettre à jour les valeurs par mois
            Object.keys(categoryTotals[category]).forEach(monthKey => {
              const [year, month] = monthKey.split('-').map(Number);
              const monthDate = new Date(year, month);
              const monthIndex = state.months.findIndex((_, idx) => {
                const monthDate2 = new Date();
                monthDate2.setMonth(monthDate2.getMonth() - (state.months.length - 1 - idx));
                return monthDate2.getMonth() === month && monthDate2.getFullYear() === year;
              });
              
              if (monthIndex !== -1) {
                newData[category][monthIndex] = categoryTotals[category][monthKey];
              }
            });
          });
          
          set({ data: newData });
          scheduleSave();
        },

        // Fonction pour synchroniser les revenus entre les deux systèmes
        syncIncomesWithTypes: () => {
          const state = get();
          
          // Créer un objet pour stocker les totaux par type et par mois
          const typeTotals = {};
          
          // Calculer les totaux des transactions individuelles par type et par mois
          state.incomeTransactions.forEach(income => {
            if (income.date && !isNaN(new Date(income.date).getTime())) {
              const date = new Date(income.date);
              const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
              
              if (!typeTotals[income.type]) {
                typeTotals[income.type] = {};
              }
              
              if (!typeTotals[income.type][monthKey]) {
                typeTotals[income.type][monthKey] = 0;
              }
              
              typeTotals[income.type][monthKey] += income.amount || 0;
            }
          });
          
          // Mettre à jour les données par type avec les totaux des transactions
          const newIncomes = { ...state.incomes };
          Object.keys(typeTotals).forEach(type => {
            if (!newIncomes[type]) {
              // Si le type n'existe pas, l'ajouter
              newIncomes[type] = state.months.map(() => 0);
              const newIncomeTypes = [...state.incomeTypes, type];
              set({ incomeTypes: newIncomeTypes });
          }
          
            // Mettre à jour les valeurs par mois SEULEMENT si il n'y a pas déjà des données
            Object.keys(typeTotals[type]).forEach(monthKey => {
              const [year, month] = monthKey.split('-').map(Number);
              const monthDate = new Date(year, month);
              const monthIndex = state.months.findIndex((_, idx) => {
                const monthDate2 = new Date();
                monthDate2.setMonth(monthDate2.getMonth() - (state.months.length - 1 - idx));
                return monthDate2.getMonth() === month && monthDate2.getFullYear() === year;
              });
              
              if (monthIndex !== -1) {
                // Ne mettre à jour que si il n'y a pas déjà des données
                // ou si les données existantes sont 0 (pas de saisie manuelle)
                const existingValue = newIncomes[type][monthIndex] || 0;
                if (existingValue === 0) {
                  newIncomes[type][monthIndex] = typeTotals[type][monthKey];
                }
                // Si il y a déjà des données manuelles, ne pas les écraser
              }
            });
          });
          
          set({ incomes: newIncomes });
            scheduleSave();
        },

        // Gestion des transactions
        addTransaction: (transaction) => {
          const state = get();
          const newTransaction = {
            id: Date.now().toString(),
            ...transaction,
            date: transaction.date && !isNaN(new Date(transaction.date).getTime()) 
              ? transaction.date 
              : new Date().toISOString(),
            createdAt: new Date().toISOString()
          };
          
          const updatedTransactions = [...state.transactions, newTransaction];
          set({ transactions: updatedTransactions });
          scheduleSave();
        },

        // Gestion des dépenses
        addExpense: (expense) => {
          const state = get();
          
          // Créer une date cohérente
          let expenseDate;
          if (expense.date && !isNaN(new Date(expense.date).getTime())) {
            // Si une date est fournie, l'utiliser directement
            expenseDate = expense.date;
          } else {
            // Sinon, utiliser la date actuelle
            expenseDate = new Date().toISOString();
          }
          
          const newExpense = {
            id: Date.now().toString(),
            ...expense,
            date: expenseDate,
            createdAt: new Date().toISOString()
          };
          
          console.log('Nouvelle dépense ajoutée:', {
            category: newExpense.category,
            amount: newExpense.amount,
            date: newExpense.date,
            parsedDate: new Date(newExpense.date).toISOString(),
            month: new Date(newExpense.date).getMonth(),
            year: new Date(newExpense.date).getFullYear(),
            originalDate: expense.date
          });
          
          const updatedExpenses = [...state.expenses, newExpense];
          set({ expenses: updatedExpenses });
          
          // Synchroniser avec les catégories après un délai
          setTimeout(() => {
            get().syncExpensesWithCategories();
          }, 100);
          
          scheduleSave();
        },

        updateExpense: (expenseId, updates) => {
          const state = get();
          const updatedExpenses = state.expenses.map(exp => 
            exp.id === expenseId ? { ...exp, ...updates } : exp
          );
          set({ expenses: updatedExpenses });
          
          // Synchroniser avec les catégories après un délai
          setTimeout(() => {
            get().syncExpensesWithCategories();
          }, 100);
          
          scheduleSave();
        },

        deleteExpense: (expenseId) => {
          const state = get();
          const updatedExpenses = state.expenses.filter(exp => exp.id !== expenseId);
          set({ expenses: updatedExpenses });
          
          // Synchroniser avec les catégories après un délai
          setTimeout(() => {
            get().syncExpensesWithCategories();
          }, 100);
          
          scheduleSave();
        },

        // Gestion des revenus
        addIncome: (income) => {
          const state = get();
          
          // Créer une date cohérente
          let incomeDate;
          if (income.date && !isNaN(new Date(income.date).getTime())) {
            // Si une date est fournie, l'utiliser directement
            incomeDate = income.date;
          } else {
            // Sinon, utiliser la date actuelle
            incomeDate = new Date().toISOString();
          }
          
          const newIncome = {
            id: Date.now().toString(),
            ...income,
            date: incomeDate,
            createdAt: new Date().toISOString()
          };
          
          console.log('Nouveau revenu ajouté:', {
            type: newIncome.type,
            amount: newIncome.amount,
            date: newIncome.date,
            parsedDate: new Date(newIncome.date).toISOString(),
            month: new Date(newIncome.date).getMonth(),
            year: new Date(newIncome.date).getFullYear(),
            originalDate: income.date
          });
          
          const updatedIncomeTransactions = [...state.incomeTransactions, newIncome];
          set({ incomeTransactions: updatedIncomeTransactions });
          
          // Ne pas synchroniser automatiquement pour éviter le double comptage
          
          scheduleSave();
        },

        updateIncome: (incomeId, updates) => {
          const state = get();
          const updatedIncomeTransactions = state.incomeTransactions.map(inc => 
            inc.id === incomeId ? { ...inc, ...updates } : inc
          );
          set({ incomeTransactions: updatedIncomeTransactions });
          
          // Ne pas synchroniser automatiquement pour éviter le double comptage
          
          scheduleSave();
        },

        deleteIncome: (incomeId) => {
          const state = get();
          const updatedIncomeTransactions = state.incomeTransactions.filter(inc => inc.id !== incomeId);
          set({ incomeTransactions: updatedIncomeTransactions });
          
          // Ne pas synchroniser automatiquement pour éviter le double comptage
          
          scheduleSave();
        },

        // Gestion de l'épargne
        addSavingsGoal: (goal) => {
          const state = get();
          const newGoal = {
            id: Date.now().toString(),
            ...goal,
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
          console.log('Déconnexion utilisateur');
          set({ 
            user: null, 
            token: null, 
            isAuthenticated: false,
            serverConnected: false,
            error: null
          });
          
          // Nettoyer le localStorage pour les données utilisateur
          try {
            localStorage.removeItem('budget-storage');
            console.log('Données utilisateur supprimées du localStorage');
          } catch (error) {
            console.error('Erreur lors du nettoyage localStorage:', error);
          }
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

        // Réinitialiser avec des données par défaut (garder l'utilisateur connecté)
        resetToDefaults: () => {
          const state = get();
          set({
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
            budgetLimits: defaultCategoryLimits,
            selectedMonth: new Date().getMonth(),
            selectedYear: new Date().getFullYear(),
            tutorialCompleted: false,
            onboardingCompleted: false,
            forceTutorial: false
          });
          
          // Sauvegarder les données par défaut
          if (state.user) {
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
              userProfile: state.userProfile,
              appSettings: state.appSettings
            };
            
            // Sauvegarder de manière synchrone pour s'assurer que c'est fait
            budgetService.saveBudget(state.user.id, defaultBudget).catch(error => {
              console.error('Erreur lors de la sauvegarde des données par défaut:', error);
            });
          }
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

        // Gestion du tutoriel et onboarding
        tutorialCompleted: false,
        onboardingCompleted: false,
        forceTutorial: false,
        setTutorialCompleted: (completed) => {
          console.log('Tutoriel: setTutorialCompleted appelé avec', completed);
          set({ tutorialCompleted: completed });
          scheduleSave();
        },

        setOnboardingCompleted: (completed) => {
          console.log('Onboarding: setOnboardingCompleted appelé avec', completed);
          set({ onboardingCompleted: completed });
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
                  appSettings: defaultAppSettings
                };
                set({ ...defaultBudget, isLoading: false });
                try {
                  await budgetService.saveBudget(user.id, defaultBudget);
                } catch (saveError) {
                  console.warn('Erreur lors de la sauvegarde initiale, mais utilisateur connecté:', saveError);
                  // L'utilisateur reste connecté même si la sauvegarde échoue
                }
              }
            } catch (error) {
              console.error('Error loading budget:', error);
              // En cas d'erreur, utiliser les données par défaut mais garder l'utilisateur connecté
              set({
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
                isLoading: false,
                error: null // Réinitialiser l'erreur
              });
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

        // Gestion du mois sélectionné
        setSelectedMonth: (month, year) => {
          set({ selectedMonth: month, selectedYear: year });
          scheduleSave();
        },

        getCurrentMonthIndex: () => {
          const state = get();
          const currentDate = new Date();
          const currentMonth = currentDate.getMonth();
          const currentYear = currentDate.getFullYear();
          
          // Trouver l'index du mois actuel dans la liste des mois
          const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                             'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
          
          for (let i = 0; i < state.months.length; i++) {
            const monthDate = new Date(currentYear, currentMonth);
            const monthDateStr = monthDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
            if (state.months[i] === monthDateStr) {
              return i;
            }
          }
          
          // Si le mois actuel n'est pas trouvé, retourner le dernier mois
          return state.months.length - 1;
        },

        getSelectedMonthIndex: () => {
          const state = get();
          const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                             'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
          
          for (let i = 0; i < state.months.length; i++) {
            const monthDate = new Date(state.selectedYear, state.selectedMonth);
            const monthDateStr = monthDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
            if (state.months[i] === monthDateStr) {
              return i;
            }
          }
          
          // Si le mois sélectionné n'est pas trouvé, retourner le dernier mois
          return state.months.length - 1;
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
        selectedMonth: state.selectedMonth,
        selectedYear: state.selectedYear,
        tutorialCompleted: state.tutorialCompleted,
        onboardingCompleted: state.onboardingCompleted,
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