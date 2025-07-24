# Configuration Capacitor pour Budget Gestion

## 🚀 Installation et Configuration

### Prérequis
- Node.js 16+
- Android Studio
- JDK 11+
- Android SDK

### Commandes utiles

```bash
# Construire et ouvrir Android Studio
npm run android

# Construire l'application
npm run android:build

# Exécuter sur émulateur/appareil
npm run android:run

# Générer APK de debug
npm run android:build-apk

# Générer AAB pour Play Store
npm run android:build-aab
```

## 🔐 Configuration Google Auth

### 1. Obtenir les identifiants Google
1. Aller sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créer un projet ou sélectionner un existant
3. Activer l'API Google+ API
4. Créer des identifiants OAuth 2.0

### 2. Configurer Android
Remplacer `VOTRE_GOOGLE_CLIENT_ID_ICI` dans :
```
android/app/src/main/res/values/strings.xml
```

### 3. Configurer l'application web
Ajouter dans `.env` :
```
VITE_GOOGLE_CLIENT_ID=votre_client_id_google
```

## 📱 Fonctionnalités natives

### Plugins installés
- ✅ **SplashScreen** : Écran de démarrage personnalisé
- ✅ **StatusBar** : Barre de statut adaptée
- ✅ **App** : Gestion du cycle de vie de l'app

### Permissions Android
- ✅ **INTERNET** : Connexion réseau
- ✅ **ACCESS_NETWORK_STATE** : État réseau
- ✅ **GET_ACCOUNTS** : Authentification Google

## 🏗️ Structure du projet

```
budget-mobile-app/
├── android/                 # Projet Android
├── dist/                   # Build web
├── capacitor.config.json   # Configuration Capacitor
└── src/                    # Code source React
```

## 🚀 Déploiement Play Store

### 1. Générer l'AAB
```bash
npm run android:build-aab
```

### 2. Signer l'application
- Créer une keystore
- Configurer le signing dans `android/app/build.gradle`

### 3. Publier
- Uploader l'AAB sur Google Play Console
- Remplir les métadonnées
- Soumettre pour review

## 🔧 Dépannage

### Problèmes courants
1. **Erreur de build** : Vérifier JDK 11+
2. **Auth Google** : Vérifier les identifiants OAuth
3. **Permissions** : Vérifier AndroidManifest.xml

### Logs Android
```bash
adb logcat | grep "Budget Gestion"
```

## 📊 Performance

L'application est optimisée pour mobile avec :
- ✅ Code splitting automatique
- ✅ Lazy loading des composants
- ✅ Optimisation des images
- ✅ Cache intelligent

## 🔄 Workflow de développement

1. **Développement** : `npm run dev`
2. **Test mobile** : `npm run android`
3. **Build** : `npm run android:build`
4. **Déploiement** : `npm run android:build-aab` 