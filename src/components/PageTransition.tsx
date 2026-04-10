import { ReactNode } from "react";

const PageTransition = ({ children }: { children: ReactNode }) => (
  <div style={{ animation: "fadeSlideUp 0.3s ease-in-out forwards" }}>
    {children}
  </div>
);

export default PageTransition;
