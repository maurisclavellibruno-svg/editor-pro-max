import { Hero } from "@/components/landing/Hero";
import { ServicesPreview } from "@/components/landing/ServicesPreview";
import { Testimonials } from "@/components/landing/Testimonials";
import { HoursAndContact } from "@/components/landing/HoursAndContact";
import { InstagramSection } from "@/components/landing/InstagramSection";
import { FAQ } from "@/components/landing/FAQ";
import { WhatsAppButton } from "@/components/landing/WhatsAppButton";
import { getActiveServices, getBarbershop, getBusinessHours } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const [shop, services, hours] = await Promise.all([
    getBarbershop(),
    getActiveServices(),
    getBusinessHours(),
  ]);

  return (
    <main>
      <Hero name={shop.name} instagramHandle={shop.instagramHandle} />
      <ServicesPreview
        services={services.map((s) => ({
          id: s.id,
          name: s.name,
          description: s.description,
          price: Number(s.price),
          duration: s.duration,
          color: s.color,
        }))}
      />
      <Testimonials />
      <HoursAndContact hours={hours} phone={shop.phone} address={shop.address} mapsEmbedUrl={shop.mapsEmbedUrl} />
      <InstagramSection instagramHandle={shop.instagramHandle} />
      <FAQ />
      <footer className="border-t border-line bg-surface-dark py-10 text-center text-sm text-white/50">
        © {new Date().getFullYear()} {shop.name}. Todos los derechos reservados.
      </footer>
      <WhatsAppButton whatsappNumber={shop.whatsappNumber} />
    </main>
  );
}
