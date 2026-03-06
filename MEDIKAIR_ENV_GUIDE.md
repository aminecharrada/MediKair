# MediKair - Guide de Configuration Environnement

## Structure du Projet

```
MediKair/
├── marque-blanche-ecommerce-backend-main/   # API Backend (Node.js + Express + MongoDB)
├── medikair-client/                          # Frontend Client (React + Vite, port 3000)
├── medikair-admin/                           # Frontend Admin (React + Vite, port 3001)
└── medikair front /                          # Source originale (ne pas modifier)
```

---

## 1. Backend (`marque-blanche-ecommerce-backend-main/.env`)

Créer un fichier `.env` à la racine du dossier backend avec :

```env
# ─── Base de données MongoDB ───
MONGO_URI=mongodb+srv://<USER>:<PASSWORD>@<CLUSTER>.mongodb.net/medikair?retryWrites=true&w=majority

# ─── JWT ───
JWT_SECRET=<votre_clé_secrète_jwt_unique>
JWT_EXPIRE=7d
COOKIE_EXPIRE=7

# ─── Cloudinary (stockage images produits) ───
CLOUDINARY_NAME=<votre_cloud_name>
CLOUDINARY_API_KEY=<votre_api_key>
CLOUDINARY_API_SECRET=<votre_api_secret>

# ─── Serveur ───
PORT=5000

# ─── CORS - URLs des frontends ───
FRONTEND_URL=http://localhost:3000
ADMIN_URL=http://localhost:3001

# ─── Stripe (optionnel - paiement en ligne) ───
# STRIPE_SECRET_KEY=sk_test_...
# STRIPE_API_KEY=pk_test_...
```

### Où trouver ces valeurs ?

| Variable | Source |
|----------|--------|
| `MONGO_URI` | [MongoDB Atlas](https://cloud.mongodb.com) → Créer un cluster gratuit → Database Access → Connect |
| `JWT_SECRET` | Générer avec `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `CLOUDINARY_*` | [Cloudinary](https://cloudinary.com) → Dashboard → Account Details |

---

## 2. Frontend Client (`medikair-client/.env`)

```env
VITE_API_URL=http://localhost:5000/api
```

En production :
```env
VITE_API_URL=https://votre-api.herokuapp.com/api
```

---

## 3. Frontend Admin (`medikair-admin/.env`)

```env
VITE_API_URL=http://localhost:5000/api
```

En production :
```env
VITE_API_URL=https://votre-api.herokuapp.com/api
```

---

## Démarrage du Projet

### 1. Backend
```bash
cd marque-blanche-ecommerce-backend-main
npm install
npm run dev    # ou: node server.js
```
Le serveur démarre sur `http://localhost:5000`

### 2. Frontend Client
```bash
cd medikair-client
npm install
npm run dev
```
Accessible sur `http://localhost:3000`

### 3. Frontend Admin
```bash
cd medikair-admin
npm install
npm run dev
```
Accessible sur `http://localhost:3001`

---

## Créer un Admin Initial

Utiliser un outil comme Postman ou curl :

```bash
# D'abord, créer un admin "super" directement en base
# Ou utiliser le endpoint (nécessite un admin super existant) :
curl -X POST http://localhost:5000/api/admin/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <SUPER_ADMIN_TOKEN>" \
  -d '{
    "name": "Admin MediKair",
    "email": "admin@medikair.com",
    "password": "MonMotDePasse123",
    "privilege": "super"
  }'
```

Pour le premier admin, vous pouvez l'insérer directement en MongoDB :
```javascript
// Dans MongoDB Shell ou Compass
use medikair
db.admins.insertOne({
  name: "Admin MediKair",
  email: "admin@medikair.com",
  password: "$2a$10$...",  // Hash bcrypt du mot de passe
  privilege: "super"
})
```

Ou créer un script seed :
```bash
cd marque-blanche-ecommerce-backend-main
node -e "
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGO_URI).then(async () => {
  const Admin = require('./models/adminModel');
  const hash = await bcrypt.hash('Admin123!', 10);
  await Admin.create({ name: 'Admin MediKair', email: 'admin@medikair.com', password: hash, privilege: 'super' });
  console.log('Admin créé !');
  process.exit(0);
}).catch(e => { console.error(e); process.exit(1); });
"
```

---

## Différences avec le Projet Darista

| Élément | Darista (ancien) | MediKair (nouveau) |
|---------|------------------|-------------------|
| Base de données | Même MONGO_URI | **Nouveau** MONGO_URI dédié |
| JWT_SECRET | Même valeur | **Nouveau** secret unique |
| Cloudinary | Dossier `tomper-wear` | Dossier `medikair` |
| FRONTEND_URL | Darista frontend | `http://localhost:3000` |
| ADMIN_URL | Darista admin | `http://localhost:3001` |
| Modèles | Admin seul | Admin + **Client** (nouveau) |
| Produits | colors, sizes, ShopName | brand, subcategory, **specs**, badge, inStock |
| Commandes | user: {name, email} | **client** (ref ObjectId) |
| Routes ajoutées | — | `/api/clients`, `/api/promotions`, `/api/reports` |

---

## API Endpoints

### Authentification Client
- `POST /api/clients/register` - Inscription client
- `POST /api/clients/login` - Connexion client  
- `GET /api/clients/logout` - Déconnexion
- `GET /api/clients/me` - Profil (auth requise)
- `PUT /api/clients/profile` - Mise à jour profil

### Authentification Admin
- `POST /api/admin/login` - Connexion admin
- `GET /api/admin/logout` - Déconnexion
- `POST /api/admin/auth` - Vérification session

### Produits
- `GET /api/products` - Tous les produits (public)
- `GET /api/products/:id` - Détail produit
- `POST /api/admin/product/new` - Créer (admin)
- `PUT /api/admin/product/:id` - Modifier (admin)
- `DELETE /api/admin/product/:id` - Supprimer (admin)

### Commandes
- `POST /api/orders/new` - Créer commande (client auth)
- `GET /api/orders/my-orders` - Mes commandes (client auth)
- `GET /api/orders/:id` - Détail commande
- `GET /api/admin/orders` - Toutes (admin)
- `PUT /api/admin/order/:id` - Mettre à jour statut (admin)
- `DELETE /api/admin/order/:id` - Supprimer (admin)

### Clients (Admin)
- `GET /api/admin/clients` - Liste clients
- `GET /api/admin/clients/:id` - Détail client
- `DELETE /api/admin/clients/:id` - Supprimer client

### Promotions
- `GET /api/promotions/active` - Promotions actives (public)
- `GET /api/promotions` - Toutes (admin)
- `POST /api/promotions` - Créer (admin)
- `PUT /api/promotions/:id` - Modifier (admin)
- `PUT /api/promotions/:id/toggle` - Activer/désactiver (admin)
- `DELETE /api/promotions/:id` - Supprimer (admin)

### Rapports (Admin)
- `GET /api/reports/dashboard` - Stats dashboard
- `GET /api/reports/revenue?year=2026` - Revenus mensuels
- `GET /api/reports/top-products?limit=5` - Top produits
- `GET /api/reports/categories` - Distribution catégories

### Catégories
- `GET /api/categories` - Liste catégories
- `POST /api/categories` - Créer (admin)

### Autres
- `POST /api/upload` - Upload image (admin)
- `GET /api/hero-images` - Images hero
- `GET /api/platform-reviews` - Avis plateforme
- `GET /api/settings` - Paramètres site
