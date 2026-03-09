import { useEffect, useRef, useState } from "react";

const CursorGlow = () => {
  const [pos, setPos] = useState({ x: -200, y: -200 });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const parent = ref.current?.parentElement;
    if (!parent) return;

    const onMove = (e: MouseEvent) => {
      const rect = parent.getBoundingClientRect();
      setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };
    const onLeave = () => setPos({ x: -200, y: -200 });

    parent.addEventListener("mousemove", onMove);
    parent.addEventListener("mouseleave", onLeave);
    return () => {
      parent.removeEventListener("mousemove", onMove);
      parent.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div ref={ref} className="pointer-events-none absolute inset-0 z-[2] overflow-hidden">
      <div
        className="absolute h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full transition-[left,top] duration-150 ease-out"
        style={{
          left: pos.x,
          top: pos.y,
          background: "radial-gradient(circle, hsl(350 78% 34% / 0.08) 0%, transparent 70%)",
        }}
      />
    </div>
  );
};

export default CursorGlow;
