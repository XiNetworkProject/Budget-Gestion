# 🔍 Guide de Diagnostic - Problème de Connexion

## 🚨 Problème Identifié

Lors de la connexion à l'application, les utilisateurs n'ont plus accès à leurs données existantes dans MongoDB.

## 🔧 Corrections Apportées

### 1. **Correction du Composant Login**
- ✅ Ajout de `await` devant `setUser()` pour attendre la récupération des données
- ✅ Amélioration de la gestion des erreurs
- ✅ Logs détaillés pour le diagnostic

### 2. **Amélioration du Service BudgetService**
- ✅ Logs détaillés pour tracer les requêtes
- ✅ Meilleure gestion des erreurs d'authentification
- ✅ Fallback vers les données locales en cas d'erreur

### 3. **Amélioration du Serveur API**
- ✅ Logs détaillés pour la récupération des données
- ✅ Vérification de la connexion à la base de données
- ✅ Route de debug pour diagnostiquer les problèmes

### 4. **Composant de Debug**
- ✅ Interface web pour tester la connexion
- ✅ Tests automatisés de l'API
- ✅ Affichage des informations de debug

## 🛠️ Étapes de Diagnostic

### Étape 1: Vérifier le Serveur
```bash
# Démarrer le serveur
npm run start

# Tester la connexion
npm run debug:connection
```

### Étape 2: Vérifier les Variables d'Environnement
Assurez-vous que ces variables sont définies dans votre `.env` :

```env
VITE_API_URL=http://localhost:3000
VITE_MONGODB_URI=mongodb+srv://...
VITE_MONGODB_DB=budget-app
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

### Étape 3: Tester via l'Interface Web
1. Connectez-vous à l'application
2. Allez sur `/debug` dans votre navigateur
3. Cliquez sur "Tester la Connexion"
4. Vérifiez les résultats

### Étape 4: Vérifier les Logs
Regardez les logs du serveur pour identifier les erreurs :

```bash
# Dans le terminal du serveur
npm run start
```

## 🔍 Points de Vérification

### 1. **Authentification Google**
- ✅ Le token Google est-il valide ?
- ✅ L'ID utilisateur correspond-il à celui en base ?

### 2. **Connexion MongoDB**
- ✅ La base de données est-elle accessible ?
- ✅ Les données existent-elles pour cet utilisateur ?

### 3. **API Endpoints**
- ✅ `/health` répond-il correctement ?
- ✅ `/api/budget/:userId` fonctionne-t-il ?

### 4. **Variables d'Environnement**
- ✅ Toutes les variables sont-elles définies ?
- ✅ Les URLs sont-elles correctes ?

## 🚀 Solutions Rapides

### Solution 1: Rechargement Forcé
```javascript
// Dans la console du navigateur
const store = useStore.getState();
await store.reloadBudgetData();
```

### Solution 2: Réinitialisation du Cache
```javascript
// Vider le localStorage
localStorage.clear();
// Puis se reconnecter
```

### Solution 3: Vérification Manuelle en Base
```javascript
// Dans MongoDB Compass ou shell
db.budgets.findOne({ userId: "votre-user-id" })
```

## 📊 Tests de Diagnostic

### Test 1: Health Check
```bash
curl http://localhost:3000/health
```

### Test 2: Debug Utilisateur
```bash
# Avec un token valide
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3000/api/debug/user/YOUR_USER_ID
```

### Test 3: Récupération des Données
```bash
# Avec un token valide
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3000/api/budget/YOUR_USER_ID
```

## 🎯 Problèmes Courants

### Problème 1: Token Expiré
**Symptômes** : Erreur 401/403
**Solution** : Se reconnecter avec Google

### Problème 2: Base de Données Inaccessible
**Symptômes** : Erreur 503
**Solution** : Vérifier la connexion MongoDB

### Problème 3: Données Non Trouvées
**Symptômes** : Objet vide retourné
**Solution** : Vérifier l'ID utilisateur en base

### Problème 4: CORS
**Symptômes** : Erreur de requête bloquée
**Solution** : Vérifier la configuration CORS

## 🔧 Scripts de Diagnostic

### Script Automatique
```bash
npm run debug:connection
```

### Script avec Token
```bash
npm run debug:connection "YOUR_TOKEN" "YOUR_USER_ID"
```

## 📱 Interface de Debug

Accédez à `/debug` dans votre application pour :
- ✅ Voir l'état actuel de la connexion
- ✅ Tester la récupération des données
- ✅ Forcer le rechargement des données
- ✅ Voir les logs détaillés

## 🎉 Résolution

Une fois le problème identifié et corrigé :

1. **Redémarrez le serveur** si nécessaire
2. **Videz le cache** du navigateur
3. **Reconnectez-vous** à l'application
4. **Vérifiez** que les données sont bien récupérées

## 📞 Support

Si le problème persiste :
1. Vérifiez les logs du serveur
2. Utilisez l'interface de debug
3. Testez avec le script de diagnostic
4. Vérifiez la configuration MongoDB

---

**Note** : Les corrections apportées devraient résoudre le problème de récupération des données lors de la connexion. 