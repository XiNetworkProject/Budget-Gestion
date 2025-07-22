# 🔧 Guide de Résolution des Problèmes CORS

## 🚨 Problème Identifié

Erreur `Cross-Origin-Opener-Policy policy would block the window.postMessage call` lors de l'authentification Google OAuth.

## 🔧 Corrections Apportées

### 1. **Middleware de Sécurité**
- ✅ Création de `server/middleware/security.js`
- ✅ Headers CORS appropriés pour Google OAuth
- ✅ Configuration `Cross-Origin-Opener-Policy: same-origin-allow-popups`

### 2. **Configuration Serveur**
- ✅ Mise à jour de `server/api.js` avec le middleware de sécurité
- ✅ Endpoint de test CORS (`/api/cors-test`)
- ✅ Gestion des requêtes OPTIONS (preflight)

### 3. **Configuration Vite**
- ✅ Mise à jour de `vite.config.js` avec les headers de sécurité
- ✅ Configuration CORS pour le serveur de développement

### 4. **Scripts de Test**
- ✅ Script de test CORS (`npm run test:cors`)
- ✅ Vérification des headers de sécurité

## 🧪 Tests à Effectuer

### 1. **Test de Configuration CORS**
```bash
# Démarrer le serveur
npm run dev

# Dans un autre terminal, tester CORS
npm run test:cors
```

### 2. **Test via l'Interface**
1. Ouvrir la console du navigateur
2. Se connecter avec Google
3. Vérifier qu'il n'y a plus d'erreurs CORS

### 3. **Test des Headers**
```bash
# Tester l'endpoint CORS
curl -H "Origin: http://localhost:5173" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     http://localhost:3000/api/cors-test
```

## 🔍 Headers de Sécurité Configurés

### **Headers CORS**
```javascript
'Access-Control-Allow-Origin': '*'
'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
'Access-Control-Allow-Credentials': 'true'
```

### **Headers de Sécurité pour Google OAuth**
```javascript
'Cross-Origin-Opener-Policy': 'same-origin-allow-popups'
'Cross-Origin-Embedder-Policy': 'unsafe-none'
'Cross-Origin-Resource-Policy': 'cross-origin'
```

### **Headers de Sécurité Généraux**
```javascript
'X-Content-Type-Options': 'nosniff'
'X-Frame-Options': 'SAMEORIGIN'
'X-XSS-Protection': '1; mode=block'
'Referrer-Policy': 'strict-origin-when-cross-origin'
```

## 🐛 Diagnostic Pas à Pas

### Étape 1: Vérifier le Serveur
```bash
# Démarrer le serveur
npm run dev

# Vérifier les logs de démarrage
# Doit afficher les headers de sécurité
```

### Étape 2: Tester CORS
```bash
# Tester la configuration CORS
npm run test:cors

# Vérifier que tous les headers sont présents
```

### Étape 3: Tester l'Authentification
1. Ouvrir la console du navigateur
2. Se connecter avec Google
3. Vérifier qu'il n'y a plus d'erreurs CORS

### Étape 4: Vérifier les Headers
1. Aller sur `http://localhost:3000/api/cors-test`
2. Vérifier les headers dans la réponse
3. Confirmer que `Cross-Origin-Opener-Policy` est `same-origin-allow-popups`

## 🔧 Solutions Possibles

### Problème 1: Headers Manquants
**Symptôme** : Erreur CORS persistante
**Solution** : Vérifier que tous les headers sont configurés

### Problème 2: Configuration Vite
**Symptôme** : Erreur en développement
**Solution** : Vérifier la configuration CORS dans `vite.config.js`

### Problème 3: Serveur de Production
**Symptôme** : Erreur en production
**Solution** : Vérifier que le middleware de sécurité est appliqué

### Problème 4: Google OAuth
**Symptôme** : Popup bloqué
**Solution** : Vérifier `Cross-Origin-Opener-Policy: same-origin-allow-popups`

## 📊 Logs à Surveiller

### Logs Serveur
```
=== TEST CONFIGURATION CORS ===
CORS test: { message: 'CORS test successful', headers: {...} }
Status: 200
CORS Headers:
- Cross-Origin-Opener-Policy: same-origin-allow-popups
- Cross-Origin-Embedder-Policy: unsafe-none
```

### Logs Client
```
// Plus d'erreurs CORS dans la console
// Authentification Google fonctionne normalement
```

## 🚀 Prochaines Étapes

1. **Tester les corrections** avec le guide ci-dessus
2. **Vérifier les headers** avec `npm run test:cors`
3. **Tester l'authentification** Google
4. **Confirmer** qu'il n'y a plus d'erreurs CORS

## 📞 Support

Si le problème persiste :
1. Vérifier que le serveur redémarre avec les nouvelles configurations
2. Vider le cache du navigateur
3. Tester avec un navigateur en mode incognito
4. Vérifier les logs du serveur pour les erreurs

---

**Note** : Les corrections apportées devraient résoudre complètement les problèmes CORS et permettre à l'authentification Google de fonctionner normalement. 