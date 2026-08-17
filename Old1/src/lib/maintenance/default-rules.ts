import type { MaintenanceRule } from "@/lib/appwrite/types";

type DefaultRule = Omit<MaintenanceRule, "id" | "vehicleId">;

export const DEFAULT_RULES: DefaultRule[] = [
  { key: "vidange", label: "Vidange — huile moteur", match: ["huile moteur"], matchType: null, onlyReplacement: false, intervalKm: 20000, intervalMonths: 12, isDefault: true },
  { key: "filtre_huile", label: "Filtre à huile", match: ["filtre à huile", "filtre huile"], matchType: null, onlyReplacement: false, intervalKm: 20000, intervalMonths: 12, isDefault: true },
  { key: "filtre_air", label: "Filtre à air", match: ["filtre à air"], matchType: null, onlyReplacement: false, intervalKm: 20000, intervalMonths: 12, isDefault: true },
  { key: "filtre_habitacle", label: "Filtre habitacle / pollen", match: ["filtre habitacle", "filtre à pollen", "filtre pollen"], matchType: null, onlyReplacement: false, intervalKm: 15000, intervalMonths: 12, isDefault: true },
  { key: "bougies", label: "Bougies d'allumage", match: ["bougies d'allumage", "bougie d'allumage"], matchType: null, onlyReplacement: false, intervalKm: 40000, intervalMonths: 24, isDefault: true },
  { key: "frein", label: "Liquide de frein", match: ["liquide de frein"], matchType: null, onlyReplacement: true, intervalKm: 40000, intervalMonths: 24, isDefault: true },
  { key: "refroidissement", label: "Liquide de refroidissement", match: ["liquide de refroidissement"], matchType: null, onlyReplacement: true, intervalKm: 100000, intervalMonths: 60, isDefault: true },
  { key: "distribution", label: "Kit distribution", match: ["kit de distribution", "distribution"], matchType: null, onlyReplacement: false, intervalKm: 160000, intervalMonths: 120, isDefault: true },
  { key: "pneus_avant", label: "Pneus avant (2)", match: ["pneus avant", "pneu avant"], matchType: null, onlyReplacement: true, intervalKm: 45000, intervalMonths: 60, isDefault: true },
  { key: "pneus_arriere", label: "Pneus arrière (2)", match: ["pneus arrière", "pneu arrière"], matchType: null, onlyReplacement: true, intervalKm: 45000, intervalMonths: 60, isDefault: true },
  { key: "freins_avant", label: "Plaquettes et disques — avant", match: ["plaquette avant", "disque avant", "disques avant", "frein avant"], matchType: null, onlyReplacement: false, intervalKm: 30000, intervalMonths: 36, isDefault: true },
  { key: "freins_arriere", label: "Plaquettes et disques — arrière", match: ["plaquette arrière", "disque arrière", "disques arrière", "frein arrière"], matchType: null, onlyReplacement: false, intervalKm: 40000, intervalMonths: 48, isDefault: true },
  { key: "filtre_carburant", label: "Filtre à carburant", match: ["filtre à carburant", "filtre carburant"], matchType: null, onlyReplacement: false, intervalKm: 60000, intervalMonths: 48, isDefault: true },
  { key: "essuie_glace", label: "Balais d'essuie-glace", match: ["essuie-glace", "essuie glace", "balais"], matchType: null, onlyReplacement: false, intervalKm: null, intervalMonths: 18, isDefault: true },
  { key: "batterie_12v", label: "Batterie 12V", match: ["batterie"], matchType: null, onlyReplacement: true, intervalKm: null, intervalMonths: 60, isDefault: true },
  { key: "boite_vitesses", label: "Vidange boîte de vitesses", match: ["boîte de vitesses", "boite de vitesses"], matchType: null, onlyReplacement: false, intervalKm: 60000, intervalMonths: 60, isDefault: true },
  { key: "courroie_accessoires", label: "Courroie d'accessoires", match: ["courroie d'accessoires", "courroie accessoire", "courroie accessoires"], matchType: null, onlyReplacement: false, intervalKm: 80000, intervalMonths: 96, isDefault: true },
  { key: "climatisation", label: "Entretien / recharge climatisation", match: ["climatisation", "clim"], matchType: null, onlyReplacement: false, intervalKm: null, intervalMonths: 24, isDefault: true },
  { key: "ct", label: "Contrôle technique", match: null, matchType: "ct", onlyReplacement: false, intervalKm: null, intervalMonths: 24, isDefault: true },
  { key: "revision", label: "Révision générale", match: null, matchType: "revision", onlyReplacement: false, intervalKm: 20000, intervalMonths: 12, isDefault: true },
];

export const DEFAULT_MINICHECKS = [
  { label: "Pression des 4 pneus", intervalDays: 60 },
  { label: "Niveaux (huile, lave-glace, liquide de frein)", intervalDays: 60 },
  { label: "État des essuie-glaces", intervalDays: 60 },
  { label: "Éclairage (feux, clignotants, stop)", intervalDays: 60 },
  { label: "Roue de secours / kit anti-crevaison", intervalDays: 60 },
];
