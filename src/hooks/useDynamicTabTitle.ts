import { useEffect, useRef } from "react";

type Stage =
  | "home"
  | "section1"
  | "section2"
  | "section3"
  | "section3-runoff"
  | "section4"
  | "final"
  | "dice";

export function useDynamicTabTitle(
  stage: Stage,
  progress?: { current: number; total: number }
) {
  const originalTitle = useRef(document.title);

  useEffect(() => {
    const base = "Words Incarnate";

    switch (stage) {
      case "home":
        document.title = base;
        break;
      case "section1":
      case "section2":
      case "section3":
      case "section3-runoff":
        if (progress && progress.total > 0) {
          const pct = Math.round((progress.current / progress.total) * 100);
          document.title = `${pct}% complete | ${base}`;
        } else {
          document.title = `Discovering... | ${base}`;
        }
        break;
      case "section4":
        document.title = `Almost there... | ${base}`;
        break;
      case "final":
        document.title = `Choose your 6 | ${base}`;
        break;
      case "dice":
        document.title = `Your 6 Values | ${base}`;
        break;
    }

    return () => {
      document.title = originalTitle.current;
    };
  }, [stage, progress?.current, progress?.total]);
}

// Animated favicon with ember glow
export function useAnimatedFavicon(active: boolean) {
  const rafRef = useRef<number>(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const originalFavicon = useRef<string>("");

  useEffect(() => {
    if (!active) return;

    const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (link) originalFavicon.current = link.href;

    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 32;
    canvasRef.current = canvas;
    const ctx = canvas.getContext("2d")!;

    let t = 0;
    const draw = () => {
      t += 0.04;
      ctx.clearRect(0, 0, 32, 32);

      // Ember glow
      const pulse = 0.6 + Math.sin(t) * 0.4;
      const gradient = ctx.createRadialGradient(16, 16, 2, 16, 16, 14);
      gradient.addColorStop(0, `rgba(200, 60, 50, ${pulse})`);
      gradient.addColorStop(0.5, `rgba(200, 60, 50, ${pulse * 0.4})`);
      gradient.addColorStop(1, "rgba(200, 60, 50, 0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 32, 32);

      // Center dot
      ctx.beginPath();
      ctx.arc(16, 16, 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 120, 80, ${0.8 + Math.sin(t * 1.5) * 0.2})`;
      ctx.fill();

      // "W" letter
      ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
      ctx.font = "bold 16px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("W", 16, 16);

      if (!link) {
        const newLink = document.createElement("link");
        newLink.rel = "icon";
        newLink.href = canvas.toDataURL();
        document.head.appendChild(newLink);
      } else {
        link.href = canvas.toDataURL();
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      const linkEl = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (linkEl && originalFavicon.current) {
        linkEl.href = originalFavicon.current;
      }
    };
  }, [active]);
}
