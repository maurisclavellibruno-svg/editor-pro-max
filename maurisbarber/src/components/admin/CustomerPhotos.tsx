"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { addCustomerPhoto, deleteCustomerPhoto } from "@/actions/customers";

interface Photo {
  id: string;
  url: string;
  caption: string;
}

export function CustomerPhotos({ customerId, photos }: { customerId: string; photos: Photo[] }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.set("file", file);
    try {
      await addCustomerPhoto(customerId, formData);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <section className="rounded-2xl border border-line bg-white p-6 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-muted">Fotos de referencia</h2>
        <label className="cursor-pointer text-sm font-medium text-accent">
          {uploading ? "Subiendo…" : "+ Subir foto"}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </label>
      </div>
      {photos.length === 0 ? (
        <p className="text-sm text-ink-muted">Todavía no hay fotos de referencia.</p>
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
          {photos.map((photo) => (
            <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-xl border border-line">
              <Image src={photo.url} alt={photo.caption || "Foto de referencia"} fill className="object-cover" />
              <button
                type="button"
                onClick={() => deleteCustomerPhoto(photo.id, customerId)}
                className="absolute right-1 top-1 hidden h-6 w-6 items-center justify-center rounded-full bg-black/60 text-xs text-white group-hover:flex"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
