import { PromoBar } from "@/components/landing/PromoBar";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { Hero } from "@/components/landing/Hero";
import { ResultsGallery } from "@/components/landing/ResultsGallery";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { ServicesPreview } from "@/components/landing/ServicesPreview";
import { GiftCards } from "@/components/landing/GiftCards";
import { Testimonials } from "@/components/landing/Testimonials";
import { HoursAndContact } from "@/components/landing/HoursAndContact";
import { FAQ } from "@/components/landing/FAQ";
import { WhatsAppButton } from "@/components/landing/WhatsAppButton";
import { MobileActionBar } from "@/components/landing/MobileActionBar";
import { getActiveServices, getBarbershop, getBusinessHours } from "@/lib/data";
import { getNextAvailableSlot, formatNextSlotLabel } from "@/lib/availability";
import { normalizeUyPhone } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<{ utm_source?: string; utm_campaign?: string; utm_content?: string }>;
}) {
  const [shop, services, hours, nextSlot] = await Promise.all([
    getBarbershop(),
    getActiveServices(),
    getBusinessHours(),
    getNextAvailableSlot(),
  ]);
  const { utm_source, utm_campaign, utm_content } = await searchParams;
  const utm = { source: utm_source, campaign: utm_campaign, content: utm_content };

  const previewServices = services.map((s) => ({
    id: s.id,
    slug: s.slug,
    name: s.name,
    description: s.description,
    duration: s.duration,
    featured: s.featured,
    badge: s.badge,
    category: s.category,
    price: Number(s.price),
    promoPrice: s.promoPrice !== null ? Number(s.promoPrice) : null,
    promoStartsAt: s.promoStartsAt,
    promoEndsAt: s.promoEndsAt,
    specialPrice: s.specialPrice !== null ? Number(s.specialPrice) : null,
    specialDates: s.specialDates,
  }));

  const utmQs = new URLSearchParams(
    Object.entries(utm).filter((e): e is [string, string] => Boolean(e[1])),
  ).toString();
  const advisoryHref = `/reservar?servicio=asesoria-corte${utmQs ? `&${utmQs}` : ""}`;
  const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(shop.address)}`;

  return (
    <main className="theme-dark pb-16 sm:pb-0">
      <PromoBar />
      <SiteHeader name={shop.name} />
      <Hero name={shop.name} nextSlotLabel={nextSlot ? formatNextSlotLabel(nextSlot.date, nextSlot.time) : null} />
      <ServicesPreview services={previewServices} utm={utm} />
      <ResultsGallery reservarHref={advisoryHref} />
      <HowItWorks />
      <Testimonials />
      <GiftCards whatsappNumber={shop.whatsappNumber} />
      <FAQ />
      <HoursAndContact hours={hours} phone={shop.phone} address={shop.address} mapsEmbedUrl={shop.mapsEmbedUrl} mapsUrl={mapsUrl} />
      <footer className="border-t border-gold/15 bg-noir px-6 py-10 text-center text-sm text-ivory-soft">
        <div className="flex items-center justify-center gap-5">
          <a
            href={`https://instagram.com/${shop.instagramHandle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gold"
            aria-label="Instagram"
          >
            Instagram
          </a>
          <a
            href={`https://wa.me/${normalizeUyPhone(shop.whatsappNumber)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gold"
            aria-label="WhatsApp"
          >
            WhatsApp
          </a>
        </div>
        <p className="mt-3">{shop.address}</p>
        <p className="mt-4">© {new Date().getFullYear()} {shop.name}. Todos los derechos reservados.</p>
      </footer>
      <WhatsAppButton whatsappNumber={shop.whatsappNumber} />
      <MobileActionBar whatsappNumber={shop.whatsappNumber} mapsUrl={mapsUrl} />
    </main>
  );
}
