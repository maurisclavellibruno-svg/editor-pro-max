import React from "react";
import {Presentation} from "../templates/content/Presentation";

export const AIPresentation: React.FC = () => {
  return (
    <Presentation
      slides={[
        {
          title: "What Is AI?",
          body: "Artificial intelligence is software that learns patterns from data to perform tasks that normally require human intelligence.",
        },
        {
          title: "How It Learns",
          body: "Models are trained on massive datasets, adjusting millions of internal parameters to minimize prediction errors.",
        },
        {
          title: "Where It's Used",
          body: "From video editing and image generation to chatbots and recommendation engines, AI now touches nearly every industry.",
        },
        {
          title: "Why It Matters",
          body: "AI automates repetitive work and unlocks new creative possibilities, letting people focus on higher-level decisions.",
        },
        {
          title: "What's Next",
          body: "Expect AI to become more capable, more accessible, and more deeply embedded in everyday tools and workflows.",
        },
      ]}
      framesPerSlide={150}
      backgroundColors={["#0a0a0a", "#1a1a2e"]}
      accentColor="#6366f1"
    />
  );
};
