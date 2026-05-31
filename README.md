# Suivi de révision du Coran

Application web pour suivre la révision quotidienne et la progression
d'apprentissage du Coran. Elle est utilisée par **un professeur** (rôle `prof`,
espace admin) et **des élèves** (rôle `eleve`).

- Chaque élève logue chaque jour ce qu'il a révisé (de telle sourate à telle
  sourate). Un jour avec au moins une révision est **vert**, un jour passé sans
  révision est **rouge**.
- Chaque élève coche les sourates qu'il connaît ; l'app calcule sa progression
  (% pondéré par versets, juz acquis, sourates connues).
- Le professeur dispose d'un espace admin en lecture seule où il voit la
  progression et l'assiduité de chaque élève.

L'interface est intégralement en **français**.

## Stack

- Vite + React + TypeScript
- Tailwind CSS (v4)
- React Router (routes protégées par rôle)
- Supabase : Auth (email + mot de passe) + Postgres + RLS

## 1. Installation

```bash
npm install
```

## 2. Variables d'environnement

Crée un fichier `.env` à la racine (jamais commité — voir `.env.example`) :

```
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

Ces deux valeurs se trouvent dans ton projet Supabase :
**Settings → API** (Project URL et clé `anon` / `public`).

## 3. Appliquer la migration

La base se résume à **3 tables** (`profiles`, `daily_logs`, `learning_state`),
un trigger de création de profil, et les policies RLS.

**Option A — Éditeur SQL Supabase (le plus simple)**
Ouvre **SQL Editor** dans le dashboard Supabase, colle le contenu de
[`supabase/migrations/001_init.sql`](supabase/migrations/001_init.sql),
puis exécute.

**Option B — Supabase CLI**

```bash
supabase db push
```

## 4. Promouvoir le professeur

Tous les nouveaux comptes sont créés avec le rôle `eleve` par défaut (via le
trigger). Pour désigner le professeur, **inscris d'abord son compte** via la
page `/signup`, puis exécute **une seule fois** dans l'éditeur SQL Supabase :

```sql
update profiles set role = 'prof' where id = '<uuid_du_prof>';
```

Tu trouves l'UUID dans **Authentication → Users**, ou via :

```sql
select id, full_name, role from profiles order by created_at;
```

Après reconnexion, ce compte arrive directement sur l'espace admin (`/admin`).

## 5. Lancer en développement

```bash
npm run dev
```

L'app démarre sur l'URL indiquée par Vite (par défaut http://localhost:5173).

## 6. Build de production

```bash
npm run build
npm run preview
```

## Rôles et accès

- **Non connecté** → redirigé vers `/login`.
- **`eleve`** → espace élève : `/` (révision), `/progression`.
- **`prof`** → espace admin : `/admin`, `/admin/eleve/:id`. La racine `/` le
  redirige vers `/admin`.

Les policies RLS (`is_prof()`) garantissent qu'un élève ne voit que ses propres
données, tandis que le professeur peut lire celles de tous les élèves (lecture
seule : il ne peut rien écrire dans les données d'un élève).

## Structure

```
src/
  components/   Composants partagés (layout, calendrier, anneau…)
  data/         Constantes du Coran (noms, versets, juz) — quran.ts
  lib/          supabase.ts, types.ts, progress.ts, dates.ts, AuthContext
  pages/        Pages (login, signup, révision, progression, admin…)
supabase/
  migrations/   001_init.sql
```
