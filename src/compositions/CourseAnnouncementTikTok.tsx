import React from "react";
import {TikTokVideo} from "../templates/social/TikTokVideo";

export const CourseAnnouncementTikTok: React.FC = () => {
  return (
    <TikTokVideo
      hook="I just launched my new course!"
      body="Learn how to edit videos with AI, from zero to pro."
      cta="Link in bio — enroll now"
      backgroundColors={["#0f0f23", "#1a1a3e"]}
      accentColor="#8b5cf6"
      textColor="#ffffff"
    />
  );
};
