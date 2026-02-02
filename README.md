# JobFeed - LinkedIn Job Aggregator

## 📋 Installation locale

### 1. Installer les dépendances

```bash
npm install
```

### 2. Lancer le serveur de développement

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

---

## 🚀 Déploiement sur Vercel

### Méthode 1 : Déploiement automatique depuis GitHub

#### Étape 1 : Pousser le code sur GitHub

```bash
# Initialiser Git (si ce n'est pas déjà fait)
git init

# Ajouter tous les fichiers
git add .

# Créer le premier commit
git commit -m "Initial commit - JobFeed dashboard"

# Ajouter le remote (remplacez par votre repo)
git remote add origin https://github.com/adeal2015/jobfeed-clean.git

# Pousser sur GitHub
git push -u origin main
```

#### Étape 2 : Connecter à Vercel

1. Allez sur [vercel.com](https://vercel.com)
2. Cliquez sur **"Add New Project"**
3. Sélectionnez votre repo GitHub **jobfeed-clean**
4. Cliquez sur **"Import"**
5. Vercel détectera automatiquement Next.js
6. Cliquez sur **"Deploy"**

✅ Votre site sera en ligne en 2-3 minutes !

### Méthode 2 : Déploiement via CLI Vercel

```bash
# Installer Vercel CLI
npm install -g vercel

# Se connecter
vercel login

# Déployer
vercel

# Déploiement en production
vercel --prod
```

---

## 🔧 Configuration Supabase

Les clés Supabase sont déjà configurées dans `src/lib/supabase.ts` :

```typescript
const supabaseUrl = 'https://xrswuoiwpyqihqddwrue.supabase.co'
const supabaseAnonKey = 'eyJhbGciOi...' // Votre clé
```

### Si vous voulez utiliser des variables d'environnement (recommandé en production)

Créez un fichier `.env.local` :

```env
NEXT_PUBLIC_SUPABASE_URL=https://xrswuoiwpyqihqddwrue.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Et ajoutez ces variables dans Vercel :
1. Project Settings → Environment Variables
2. Ajoutez `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 📂 Structure du projet

```
jobfeed-nextjs/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Landing page (/)
│   │   ├── dashboard/
│   │   │   └── page.tsx          # Dashboard (/dashboard)
│   │   ├── layout.tsx            # Layout global
│   │   └── globals.css           # Styles globaux
│   └── lib/
│       └── supabase.ts           # Configuration Supabase
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── next.config.js
```

---

## 🎨 Pages disponibles

- **/** : Landing page avec présentation
- **/dashboard** : Dashboard avec les opportunités (thème sombre)

---

## 🔗 Liens utiles

- **Supabase Dashboard** : https://supabase.com/dashboard/project/xrswuoiwpyqihqddwrue
- **Vercel Dashboard** : https://vercel.com/dashboard
- **GitHub Repo** : https://github.com/adeal2015/jobfeed-clean

---

## 🐛 Troubleshooting

### Erreur : "Module not found"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Dashboard vide
Vérifiez que :
- Les données existent dans Supabase (table `opportunities`)
- Le `user_id` est correct : `4c5e0492-c8b2-43d7-ab33-42c05655ec34`

### Build error sur Vercel
Vérifiez que toutes les dépendances sont dans `package.json`

---

## ✅ Checklist avant déploiement

- [ ] Code poussé sur GitHub
- [ ] Projet importé dans Vercel
- [ ] Variables d'environnement configurées (optionnel)
- [ ] Build réussi
- [ ] Dashboard accessible à /dashboard
- [ ] Données Supabase affichées
Version: 2.0 - Dashboard amélioré déployé le 30 janvier 2026
- [ ] 

---

**Projet créé le** : 13 janvier 2026
**Version** : 1.0.0

Version: 2.0 - Dashboard amélioré - Déployé le 02/02/2026
Version: 2.0 - Dashboard amélioré - Déployé le 03/02/2026 à 19h
