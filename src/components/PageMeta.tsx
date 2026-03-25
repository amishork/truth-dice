import { useEffect } from "react";

interface PageMetaProps {
  title: string;
  description: string;
  path?: string;
}

const BASE_URL = "https://wordsincarnate.com";
const SITE_NAME = "Words Incarnate";
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.jpg`;

const PageMeta = ({ title, description, path = "" }: PageMetaProps) => {
  useEffect(() => {
    const fullTitle = `${title} | ${SITE_NAME}`;
    document.title = fullTitle;

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
    setMeta("og:image", DEFAULT_OG_IMAGE);
    setMeta("og:type", "website");
    setMeta("twitter:title", fullTitle);
    setMeta("twitter:description", description);
    setMeta("twitter:image", DEFAULT_OG_IMAGE);

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
