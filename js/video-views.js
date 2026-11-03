import { supabase, SITE_VIDEO_BUCKET, SITE_VIDEO_PATH } from "./supabase-client.js";

const heroVideo = document.querySelector("#heroMedia video");

if (heroVideo) {
  const { data } = supabase.storage
    .from(SITE_VIDEO_BUCKET)
    .getPublicUrl(SITE_VIDEO_PATH);
  const videoUrl = data?.publicUrl;

  if (videoUrl) {
    const source = document.createElement("source");
    source.src = videoUrl;
    source.type = "video/mp4";
    heroVideo.appendChild(source);

    heroVideo.addEventListener("loadeddata", () => {
      heroVideo.play().catch(() => {});
    }, { once: true });

    heroVideo.addEventListener("playing", () => {
      document.getElementById("heroMedia")?.classList.add("video-playing");
      supabase.from("video_views").insert({}).then(({ error }) => {
        if (error) console.error("Could not record video view:", error);
      });
    }, { once: true });
  }

  heroVideo.addEventListener("error", () => {
    document.getElementById("heroMedia")?.classList.remove("video-playing");
  });
}
