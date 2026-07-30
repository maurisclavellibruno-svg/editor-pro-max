import React from "react";
import {AbsoluteFill} from "remotion";
import {Announcement} from "../templates/promo/Announcement";
import {ParticleField} from "../components/backgrounds/ParticleField";

export const AnnouncementParticles: React.FC = () => {
  return (
    <AbsoluteFill>
      <Announcement
        preTitle="Introducing"
        title="Something Amazing"
        subtitle="The future is here"
        cta="Learn More"
        backgroundColors={["#0f0f23", "#1a1a3e"]}
        accentColor="#8b5cf6"
      />
      <ParticleField count={90} color="rgba(255,255,255,0.5)" speed={0.6} direction="up" />
    </AbsoluteFill>
  );
};
