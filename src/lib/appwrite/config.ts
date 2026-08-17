// Identifiants Appwrite — publics par nature (aucun secret ici).
export const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
export const APPWRITE_PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;

export const DATABASE_ID = "oyhana_cars";

export const COLLECTIONS = {
  households: "households",
  vehicles: "vehicles",
  entries: "maintenance_entries",
  rules: "maintenance_rules",
  minichecks: "mini_checks",
  integrations: "manufacturer_integrations",
  telemetry: "vehicle_telemetry",
  fuelLogs: "fuel_logs",
} as const;

export const PHOTOS_BUCKET_ID = "vehicle_photos";
export const MAX_PHOTOS_PER_VEHICLE = 5;

export const SESSION_COOKIE = "oyhana-session";
