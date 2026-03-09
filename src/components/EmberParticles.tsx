import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  life: number;
  maxLife: number;
}

const EmberParticles = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let particles: Particle[] = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    const spawn = () => {
      if (particles.length > 40) return;
      const maxLife = 120 + Math.random() * 180;
      particles.push({
        x: Math.random() * canvas.offsetWidth,
        y: canvas.offsetHeight + 10,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -(0.3 + Math.random() * 0.6),
        size: 1.5 + Math.random() * 2.5,
        opacity: 0.6 + Math.random() * 0.4,
        life: 0,
        maxLife,
      });
    };

    const tick = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      if (Math.random() < 0.15) spawn();

      particles = particles.filter((p) => p.life < p.maxLife);

      for (const p of particles) {
        p.life++;
        p.x += p.vx + Math.sin(p.life * 0.02) * 0.15;
        p.y += p.vy;
        const progress = p.life / p.maxLife;
        const alpha = p.opacity * (progress < 0.1 ? progress / 0.1 : 1 - progress);

        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
        gradient.addColorStop(0, `hsla(20, 90%, 55%, ${alpha})`);
        gradient.addColorStop(0.4, `hsla(350, 78%, 45%, ${alpha * 0.6})`);
        gradient.addColorStop(1, `hsla(350, 78%, 34%, 0)`);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      animId = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-[1]"
      style={{ width: "100%", height: "100%" }}
    />
  );
};

export default EmberParticles;
