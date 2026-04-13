import { Phone } from "lucide-react";

/** Sticky bottom phone CTA — mobile only, hidden on desktop and on quiz/admin pages */
const MobilePhoneCTA = () => {
  return (
    <a
      href="tel:+16822333559"
      className="fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors md:hidden"
      aria-label="Call Words Incarnate"
    >
      <Phone className="h-4 w-4" />
      <span className="text-sm font-semibold">Talk to an Adviser</span>
    </a>
  );
};

export default MobilePhoneCTA;
