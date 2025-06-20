# 🔑 Guide de Configuration Stripe

## 📋 Étapes pour obtenir vos clés Stripe

### 1. **Créer un compte Stripe**

1. **Allez sur** : https://dashboard.stripe.com/register
2. **Remplissez le formulaire** :
   - Email
   - Mot de passe
   - Nom de l'entreprise
   - Pays
3. **Vérifiez votre email** et activez votre compte

### 2. **Accéder aux clés API**

1. **Connectez-vous** au dashboard Stripe
2. **Cliquez sur "Developers"** dans le menu de gauche
3. **Sélectionnez "API keys"**
4. **Vous verrez vos clés** :

```
Publishable key: pk_test_... (clé publique)
Secret key: sk_test_... (clé secrète)
```

### 3. **Comprendre les types de clés**

#### 🔓 **Clé Publique (Publishable Key)**
- **Format** : `pk_test_...` ou `pk_live_...`
- **Utilisation** : Côté client (frontend)
- **Sécurité** : Peut être exposée publiquement
- **Fonction** : Initialiser Stripe dans le navigateur

#### 🔒 **Clé Secrète (Secret Key)**
- **Format** : `sk_test_...` ou `sk_live_...`
- **Utilisation** : Côté serveur uniquement
- **Sécurité** : JAMAIS exposer côté client
- **Fonction** : Créer des sessions de paiement

### 4. **Modes Test vs Live**

#### 🧪 **Mode Test**
- **Clés** : Commencent par `pk_test_` et `sk_test_`
- **Utilisation** : Développement et tests
- **Paiements** : Simulés, pas de vrais transferts
- **Cartes de test** : 4242 4242 4242 4242

#### 🚀 **Mode Live**
- **Clés** : Commencent par `pk_live_` et `sk_live_`
- **Utilisation** : Production
- **Paiements** : Vrais transferts d'argent
- **Activation** : Nécessite vérification du compte

### 5. **Configurer votre application**

#### Étape 1 : Créer le fichier de configuration

```bash
# Copier le fichier d'exemple
cp stripe-config.example.js stripe-config.js
```

#### Étape 2 : Remplacer les clés

```javascript
// Dans stripe-config.js
export const STRIPE_CONFIG = {
  publishableKey: 'pk_test_VOTRE_CLE_PUBLIQUE_ICI',
  mode: 'test',
  // ... autres configurations
};
```

#### Étape 3 : Ajouter au .gitignore

```bash
# Ajouter cette ligne à .gitignore
echo "stripe-config.js" >> .gitignore
```

### 6. **Tester la configuration**

#### Test rapide dans la console

```javascript
// Ouvrir la console du navigateur
// Tester si Stripe se charge
import { loadStripe } from '@stripe/stripe-js';
const stripe = await loadStripe('pk_test_VOTRE_CLE');
console.log('Stripe chargé:', !!stripe);
```

#### Test avec une carte de test

```
Numéro: 4242 4242 4242 4242
Date: 12/34
CVC: 123
Code postal: 12345
```

### 7. **Sécurité et bonnes pratiques**

#### ✅ **À faire**
- Utiliser HTTPS en production
- Valider les données côté serveur
- Utiliser les webhooks pour les événements
- Tester avec les cartes de test Stripe
- Garder les clés secrètes sur le serveur

#### ❌ **À éviter**
- Exposer les clés secrètes côté client
- Commiter les clés dans Git
- Utiliser le mode live pendant le développement
- Ignorer les erreurs de validation

### 8. **Passer en production**

#### Prérequis
1. **Vérifier votre compte** Stripe
2. **Ajouter vos informations bancaires**
3. **Compléter la vérification d'identité**
4. **Tester avec de petites sommes**

#### Changement de mode
```javascript
// Changer de test vers live
export const STRIPE_CONFIG = {
  publishableKey: 'pk_live_VOTRE_CLE_LIVE',
  mode: 'live',
  // ...
};
```

### 9. **Dépannage**

#### Problèmes courants

**Erreur : "Invalid API key"**
- Vérifiez que la clé est correcte
- Assurez-vous qu'elle correspond au bon mode (test/live)

**Erreur : "This payment method is not supported"**
- Utilisez une carte de test Stripe
- Vérifiez la configuration des méthodes de paiement

**Erreur : "No such customer"**
- Vérifiez que le customer ID est correct
- Assurez-vous que le customer existe dans le bon mode

### 10. **Support**

- **Documentation Stripe** : https://stripe.com/docs
- **Support Stripe** : https://support.stripe.com
- **Communauté** : https://stackoverflow.com/questions/tagged/stripe

---

## 🎯 **Prochaines étapes**

1. **Créez votre compte Stripe**
2. **Récupérez vos clés API**
3. **Configurez stripe-config.js**
4. **Testez avec les cartes de test**
5. **Passez en production quand prêt**

**🚀 Votre application sera prête pour les vrais paiements !** 