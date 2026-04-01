import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface ValuesConstellationProps {
  values: string[];
}

const ValuesConstellation: React.FC<ValuesConstellationProps> = ({ values }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);

  const getPositions = (w: number, h: number, count: number, time: number) => {
    const cx = w / 2;
    const cy = h / 2;
    const radius = Math.min(w, h) * 0.34;
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
      const wobble = Math.sin(time * 0.001 + i * 1.2) * 6;
      return {
        x: cx + Math.cos(angle) * (radius + wobble),
        y: cy + Math.sin(angle) * (radius + wobble),
      };
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || values.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    const primaryColor = getComputedStyle(document.documentElement)
      .getPropertyValue("--primary")
      .trim();
    const hslPrimary = `hsl(${primaryColor})`;
    const fgColor = getComputedStyle(document.documentElement)
      .getPropertyValue("--foreground")
      .trim();
    const hslFg = `hsl(${fgColor})`;

    const tick = (timestamp: number) => {
      timeRef.current = timestamp;
      ctx.clearRect(0, 0, w, h);
      const positions = getPositions(w, h, values.length, timestamp);
      const cx = w / 2;
      const cy = h / 2;

      // Draw connections between all values
      for (let i = 0; i < positions.length; i++) {
        for (let j = i + 1; j < positions.length; j++) {
          const p1 = positions[i];
          const p2 = positions[j];
          const isHighlighted = hoveredIndex === i || hoveredIndex === j;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = isHighlighted
            ? `hsla(${primaryColor} / 0.5)`
            : `hsla(${primaryColor} / 0.12)`;
          ctx.lineWidth = isHighlighted ? 1.5 : 0.5;
          ctx.stroke();
        }
      }

      // Draw center glow
      const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 40);
      gradient.addColorStop(0, `hsla(${primaryColor} / 0.2)`);
      gradient.addColorStop(1, `hsla(${primaryColor} / 0)`);
      ctx.beginPath();
      ctx.arc(cx, cy, 40, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Draw orbiting dots at each value position
      positions.forEach((pos, i) => {
        const isHovered = hoveredIndex === i;
        const dotRadius = isHovered ? 6 : 4;

        // Glow
        const glow = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, dotRadius * 4);
        glow.addColorStop(0, `hsla(${primaryColor} / ${isHovered ? 0.4 : 0.15})`);
        glow.addColorStop(1, `hsla(${primaryColor} / 0)`);
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, dotRadius * 4, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        // Dot
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, dotRadius, 0, Math.PI * 2);
        ctx.fillStyle = hslPrimary;
        ctx.fill();
      });

      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [values, hoveredIndex]);

  const positions = getPositions(
    canvasRef.current?.clientWidth || 400,
    canvasRef.current?.clientHeight || 400,
    values.length,
    timeRef.current
  );

  return (
    <motion.div
      className="relative mx-auto w-full max-w-md aspect-square"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ width: "100%", height: "100%" }}
      />
      {/* Value labels overlaid on top of canvas */}
      {values.map((value, i) => {
        const angle = (i / values.length) * Math.PI * 2 - Math.PI / 2;
        const labelRadius = 46;
        const left = 50 + Math.cos(angle) * labelRadius;
        const top = 50 + Math.sin(angle) * labelRadius;

        return (
          <motion.div
            key={value}
            className="absolute pointer-events-auto cursor-default"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              transform: "translate(-50%, -50%)",
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + i * 0.15, duration: 0.5, type: "spring" }}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <span
              className={`text-xs font-semibold px-2 py-1 rounded-md transition-all duration-200 whitespace-nowrap ${
                hoveredIndex === i
                  ? "bg-primary text-primary-foreground shadow-lg scale-110"
                  : "bg-card/80 text-foreground border border-border backdrop-blur-sm"
              }`}
            >
              {value.length > 20 ? value.split("(")[0].trim() : value}
            </span>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default ValuesConstellation;
