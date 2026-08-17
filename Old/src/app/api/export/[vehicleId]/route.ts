import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { Query } from "node-appwrite";
import { createSessionClient } from "@/lib/appwrite/server";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite/config";
import { mapVehicle, mapEntry } from "@/lib/appwrite/mappers";
import { sortedEntries } from "@/lib/maintenance/compute";
import { fmtDate, fmtKm } from "@/lib/utils";

const PAGE_W = 595.28; // A4
const PAGE_H = 841.89;
const MARGIN = 50;

export async function GET(_req: Request, { params }: { params: { vehicleId: string } }) {
  const { databases } = createSessionClient();

  let vehicleDoc;
  try {
    vehicleDoc = await databases.getDocument(DATABASE_ID, COLLECTIONS.vehicles, params.vehicleId);
  } catch {
    return new NextResponse("Véhicule introuvable", { status: 404 });
  }
  const vehicle = mapVehicle(vehicleDoc);

  const entriesRes = await databases.listDocuments(DATABASE_ID, COLLECTIONS.entries, [
    Query.equal("vehicleId", params.vehicleId), Query.limit(500),
  ]);
  const entries = [...sortedEntries(entriesRes.documents.map(mapEntry))].reverse();

  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const copper = rgb(0.75, 0.52, 0.32);
  const dark = rgb(0.13, 0.13, 0.14);
  const gray = rgb(0.45, 0.45, 0.47);

  let page = pdf.addPage([PAGE_W, PAGE_H]);
  let y = PAGE_H - MARGIN;

  function newPageIfNeeded(space: number) {
    if (y - space < MARGIN) {
      page = pdf.addPage([PAGE_W, PAGE_H]);
      y = PAGE_H - MARGIN;
    }
  }

  page.drawText("CARNET D'ENTRETIEN", { x: MARGIN, y, size: 11, font: bold, color: copper });
  y -= 22;
  page.drawText(vehicle.name, { x: MARGIN, y, size: 22, font: bold, color: dark });
  y -= 20;
  const specs = [vehicle.engine, vehicle.fuelType, vehicle.transmission && `Boîte ${vehicle.transmission}`]
    .filter(Boolean).join("  ·  ");
  page.drawText(specs, { x: MARGIN, y, size: 10, font, color: gray });
  y -= 30;

  page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_W - MARGIN, y }, thickness: 1, color: rgb(0.85, 0.85, 0.85) });
  y -= 24;

  page.drawText("HISTORIQUE", { x: MARGIN, y, size: 11, font: bold, color: copper });
  y -= 20;

  const colDate = MARGIN;
  const colKm = MARGIN + 75;
  const colTitle = MARGIN + 155;
  const rowGap = 14;

  for (const e of entries) {
    newPageIfNeeded(60);
    page.drawText(fmtDate(e.date), { x: colDate, y, size: 9.5, font: bold, color: dark });
    page.drawText(fmtKm(e.km), { x: colKm, y, size: 9.5, font, color: gray });
    page.drawText(e.title, { x: colTitle, y, size: 9.5, font: bold, color: dark });
    y -= rowGap;

    for (const item of e.items) {
      newPageIfNeeded(20);
      page.drawText(`•  ${item}`, { x: colTitle, y, size: 9, font, color: gray });
      y -= 12.5;
    }
    if (e.note) {
      newPageIfNeeded(20);
      page.drawText(e.note, { x: colTitle, y, size: 8.5, font, color: gray });
      y -= 12.5;
    }
    y -= 8;
  }

  const bytes = await pdf.save();
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="carnet-${vehicle.name.replace(/\s+/g, "-").toLowerCase()}.pdf"`,
    },
  });
}
