import { getBarbershop } from "@/lib/data";
import { BarbershopSettingsForm } from "@/components/admin/BarbershopSettingsForm";

export const dynamic = "force-dynamic";

export default async function ConfiguracionPage() {
  const shop = await getBarbershop();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-ink">Configuración del negocio</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Estos datos se muestran en la web pública — teléfono, WhatsApp, Instagram, dirección.
        </p>
      </div>
      <BarbershopSettingsForm
        shop={{
          name: shop.name,
          phone: shop.phone,
          whatsappNumber: shop.whatsappNumber,
          instagramHandle: shop.instagramHandle,
          address: shop.address,
          mapsEmbedUrl: shop.mapsEmbedUrl,
          description: shop.description,
        }}
      />
    </div>
  );
}
