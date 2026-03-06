# MEDIKAIR — Feuille de Route Complète

> **Objectif :** Transformer la plateforme actuelle (backend générique + frontends partiellement câblés) en la solution B2B dentaire conforme au Cahier des Charges IA-Medikair.
>
> **Convention :** ✅ = Fait | 🔶 = Partiel | ❌ = Manquant
>
> Chaque étape est autonome, testable, et ordonnée par priorité (les fondations d'abord, l'IA en dernier).

---

## TABLE DES MATIÈRES

| # | Phase | Effort estimé |
|---|-------|---------------|
| 1 | [Corrections critiques du backend existant](#phase-1--corrections-critiques-du-backend) | 1-2 jours |
| 2 | [Modèles de données — Mise à niveau B2B](#phase-2--modèles-de-données--mise-à-niveau-b2b) | 2-3 jours |
| 3 | [API Backend — Nouvelles routes & contrôleurs](#phase-3--api-backend--nouvelles-routes--contrôleurs) | 3-4 jours |
| 4 | [Admin — Câbler les pages statiques à l'API](#phase-4--admin--câbler-les-pages-statiques-à-lapi) | 3-4 jours |
| 5 | [Admin — Fonctionnalités manquantes](#phase-5--admin--fonctionnalités-manquantes) | 2-3 jours |
| 6 | [Client — Câbler les pages statiques à l'API](#phase-6--client--câbler-les-pages-statiques-à-lapi) | 2-3 jours |
| 7 | [Client — Fonctionnalités manquantes](#phase-7--client--fonctionnalités-manquantes) | 3-4 jours |
| 8 | [Tunnel de commande B2B](#phase-8--tunnel-de-commande-b2b) | 2-3 jours |
| 9 | [Système de recherche avancé](#phase-9--système-de-recherche-avancé) | 2-3 jours |
| 10 | [Module IA — Recommandations](#phase-10--module-ia--recommandations) | 4-5 jours |
| 11 | [Module IA — Avancé (Clustering, Prédiction, Chatbot)](#phase-11--module-ia--avancé) | 5-7 jours |
| 12 | [Sécurité & Conformité RGPD](#phase-12--sécurité--conformité-rgpd) | 2-3 jours |
| 13 | [Performance, Tests & Déploiement](#phase-13--performance-tests--déploiement) | 3-4 jours |

**Effort total estimé : 34-48 jours développeur**

---

## ÉTAT ACTUEL — Résumé de l'Audit

### Ce qui fonctionne (✅)

| Composant | Détail |
|-----------|--------|
| Backend (Express) | Server.js, 12 mounts de routes, CORS, JWT auth, Cloudinary uploads |
| Models (Mongoose) | Admin, Product (PIM complet avec variations/documents/specs), Order, Category, Client, HeroImage, PlatformReview, Promotion (rule engine avec tiers/bundle), SiteSettings |
| Admin — Login | Auth live via API, token persisant |
| Admin — Produits (PIM) | CRUD live (créer, lister, supprimer). Modal à 4 onglets (Général, Stock, Médias, Specs) |
| Admin — Promotions | Liste, créer, toggle actif. Modal à 3 onglets (Offre, Ciblage, Paramètres). 3 types d'offre |
| Client — Auth | Login + Register via API |
| Client — Catalogue | Liste produits live, filtres catégorie/marque (côté client) |
| Client — Détail produit | Données live, produits associés |
| Client — Panier | CRUD local (localStorage) |
| Client — Checkout | Wizard 3 étapes, création commande API |
| Client — Commandes | Liste commandes live, bouton reccommander |
| Client — Dashboard | Commandes + produits live (mais section IA = faux) |
| Client — Comparateur | Compare jusqu'à 3 produits, données live |

### Ce qui est statique / faux (🔶)

| Page | Problème |
|------|----------|
| **Admin — Dashboard** | Tous les KPI, graphiques, tableaux = `const` hardcodés |
| **Admin — Clients (CRM)** | 5 clients `const` hardcodés. Aucun appel API |
| **Admin — Commandes** | 7 commandes `const` hardcodées. Aucun appel API |
| **Admin — Rapports** | Tous graphiques + tableaux = `const` hardcodés |
| **Admin — Paramètres** | 5 onglets, tous hardcodés. Le bouton Sauvegarder affiche un toast mais n'envoie rien |
| **Client — Notifications** | 6 notifications `const` hardcodées |
| **Client — ChatBot** | Keyword matching local. Aucune IA |
| **Client — Favoris** | Affiche les 3 premiers produits, pas de vrais favoris |
| **Client — Page d'accueil (stats)** | "5 000+ Références", "1 200+ Praticiens" = hardcodé |
| **Client — Hero** | Image locale, pas depuis `heroAPI` |

### Ce qui manque totalement (❌)

| Fonctionnalité (Cahier des Charges) | Section CDC |
|--------------------------------------|-------------|
| Rôles B2B (dentiste, assistant, clinique, commercial) | §2.1 |
| Catégories hiérarchiques (catégorie → sous-cat → famille) | §2.2 |
| Documents FDS accessibles au catalogue | §2.2 |
| Stock temps réel avec alertes | §2.2 |
| Recherche avancée (Elasticsearch/Algolia, fuzzy, facettes) | §2.3 |
| Import CSV / commande rapide / recommande | §2.4 |
| Validation hiérarchique des commandes B2B | §2.4 |
| Panier persistent côté serveur | §2.4 |
| IA — Recommandations (content-based, collaborative, hybrid) | §4 |
| IA — Segmentation K-Means | §5.1 |
| IA — Prédiction churn/réapprovisionnement | §5.2 |
| IA — Chatbot NLP | §5.3 |
| MFA pour admins | §7 |
| Chiffrement AES-256 données sensibles | §7 |
| Conformité RGPD (consentement, export, suppression) | §7 |
| KPI tracking temps réel | §9 |
| Pagination sur toutes les listes | §11 |
| Rate limiting | §11 |
| Tests (objectif > 80% couverture) | §11 |

---

## PHASE 1 — Corrections Critiques du Backend

> Corriger les bugs et failles de sécurité avant d'ajouter quoi que ce soit.

### 1.1 Bugs à corriger

| # | Fichier | Problème | Correction |
|---|---------|----------|------------|
| 1 | `adminController.js` → `loginAdmin` | Pas wrappé dans `catchAsyncError` → crash non-géré si DB error | Wrapper avec `catchAsyncError` |
| 2 | `siteSettingsController.js` → `getSettings` | Accède à `req.user._id` pour créer les settings par défaut, mais la route GET `/api/settings` n'a PAS de middleware auth → crash si pas de settings existants | Ajouter `checkUserAuthentication` sur la route OU modifier le controller pour ne pas requérir `req.user` |
| 3 | `adminController.js` → `updateAdminPrivilege` | Valide les privileges contre `["admin", "prestataire", "client"]` mais les vrais privilèges utilisés sont `"super"`, `"moderate"`, `"low"` → impossible de promouvoir un admin | Corriger l'enum de validation |
| 4 | `adminController.js` → `deleteAdmin` | Utilise `.remove()` déprécié (Mongoose 6, cassé en v7) | Remplacer par `findByIdAndDelete()` |
| 5 | `orderController.js` → `deleteOrder` | Même problème `.remove()` | Remplacer par `findByIdAndDelete()` |
| 6 | `siteSettingsModel.js` → `createdAt` | `default: Date.now()` (évalué une fois au chargement) | Corriger en `default: Date.now` (sans parenthèses) |

### 1.2 Failles de sécurité à corriger

| # | Fichier | Problème | Correction |
|---|---------|----------|------------|
| 7 | `productRouter.js` | `GET /api/products/` (liste admin), `GET /admin/all-reviews`, `DELETE /admin/reviews/:id` → AUCUN auth middleware | Ajouter `checkUserAuthentication` + `checkAdminPrivileges` |
| 8 | `platformReviewRouter.js` | `DELETE /:id` → aucun auth | Ajouter auth admin |
| 9 | `uploadRouter.js` | `POST /` et `POST /document` → aucun auth | Ajouter auth |
| 10 | `paymentRouter.js` | `POST /create-payment-intent` → aucun auth | Ajouter `checkClientAuthentication` |

### 1.3 Nettoyage

| # | Action |
|---|--------|
| 11 | Supprimer `body-parser` de package.json (non utilisé, `express.json()` est utilisé) |
| 12 | Supprimer `mysql2` de package.json + supprimer `config/DataBase.js` (code mort) |
| 13 | Supprimer `stripe` de package.json OU réactiver le paiement Stripe |
| 14 | Déplacer `nodemon` vers `devDependencies` |
| 15 | Corriger les routes API admin qui ne correspondent pas aux appels frontend (voir §1.4) |

### 1.4 Désalignements API Frontend ↔ Backend

| Frontend appelle | Backend attend | Problème |
|------------------|----------------|----------|
| `GET /admin/me` (admin auth `getMe`) | N'existe pas. Backend a `POST /admin/auth` (`sendCurrentUser`) | Créer `GET /admin/me` OU modifier le frontend pour utiliser `POST /admin/auth` |
| `GET /admin/all` (admin list) | Backend a `GET /admin/users` | Aligner les routes |
| `POST /admin/register` | Backend attend `checkAdminPrivileges("super")` | OK mais véréfier le flux |
| `PUT /admin/privilege/:id` | Backend a `PUT /admin/users/:id` | Aligner les routes |
| `DELETE /admin/:id` | Backend a `DELETE /admin/users/:id` | Aligner les routes |
| `POST /products/new` (admin create) | Backend a la route sur `POST /admin/product/new` | Le frontend admin appelle `/products/new` mais le backend mount est sur `/admin/product/new` — **VÉRÉFIER** |
| `PUT /products/:id` (admin update) | Backend a `PUT /admin/product/:id` | Même problème |
| `DELETE /products/:id` (admin delete) | Backend a `DELETE /admin/product/:id` | Même problème |
| `GET /orders/admin/all` (admin) | Backend n'a PAS cette route. Admin orders sont sur `GET /admin/orders` | Aligner |
| `PUT /orders/:id` (admin status) | Backend a `PUT /admin/order/:id` | Aligner |
| `DELETE /orders/:id` (admin) | Backend a `DELETE /admin/order/:id` | Aligner |
| `GET /clients/all` (admin) | Backend a `GET /admin/clients` | Aligner |
| `GET /clients/:id` (admin) | Backend a `GET /admin/clients/:id` | Aligner |
| `DELETE /clients/:id` (admin) | Backend a `DELETE /admin/clients/:id` | Aligner |
| `PUT /clients/me` (client profile update) | Backend a `PUT /api/clients/profile` | Aligner |
| `GET /orders/me` (client orders) | Backend a `GET /api/orders/my-orders` | Aligner |
| `POST /products/review` (client) | Backend a `POST /api/products/client/reviews` | Aligner |

> **⚠️ ACTION CRITIQUE :** Avant de câbler les pages, vérifier et aligner TOUS les endpoints. Choisir une convention : soit modifier le frontend, soit modifier le backend. Recommandation : modifier le frontend pour correspondre aux routes backend existantes, car le backend a déjà les middlewares auth en place.

---

## PHASE 2 — Modèles de Données — Mise à Niveau B2B

> Adapter les modèles MongoDB au cahier des charges B2B dentaire.

### 2.1 Client Model — Ajouter les rôles B2B (CDC §2.1)

**Fichier :** `models/clientModel.js`

**Champs à ajouter :**

```javascript
// Rôle B2B
role: {
  type: String,
  enum: ["dentiste", "assistant", "clinique", "laboratoire"],
  default: "dentiste"
},
// Structure professionnelle
structure: {
  type: { type: String, enum: ["cabinet", "clinique", "centre", "hôpital"] },
  name: String,
  siret: String,           // Identifiant entreprise
  tvaIntracom: String,     // N° TVA
  adressePro: String,
},
// Clinique multi-utilisateurs : référence au compte parent
parentClient: {
  type: mongoose.Schema.ObjectId,
  ref: "Client",
  default: null
},
// Validation hiérarchique
validationRequired: { type: Boolean, default: false },
approvedBy: { type: mongoose.Schema.ObjectId, ref: "Client" },
// Favoris & préférences
favorites: [{ type: mongoose.Schema.ObjectId, ref: "Product" }],
preferredPayment: { type: String, enum: ["cod", "card", "transfer", "cheque"], default: "cod" },
// Notifications
notificationPrefs: {
  email: { type: Boolean, default: true },
  stock: { type: Boolean, default: true },
  promotions: { type: Boolean, default: true },
  newsletter: { type: Boolean, default: false }
},
// Segmentation IA (sera rempli par le module IA)
segment: { type: String, default: "" },
churnRisk: { type: Number, default: 0 },
lastActivity: { type: Date, default: Date.now },
```

### 2.2 Category Model — Hiérarchie multi-niveaux (CDC §2.2)

**Fichier :** `models/categoryModel.js`

**Refactorer pour supporter 3 niveaux :**

```javascript
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true },
  description: { type: String, default: "" },
  image: {
    public_id: String,
    url: String
  },
  level: { type: Number, enum: [1, 2, 3], default: 1 }, // 1=catégorie, 2=sous-catégorie, 3=famille
  parent: {
    type: mongoose.Schema.ObjectId,
    ref: "Category",
    default: null
  },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// Index pour la recherche enfants
categorySchema.index({ parent: 1 });
// Virtual pour les enfants
categorySchema.virtual("children", {
  ref: "Category",
  localField: "_id",
  foreignField: "parent"
});
```

**Migration :** Script pour convertir les 6 catégories existantes en catégories de niveau 1 + créer des sous-catégories.

### 2.3 Order Model — Enrichir pour le B2B (CDC §2.4)

**Fichier :** `models/orderModel.js`

**Champs à ajouter :**

```javascript
// Référence commande unique
orderNumber: {
  type: String,
  unique: true
  // Auto-généré : "MK-2024-00001"
},
// Validation hiérarchique B2B
validationStatus: {
  type: String,
  enum: ["auto-approved", "pending-validation", "approved", "rejected"],
  default: "auto-approved"
},
validatedBy: { type: mongoose.Schema.ObjectId, ref: "Client" },
validatedAt: Date,
// Commentaires internes
notes: { type: String, default: "" },
// Source de la commande
source: {
  type: String,
  enum: ["web", "csv-import", "reorder", "api"],
  default: "web"
},
// Historique de statut
statusHistory: [{
  status: String,
  date: { type: Date, default: Date.now },
  by: String // admin email or "system"
}],
```

### 2.4 Notification Model — Nouveau (CDC §3)

**Créer :** `models/notificationModel.js`

```javascript
const notificationSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.ObjectId, ref: "Client", required: true },
  type: {
    type: String,
    enum: ["order", "stock", "promo", "delivery", "system", "ai-suggestion"],
    required: true
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  link: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now }
});
```

### 2.5 Cart Model — Panier persistent côté serveur (CDC §2.4)

**Créer :** `models/cartModel.js`

```javascript
const cartSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.ObjectId, ref: "Client", required: true, unique: true },
  items: [{
    product: { type: mongoose.Schema.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 1 },
    variation: { type: mongoose.Schema.ObjectId }, // Si produit variable
    addedAt: { type: Date, default: Date.now }
  }],
  updatedAt: { type: Date, default: Date.now }
});
```

### 2.6 Admin Model — Enrichir les rôles (CDC §8)

**Fichier :** `models/adminModel.js`

**Modifier :**

```javascript
privilege: {
  type: String,
  enum: ["super", "admin", "moderate", "low", "commercial"],
  default: "low"
},
// MFA
mfaEnabled: { type: Boolean, default: false },
mfaSecret: { type: String, select: false },
lastLogin: { type: Date },
```

### 2.7 SiteSettings Model — Compléter (CDC §8)

**Fichier :** `models/siteSettingsModel.js`

**Remplacer par un modèle complet :**

```javascript
const siteSettingsSchema = new mongoose.Schema({
  // Général
  storeName: { type: String, default: "MediKair" },
  storeEmail: { type: String, default: "" },
  storePhone: { type: String, default: "" },
  currency: { type: String, default: "MAD" },
  address: { type: String, default: "" },
  maintenanceMode: { type: Boolean, default: false },
  // Notifications
  notifyOrders: { type: Boolean, default: true },
  notifyStock: { type: Boolean, default: true },
  notifyNewClients: { type: Boolean, default: true },
  notifyAI: { type: Boolean, default: false },
  notificationEmail: { type: String, default: "" },
  // Paiement
  paymentMethods: {
    virement: { type: Boolean, default: true },
    carte: { type: Boolean, default: false },
    cheque: { type: Boolean, default: true },
    cod: { type: Boolean, default: true }
  },
  bankInfo: {
    rib: { type: String, default: "" },
    bank: { type: String, default: "" },
    iban: { type: String, default: "" }
  },
  // Livraison
  shippingZones: [{
    name: String,
    delay: String,
    price: Number
  }],
  defaultCarrier: { type: String, default: "Amana Express" },
  freeShippingThreshold: { type: Number, default: 500 },
  // Sécurité
  require2FA: { type: Boolean, default: false },
  hierarchicalValidation: { type: Boolean, default: false },
  validationThreshold: { type: Number, default: 5000 },
  auditLogs: { type: Boolean, default: true },
  ipRestriction: { type: Boolean, default: false },
  // Offer timer (existant)
  offerTimerEnd: { type: Date },
  admin: { type: mongoose.Schema.ObjectId, ref: "Admin" },
}, { timestamps: true });
```

---

## PHASE 3 — API Backend — Nouvelles Routes & Contrôleurs

### 3.1 Catégories — Refactorer le CRUD

**Fichier :** `controllers/categoryController.js`

| Action | Détail |
|--------|--------|
| `getAllCategories` | Retourner l'arbre hiérarchique (populate enfants récursif ou flat avec `parent` + `level`) |
| `getCategoryTree` | Nouveau — retourne l'arbre complet pour les dropdowns de taxonomie |
| `createCategory` | Accepter `parent` et `level`, générer `slug` automatiquement |
| `updateCategory` | Supporter mise à jour de `parent` (déplacer dans l'arbre) |
| `deleteCategory` | Vérifier qu'il n'y a pas d'enfants avant suppression (ou cascade) |

### 3.2 Clients — Compléter le CRUD

**Fichier :** `controllers/clientController.js`

| Fonction | Statut | Détail |
|----------|--------|--------|
| `registerClient` | 🔶 Modifier | Accepter les nouveaux champs B2B (role, structure, etc.) |
| `getMe` | ✅ OK | — |
| `updateProfile` | 🔶 Modifier | Accepter tous les nouveaux champs |
| `getAllClients` | ✅ OK | Déjà enrichi avec orderCount, totalSpent, lastOrder |
| `getClientById` | ✅ OK | Retourne déjà l'historique commandes |
| `toggleFavorite` | ❌ Créer | `PUT /api/clients/favorites/:productId` — toggle un produit dans la liste favoris |
| `getFavorites` | ❌ Créer | `GET /api/clients/favorites` — retourne les produits favoris peuplés |
| `updateNotifPrefs` | ❌ Créer | `PUT /api/clients/notifications` — met à jour les préférences notification |

### 3.3 Commandes — Compléter le CRUD

**Fichier :** `controllers/orderController.js`

| Fonction | Statut | Détail |
|----------|--------|--------|
| `createNewOrder` | 🔶 Modifier | Auto-générer `orderNumber` ("MK-YYYY-NNNNN"), ajouter `statusHistory`, vérifier stock AVANT création, support `source` |
| `getAllOrders` (admin) | 🔶 Modifier | Ajouter pagination, filtres par statut/date/client |
| `updateOrderStatus` | 🔶 Modifier | Ajouter entrée dans `statusHistory`, envoyer notification client |
| `importCSVOrders` | ❌ Créer | `POST /api/orders/import-csv` — Parser CSV, créer commandes en batch |
| `reorder` | ❌ Créer | `POST /api/orders/reorder/:orderId` — Dupliquer une commande existante |
| `validateOrder` | ❌ Créer | `PUT /api/orders/:id/validate` — Validation hiérarchique B2B |

### 3.4 Notifications — Nouveau contrôleur

**Créer :** `controllers/notificationController.js` + `routes/notificationRouter.js`

| Fonction | Route | Détail |
|----------|-------|--------|
| `getMyNotifications` | `GET /api/notifications` | Notifications du client connecté, triées par date |
| `markAsRead` | `PUT /api/notifications/:id/read` | Marquer comme lue |
| `markAllAsRead` | `PUT /api/notifications/read-all` | Marquer toutes comme lues |
| `deleteNotification` | `DELETE /api/notifications/:id` | Supprimer |
| `createNotification` | Interne (pas de route) | Fonction utilitaire appelée par les autres contrôleurs |

### 3.5 Panier persistent — Nouveau contrôleur

**Créer :** `controllers/cartController.js` + `routes/cartRouter.js`

| Fonction | Route | Détail |
|----------|-------|--------|
| `getCart` | `GET /api/cart` | Retourner le panier du client (populate produits) |
| `addToCart` | `POST /api/cart/add` | Ajouter un produit (ou augmenter qty) |
| `updateCartItem` | `PUT /api/cart/:itemId` | Modifier la quantité |
| `removeFromCart` | `DELETE /api/cart/:itemId` | Retirer un item |
| `clearCart` | `DELETE /api/cart` | Vider le panier |
| `syncCart` | `POST /api/cart/sync` | Fusionner le panier localStorage avec le panier serveur (à l'authentification) |

### 3.6 Reports — Compléter

**Fichier :** `controllers/reportController.js`

| Fonction | Statut | Détail |
|----------|--------|--------|
| `getDashboardStats` | ✅ OK | totalOrders, totalClients, totalProducts, totalRevenue, etc. |
| `getRevenueReport` | ✅ OK | Mensuel par année |
| `getTopProducts` | ✅ OK | Par revenu |
| `getCategoryStats` | ✅ OK | Produits par catégorie |
| `getClientSegmentStats` | ❌ Créer | Répartition clients par rôle/segment |
| `getOrderTrends` | ❌ Créer | Tendances commandes (quotidien/hebdo/mensuel) |
| `getAIMetrics` | ❌ Créer | Métriques IA (sera câblé en Phase 10-11) |

### 3.7 SiteSettings — Refactorer le CRUD

**Fichier :** `controllers/siteSettingsController.js`

| Fonction | Statut | Détail |
|----------|--------|--------|
| `getSettings` | 🔶 Modifier | Créer les paramètres par défaut sans requérir `req.user`, supporter le nouveau modèle complet |
| `updateSettings` | ❌ Créer | `PUT /api/settings` — Mise à jour complète (tous les onglets) |

### 3.8 Pagination middleware

**Créer :** `middleware/pagination.js`

```javascript
// Usage: router.get("/", paginate, handler)
// Provides req.pagination = { page, limit, skip }
module.exports = (req, res, next) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
  req.pagination = { page, limit, skip: (page - 1) * limit };
  next();
};
```

**Appliquer à :** `getAllProducts`, `getAllProductsFromClient`, `getAllOrders`, `getAllClients`, `getAllPromotions`, `getMyNotifications`.

### 3.9 Rate Limiting

**Installer :** `express-rate-limit`

**Appliquer à :**
- `/api/admin/login` → 5 tentatives / 15 min
- `/api/clients/login` → 5 tentatives / 15 min
- `/api/clients/register` → 3 tentatives / heure
- Global → 100 requêtes / minute

---

## PHASE 4 — Admin — Câbler les Pages Statiques à l'API

### 4.1 Dashboard (`AdminDashboard.tsx`) — PRIORITÉ HAUTE

**Actuel :** 100% hardcodé (KPI, graphiques, tableaux).

**Actions :**

1. **Importer `reportsAPI`** → Appeler `reportsAPI.getDashboard()` dans `useEffect`
2. **Remplacer les 4 KPI cards** par les données live :
   - Revenu total ← `totalRevenue`
   - Commandes ← `totalOrders`
   - Nouveaux clients ← `totalClients`
   - Taux AI ← placeholder ou 0 (sera câblé en Phase 10)
3. **Revenue chart** → Appeler `reportsAPI.getRevenue({ year: currentYear })` → peupler le `AreaChart`
4. **Category pie chart** → Appeler `reportsAPI.getCategoryStats()` → peupler le `PieChart`
5. **Top products table** → Appeler `reportsAPI.getTopProducts()` → peupler la table
6. **Recent orders** → Utiliser `recentOrders` du dashboard stats
7. **Ajouter loading skeletons** pour chaque section

### 4.2 Clients / CRM (`AdminClients.tsx`) — PRIORITÉ HAUTE

**Actuel :** 5 clients hardcodés in-line.

**Actions :**

1. **Importer `clientsAPI`** → Appeler `clientsAPI.getAll()` dans `useEffect`
2. **Supprimer le `const clients = [...]`** hardcodé
3. **Stats cards :** Calculer depuis les données live (total, actifs = ceux avec commandes récentes, valeur moyenne = totalSpent moyen)
4. **Ajouter fiche client détaillée** → Dialog/Sheet avec appel `clientsAPI.getById(id)` → historique commandes, total dépensé, informations B2B
5. **Ajouter suppression client** avec confirmation
6. **Ajouter filtre par rôle B2B** (après Phase 2.1)

### 4.3 Commandes (`AdminOrders.tsx`) — PRIORITÉ HAUTE

**Actuel :** 7 commandes hardcodées in-line.

**Actions :**

1. **Importer `ordersAPI`** → Appeler `ordersAPI.getAll()` dans `useEffect`
2. **Supprimer le `const orders = [...]`** hardcodé
3. **Stats cards :** Calculer depuis les données live
4. **Activer le filtre par statut** → Filtrer côté client ou ajouter param `?status=`
5. **Câbler "Mettre à jour le statut"** dans le modal → Appeler `ordersAPI.updateStatus(id, newStatus)`
6. **Câbler "Valider la commande"** → Appeler `ordersAPI.updateStatus(id, "confirmed")`
7. **Implémenter l'export CSV** → Générer et télécharger un fichier CSV côté client

### 4.4 Rapports (`AdminReports.tsx`) — PRIORITÉ MOYENNE

**Actuel :** 100% hardcodé.

**Actions :**

1. **Importer `reportsAPI`**
2. **Sales evolution chart** → `reportsAPI.getRevenue({ year })`
3. **Revenue bar chart** → Même données, format différent
4. **Category performance** → `reportsAPI.getCategoryStats()`
5. **AI Performance section** → Placeholder avec données à 0 (câblé en Phase 10)
6. **Period selector** → Modifier les appels API en fonction (filtrer par mois)
7. **Export PDF** → Utiliser `html2canvas` + `jsPDF` ou similaire

### 4.5 Paramètres (`AdminSettings.tsx`) — PRIORITÉ MOYENNE

**Actuel :** 5 onglets, tous hardcodés, save = toast uniquement.

**Actions :**

1. **Importer `settingsAPI`** → Charger `settingsAPI.get()` à l'ouverture
2. **Peupler les 5 onglets** avec les valeurs du backend
3. **Onglet Général** → Câbler le bouton Save → `settingsAPI.update({ storeName, storeEmail, ... })`
4. **Onglet Notifications** → Câbler save → même API
5. **Onglet Paiement** → Câbler save
6. **Onglet Livraison** → Câbler save (shipping zones dynamiques)
7. **Onglet Sécurité** → Câbler save
8. **Feedback visuel :** Loading sur le bouton, toast de succès/erreur

---

## PHASE 5 — Admin — Fonctionnalités Manquantes

### 5.1 Produits — Edit & View

| # | Action | Détail |
|---|--------|--------|
| 1 | **Edit product** | Réutiliser le formulaire `AddProductForm` en mode édition. Pré-remplir les champs. Appeler `productsAPI.update(id, data)` |
| 2 | **View product** | Dialog/Sheet avec toutes les informations, images, specs, variations, documents |
| 3 | **Filter panel** | Activer le bouton "Filtrer" → Panel avec filtres par catégorie, stock, prix, badge |

### 5.2 Promotions — Edit & Delete

| # | Action | Détail |
|---|--------|--------|
| 1 | **Edit promotion** | Réutiliser le formulaire en mode édition. Appeler `promotionsAPI.update(id, data)` |
| 2 | **Delete promotion** | Ajouter bouton + confirm dialog → Appeler `promotionsAPI.delete(id)` |

### 5.3 Gestion des catégories — Nouveau page ou section

| # | Action | Détail |
|---|--------|--------|
| 1 | **UI catégories** | Arbre interactif avec drag-and-drop pour réordonner |
| 2 | **CRUD catégories** | Créer, modifier, supprimer via l'API existante |
| 3 | **Upload image catégorie** | Via Cloudinary |

### 5.4 Gestion Hero Images — Nouveau page ou section

| # | Action | Détail |
|---|--------|--------|
| 1 | **UI hero images** | Liste avec preview, order par drag-and-drop |
| 2 | **CRUD** | Créer, modifier, supprimer, réordonner via `heroAPI` |

### 5.5 Gestion des admins — Nouveau page

| # | Action | Détail |
|---|--------|--------|
| 1 | **Liste admins** | Table avec nom, email, privilège |
| 2 | **Créer admin** | Formulaire avec rôle |
| 3 | **Modifier privilège** | Dropdown inline |
| 4 | **Supprimer admin** | Avec confirmation |

### 5.6 Sidebar partagée — Refactoring

| # | Action | Détail |
|---|--------|--------|
| 1 | **Extraire la sidebar** | Créer `components/AdminLayout.tsx` avec la sidebar et le header mobile |
| 2 | **Utiliser dans App.tsx** | Wrapper toutes les routes protégées dans le layout |
| 3 | **Retirer la sidebar** dupliquée de chaque page |

---

## PHASE 6 — Client — Câbler les Pages Statiques à l'API

### 6.1 Page d'accueil — Hero & Stats dynamiques

| # | Action | Détail |
|---|--------|--------|
| 1 | **Hero images** | Remplacer l'image statique par un carousel alimenté par `heroAPI.getActive()` |
| 2 | **Stats bar** | Optionnel — soit garder en dur, soit créer un endpoint `/api/stats/public` |

### 6.2 Notifications (`NotificationsPage.tsx`)

| # | Action | Détail |
|---|--------|--------|
| 1 | **Supprimer les notifications hardcodées** | — |
| 2 | **Appeler l'API notifications** | `GET /api/notifications` (après Phase 3.4) |
| 3 | **Câbler markAsRead / delete** | Vers l'API |

### 6.3 Profil — Favoris

| # | Action | Détail |
|---|--------|--------|
| 1 | **Onglet Favoris** | Appeler `GET /api/clients/favorites` au lieu de `productsAPI.getAll()` |
| 2 | **Bouton favoris** | Ajouter un ❤️ sur chaque `ProductCard` → toggle `PUT /api/clients/favorites/:id` |

### 6.4 Profil — Settings

| # | Action | Détail |
|---|--------|--------|
| 1 | **Persister les préférences** | Câbler les toggles (email notifs, AI suggestions, newsletter) → `PUT /api/clients/notifications` |
| 2 | **Supprimer le compte** | Câbler le bouton → Confirmation → `DELETE /api/clients/me` (à créer côté backend) |

### 6.5 Profil — Adresses

| # | Action | Détail |
|---|--------|--------|
| 1 | **Ajouter le modèle d'adresse** | Soit dans le client model, soit model séparé |
| 2 | **CRUD adresses** | Formulaire d'ajout/modification |
| 3 | **Utiliser à checkout** | Select parmi les adresses sauvegardées |

### 6.6 Route Protection

| # | Action | Détail |
|---|--------|--------|
| 1 | **Créer `ProtectedRoute` component** | Vérifie `useAuth().user`, redirige vers `/login` sinon |
| 2 | **Appliquer à** | `/dashboard`, `/profil`, `/commandes`, `/checkout`, `/notifications` |

---

## PHASE 7 — Client — Fonctionnalités Manquantes

### 7.1 Détail Produit — Améliorations

| # | Fonctionnalité | Détail |
|---|----------------|--------|
| 1 | **Galerie images** | Carousel avec `embla-carousel-react` (déjà installé) + thumbnails |
| 2 | **Sélecteur de quantité** | Avant "Ajouter au panier" (actuellement fixé à 1) |
| 3 | **Variations** | Si `productType === "variable"`, afficher les sélecteurs d'attributs (taille, couleur, etc.) et ajuster prix/stock |
| 4 | **Documents réglementaires** | Section "Documents" avec liens vers FDS, fiches techniques (données déjà dans le model) |
| 5 | **Avis clients** | Afficher les reviews existantes + formulaire d'ajout (appeler `reviewsAPI.create()`) |
| 6 | **Bouton favoris** | Toggle ❤️ |

### 7.2 Catalogue — Améliorations

| # | Fonctionnalité | Détail |
|---|----------------|--------|
| 1 | **Tri** | Par prix (asc/desc), nom, popularité, date d'ajout |
| 2 | **Pagination** | Lazy loading ou pagination classique (après Phase 3.8) |
| 3 | **Filtres avancés** | Prix range (slider), stock ↔ en stock seulement, promotions |
| 4 | **Recherche serveur** | Utiliser le `?search=` côté API au lieu du filtre côté client |

### 7.3 Promotions côté client

| # | Fonctionnalité | Détail |
|---|----------------|--------|
| 1 | **Bandeau promo** | Sur la page d'accueil, afficher les promotions actives (`promotionsAPI.getActive()`) |
| 2 | **Badge promo** | Sur les `ProductCard` si le produit est dans une promo active |
| 3 | **Code promo** | Champ dans le panier/checkout pour appliquer un code |
| 4 | **Calcul remise** | Appliquer la logique de réduction (simple/volume/bundle) au panier |

### 7.4 Dashboard Client — Vraies recommandations

| # | Fonctionnalité | Détail |
|---|----------------|--------|
| 1 | **Produits fréquents** | Calculer depuis les commandes réelles du client |
| 2 | **Recommandations IA** | Placeholder → connecter à l'API IA en Phase 10 |

---

## PHASE 8 — Tunnel de Commande B2B (CDC §2.4)

### 8.1 Import CSV

| # | Action | Détail |
|---|--------|--------|
| 1 | **Backend** | `POST /api/orders/import-csv` — parser CSV avec colonnes (ref_produit, quantité), créer la commande |
| 2 | **Frontend** | Bouton "Import CSV" sur le dashboard client ou une page dédiée |
| 3 | **Template CSV** | Fournir un fichier CSV template téléchargeable |

### 8.2 Quick Reorder

| # | Action | Détail |
|---|--------|--------|
| 1 | **Backend** | `POST /api/orders/reorder/:orderId` — dupliquer la commande, vérifier stock actuel |
| 2 | **Frontend** | ✅ Déjà un bouton "Reccommander" sur la page commandes. Câbler vers le panier OU directement créer la commande |

### 8.3 Validation hiérarchique B2B

| # | Action | Détail |
|---|--------|--------|
| 1 | **Logique** | Si `client.validationRequired === true` et `totalPrice > settings.validationThreshold`, la commande passe en `pending-validation` |
| 2 | **Backend** | `PUT /api/orders/:id/validate` — le parent client approuve/rejette |
| 3 | **Frontend admin** | Colonne "Validation" dans la liste commandes |
| 4 | **Frontend client** | Notification + badge "En attente de validation" sur le dashboard |

### 8.4 Panier persistent

| # | Action | Détail |
|---|--------|--------|
| 1 | **Sync à la connexion** | Quand le client se connecte, appeler `POST /api/cart/sync` pour fusionner localStorage → serveur |
| 2 | **CartContext** | Modifier pour lire/écrire depuis l'API quand connecté, localStorage quand anonyme |

---

## PHASE 9 — Système de Recherche Avancé (CDC §2.3)

### 9.1 Option A — Recherche MongoDB améliorée (plus simple)

| # | Action | Détail |
|---|--------|--------|
| 1 | **Index text** | `productSchema.index({ name: 'text', description: 'text', brand: 'text', category: 'text' })` |
| 2 | **Recherche $text** | Modifier `getAllProductsFromClient` pour utiliser `$text: { $search: query }` avec score |
| 3 | **Filtres côté serveur** | Prix range, catégorie, marque, en stock, promotion |
| 4 | **Tri** | `?sort=price_asc`, `price_desc`, `name`, `rating`, `newest` |

### 9.2 Option B — Algolia / Meilisearch (recommandé par le CDC)

| # | Action | Détail |
|---|--------|--------|
| 1 | **Installer Meilisearch** | Docker `meilisearch/meilisearch` (gratuit, self-hosted alternative à Algolia) |
| 2 | **Indexer les produits** | Script de sync MongoDB → Meilisearch |
| 3 | **Endpoint recherche** | `GET /api/search?q=&facets=category,brand,price` |
| 4 | **Frontend** | Composant de recherche avec autocomplétion, suggestions, résultats instantanés |
| 5 | **Sync automatique** | Hooks Mongoose to update Meilisearch index on product create/update/delete |

### 9.3 Autocomplétion & suggestions

| # | Action | Détail |
|---|--------|--------|
| 1 | **Frontend** | Composant `SearchBar` avec debounce, dropdown de suggestions |
| 2 | **Backend** | Endpoint `GET /api/search/suggest?q=` — retourne les 5 premières suggestions |

---

## PHASE 10 — Module IA — Recommandations (CDC §4)

> **Stack recommandé :** Service Python séparé (FastAPI) consommé par le backend Node.js.

### 10.1 Infrastructure IA

| # | Action | Détail |
|---|--------|--------|
| 1 | **Créer le service Python** | `ai-service/` avec FastAPI, scikit-learn, pandas |
| 2 | **Dockerfile** | Conteneur Python séparé |
| 3 | **Communication** | Le backend Node appelle le service Python via HTTP (REST interne) |
| 4 | **Base de données** | Le service Python lit MongoDB directement OU reçoit les données via l'API Node |

### 10.2 Content-Based Filtering (CDC §4.1)

| # | Action | Détail |
|---|--------|--------|
| 1 | **Feature extraction** | Vectoriser les produits par catégorie, specs, marque, prix |
| 2 | **Similarity matrix** | Cosine similarity entre produits |
| 3 | **Endpoint** | `GET /api/ai/recommendations/similar/:productId` → 5 produits similaires |
| 4 | **Frontend** | Section "Produits similaires" sur la page détail produit |

### 10.3 Collaborative Filtering (CDC §4.2)

| # | Action | Détail |
|---|--------|--------|
| 1 | **Matrice utilisateur-produit** | Construire depuis les commandes (clientId × productId → quantité) |
| 2 | **Algorithme** | SVD ou ALS pour matrix factorization |
| 3 | **Endpoint** | `GET /api/ai/recommendations/personal/:clientId` → 10 produits recommandés |
| 4 | **Frontend** | Section "Recommandé pour vous" sur le dashboard client |

### 10.4 Hybrid Filtering (CDC §4.3)

| # | Action | Détail |
|---|--------|--------|
| 1 | **Combinaison** | Pondérer content-based (0.4) + collaborative (0.6) |
| 2 | **Cold start** | Nouveaux utilisateurs → content-based uniquement |
| 3 | **Endpoint** | `GET /api/ai/recommendations/hybrid/:clientId` → intégre les deux approches |

### 10.5 Cross-sell & Up-sell

| # | Action | Détail |
|---|--------|--------|
| 1 | **Cross-sell** | Dans le panier : "Souvent achetés ensemble" (fréquence d'achat conjointe) |
| 2 | **Up-sell** | Sur la page produit : "Version premium" (même catégorie, prix supérieur) |
| 3 | **Smart relance email** | Recommandations par email quand réapprovisionnement prédit (Phase 11) |

---

## PHASE 11 — Module IA — Avancé (CDC §5)

### 11.1 Segmentation Client K-Means (CDC §5.1)

| # | Action | Détail |
|---|--------|--------|
| 1 | **Features** | RFM (Recency, Frequency, Monetary) + rôle B2B + city |
| 2 | **Algorithme** | K-Means (k=4-6 segments) avec scikit-learn |
| 3 | **Endpoint** | `POST /api/ai/segmentation/run` → met à jour `client.segment` pour chaque client |
| 4 | **Admin UI** | Visualisation des segments (pie chart), liste clients par segment |
| 5 | **Promotions** | Utiliser les segments dans le ciblage des promotions (déjà le champ `segmentClient`) |

### 11.2 Prédiction Churn & Réapprovisionnement (CDC §5.2)

| # | Action | Détail |
|---|--------|--------|
| 1 | **Churn prediction** | Logistic regression ou Random Forest sur historique commandes |
| 2 | **Reorder prediction** | Time series (ARIMA ou Prophet) sur les intervalles de commande par produit par client |
| 3 | **Endpoints** | `GET /api/ai/predictions/churn/:clientId`, `GET /api/ai/predictions/reorder/:clientId` |
| 4 | **Admin UI** | Dashboard avec indicateurs de risque churn par client |
| 5 | **Actions automatiques** | Email de relance si churn_risk > 0.7 |

### 11.3 Chatbot NLP (CDC §5.3)

| # | Action | Détail |
|---|--------|--------|
| 1 | **Option A — LLM API** | Intégrer OpenAI / Anthropic API avec contexte produit |
| 2 | **Option B — RAG local** | Langchain + embeddings des fiches produits + LLM |
| 3 | **Endpoint** | `POST /api/ai/chat` → `{ message, sessionId }` → réponse contextualisée |
| 4 | **Frontend** | Remplacer le keyword matcher actuel dans `ChatBot.tsx` par des appels API |
| 5 | **Fonctionnalités** | Recherche produit, conseils d'utilisation, suivi commande, FAQ |

---

## PHASE 12 — Sécurité & Conformité RGPD (CDC §7)

### 12.1 Authentification & MFA

| # | Action | Détail |
|---|--------|--------|
| 1 | **MFA Admin** | Installer `speakeasy` + `qrcode`. Génération TOTP au premier login. Vérification à chaque login |
| 2 | **Token refresh** | Ajouter un refresh token (le JWT actuel expire mais n'est pas renouvelable) |
| 3 | **Cookies sécurisés** | Vérifier `httpOnly`, `secure`, `sameSite` en production |

### 12.2 Chiffrement

| # | Action | Détail |
|---|--------|--------|
| 1 | **TLS 1.3** | Configuration au niveau du reverse proxy (Nginx/Caddy) en prod |
| 2 | **Données sensibles** | Chiffrer AES-256 les données sensibles (SIRET, RIB) au repos dans MongoDB |
| 3 | **Helmet.js** | `npm install helmet` — headers de sécurité HTTP |

### 12.3 RGPD

| # | Action | Détail |
|---|--------|--------|
| 1 | **Consentement cookies** | Bannière de consentement côté client |
| 2 | **Export données** | `GET /api/clients/me/export` → JSON/CSV de toutes les données du client |
| 3 | **Suppression compte** | `DELETE /api/clients/me` → Anonymiser les commandes + supprimer le profil |
| 4 | **Audit log** | Logger toutes les actions admin (créer, modifier, supprimer) dans un modèle `AuditLog` |
| 5 | **Politique de confidentialité** | Page statique sur le frontend client |

### 12.4 Input Validation

| # | Action | Détail |
|---|--------|--------|
| 1 | **Backend** | Installer `express-validator` ou `joi` — valider tous les inputs sur chaque route |
| 2 | **Frontend** | Utiliser `react-hook-form` + `zod` (déjà installés mais non-utilisés) pour la validation des formulaires |
| 3 | **Sanitization** | Installer `express-mongo-sanitize` pour prévenir les injections NoSQL |

---

## PHASE 13 — Performance, Tests & Déploiement (CDC §9, §10, §11)

### 13.1 Performance

| # | Action | Détail |
|---|--------|--------|
| 1 | **Pagination** | Vérifier que toutes les listes utilisent la pagination (Phase 3.8) |
| 2 | **Index MongoDB** | Ajouter des index sur : `products.category`, `orders.client`, `orders.createdAt`, `clients.email`, `notifications.client` |
| 3 | **Cache** | Installer Redis pour cacher les requêtes fréquentes (catégories, settings, produits featured) |
| 4 | **Images** | Utiliser les transformations Cloudinary (resize, format webp) pour optimiser le chargement |
| 5 | **Frontend** | Lazy loading des routes (`React.lazy` + `Suspense`), image lazy loading |
| 6 | **Compression** | `npm install compression` — gzip les réponses HTTP |

### 13.2 Tests

| # | Action | Détail |
|---|--------|--------|
| 1 | **Backend — Unit tests** | Jest + Supertest pour tester chaque route |
| 2 | **Backend — Integration tests** | MongoDB Memory Server pour les tests DB |
| 3 | **Frontend — Component tests** | Vitest (déjà configuré dans `project-compass-main`) + React Testing Library |
| 4 | **E2E** | Playwright ou Cypress pour les flux critiques (login → catalogue → panier → checkout) |
| 5 | **Objectif** | > 80% couverture (comme requis par le CDC §11) |

### 13.3 Déploiement

| # | Action | Détail |
|---|--------|--------|
| 1 | **Docker** | Dockerfile backend existe déjà. Créer Dockerfiles pour admin + client. Docker Compose pour tout orchestrer |
| 2 | **Variables d'environnement** | Créer `.env.example` pour chaque composant |
| 3 | **CI/CD** | GitHub Actions : lint → test → build → deploy |
| 4 | **Backend** | Deploy sur Railway / Render / Azure App Service |
| 5 | **Frontends** | Deploy sur Vercel (setup-vercel.sh existe déjà) |
| 6 | **MongoDB** | MongoDB Atlas (déjà configuré) |
| 7 | **AI Service** | Deploy conteneur Python séparément |

### 13.4 Monitoring

| # | Action | Détail |
|---|--------|--------|
| 1 | **Health checks** | ✅ Existe déjà (`GET /` retourne status JSON) |
| 2 | **Logging** | Installer `winston` ou `morgan` pour les logs structurés |
| 3 | **Error tracking** | Sentry (frontend + backend) |
| 4 | **Uptime** | Monitoring externe (UptimeRobot / Better Uptime) |

---

## ORDRE D'EXÉCUTION RECOMMANDÉ

```
Semaine 1-2 :  Phase 1 (bugs/sécurité) + Phase 2 (modèles)
Semaine 3-4 :  Phase 3 (API) + Phase 4 (câbler admin)
Semaine 5-6 :  Phase 5 (admin manquant) + Phase 6 (câbler client)
Semaine 7-8 :  Phase 7 (client manquant) + Phase 8 (tunnel B2B)
Semaine 9-10 : Phase 9 (recherche) + Phase 12 (sécurité)
Semaine 11-13 : Phase 10 (IA recommandations) + Phase 11 (IA avancé)
Semaine 14 :  Phase 13 (tests, perf, déploiement)
```

---

## ANNEXE A — Dépendances à Installer

### Backend (`marque-blanche-ecommerce-backend-main/`)

```bash
npm install express-rate-limit helmet compression express-mongo-sanitize express-validator morgan winston
npm install speakeasy qrcode   # MFA (Phase 12)
npm install --save-dev jest supertest mongodb-memory-server
```

### AI Service (nouveau dossier `ai-service/`)

```bash
pip install fastapi uvicorn scikit-learn pandas numpy pymongo
pip install langchain openai   # Si chatbot LLM (Phase 11)
```

### Frontend Admin + Client

```bash
# Déjà installé : react-hook-form, zod, @tanstack/react-query, recharts, date-fns, embla-carousel-react
# → Ils sont là mais NON-UTILISÉS. Pas de nouvelles installations nécessaires.
npm install html2canvas jspdf  # Pour export PDF (Phase 4.4)
```

---

## ANNEXE B — Fichiers Morts à Supprimer

| Fichier | Raison |
|---------|--------|
| `config/DataBase.js` | Connexion MySQL non-utilisée |
| `package.json` → `body-parser` | Non-importé (express.json utilisé) |
| `package.json` → `mysql2` | Non-utilisé |
| `package.json` → `stripe` | Commenté (réactiver si besoin) |

---

## ANNEXE C — APIs Admin Frontend — Corrections de Routes

Le frontend admin (`src/api/index.ts`) appelle des endpoints qui ne correspondent PAS aux routes backend. Voici le mapping de corrections nécessaires :

| Frontend appelle | Backend route réelle | Action |
|------------------|---------------------|--------|
| `GET /admin/me` | `POST /admin/auth` | Modifier frontend → `POST /admin/auth` OU créer route backend `GET /admin/me` |
| `GET /admin/all` | `GET /admin/users` | Modifier frontend |
| `PUT /admin/privilege/:id` | `PUT /admin/users/:id` | Modifier frontend |
| `DELETE /admin/:id` | `DELETE /admin/users/:id` | Modifier frontend |
| `POST /products/new` | `POST /admin/product/new` | Modifier frontend → préfixer `/admin` |
| `PUT /products/:id` | `PUT /admin/product/:id` | Modifier frontend |
| `DELETE /products/:id` | `DELETE /admin/product/:id` | Modifier frontend |
| `GET /orders/admin/all` | `GET /admin/orders` | Modifier frontend |
| `PUT /orders/:id` | `PUT /admin/order/:id` | Modifier frontend |
| `DELETE /orders/:id` | `DELETE /admin/order/:id` | Modifier frontend |
| `GET /clients/all` | `GET /admin/clients` | Modifier frontend |
| `GET /clients/:id` | `GET /admin/clients/:id` | Modifier frontend |
| `DELETE /clients/:id` | `DELETE /admin/clients/:id` | Modifier frontend |

| Frontend Client | Backend route réelle | Action |
|-----------------|---------------------|--------|
| `PUT /clients/me` | `PUT /clients/profile` | Modifier frontend |
| `GET /orders/me` | `GET /orders/my-orders` | Modifier frontend |
| `POST /products/review` | `POST /products/client/reviews` | Modifier frontend |

---

*Dernière mise à jour : Généré par audit automatique du code source + analyse du Cahier des Charges IA-Medikair-Dentaire*
