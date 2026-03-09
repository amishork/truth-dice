import { useEffect, useRef } from "react";

interface ConfettiPiece {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
  size: number;
  life: number;
}

const COLORS = [
  "hsl(350, 78%, 45%)",
  "hsl(20, 90%, 55%)",
  "hsl(45, 90%, 55%)",
  "hsl(350, 60%, 65%)",
  "hsl(0, 0%, 40%)",
];

interface ConfettiProps {
  trigger: boolean;
  onComplete?: () => void;
}

const Confetti: React.FC<ConfettiProps> = ({ trigger, onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!trigger) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth * window.devicePixelRatio;
    canvas.height = window.innerHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const w = window.innerWidth;
    const h = window.innerHeight;

    const pieces: ConfettiPiece[] = Array.from({ length: 80 }, () => ({
      x: w / 2 + (Math.random() - 0.5) * 200,
      y: h * 0.4,
      vx: (Math.random() - 0.5) * 12,
      vy: -(4 + Math.random() * 8),
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 15,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: 4 + Math.random() * 6,
      life: 0,
    }));

    let animId: number;
    const maxLife = 120;

    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      let alive = false;

      for (const p of pieces) {
        p.life++;
        if (p.life > maxLife) continue;
        alive = true;
        p.vy += 0.15;
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.98;
        p.rotation += p.rotationSpeed;

        const alpha = 1 - p.life / maxLife;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
      }

      if (alive) {
        animId = requestAnimationFrame(tick);
      } else {
        onComplete?.();
      }
    };

    tick();
    return () => cancelAnimationFrame(animId);
  }, [trigger, onComplete]);

  if (!trigger) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[100]"
      style={{ width: "100vw", height: "100vh" }}
    />
  );
};

export default Confetti;
