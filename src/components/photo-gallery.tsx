"use client";

import { useRef, useState } from "react";
import { uploadVehiclePhoto, deleteVehiclePhoto } from "@/actions/photos";
import { Button } from "@/components/ui/button";
import { APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, PHOTOS_BUCKET_ID, MAX_PHOTOS_PER_VEHICLE } from "@/lib/appwrite/config";
import { ImagePlus, X } from "lucide-react";

function photoUrl(fileId: string) {
  return `${APPWRITE_ENDPOINT}/storage/buckets/${PHOTOS_BUCKET_ID}/files/${fileId}/view?project=${APPWRITE_PROJECT_ID}`;
}

export function PhotoGallery({ vehicleId, photoFileIds }: { vehicleId: string; photoFileIds: string[] }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const full = photoFileIds.length >= MAX_PHOTOS_PER_VEHICLE;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] uppercase tracking-wide text-muted font-mono">
          Photos ({photoFileIds.length}/{MAX_PHOTOS_PER_VEHICLE})
        </p>
        {!full && (
          <>
            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              hidden
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setUploading(true);
                const fd = new FormData();
                fd.set("photo", file);
                await uploadVehiclePhoto(vehicleId, fd);
                setUploading(false);
                if (inputRef.current) inputRef.current.value = "";
              }}
            />
            <Button variant="ghost" size="sm" disabled={uploading} onClick={() => inputRef.current?.click()}>
              <ImagePlus className="h-3.5 w-3.5" /> {uploading ? "Envoi..." : "Ajouter une photo"}
            </Button>
          </>
        )}
      </div>

      {photoFileIds.length === 0 ? (
        <p className="text-sm text-muted">Aucune photo pour le moment.</p>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {photoFileIds.map((fid) => (
            <div key={fid} className="relative aspect-square rounded-lg overflow-hidden border border-border group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photoUrl(fid)} alt="Photo du véhicule" className="w-full h-full object-cover" />
              <form action={deleteVehiclePhoto.bind(null, vehicleId, fid)} className="absolute top-1 right-1">
                <button type="submit" className="h-6 w-6 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="h-3.5 w-3.5 text-white" />
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
