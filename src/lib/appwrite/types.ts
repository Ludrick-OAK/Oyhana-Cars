export type EntryType = "revision" | "vidange" | "ct" | "achat" | "autre";

// Les documents Appwrite exposent $id, $createdAt, etc. Pour garder le reste du
// code (compute.ts, composants) inchangé, on mappe systématiquement $id -> id
// à la lecture (voir mappers.ts).

export interface Household {
  id: string;
  name: string;
  inviteCode: string;
  memberIds: string[];
}

export interface Vehicle {
  id: string;
  householdId: string;
  name: string;
  brand: string | null;
  model: string | null;
  engine: string | null;
  powerHp: number | null;
  fuelType: string | null;
  transmission: string | null;
  gears: number | null;
  firstRegistration: string | null;
  purchaseDate: string | null;
  photoFileIds: string[];
  manufacturerEnabled: boolean;
}

export interface MaintenanceEntry {
  id: string;
  vehicleId: string;
  date: string;
  km: number;
  type: EntryType;
  title: string;
  items: string[];
  note: string | null;
  createdBy: string | null;
}

export interface MaintenanceRule {
  id: string;
  vehicleId: string;
  key: string;
  label: string;
  match: string[] | null;
  matchType: EntryType | null;
  onlyReplacement: boolean;
  intervalKm: number | null;
  intervalMonths: number | null;
  isDefault: boolean;
}

export interface MiniCheck {
  id: string;
  vehicleId: string;
  label: string;
  intervalDays: number;
  lastDone: string | null;
  lastDoneBy: string | null;
}

export interface ManufacturerIntegration {
  id: string;
  vehicleId: string;
  provider: string;
  externalVehicleId: string | null;
  status: "disconnected" | "connected" | "error";
  lastSyncAt: string | null;
  lastError: string | null;
}

export interface VehicleTelemetry {
  id: string;
  vehicleId: string;
  odometerKm: number | null;
  fuelLevelPct: number | null;
  batteryLevelPct: number | null;
  doorsLocked: boolean | null;
  latitude: number | null;
  longitude: number | null;
  syncedAt: string;
}

export interface FuelLog {
  id: string;
  vehicleId: string;
  date: string;
  km: number;
  liters: number;
  totalPrice: number;
  fullTank: boolean;
}
