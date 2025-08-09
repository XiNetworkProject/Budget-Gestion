import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
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
  autoLogin: true, // Connexion automatique activée par défaut
  notifications: {
    budgetAlerts: true,
    billReminders: true,
    savingsGoals: true,
    weeklyReports: true,
    mode: 'minimal' // off | minimal | full
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

// Slice notifications simple
const createNotificationsSlice = (set, get) => ({
  notifications: [],
  unreadCount: 0,
  addNotification: (n) => {
    const id = Date.now() + Math.random();
    const notif = { id, timestamp: Date.now(), ...n };
    set((state) => ({ notifications: [notif, ...state.notifications], unreadCount: state.unreadCount + 1 }));
  },
  markAllRead: () => set({ unreadCount: 0 }),
  removeNotification: (id) => set((state) => ({ notifications: state.notifications.filter(n => n.id !== id) })),
  setNotificationMode: (mode) => {
    const state = get();
    const appSettings = { ...(state.appSettings || {}), notifications: { ...(state.appSettings?.notifications || {}), mode } };
    set({ appSettings });
  }
});

// Plans d'abonnement avec les vrais Price IDs Stripe
const subscriptionPlans = {
  FREE: {
    id: 'free',
    name: 'subscription.free',
    price: 0,
    currency: 'EUR',
    features: {
      maxTransactions: 100,
      unlimitedCategories: true,
      maxSavingsGoals: 2,
      basicAnalytics: true,
      aiAnalysis: false,
      maxActionPlans: 0,
      multipleAccounts: false,
      prioritySupport: false,
      advancedReports: false
    }
  },
  PREMIUM: {
    id: 'premium',
    name: 'subscription.premium',
    price: 1.99,
    currency: 'EUR',
    stripePriceId: 'price_1RcAEjGb8GKvvz2G9mn9OlJs',
    features: {
      maxTransactions: -1, // Illimité
      unlimitedCategories: true,
      maxSavingsGoals: -1, // Illimité
      basicAnalytics: true,
      aiAnalysis: 'partial',
      maxActionPlans: 1,
      multipleAccounts: false,
      prioritySupport: false,
      advancedReports: false
    }
  },
  PRO: {
    id: 'pro',
    name: 'subscription.pro',
    price: 5.99,
    currency: 'EUR',
    stripePriceId: 'price_1RcAERGb8GKvvz2GAyajrGFo',
    features: {
      maxTransactions: -1, // Illimité
      unlimitedCategories: true,
      maxSavingsGoals: -1, // Illimité
      basicAnalytics: true,
      aiAnalysis: 'full',
      maxActionPlans: -1, // Illimité
      multipleAccounts: true,
      prioritySupport: true,
      advancedReports: true
    }
  }
};

// Liste des emails autorisés pour l'accès spécial (développeur/testeurs)
const specialAccessEmails = [
  'mvadn@example.com', // Remplacez par votre email
  'test@example.com',
  'dev@example.com'
];

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

const useStore = create(persist(
    (set, get) => {
      // intégrer slice notifications
      const notificationsApi = createNotificationsSlice(set, get);
      let saveTimeout = null;
      const SAVE_DEBOUNCE_MS = 500;

      function scheduleSave() {
        if (saveTimeout) clearTimeout(saveTimeout);
        saveTimeout = setTimeout(async () => {
          const state = get();
          // Eviter toute sauvegarde serveur pendant le bootstrap initial
          if (!state.initialDataLoaded) {
            console.log('Sauvegarde ignorée (bootstrap en cours): initialDataLoaded=false');
            return;
          }
        
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
            activeAccount: state.activeAccount,
            tutorialCompleted: state.tutorialCompleted,
            onboardingCompleted: state.onboardingCompleted,
            lastUpdateShown: state.lastUpdateShown,
            appVersion: state.appVersion
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
        initialDataLoaded: false,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        serverConnected: true,
        autoLogin: true, // Connexion automatique
        
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

        // Gamification (spins/points/boosters)
        gamification: {
          points: 0,
          spins: 0,
          lastDailySpinAwardDate: null,
          lastSpinAt: null,
          rerollTokens: 0,
          freezeTokens: 0,
          activeBoosters: [], // { code, kind: 'pointsBonus', value: 0.1, expiresAt }
        },
        
        // Profil et paramètres utilisateur
        userProfile: defaultUserProfile,
        appSettings: defaultAppSettings,
      selectedMonth: new Date().getMonth(), // Mois actuel par défaut
      selectedYear: new Date().getFullYear(), // Année actuelle par défaut

      // Gestion des mises à jour
      appVersion: "2.2.0",
      lastUpdateShown: null,
      showUpdateDialog: false,

      // Gestion du tutoriel et onboarding
      tutorialCompleted: false,
      onboardingCompleted: false,
      forceTutorial: false,

      // Gestion des abonnements
      subscription: {
        currentPlan: 'FREE',
        status: 'active', // active, expired, cancelled
        startDate: null,
        endDate: null,
        stripeCustomerId: null,
        stripeSubscriptionId: null
      },
      subscriptionPlans,
      specialAccessEmails,

      // Fonction pour vérifier et afficher les mises à jour
      checkForUpdates: () => {
        const state = get();
        const currentVersion = "2.2.0";
        const lastShown = state.lastUpdateShown;
        
        console.log('CheckForUpdates:', { currentVersion, lastShown, showUpdateDialog: state.showUpdateDialog });
        
        // Vérifier si c'est la première fois ou si la version a changé
        if (!lastShown || lastShown.version !== currentVersion) {
          console.log('Nouvelle version détectée, affichage du dialog');
                set({
            showUpdateDialog: true,
            lastUpdateShown: {
              version: currentVersion,
              date: new Date().toISOString()
            }
                });
              } else {
          console.log('Version déjà affichée, pas d\'affichage automatique');
          // Ne pas afficher si la version a déjà été montrée
          set({ showUpdateDialog: false });
        }
      },

      // Fonction pour fermer le dialog de mise à jour
      closeUpdateDialog: () => {
        set({ showUpdateDialog: false });
      },

      // Fonction pour forcer l'affichage du dialog de mise à jour (pour les tests)
      forceShowUpdateDialog: () => {
        set({ 
          showUpdateDialog: true,
          lastUpdateShown: null // Réinitialiser pour forcer l'affichage
        });
      },

      // Fonction pour réinitialiser les états d'onboarding et tutoriel
      resetOnboardingStates: () => {
        console.log('Reset des états d\'onboarding et tutoriel');
        set({ 
          onboardingCompleted: false,
          tutorialCompleted: false,
          forceTutorial: false,
          lastUpdateShown: null
        });
          scheduleSave();
        },

      // Fonction pour forcer l'état onboardingCompleted à true
      forceOnboardingCompleted: () => {
        console.log('Force onboardingCompleted à true');
        set({ onboardingCompleted: true });
          scheduleSave();
        },

      // Fonction pour vérifier et corriger automatiquement l'état onboarding
      checkAndFixOnboardingState: () => {
          const state = get();
        console.log('CheckAndFixOnboardingState: Vérification de l\'état');
        
        // Vérifier si l'utilisateur a des données réelles
        const hasRealData = (
          state.expenses && state.expenses.length > 0 ||
          state.incomeTransactions && state.incomeTransactions.length > 0 ||
          state.transactions && state.transactions.length > 0 ||
          (state.data && Object.values(state.data).some(cat => cat.some(val => val > 0))) ||
          (state.revenus && state.revenus.some(val => val > 0))
        );
          
        console.log('CheckAndFixOnboardingState:', { 
          hasRealData, 
          currentOnboardingCompleted: state.onboardingCompleted,
          expensesCount: state.expenses?.length || 0,
          transactionsCount: state.transactions?.length || 0,
          userId: state.user?.id
        });
        
        // Si l'utilisateur a des données mais que l'onboarding n'est pas marqué comme terminé
        if (hasRealData && !state.onboardingCompleted && state.user) {
          console.log('CheckAndFixOnboardingState: Correction automatique - l\'utilisateur a des données');
          set({ onboardingCompleted: true });
          // Sauvegarder immédiatement sur le serveur
          scheduleSave();
          return true; // Indique qu'une correction a été faite
        }
        
        return false; // Aucune correction nécessaire
        },

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
            // Gestion des transactions récurrentes
            recurring: expense.recurring || false,
            recurringType: expense.recurringType || 'monthly',
            recurringEndDate: expense.recurringEndDate || null,
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
        
          // Gamification: évaluer spin quotidien si épargne nette du jour positive
          try {
            get().evaluateGamificationDailySpin();
          } catch (_) {}

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
            // Gestion des transactions récurrentes
            recurring: income.recurring || false,
            recurringType: income.recurringType || 'monthly',
            recurringEndDate: income.recurringEndDate || null,
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
        
          // Gamification: évaluer spin quotidien si épargne nette du jour positive
          try {
            get().evaluateGamificationDailySpin();
          } catch (_) {}

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

        addCategory: (categoryData) => {
          const state = get();
          const categoryName = typeof categoryData === 'string' ? categoryData : categoryData.name;
          
          // Vérifier si la catégorie existe déjà
          const existingCategory = state.categories.find(cat => 
            (typeof cat === 'string' && cat === categoryName) ||
            (typeof cat === 'object' && cat.name === categoryName)
          );
          
          if (existingCategory) return;

          // Créer un objet catégorie complet
          const newCategory = typeof categoryData === 'string' ? {
            id: `category-${Date.now()}`,
            name: categoryData,
            icon: 'Category',
            color: '#2196f3',
            budget: 0
          } : {
            id: categoryData.id || `category-${Date.now()}`,
            name: categoryData.name,
            icon: categoryData.icon || 'Category',
            color: categoryData.color || '#2196f3',
            budget: categoryData.budget || 0
          };

          const newData = { ...state.data };
          newData[newCategory.name] = state.months.map(() => 0);
          const newCategories = [...state.categories, newCategory];
          const newLimits = { ...state.budgetLimits, [newCategory.name]: newCategory.budget };
          
          set({ categories: newCategories, data: newData, budgetLimits: newLimits });
          scheduleSave();
        },

        updateCategory: (categoryId, updatedData) => {
          const state = get();
          const categoryIndex = state.categories.findIndex(cat => 
            (typeof cat === 'object' && (cat.id === categoryId || cat.name === categoryId)) ||
            (typeof cat === 'string' && cat === categoryId)
          );
          
          if (categoryIndex === -1) return;

          const oldCategory = state.categories[categoryIndex];
          const oldName = typeof oldCategory === 'string' ? oldCategory : oldCategory.name;
          
          // Créer la nouvelle catégorie
          const newCategory = {
            id: typeof oldCategory === 'object' ? oldCategory.id : `category-${Date.now()}`,
            name: updatedData.name,
            icon: updatedData.icon || 'Category',
            color: updatedData.color || '#2196f3',
            budget: updatedData.budget || 0
          };

          // Mettre à jour les données si le nom a changé
          const newData = { ...state.data };
          if (oldName !== newCategory.name) {
            newData[newCategory.name] = newData[oldName] || state.months.map(() => 0);
            delete newData[oldName];
          }

          // Mettre à jour les limites de budget
          const newLimits = { ...state.budgetLimits };
          newLimits[newCategory.name] = newCategory.budget;
          if (oldName !== newCategory.name) {
            delete newLimits[oldName];
          }

          // Mettre à jour la liste des catégories
          const newCategories = [...state.categories];
          newCategories[categoryIndex] = newCategory;
          
          set({ categories: newCategories, data: newData, budgetLimits: newLimits });
          scheduleSave();
        },

        removeCategory: (categoryId, deleteWithData = false) => {
          const state = get();
          
          // Trouver la catégorie à supprimer
          let categoryToRemove = null;
          let categoryIndex = -1;
          
          // Chercher par ID, nom d'objet, ou nom de chaîne
          for (let i = 0; i < state.categories.length; i++) {
            const cat = state.categories[i];
            if ((typeof cat === 'object' && (cat.id === categoryId || cat.name === categoryId)) ||
                (typeof cat === 'string' && cat === categoryId)) {
              categoryToRemove = cat;
              categoryIndex = i;
              break;
            }
          }
          
          if (categoryIndex === -1) {
            console.warn('Catégorie non trouvée pour suppression:', categoryId);
            return;
          }

          const categoryName = typeof categoryToRemove === 'string' ? categoryToRemove : categoryToRemove.name;
          
          // Supprimer les données de la catégorie
          const newData = { ...state.data };
          if (deleteWithData) {
            delete newData[categoryName];
          }

          // Supprimer de la liste des catégories
          const newCategories = state.categories.filter((_, index) => index !== categoryIndex);
          
          // Supprimer les limites de budget
          const newLimits = { ...state.budgetLimits };
          delete newLimits[categoryName];
          
          // Supprimer les transactions associées si deleteWithData est true
          let newExpenses = [...state.expenses];
          let newIncomeTransactions = [...state.incomeTransactions];
          
          if (deleteWithData) {
            newExpenses = newExpenses.filter(exp => exp.category !== categoryName);
            newIncomeTransactions = newIncomeTransactions.filter(inc => inc.category !== categoryName);
          }
          
          set({ 
            categories: newCategories, 
            data: newData, 
            budgetLimits: newLimits,
            expenses: newExpenses,
            incomeTransactions: newIncomeTransactions
          });
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

        removeIncomeType: (type, deleteWithData = false) => {
          const state = get();
          
          // Supprimer les données de revenus
          const { [type]: _, ...rest } = state.incomes;
          const newIncomeTypes = state.incomeTypes.filter((t) => t !== type);
          
          // Supprimer les transactions associées si deleteWithData est true
          let newIncomeTransactions = [...state.incomeTransactions];
          
          if (deleteWithData) {
            newIncomeTransactions = newIncomeTransactions.filter(inc => inc.category !== type);
          }
          
          set({ 
            incomeTypes: newIncomeTypes, 
            incomes: rest,
            incomeTransactions: newIncomeTransactions
          });
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
            appSettings: state.appSettings,
            tutorialCompleted: false,
            onboardingCompleted: false,
            lastUpdateShown: null,
            appVersion: "2.2.0"
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
        console.log('setUser: Connexion de l\'utilisateur:', user);
        set({ user, isAuthenticated: !!user });
        if (user) {
          try {
            set({ isLoading: true });
            const data = await budgetService.getBudget(user.id);
            console.log('setUser: Données reçues du serveur:', data);
            
            if (data && Object.keys(data || {}).length > 0) {
              // Si l'utilisateur a des données, l'onboarding est forcément terminé
              const shouldCompleteOnboarding = data.onboardingCompleted !== undefined ? data.onboardingCompleted : true;
              
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
                tutorialCompleted: data.tutorialCompleted || false,
                onboardingCompleted: shouldCompleteOnboarding,
                lastUpdateShown: data.lastUpdateShown || null,
                appVersion: data.appVersion || "2.2.0",
                isLoading: false,
                initialDataLoaded: true
              });
              
              console.log('setUser: Données chargées depuis le serveur, onboardingCompleted:', shouldCompleteOnboarding);
            } else {
              // Nouvel utilisateur, onboarding non terminé
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
                tutorialCompleted: false,
                onboardingCompleted: false,
                lastUpdateShown: null,
                appVersion: "2.2.0"
              };
              set({ ...defaultBudget, isLoading: false, initialDataLoaded: true });
              await budgetService.saveBudget(user.id, defaultBudget);
              console.log('setUser: Nouvel utilisateur créé, onboardingCompleted: false');
            }
          } catch (error) {
            console.error('Error loading budget:', error);
            set({ error: error.message, isLoading: false, initialDataLoaded: true });
          }
        }
      },

      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      setToken: (token) => set({ token }),
      
      // Gestion de la connexion Google
      loginWithGoogle: async (token, user) => {
        console.log('loginWithGoogle: Connexion avec Google:', user);
        set({ token, user, isAuthenticated: !!user });
        
        if (user) {
          try {
            set({ isLoading: true });
            const data = await budgetService.getBudget(user.id);
            
            if (data && Object.keys(data || {}).length > 0) {
              const shouldCompleteOnboarding = data.onboardingCompleted !== undefined ? data.onboardingCompleted : true;
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
                tutorialCompleted: data.tutorialCompleted || false,
                onboardingCompleted: shouldCompleteOnboarding,
                lastUpdateShown: data.lastUpdateShown || null,
                appVersion: data.appVersion || "2.2.0",
                isLoading: false,
                initialDataLoaded: true
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
                tutorialCompleted: false,
                onboardingCompleted: false,
                lastUpdateShown: null,
                appVersion: "2.2.0"
              };
              set({ ...defaultBudget, isLoading: false, initialDataLoaded: true });
              await budgetService.saveBudget(user.id, defaultBudget);
            }
          } catch (error) {
            console.error('Error loading budget for Google user:', error);
            set({ error: error.message, isLoading: false, initialDataLoaded: true });
          }
        }
      },
      
      // Gestion de la connexion automatique
      setAutoLogin: (enabled) => {
        set({ autoLogin: enabled });
        scheduleSave();
      },
      
      // Vérifier et restaurer la session automatiquement
      checkAutoLogin: async () => {
        const state = get();
        console.log('checkAutoLogin - État actuel:', { 
          autoLogin: state.autoLogin, 
          hasToken: !!state.token, 
          hasUser: !!state.user,
          isAuthenticated: state.isAuthenticated 
        });

        // Si pas de session en mémoire, tenter de recharger depuis la persistance
        if (state.autoLogin && (!state.token || !state.user)) {
          try {
            const raw = localStorage.getItem('budget-storage');
            if (raw) {
              const parsed = JSON.parse(raw);
              const persisted = parsed?.state || parsed;
              if (persisted?.token && persisted?.user) {
                set({ token: persisted.token, user: persisted.user, isAuthenticated: true });
                // Charger immédiatement les données depuis le serveur pour éviter d'écraser avec les valeurs par défaut
                try {
                  await get().setUser(persisted.user);
                } catch (e) {
                  console.warn('checkAutoLogin: setUser a échoué pendant la restauration:', e?.message);
                }
              }
            }
          } catch (e) {
            console.warn('checkAutoLogin: impossible de recharger la session persistée:', e?.message);
          }
        }

        const after = get();
        if (after.autoLogin && after.token && after.user) {
          console.log('Connexion automatique détectée - restauration de la session');
          set({ isAuthenticated: true });
          // S'assurer que les données sont chargées une fois la session restaurée
          try {
            await get().setUser(after.user);
          } catch (e) {
            console.warn('checkAutoLogin: setUser a échoué après restauration:', e?.message);
          }
          return true;
        }
        console.log('Aucune session valide trouvée pour la connexion automatique');
        return false;
      },
      
      // Forcer la sauvegarde immédiate
      forceSave: () => {
        console.log('Forçage de la sauvegarde des données');
        if (saveTimeout) clearTimeout(saveTimeout);
        
        const state = get();
        if (!state.user) {
          console.warn('Pas d\'utilisateur connecté - sauvegarde locale uniquement');
          return;
        }
        
        set({ isSaving: true });
        
        // Sauvegarde immédiate sans délai
        budgetService.saveBudget(state.user.id, {
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
          activeAccount: state.activeAccount,
          tutorialCompleted: state.tutorialCompleted,
          onboardingCompleted: state.onboardingCompleted,
          lastUpdateShown: state.lastUpdateShown,
          appVersion: state.appVersion
        }).then(() => {
          console.log('Sauvegarde forcée réussie');
          set({ isSaving: false });
        }).catch((error) => {
          console.error('Erreur lors de la sauvegarde forcée:', error);
          set({ isSaving: false });
        });
      },

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

        // === Gamification helpers ===
        getGamificationBenefits: () => {
          const state = get();
          const planId = state.subscription?.currentPlan || 'FREE';
          // Avantages par plan
          if (planId === 'PRO') {
            return { dailySpinCap: 3, rareBoost: 0.2, guaranteedMinTier: 'medium', rollover: 3 };
          }
          if (planId === 'PREMIUM') {
            return { dailySpinCap: 2, rareBoost: 0.1, guaranteedMinTier: null, rollover: 2 };
          }
          return { dailySpinCap: 1, rareBoost: 0.0, guaranteedMinTier: null, rollover: 1 };
        },

        addGamificationPoints: (basePoints) => {
          const state = get();
          const now = Date.now();
          // Appliquer boosters actifs (pointsBonus)
          const effectiveMultiplier = (state.gamification?.activeBoosters || [])
            .filter(b => b.kind === 'pointsBonus' && new Date(b.expiresAt).getTime() > now)
            .reduce((m, b) => m * (1 + (b.value || 0)), 1);
          const gained = Math.round((basePoints || 0) * effectiveMultiplier);
          set({ gamification: { ...state.gamification, points: (state.gamification.points || 0) + gained } });
          return gained;
        },

        grantSpin: (reason = 'manual') => {
          const state = get();
          const benefits = get().getGamificationBenefits();
          const rollover = Math.max(1, benefits.rollover || 1);
          const currentSpins = Math.min((state.gamification?.spins || 0) + 1, rollover);
          set({ gamification: { ...state.gamification, spins: currentSpins } });
          console.log(`[Gamification] Spin accordé (${reason}). Spins=${currentSpins}/${rollover}`);
          return currentSpins;
        },

        evaluateGamificationDailySpin: () => {
          const state = get();
          const todayKey = new Date().toISOString().slice(0,10);
          if (state.gamification?.lastDailySpinAwardDate === todayKey) return false;

          // Calculer l'épargne nette du jour
          const isSameDay = (d) => new Date(d).toDateString() === new Date().toDateString();
          const expensesToday = (state.expenses || []).filter(e => e.date && isSameDay(e.date));
          const incomeToday = (state.incomeTransactions || []).filter(i => i.date && isSameDay(i.date));
          const totalExp = expensesToday.reduce((s, e) => s + (Number(e.amount) || 0), 0);
          const totalInc = incomeToday.reduce((s, i) => s + (Number(i.amount) || 0), 0);
          const net = totalInc - totalExp;
          if (net > 0) {
            const spins = get().grantSpin('daily_net_savings_positive');
            set({ gamification: { ...state.gamification, lastDailySpinAwardDate: todayKey } });
            // Petit bonus points pour renforcer la boucle
            get().addGamificationPoints(Math.min(25, Math.max(5, Math.round(net))));
            return spins;
          }
          return false;
        },

        getSpinOutcome: () => {
          const state = get();
          const benefits = get().getGamificationBenefits();
          // Tiers & poids de base
          const base = [
            { tier: 'small', weight: 45 },
            { tier: 'medium', weight: 35 },
            { tier: 'rare', weight: 15 },
            { tier: 'epic', weight: 5 }
          ];
          // Boost des rares selon plan
          const boosted = base.map(x => x.tier === 'rare' ? { ...x, weight: x.weight + Math.round(base[2].weight * (benefits.rareBoost || 0)) } : x);
          // Normaliser & tirage
          const total = boosted.reduce((s, x) => s + x.weight, 0);
          let roll = Math.random() * total;
          let chosen = boosted[0];
          for (const x of boosted) { roll -= x.weight; if (roll <= 0) { chosen = x; break; } }
          // Garantie de plan
          if (benefits.guaranteedMinTier === 'medium' && (chosen.tier === 'small')) {
            chosen = { tier: 'medium', weight: 0 };
          }
          // Mapper tier -> récompense
          const reward = (() => {
            if (chosen.tier === 'small') return { code: 'POINTS_25', kind: 'points', value: 25 };
            if (chosen.tier === 'medium') return { code: 'POINTS_100', kind: 'points', value: 100 };
            if (chosen.tier === 'rare') return { code: 'BOOST_10', kind: 'booster', booster: { kind: 'pointsBonus', value: 0.10, durationHours: 24 } };
            return { code: 'FREEZE_1', kind: 'token', token: 'freeze', value: 1 };
          })();
          return { tier: chosen.tier, reward };
        },

        consumeSpinAndRoll: () => {
          const state = get();
          const spins = state.gamification?.spins || 0;
          if (spins <= 0) return null;
          const outcome = get().getSpinOutcome();
          // Consommer 1 spin
          set({ gamification: { ...state.gamification, spins: spins - 1, lastSpinAt: new Date().toISOString() } });
          // Appliquer récompense
          if (outcome.reward.kind === 'points') {
            get().addGamificationPoints(outcome.reward.value || 0);
          } else if (outcome.reward.kind === 'booster') {
            const hours = outcome.reward.booster.durationHours || 24;
            const expiresAt = new Date(Date.now() + hours * 3600 * 1000).toISOString();
            const booster = { code: outcome.reward.code, ...outcome.reward.booster, expiresAt };
            const after = get();
            set({ gamification: { ...after.gamification, activeBoosters: [...(after.gamification.activeBoosters || []), booster] } });
          } else if (outcome.reward.kind === 'token' && outcome.reward.token === 'freeze') {
            const after = get();
            set({ gamification: { ...after.gamification, freezeTokens: (after.gamification.freezeTokens || 0) + (outcome.reward.value || 1) } });
          }
          return outcome;
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

      // === GESTION DES ABONNEMENTS ===
      
      // Vérifier si l'utilisateur a un accès spécial
      hasSpecialAccess: () => {
        const state = get();
        if (!state.user?.email) return false;
        return state.specialAccessEmails.includes(state.user.email);
      },

      // Obtenir le plan actuel de l'utilisateur
      getCurrentPlan: () => {
        const state = get();
        if (state.hasSpecialAccess()) {
          return { ...state.subscriptionPlans.PRO, name: 'Développeur' };
        }
        
        // Si pas de plan défini, retourner le plan gratuit par défaut
        const currentPlanId = state.subscription?.currentPlan || 'FREE';
        return state.subscriptionPlans[currentPlanId] || state.subscriptionPlans.FREE;
      },

      // Vérifier si une fonctionnalité est disponible
      isFeatureAvailable: (feature) => {
        const state = get();
        const currentPlan = state.getCurrentPlan();
        return currentPlan.features[feature] !== false && currentPlan.features[feature] !== 0;
      },

      // Vérifier le niveau d'IA disponible
      getAILevel: () => {
        const state = get();
        const currentPlan = state.getCurrentPlan();
        return currentPlan.features.aiAnalysis || false;
      },

      // Vérifier si l'IA complète est disponible (Pro uniquement)
      hasFullAI: () => {
        const state = get();
        const currentPlan = state.getCurrentPlan();
        return currentPlan.features.aiAnalysis === 'full';
      },

      // Vérifier si l'IA partielle est disponible (Premium et Pro)
      hasPartialAI: () => {
        const state = get();
        const currentPlan = state.getCurrentPlan();
        return currentPlan.features.aiAnalysis === 'partial' || currentPlan.features.aiAnalysis === 'full';
      },

      // Vérifier les limites d'utilisation
      checkUsageLimit: (feature, currentUsage) => {
        const state = get();
        const currentPlan = state.getCurrentPlan();
        const limit = currentPlan.features[feature];
        
        if (limit === -1) return { allowed: true, remaining: -1 }; // Illimité
        if (limit === false || limit === 0) return { allowed: false, remaining: 0 };
        
        const remaining = Math.max(0, limit - currentUsage);
        return { allowed: remaining > 0, remaining };
      },

      // Mettre à jour l'abonnement
      updateSubscription: (planId, stripeData = null) => {
        const state = get();
        const newSubscription = {
          currentPlan: planId,
          status: 'active',
          startDate: new Date().toISOString(),
          endDate: null,
          ...(stripeData && {
            stripeCustomerId: stripeData.customerId,
            stripeSubscriptionId: stripeData.subscriptionId
          })
        };
        
        set({ subscription: newSubscription });
        scheduleSave();
        
        const plan = state.subscriptionPlans[planId];
        toast.success(`Abonnement ${planId === 'FREE' ? 'Gratuit' : planId === 'PREMIUM' ? 'Premium' : 'Pro'} activé !`);
      },

      // Annuler l'abonnement
      cancelSubscription: () => {
        const state = get();
        set({ 
          subscription: {
            ...state.subscription,
            status: 'cancelled',
            endDate: new Date().toISOString()
          }
        });
        scheduleSave();
        toast.success('Abonnement annulé');
      },

      // Réinitialiser l'abonnement (pour les tests)
      resetSubscription: () => {
        set({ 
          subscription: {
            currentPlan: 'FREE',
            status: 'active',
            startDate: null,
            endDate: null,
            stripeCustomerId: null,
            stripeSubscriptionId: null
          },
          appliedPromoCode: null,
          promoCodeDiscount: 0
        });
        scheduleSave();
        toast.success('Abonnement réinitialisé');
      },

      // Forcer le rechargement des données de budget
      reloadBudgetData: async () => {
        const state = get();
        if (!state.user?.id) {
          console.log('Aucun utilisateur connecté, impossible de recharger les données');
          return;
        }

        try {
          console.log('Rechargement forcé des données de budget...');
          set({ isLoading: true });
          
          const data = await budgetService.getBudget(state.user.id);
          console.log('Données rechargées:', data);
          
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
              tutorialCompleted: data.tutorialCompleted || false,
              onboardingCompleted: data.onboardingCompleted !== undefined ? data.onboardingCompleted : true,
              lastUpdateShown: data.lastUpdateShown || null,
              appVersion: data.appVersion || "2.2.0",
              isLoading: false
            });
            
            toast.success('Données rechargées avec succès');
          } else {
            console.log('Aucune donnée trouvée, création d\'un nouveau budget');
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
              userProfile: { ...defaultUserProfile, email: state.user.email },
              appSettings: defaultAppSettings,
              tutorialCompleted: false,
              onboardingCompleted: false,
              lastUpdateShown: null,
              appVersion: "2.2.0"
            };
            set({ ...defaultBudget, isLoading: false });
            await budgetService.saveBudget(state.user.id, defaultBudget);
            toast.success('Nouveau budget créé');
          }
        } catch (error) {
          console.error('Erreur lors du rechargement des données:', error);
          set({ isLoading: false });
          toast.error('Erreur lors du rechargement des données');
        }
      },

      // Gestion des transactions récurrentes
      processRecurringTransactions: () => {
        const state = get();
        const today = new Date();
        let hasChanges = false;

        // Traiter les dépenses récurrentes
        const updatedExpenses = state.expenses.map(expense => {
          if (!expense.recurring) return expense;

          const lastDate = new Date(expense.date);
          let nextDate = new Date(lastDate);

          // Calculer la prochaine date selon le type de récurrence
          switch (expense.recurringType) {
            case 'daily':
              nextDate = new Date(lastDate.getTime() + 24 * 60 * 60 * 1000);
              break;
            case 'weekly':
              nextDate = new Date(lastDate.getTime() + 7 * 24 * 60 * 60 * 1000);
              break;
            case 'monthly':
              nextDate = new Date(lastDate.getFullYear(), lastDate.getMonth() + 1, lastDate.getDate());
              break;
            case 'yearly':
              nextDate = new Date(lastDate.getFullYear() + 1, lastDate.getMonth(), lastDate.getDate());
              break;
            default:
              return expense;
          }

          // Vérifier si la prochaine date est passée et si la transaction n'a pas de date de fin
          if (nextDate <= today && (!expense.recurringEndDate || new Date(expense.recurringEndDate) > today)) {
            hasChanges = true;
            return { ...expense, date: nextDate.toISOString() };
          }

          return expense;
        });

        // Traiter les revenus récurrents
        const updatedIncomes = state.incomeTransactions.map(income => {
          if (!income.recurring) return income;

          const lastDate = new Date(income.date);
          let nextDate = new Date(lastDate);

          // Calculer la prochaine date selon le type de récurrence
          switch (income.recurringType) {
            case 'daily':
              nextDate = new Date(lastDate.getTime() + 24 * 60 * 60 * 1000);
              break;
            case 'weekly':
              nextDate = new Date(lastDate.getTime() + 7 * 24 * 60 * 60 * 1000);
              break;
            case 'monthly':
              nextDate = new Date(lastDate.getFullYear(), lastDate.getMonth() + 1, lastDate.getDate());
              break;
            case 'yearly':
              nextDate = new Date(lastDate.getFullYear() + 1, lastDate.getMonth(), lastDate.getDate());
              break;
            default:
              return income;
          }

          // Vérifier si la prochaine date est passée et si la transaction n'a pas de date de fin
          if (nextDate <= today && (!income.recurringEndDate || new Date(income.recurringEndDate) > today)) {
            hasChanges = true;
            return { ...income, date: nextDate.toISOString() };
          }

          return income;
        });

        if (hasChanges) {
          set({ 
            expenses: updatedExpenses,
            incomeTransactions: updatedIncomes
          });
          scheduleSave();
        }
      },

      // Récupérer les informations d'abonnement depuis Stripe
      fetchSubscriptionFromStripe: async () => {
        const state = get();
        if (!state.user?.id || !state.token) {
          console.log('Utilisateur non connecté, impossible de récupérer l\'abonnement');
          return;
        }

        try {
          console.log('Récupération des informations d\'abonnement depuis Stripe...');
          
          const API_ORIGIN = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
          let apiUrl = '/api/stripe';
          try {
            if (typeof window !== 'undefined' && API_ORIGIN) {
              const configured = new URL(API_ORIGIN, window.location.origin);
              if (configured.origin === window.location.origin) {
                apiUrl = `${API_ORIGIN}/api/stripe`;
              } else {
                console.warn('[API] VITE_API_URL pointe vers une autre origine, utilisation des routes relatives /api');
              }
            }
          } catch (_) {
            apiUrl = '/api/stripe';
          }
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${state.token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
              action: 'subscription-info', 
              customerId: state.subscription?.stripeCustomerId || null,
              userEmail: state.user?.email || null
            })
          });

          if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
          }

          const data = await response.json();
          
          if (data.success && data.subscription) {
            const subscriptionInfo = data.subscription;
            console.log('Informations d\'abonnement récupérées:', subscriptionInfo);
            
            // Mettre à jour l'abonnement dans le store
            const newSubscription = {
              currentPlan: subscriptionInfo.planId,
              status: subscriptionInfo.status,
              startDate: subscriptionInfo.createdAt,
              endDate: subscriptionInfo.currentPeriodEnd,
              stripeCustomerId: subscriptionInfo.customerId,
              stripeSubscriptionId: subscriptionInfo.subscriptionId,
              isTrialing: subscriptionInfo.isTrialing,
              trialEnd: subscriptionInfo.trialEnd,
              cancelAtPeriodEnd: subscriptionInfo.cancelAtPeriodEnd
            };
            
            set({ subscription: newSubscription });
            scheduleSave();
            
            const plan = state.subscriptionPlans[subscriptionInfo.planId];
            if (subscriptionInfo.isTrialing) {
              toast.success(`Période d'essai ${subscriptionInfo.planId === 'FREE' ? 'Gratuit' : subscriptionInfo.planId === 'PREMIUM' ? 'Premium' : 'Pro'} activée !`);
            } else if (subscriptionInfo.planId !== 'FREE') {
              toast.success(`Abonnement ${subscriptionInfo.planId === 'PREMIUM' ? 'Premium' : 'Pro'} détecté !`);
            }
            
            return subscriptionInfo;
          } else {
            console.log('Aucun abonnement actif trouvé, plan gratuit par défaut');
            return null;
          }
        } catch (error) {
          console.error('Erreur lors de la récupération de l\'abonnement:', error);
          toast.error('Erreur lors de la récupération de l\'abonnement');
          return null;
        }
      },
    };
  },
  {
    name: 'budget-storage',
    storage: createJSONStorage(() => localStorage),
    partialize: (state) => ({
      user: state.user,
      token: state.token,
      isAuthenticated: state.isAuthenticated,
      autoLogin: state.autoLogin,
      appSettings: state.appSettings,
      subscription: state.subscription,
      lastUpdateShown: state.lastUpdateShown,
      gamification: state.gamification
    })
  }
));

// Suppression de la recharge automatique pour éviter les conflits avec la persistance locale
// const store = useStore.getState();
// if (store.user && store.isAuthenticated) {
//   store.setUser(store.user);
// }

export { useStore }; 