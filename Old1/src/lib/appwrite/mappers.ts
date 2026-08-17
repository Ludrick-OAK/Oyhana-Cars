import type { Models } from "node-appwrite";
import type {
  Household, Vehicle, MaintenanceEntry, MaintenanceRule,
  MiniCheck, ManufacturerIntegration, VehicleTelemetry, FuelLog,
} from "./types";

type Doc = Models.Document;

export const mapHousehold = (d: Doc): Household => ({
  id: d.$id, name: d.name, inviteCode: d.inviteCode, memberIds: d.memberIds || [],
});

export const mapVehicle = (d: Doc): Vehicle => ({
  id: d.$id, householdId: d.householdId, name: d.name, brand: d.brand ?? null,
  model: d.model ?? null, engine: d.engine ?? null, powerHp: d.powerHp ?? null,
  fuelType: d.fuelType ?? null, transmission: d.transmission ?? null, gears: d.gears ?? null,
  firstRegistration: d.firstRegistration ?? null, purchaseDate: d.purchaseDate ?? null,
  photoFileIds: d.photoFileIds || [],
  manufacturerEnabled: d.manufacturerEnabled ?? true,
});

export const mapEntry = (d: Doc): MaintenanceEntry => ({
  id: d.$id, vehicleId: d.vehicleId, date: d.date, km: d.km, type: d.type,
  title: d.title, items: d.items || [], note: d.note ?? null, createdBy: d.createdBy ?? null,
});

export const mapRule = (d: Doc): MaintenanceRule => ({
  id: d.$id, vehicleId: d.vehicleId, key: d.key, label: d.label,
  match: d.match ?? null, matchType: d.matchType ?? null,
  onlyReplacement: !!d.onlyReplacement, intervalKm: d.intervalKm ?? null,
  intervalMonths: d.intervalMonths ?? null, isDefault: !!d.isDefault,
});

export const mapMiniCheck = (d: Doc): MiniCheck => ({
  id: d.$id, vehicleId: d.vehicleId, label: d.label, intervalDays: d.intervalDays,
  lastDone: d.lastDone ?? null, lastDoneBy: d.lastDoneBy ?? null,
});

export const mapIntegration = (d: Doc): ManufacturerIntegration => ({
  id: d.$id, vehicleId: d.vehicleId, provider: d.provider,
  externalVehicleId: d.externalVehicleId ?? null, status: d.status,
  lastSyncAt: d.lastSyncAt ?? null, lastError: d.lastError ?? null,
});

export const mapTelemetry = (d: Doc): VehicleTelemetry => ({
  id: d.$id, vehicleId: d.vehicleId, odometerKm: d.odometerKm ?? null,
  fuelLevelPct: d.fuelLevelPct ?? null, batteryLevelPct: d.batteryLevelPct ?? null,
  doorsLocked: d.doorsLocked ?? null, latitude: d.latitude ?? null,
  longitude: d.longitude ?? null, syncedAt: d.syncedAt,
});

export const mapFuelLog = (d: Doc): FuelLog => ({
  id: d.$id, vehicleId: d.vehicleId, date: d.date, km: d.km,
  liters: d.liters, totalPrice: d.totalPrice, fullTank: !!d.fullTank,
});
