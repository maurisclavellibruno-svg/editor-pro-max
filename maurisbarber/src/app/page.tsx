import { Hero } from "@/components/landing/Hero";
import { StickyBookBar } from "@/components/landing/StickyBookBar";
import { NextAvailabilityBanner } from "@/components/landing/NextAvailabilityBanner";
import { TrustBadges } from "@/components/landing/TrustBadges";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { ResultsGallery } from "@/components/landing/ResultsGallery";
import { ServicesPreview } from "@/components/landing/ServicesPreview";
import { LoyaltyCardBanner } from "@/components/landing/LoyaltyCardBanner";
import { Testimonials } from "@/components/landing/Testimonials";
import { LeaveReview } from "@/components/landing/LeaveReview";
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
    <main className="theme-dark">
      <StickyBookBar name={shop.name} />
      <Hero name={shop.name} instagramHandle={shop.instagramHandle} whatsappNumber={shop.whatsappNumber} />
      <NextAvailabilityBanner />
      <TrustBadges />
      <ResultsGallery />
      <HowItWorks />
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
      <LoyaltyCardBanner />
      <Testimonials />
      <LeaveReview />
      <HoursAndContact hours={hours} phone={shop.phone} address={shop.address} mapsEmbedUrl={shop.mapsEmbedUrl} />
      <InstagramSection instagramHandle={shop.instagramHandle} />
      <FAQ />
      <footer className="border-t border-gold/15 bg-noir py-10 text-center text-sm text-ivory-soft">
        © {new Date().getFullYear()} {shop.name}. Todos los derechos reservados.
      </footer>
      <WhatsAppButton whatsappNumber={shop.whatsappNumber} />
    </main>
  );
}
