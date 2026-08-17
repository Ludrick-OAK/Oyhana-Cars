/**
 * Appwrite Function programmée (ex: tous les jours à 8h — cron "0 8 * * *").
 * Parcourt tous les véhicules, calcule les échéances "bientôt"/"dépassé"
 * (copie volontairement autonome de la logique de src/lib/maintenance/compute.ts,
 * car les Appwrite Functions sont déployées indépendamment de l'app Next.js)
 * et envoie un email récapitulatif à chaque membre du foyer concerné via
 * Appwrite Messaging.
 *
 * Pré-requis avant déploiement (voir README du projet, section Notifications) :
 *  - Un provider Email configuré dans Appwrite > Messaging > Providers
 *  - La fonction déployée avec la variable d'environnement APPWRITE_API_KEY
 *    (scopes : databases.read, users.read, messaging.write)
 *  - Une programmation (schedule) définie dans les réglages de la fonction
 *
 * Limite connue : envoie un résumé à CHAQUE exécution tant qu'un élément est
 * "bientôt/dépassé" (pas de déduplication "déjà notifié hier"). À améliorer
 * en stockant un timestamp de dernière notification par règle si le volume
 * d'emails devient gênant.
 */
const { Client, Databases, Users, Messaging, Query } = require("node-appwrite");

const DATABASE_ID = "oyhana_cars";
const COLLECTIONS = {
  households: "households", vehicles: "vehicles", entries: "maintenance_entries", rules: "maintenance_rules",
};

function addMonths(date, months) { const d = new Date(date); d.setMonth(d.getMonth() + months); return d; }
function daysBetween(a, b) { return Math.round((+b - +a) / 86400000); }

function computeStats(entries) {
  if (entries.length === 0) return null;
  const sorted = [...entries].sort((a, b) => +new Date(a.date) - +new Date(b.date));
  const first = sorted[0], last = sorted[sorted.length - 1];
  const totalMonths = Math.max(1, (+new Date(last.date) - +new Date(first.date)) / (30.44 * 86400000));
  const kmPerMonth = (last.km - first.km) / totalMonths;
  return { last, kmPerMonth };
}

function findLastMatch(rule, entries) {
  const sorted = [...entries].sort((a, b) => +new Date(b.date) - +new Date(a.date));
  for (const e of sorted) {
    if (rule.matchType) { if (e.type === rule.matchType) return e; continue; }
    for (const item of e.items || []) {
      const low = item.toLowerCase();
      if ((rule.match || []).some((k) => low.includes(k))) {
        if (rule.onlyReplacement && low.includes("appoint")) continue;
        return e;
      }
    }
  }
  return null;
}

function computeDueStatus(rule, entries, stats, today) {
  const last = findLastMatch(rule, entries);
  if (!last) return null;
  const lastDate = new Date(last.date);
  const dueDateByTime = rule.intervalMonths ? addMonths(lastDate, rule.intervalMonths) : null;
  const dueKm = rule.intervalKm ? last.km + rule.intervalKm : null;
  let dueDateByKm = null;
  if (dueKm !== null && stats.kmPerMonth > 0) {
    dueDateByKm = addMonths(new Date(stats.last.date), (dueKm - stats.last.km) / stats.kmPerMonth);
  }
  const dueDate = dueDateByTime && dueDateByKm ? (dueDateByTime < dueDateByKm ? dueDateByTime : dueDateByKm) : (dueDateByTime || dueDateByKm);
  if (!dueDate) return null;
  const daysRemaining = daysBetween(today, dueDate);
  const kmRemaining = dueKm !== null ? Math.round(dueKm - stats.last.km) : null;
  let status = "ok";
  if (daysRemaining <= 0 || (kmRemaining !== null && kmRemaining <= 0)) status = "overdue";
  else if (daysRemaining <= 60 || (kmRemaining !== null && kmRemaining <= 2000)) status = "soon";
  return { status, dueDate, daysRemaining };
}

module.exports = async ({ req, res, log, error }) => {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT || "https://cloud.appwrite.io/v1")
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  const databases = new Databases(client);
  const users = new Users(client);
  const messaging = new Messaging(client);
  const today = new Date();

  const vehiclesRes = await databases.listDocuments(DATABASE_ID, COLLECTIONS.vehicles, [Query.limit(200)]);

  for (const vehicle of vehiclesRes.documents) {
    const [entriesRes, rulesRes] = await Promise.all([
      databases.listDocuments(DATABASE_ID, COLLECTIONS.entries, [Query.equal("vehicleId", vehicle.$id), Query.limit(500)]),
      databases.listDocuments(DATABASE_ID, COLLECTIONS.rules, [Query.equal("vehicleId", vehicle.$id), Query.limit(200)]),
    ]);
    const entries = entriesRes.documents;
    const stats = computeStats(entries);
    if (!stats) continue;

    const dueItems = [];
    for (const rule of rulesRes.documents) {
      const due = computeDueStatus(rule, entries, stats, today);
      if (due && (due.status === "soon" || due.status === "overdue")) {
        dueItems.push({ label: rule.label, status: due.status, dueDate: due.dueDate });
      }
    }
    if (dueItems.length === 0) continue;

    const household = await databases.getDocument(DATABASE_ID, COLLECTIONS.households, vehicle.householdId);
    const memberIds = household.memberIds || [];

    const lines = dueItems
      .map((d) => `- ${d.label} : ${d.status === "overdue" ? "dépassé" : "bientôt"} (échéance ${d.dueDate.toLocaleDateString("fr-FR")})`)
      .join("\n");
    const subject = `Oyhana Cars — ${dueItems.length} échéance(s) sur ${vehicle.name}`;
    const content = `Bonjour,\n\nVoici les échéances à surveiller pour votre ${vehicle.name} :\n\n${lines}\n\n— Oyhana Cars`;

    try {
      await messaging.createEmail(
        `due-${vehicle.$id}-${today.toISOString().slice(0, 10)}`,
        subject,
        content,
        [],            // topics
        [],            // users (IDs) — voir note ci-dessous
        memberIds      // targets : dans la plupart des cas, un target email par utilisateur suffit
      );
      log(`Email envoyé pour ${vehicle.name} (${dueItems.length} échéance(s))`);
    } catch (e) {
      error(`Échec d'envoi pour ${vehicle.name}: ${e.message}`);
    }
  }

  return res.json({ ok: true });
};
