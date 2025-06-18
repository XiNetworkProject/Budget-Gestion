# 💰 Budget Gestion - Application de Gestion de Budget Moderne

Une application mobile moderne et intuitive pour la gestion complète de vos finances personnelles, construite avec React et Material-UI.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/React-18.0.0-blue.svg)
![Material-UI](https://img.shields.io/badge/Material--UI-5.0.0-green.svg)
![License](https://img.shields.io/badge/license-MIT-yellow.svg)

## ✨ Fonctionnalités Principales

### 📊 **Tableau de Bord (Home)**
- Vue d'ensemble de vos finances
- KPIs en temps réel (revenus, dépenses, économies)
- Graphiques interactifs de l'évolution mensuelle
- Accès rapide aux actions principales

### 💸 **Gestion des Dépenses**
- Ajout rapide de dépenses avec catégorisation
- Édition et suppression inline
- Historique complet des transactions
- Filtrage par catégorie et période

### 💰 **Gestion des Revenus**
- Suivi de tous vos revenus
- Catégorisation des sources de revenus
- Édition et suppression des entrées
- Historique détaillé

### 🎯 **Objectifs d'Épargne**
- Création d'objectifs personnalisés
- Suivi de progression en temps réel
- Calcul automatique des pourcentages
- Graphiques de répartition
- Mise à jour rapide des montants

### 💳 **Gestion des Dettes**
- Suivi complet des dettes et prêts
- Calcul automatique des intérêts
- Système de paiements
- Échéances avec alertes
- Types de dettes différenciés (carte de crédit, prêt, hypothèque)

### 🏦 **Gestion Bancaire**
- Gestion de plusieurs comptes
- Transferts entre comptes
- Édition inline des soldes
- Ajout/suppression de comptes
- Types de comptes différenciés

### 📈 **Analytics Avancés**
- KPIs colorés et animés
- Graphiques interactifs (camembert, barres, ligne)
- Filtres temporels (semaine, mois, trimestre, année)
- Répartition des dépenses par catégorie
- Évolution des économies dans le temps
- Comparaison revenus vs dépenses

### ⚙️ **Paramètres Complets**
- Interface organisée en sections
- Gestion des langues et devises
- Export/Import de données
- Système de feedback
- Notifications personnalisables
- Mode sombre

### 📱 **Navigation Moderne**
- AppBar Material Design
- Bottom Navigation intuitive
- Transitions fluides
- Interface responsive

## 🛠️ Technologies Utilisées

- **React 18** - Framework principal
- **Material-UI (MUI) 5** - Composants UI modernes
- **Chart.js** - Graphiques interactifs
- **React Router** - Navigation
- **Zustand** - Gestion d'état
- **Tailwind CSS** - Utilitaires CSS
- **React Icons** - Icônes

## 🎨 Design System

### Palette de Couleurs
- **Bleu nuit** - Couleur principale
- **Blanc** - Arrière-plans
- **Rouge clair** - Accents et alertes
- **Gris** - Textes secondaires

### Typographie
- **Police principale** : Poppins
- **Hiérarchie claire** avec différentes tailles
- **Contraste optimal** pour l'accessibilité

## 🚀 Installation et Démarrage

### Prérequis
- Node.js (version 16 ou supérieure)
- npm ou yarn

### Installation

1. **Cloner le repository**
```bash
git clone https://github.com/XiNetworkProject/Budget-Gestion.git
cd budget-mobile-app
```

2. **Installer les dépendances**
```bash
npm install
# ou
yarn install
```

3. **Démarrer l'application**
```bash
npm start
# ou
yarn start
```

4. **Ouvrir dans le navigateur**
```
http://localhost:3000
```

### Scripts Disponibles

```bash
npm start          # Démarre l'application en mode développement
npm run build      # Construit l'application pour la production
npm run test       # Lance les tests
npm run eject      # Éjecte la configuration (irréversible)
```

## 📱 Utilisation

### Première Utilisation
1. **Accueil** - Consultez votre vue d'ensemble
2. **Ajout Rapide** - Utilisez le bouton + pour ajouter des transactions
3. **Configuration** - Personnalisez vos paramètres dans l'onglet Settings

### Gestion des Finances
- **Dépenses** : Ajoutez et catégorisez vos dépenses
- **Revenus** : Suivez vos sources de revenus
- **Épargne** : Créez et suivez vos objectifs
- **Dettes** : Gérez vos prêts et cartes de crédit
- **Banque** : Suivez vos comptes bancaires

### Analytics
- **Graphiques** : Visualisez vos données financières
- **Filtres** : Analysez par période
- **KPIs** : Suivez vos indicateurs clés

## 🔧 Configuration

### Variables d'Environnement
Créez un fichier `.env` à la racine du projet :

```env
REACT_APP_API_URL=your_api_url
REACT_APP_VERSION=1.0.0
```

### Personnalisation du Thème
Modifiez le fichier `src/theme.js` pour personnaliser :
- Couleurs
- Typographie
- Espacements
- Composants

## 📊 Structure du Projet

```
src/
├── components/          # Composants réutilisables
│   ├── atoms/          # Composants de base
│   ├── molecules/      # Composants composés
│   └── organisms/      # Composants complexes
├── pages/              # Pages de l'application
│   ├── Home.jsx        # Tableau de bord
│   ├── Expenses.jsx    # Gestion des dépenses
│   ├── Income.jsx      # Gestion des revenus
│   ├── Savings.jsx     # Objectifs d'épargne
│   ├── Debts.jsx       # Gestion des dettes
│   ├── Bank.jsx        # Comptes bancaires
│   ├── Analytics.jsx   # Analyses et graphiques
│   ├── History.jsx     # Historique des transactions
│   └── Settings.jsx    # Paramètres
├── store/              # Gestion d'état (Zustand)
├── theme.js            # Configuration du thème
└── App.js              # Composant principal
```

## 🎯 Fonctionnalités Avancées

### Gestion des Données
- **Export/Import** : Sauvegarde et restauration de vos données
- **Synchronisation** : Prêt pour la synchronisation cloud
- **Sauvegarde locale** : Données persistantes

### Expérience Utilisateur
- **Animations fluides** : Transitions et micro-interactions
- **Feedback visuel** : Notifications et confirmations
- **Responsive design** : Optimisé pour tous les écrans
- **Accessibilité** : Conforme aux standards WCAG

### Sécurité
- **Validation des données** : Contrôles de saisie
- **Confirmation des actions** : Prévention des erreurs
- **Sauvegarde sécurisée** : Protection des données

## 🔮 Roadmap

### Version 1.1
- [ ] Synchronisation cloud
- [ ] Notifications push
- [ ] Mode hors ligne
- [ ] Export PDF

### Version 1.2
- [ ] Scanner de codes-barres
- [ ] Reconnaissance de factures
- [ ] Intégration bancaire
- [ ] Budgets automatiques

### Version 1.3
- [ ] Application mobile native
- [ ] Synchronisation multi-appareils
- [ ] IA pour les recommandations
- [ ] Intégration crypto

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Fork le projet
2. Créez une branche pour votre fonctionnalité
3. Committez vos changements
4. Poussez vers la branche
5. Ouvrez une Pull Request

### Standards de Code
- Utilisez ESLint et Prettier
- Suivez les conventions React
- Testez vos modifications
- Documentez les nouvelles fonctionnalités

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👥 Équipe

- **Développeur Principal** : Assistant IA
- **Design** : Material-UI Design System
- **Architecture** : React + Zustand

## 📞 Support

Pour toute question ou problème :
- Ouvrez une issue sur GitHub
- Consultez la documentation
- Contactez l'équipe de développement

---

**Budget Gestion** - Votre partenaire financier moderne et intelligent 💰✨
