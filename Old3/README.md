# Oyhana Cars

Assistant de gestion et suivi automobile pour un foyer (multi-véhicules, multi-utilisateurs) : historique d'entretien, prédiction des prochaines échéances, mini-contrôles récurrents, et un onglet prêt à recevoir les données constructeur (My DS / MyPeugeot / MyCitroën...).

**Stack** : Next.js 14 (App Router) · TypeScript · Tailwind CSS · Shadcn/UI (style, composants maison basés sur Radix) · **Appwrite Cloud** (Databases, Auth, Realtime) · Vercel.

---

## 1. Mise en route

### 1.1 Créer le projet Appwrite Cloud
1. Va sur [cloud.appwrite.io](https://cloud.appwrite.io) → crée un compte / connecte-toi → **Create project**.
2. Dans le projet, ajoute une plateforme **Web** (Settings → Platforms → Add platform → Web) avec comme "Hostname" `localhost` (pour le développement local) — tu en ajouteras une seconde avec le domaine Vercel une fois déployé.
3. Note le **Project ID** et l'**API Endpoint** affichés sur la page Overview.
4. Va dans **Overview → Integrations → API keys → Create API key**, et coche **toutes** les cases sous les sections **Databases** (databases, collections, attributes, indexes, documents — read & write), **Users** (read & write) et **Storage** (buckets, files — read & write). Copie la clé générée (elle ne sera plus jamais affichée en entier).

### 1.2 Configurer le projet en local
```bash
cp .env.local.example .env.local
# renseigne NEXT_PUBLIC_APPWRITE_ENDPOINT, NEXT_PUBLIC_APPWRITE_PROJECT_ID, APPWRITE_API_KEY
npm install
```

### 1.3 Créer la base de données et les collections
Contrairement à Supabase, il n'y a pas de simple fichier SQL à coller : le script suivant crée automatiquement la base `oyhana_cars`, les 7 collections, leurs attributs, index et permissions via l'API Appwrite.
```bash
npm run setup:appwrite
```
Patiente une trentaine de secondes après l'exécution : les attributs Appwrite mettent un court instant à passer en statut "available" avant d'être utilisables.

### 1.4 Lancer l'application
```bash
npm run dev
```
Ouvre [http://localhost:3000](http://localhost:3000) → tu es redirigé vers `/login` → crée ton compte via **"Créer un compte"**. Un foyer (avec code d'invitation) est créé automatiquement pour toi.

### 1.5 (Optionnel) Importer les données de la DS3 Crossback
```bash
# dans .env.local : SEED_USER_EMAIL=ton-email-de-compte
npm run seed:ds3
```
Crée le véhicule "DS3 Crossback" avec tout l'historique qu'on avait construit ensemble (révisions, vidanges, CT depuis 2022) et les éléments à surveiller par défaut.

### 1.6 Inviter un autre utilisateur dans le même foyer
1. L'autre utilisateur crée son propre compte via `/register` (ça lui crée un foyer vide).
2. Toi : va dans **Paramètres** → copie ton **code d'invitation**.
3. L'autre utilisateur : va dans **Paramètres** → colle le code dans "Rejoindre un autre foyer" → il/elle voit alors les mêmes véhicules que toi, mis à jour en temps réel (Appwrite Realtime) sans recharger la page.

---

## 2. Comment fonctionne le partage foyer sur Appwrite

Appwrite n'a pas d'équivalent direct des *policies* RLS de Postgres. Le modèle retenu ici :

- Chaque utilisateur a un **foyer** (document dans la collection `households`), dont l'identifiant est stocké dans ses **préférences de compte** (`user.prefs.householdId`).
- Chaque document (véhicule, intervention, règle...) reçoit, à sa création, des **permissions explicites** listant chaque membre du foyer (`Permission.read(Role.user(uid))`, etc. — voir `src/lib/appwrite/permissions.ts`). C'est l'équivalent de la policy `household_id = current_household_id()` qu'on avait en SQL, mais posée document par document plutôt que déclarée une fois pour toutes.
- Rejoindre un foyer via un code d'invitation nécessite le client **admin** (clé API), car la personne qui rejoint n'a par définition pas encore la permission de lire le document du foyer cible — c'est la seule opération du projet qui a besoin de cette clé côté runtime (le reste utilise le client de session, qui respecte les permissions comme le ferait la RLS).

Limite connue : si un foyer dépasse 2-3 membres, la liste de permissions par document grandit un peu — largement suffisant pour un usage familial, mais à garder en tête si tu envisages un foyer plus grand.

---

## 3. Déploiement (Vercel)

1. Pousse ce projet sur un repo GitHub.
2. Sur [vercel.com](https://vercel.com) → **New Project** → importe le repo.
3. Ajoute les variables d'environnement : `NEXT_PUBLIC_APPWRITE_ENDPOINT`, `NEXT_PUBLIC_APPWRITE_PROJECT_ID`, `APPWRITE_API_KEY` (`SEED_USER_EMAIL` inutile en production).
4. Deploy.
5. Retourne dans la console Appwrite → Settings → Platforms → ajoute une plateforme Web avec le domaine `*.vercel.app` (ou ton domaine final), sinon les requêtes depuis le site déployé seront bloquées par Appwrite (CORS).

---

## 4. Intégration constructeur (onglet "Constructeur")

**Il n'existe pas d'API publique officielle documentée par Stellantis** (DS/Peugeot/Citroën/Opel) permettant à une app tierce de récupérer les données de ton compte My DS. L'onglet "Constructeur" est donc livré **prêt à brancher**, mais pas connecté par défaut :

- Collections `manufacturer_integrations` et `vehicle_telemetry` déjà créées (kilométrage, niveau carburant, batterie 12V, verrouillage portes, position).
- L'onglet affiche ces données dès qu'un document existe dans `vehicle_telemetry` pour le véhicule.

Options réalistes pour alimenter ces données, par ordre de facilité :

1. **Saisie manuelle périodique** — le plus simple et 100% fiable : quand tu relèves le kilométrage dans l'app My DS, ajoute-le comme intervention "Autre" dans l'onglet Historique.
2. **Projet communautaire open-source** — [`psa_car_controller`](https://github.com/flobz/psa_car_controller) (et projets similaires) reverse-engineer l'API privée PSA/Stellantis utilisée par les apps mobiles. Fonctionnement non garanti dans le temps (API privée, peut changer sans préavis) et nécessite tes identifiants My DS. Si tu veux emprunter cette voie, il faudrait écrire une tâche planifiée (une **Appwrite Function** programmée, l'équivalent des Edge Functions Supabase) qui interroge ce service et écrit dans `vehicle_telemetry` via le SDK admin.
3. **Contact direct Stellantis / concessionnaire** — certains programmes B2B donnent accès à une API officielle, mais c'est rarement accessible à un particulier.

Je n'ai pas implémenté l'option 2 par défaut : elle repose sur une API non documentée et non garantie, potentiellement contraire aux conditions d'utilisation de l'app constructeur. À toi de voir si tu veux prendre ce risque en connaissance de cause.

---

## 5. Structure du projet

```
src/
  app/
    (auth)/login, register        → pages publiques
    (app)/dashboard                → liste des véhicules du foyer
    (app)/vehicules/nouveau        → formulaire d'ajout de véhicule
    (app)/vehicules/[vehicleId]    → page véhicule (onglets)
    (app)/parametres               → code d'invitation du foyer
  actions/                         → server actions (auth, vehicles, entries, rules, minichecks, household)
  components/                      → composants UI (dont ui/ = primitives type Shadcn)
  lib/maintenance/                 → logique de calcul des échéances (compute.ts) + règles par défaut
  lib/appwrite/
    config.ts                      → endpoint, project id, noms des collections
    server.ts                      → client de session (respecte les permissions) + client admin (clé API)
    client.ts                      → client navigateur (Realtime uniquement)
    types.ts / mappers.ts          → types du domaine + conversion documents Appwrite → types internes
    permissions.ts                 → construction des permissions par foyer
    household.ts                   → contexte foyer de l'utilisateur connecté
scripts/
  setup-appwrite.ts                → création base + collections + attributs + permissions
  seed-ds3.ts                      → import des données réelles de la DS3
```

## 6. Points de vigilance avant mise en production

- **La synchronisation temps réel** (`components/realtime-refresher.tsx`) s'appuie sur l'API Realtime d'Appwrite, qui évolue régulièrement. Si elle ne se déclenche pas chez toi, vérifie la doc Appwrite à jour (canaux d'écoute, format des évènements) — le reste de l'app fonctionne normalement sans elle, il faut juste recharger la page manuellement.
- **`APPWRITE_API_KEY`** ne doit jamais être exposée au navigateur : elle n'est utilisée que dans `src/lib/appwrite/server.ts` (`createAdminClient`), les server actions, et les scripts `scripts/*.ts`, jamais dans un composant `"use client"`.
- Le script `setup:appwrite` est ré-exécutable sans risque (il ignore les éléments déjà existants), pratique si tu ajoutes de nouveaux attributs plus tard.

## 7. Fonctionnalités ajoutées

### Fiche véhicule enrichie (carte grise)
Onglet **Réglages** → carte "Informations du véhicule" → bouton "Modifier". Couvre immatriculation (A), VIN (E), puissance fiscale en CV (P.6), catégorie (J) et classe CO2 (V.7), en plus des infos déjà présentes (marque, modèle, motorisation, énergie, boîte, mise en circulation). Volontairement exclus : puissance en kW, cotitulaire(s) (redondant avec les membres du foyer), PTAC/poids à vide.

### Thème clair / sombre
Bouton soleil/lune dans la barre de navigation (à côté de l'icône Paramètres). Sombre par défaut (identique à l'apparence d'origine) ; le choix est mémorisé automatiquement par le navigateur. Certains éléments très spécifiques (couleurs des graphiques, affichage type "compteur LCD" du kilométrage) restent volontairement sombres dans les deux thèmes pour un rendu cohérent façon tableau de bord.

### Supprimer un véhicule
Onglet **Réglages** de la page du véhicule → section "Zone dangereuse". Supprime en cascade l'historique, les règles, les mini-contrôles, les pleins, l'intégration constructeur et les photos associées — aucune trace orpheline en base.

### Activer/désactiver l'onglet Constructeur
Même onglet **Réglages** → interrupteur "Onglet Constructeur". Une fois désactivé, l'onglet disparaît de la navigation du véhicule (pratique si tu n'as pas de compte My DS pour un véhicule donné).

### Photos (jusqu'à 5 par véhicule)
Onglet **Réglages** → section Photos. Stockées dans le bucket Appwrite Storage `vehicle_photos` (créé automatiquement par `npm run setup:appwrite`). Écriture/suppression réservées aux membres du foyer ; lecture volontairement publique par lien direct (photos peu sensibles) pour permettre un affichage simple sans dispositif d'authentification côté navigateur.

### Graphique d'évolution du kilométrage
Visible en haut de l'onglet **Vue d'ensemble**, sous les cadrans d'échéances — se construit automatiquement à partir de l'historique existant (apparaît dès 2 interventions).

### Onglet Carburant
Suivi des pleins (date, kilométrage, litres, prix), avec :
- Statistiques : total dépensé, prix moyen au litre, consommation moyenne (L/100km, calculée entre pleins complets consécutifs — coche "Plein complet" pour que ce calcul soit fiable).
- Graphique des dépenses par période, avec sélecteur Semaine / Mois / Année.

### Export PDF du carnet
Bouton "Export PDF" en haut de la page du véhicule (à côté du nom). Génère un PDF téléchargeable avec l'historique complet, généré à la volée côté serveur (`src/app/api/export/[vehicleId]/route.ts`, librairie `pdf-lib`) — rien à configurer.

### Notifications email des échéances (Appwrite Function)
Contrairement aux fonctionnalités précédentes, celle-ci **n'est pas active par défaut** : c'est un scaffold prêt à déployer dans `functions/check-due-maintenance/`, car elle nécessite une configuration propre à ton compte Appwrite (provider email). Pour l'activer :

1. Console Appwrite → **Messaging → Providers** → configure un provider Email (ex: SMTP, Mailgun, Resend...).
2. Console Appwrite → **Functions → Create function** → runtime Node.js 18+ → déploie le dossier `functions/check-due-maintenance/` (via CLI `appwrite push functions` ou upload manuel du dossier zippé).
3. Dans les réglages de la fonction, ajoute la variable d'environnement `APPWRITE_API_KEY` (une clé avec les scopes `databases.read`, `users.read`, `messaging.write` — distincte de celle du `.env.local`, à créer spécifiquement pour la fonction).
4. Définis une programmation (Schedule), ex. `0 8 * * *` pour un envoi quotidien à 8h.

La fonction calcule elle-même les échéances "bientôt"/"dépassé" pour chaque véhicule (copie autonome de la logique de `compute.ts`, car une Appwrite Function est déployée indépendamment de l'app Next.js) et envoie un email récapitulatif à chaque membre du foyer concerné. Limite connue documentée dans le fichier lui-même : pas de déduplication entre exécutions (renvoie le résumé tant qu'un élément reste "bientôt/dépassé").

## 8. Idées d'évolutions restantes

- Notifications push (en plus de l'email) via un second provider Messaging.
- Rappel budget (coût moyen d'entretien par an) — éventuellement croisé avec Oyhana Budget.
- Déduplication des notifications email (ne prévenir qu'au changement de statut, pas à chaque exécution).
- Export PDF plus riche (mise en page façon carnet officiel, logo, tableau au lieu de texte brut).
