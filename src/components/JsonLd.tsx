import { useEffect } from "react";

interface JsonLdProps {
  data: Record<string, unknown>;
}

const JsonLd = ({ data }: JsonLdProps) => {
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, [data]);
  return null;
};

export default JsonLd;

// Reusable schema generators
export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Words Incarnate",
  url: "https://wordsincarnate.com",
  logo: "https://wordsincarnate.com/android-chrome-512x512.png",
  description: "Values formation for families, schools, and organizations.",
  founder: {
    "@type": "Person",
    name: "Alex Mishork",
  },
  sameAs: [],
  contactPoint: {
    "@type": "ContactPoint",
    email: "alex@wordsincarnate.com",
    contactType: "customer service",
  },
};

export const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "Words Incarnate",
  url: "https://wordsincarnate.com",
  logo: "https://wordsincarnate.com/android-chrome-512x512.png",
  description: "Values formation consulting for families, schools, and organizations in the DFW metroplex and beyond.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Fort Worth",
    addressRegion: "TX",
    addressCountry: "US",
  },
  areaServed: {
    "@type": "GeoCircle",
    geoMidpoint: { "@type": "GeoCoordinates", latitude: 32.7555, longitude: -97.3308 },
    geoRadius: "200mi",
  },
  priceRange: "$$",
};

export const productSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Values Dice Conversation Game — Custom Engraved",
  description: "An easy to play dice conversation game with your 6 personal core values custom engraved on each face. Roll the dice to spark meaningful conversations with family, friends, and teams.",
  image: "https://wordsincarnate.com/dice-product.png",
  brand: { "@type": "Brand", name: "Words Incarnate" },
  offers: {
    "@type": "Offer",
    price: "49.00",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
    url: "https://words-incarnate.myshopify.com/products/values-dice-conversation-game-custom-engraved?variant=43386798473290",
  },
};

export const faqSchema = (items: { question: string; answer: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: items.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: { "@type": "Answer", text: item.answer },
  })),
});

export const webPageSchema = (name: string, description: string, path: string) => ({
  "@context": "https://schema.org",
  "@type": "WebPage",
  name,
  description,
  url: `https://wordsincarnate.com${path}`,
  isPartOf: { "@type": "WebSite", name: "Words Incarnate", url: "https://wordsincarnate.com" },
});
