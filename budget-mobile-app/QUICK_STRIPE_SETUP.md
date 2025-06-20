# ⚡ Configuration Rapide Stripe

## 🚀 **Étapes en 5 minutes**

### 1. **Créer votre compte Stripe**
- Allez sur : https://dashboard.stripe.com/register
- Créez votre compte avec votre email
- Vérifiez votre email

### 2. **Récupérer votre clé**
- Connectez-vous au dashboard Stripe
- Allez dans **Developers** → **API keys**
- Copiez votre **Publishable key** (pk_test_...)

### 3. **Configurer automatiquement**
```bash
# Dans votre terminal, à la racine du projet
npm run setup-stripe
```

### 4. **Suivre les instructions**
- Collez votre clé publique
- Choisissez le mode (test/live)
- Ajoutez vos emails d'accès spécial (optionnel)

### 5. **Tester**
```bash
npm start
```

---

## 🔑 **Vos clés Stripe**

### **Clé Publique** (à utiliser dans l'app)
```
pk_test_... (mode test)
pk_live_... (mode production)
```

### **Clé Secrète** (pour le serveur plus tard)
```
sk_test_... (mode test)
sk_live_... (mode production)
```

---

## 🧪 **Cartes de test Stripe**

### **Carte qui fonctionne toujours**
```
Numéro: 4242 4242 4242 4242
Date: 12/34
CVC: 123
Code postal: 12345
```

### **Carte qui échoue**
```
Numéro: 4000 0000 0000 0002
Date: 12/34
CVC: 123
Code postal: 12345
```

---

## ✅ **Vérification**

1. **Démarrez l'app** : `npm start`
2. **Allez sur** : http://localhost:3000/subscription
3. **Cliquez sur "Upgrade"** sur un plan
4. **Testez avec la carte** : 4242 4242 4242 4242

---

## 🔒 **Sécurité**

- ✅ Le fichier `stripe-config.js` est ignoré par Git
- ✅ Seule la clé publique est utilisée côté client
- ✅ La clé secrète reste sur le serveur
- ✅ Mode test par défaut (pas de vrais paiements)

---

## 🆘 **Aide**

- **Guide complet** : `STRIPE_SETUP_GUIDE.md`
- **Documentation Stripe** : https://stripe.com/docs
- **Support** : https://support.stripe.com

---

**🎉 Votre app est prête pour les paiements !** 