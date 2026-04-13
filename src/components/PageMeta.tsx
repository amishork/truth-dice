import { useEffect } from "react";

interface PageMetaProps {
  title: string;
  description: string;
  path?: string;
}

const BASE_URL = "https://wordsincarnate.com";
const SITE_NAME = "Words Incarnate";
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-home.png`;

// Map paths to per-page OG images
const OG_IMAGE_MAP: Record<string, string> = {
  "/": "/og-home.png",
  "/about": "/og-about.png",
  "/our-story": "/og-our-story.png",
  "/how-we-work": "/og-services.png",
  "/hold": "/og-services.png",
  "/services": "/og-services.png",
  "/schools": "/og-schools.png",
  "/families": "/og-home.png",
  "/organizations": "/og-home.png",
  "/case-studies": "/og-home.png",
  "/contact": "/og-contact.png",
  "/quiz": "/og-quiz.png",
  "/workshop": "/og-workshop.png",
  "/testimonials": "/og-testimonials.png",
};

const PageMeta = ({ title, description, path = "" }: PageMetaProps) => {
  useEffect(() => {
    const fullTitle = `${title} | ${SITE_NAME}`;
    document.title = fullTitle;

    const ogImage = `${BASE_URL}${OG_IMAGE_MAP[path] || "/og-home.png"}`;

    const setMeta = (property: string, content: string) => {
      let el = document.querySelector(`meta[property="${property}"]`) || document.querySelector(`meta[name="${property}"]`);
      if (!el) {
        el = document.createElement("meta");
        if (property.startsWith("og:") || property.startsWith("twitter:")) {
          el.setAttribute("property", property);
        } else {
          el.setAttribute("name", property);
        }
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("description", description);
    setMeta("og:title", fullTitle);
    setMeta("og:description", description);
    setMeta("og:url", `${BASE_URL}${path}`);
    setMeta("og:image", ogImage);
    setMeta("og:type", "website");
    setMeta("twitter:title", fullTitle);
    setMeta("twitter:description", description);
    setMeta("twitter:image", ogImage);

    // Update canonical
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", `${BASE_URL}${path}`);
  }, [title, description, path]);

  return null;
};

export default PageMeta;
