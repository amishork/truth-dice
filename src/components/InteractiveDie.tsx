import React, { useRef, useState, useCallback, useImperativeHandle, forwardRef, useEffect } from "react";

export interface DieHandle {
  roll: (targetFaceIndex: number) => Promise<string>;
}

interface InteractiveDieProps {
  faceLabels: string[];
  variant: "light" | "dark";
  size?: number;
  onRollComplete?: (label: string) => void;
}

// To show face[i] to the viewer, rotate container by these degrees
const FACE_TARGET: { x: number; y: number }[] = [
  { x: 0, y: 0 },       // 0 = front
  { x: 0, y: 180 },     // 1 = back
  { x: 0, y: -90 },     // 2 = right
  { x: 0, y: 90 },      // 3 = left
  { x: -90, y: 0 },     // 4 = top
  { x: 90, y: 0 },      // 5 = bottom
];

const InteractiveDie = forwardRef<DieHandle, InteractiveDieProps>(
  ({ faceLabels, variant, size = 160, onRollComplete }, ref) => {
    const [rotX, setRotX] = useState(25);
    const [rotY, setRotY] = useState(-30);
    const isDragging = useRef(false);
    const isRolling = useRef(false);
    const lastMouse = useRef({ x: 0, y: 0 });
    const velocity = useRef({ x: 0, y: 0 });
    const animRef = useRef<number>(0);
    const labelsRef = useRef(faceLabels);
    labelsRef.current = faceLabels;
    const rotRef = useRef({ x: 25, y: -30 });

    const labels = [...faceLabels];
    while (labels.length < 6) labels.push("");

    const isLight = variant === "light";
    const half = size * 0.42;

    // ─── Shared styles (identical on both variants, just colors inverted) ─────
    const faceBg = isLight ? "#FFFFFF" : "#000000";
    const faceText = isLight ? "#000000" : "#FFFFFF";
    const faceBorder = isLight ? "rgba(0,0,0,0.18)" : "rgba(255,255,255,0.18)";
    const innerBorder = isLight ? "rgba(0,0,0,0.07)" : "rgba(255,255,255,0.07)";

    const faceStyle = (label: string, transform: string): React.CSSProperties => ({
      position: "absolute",
      width: half * 2,
      height: half * 2,
      backfaceVisibility: "hidden",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: faceBg,
      border: `1.5px solid ${faceBorder}`,
      borderRadius: size * 0.05,
      transform,
      fontFamily: "-apple-system, 'Segoe UI', Helvetica, Arial, sans-serif",
      fontWeight: 800,
      fontSize: label.length > 12 ? size * 0.075 : label.length > 8 ? size * 0.09 : size * 0.115,
      color: faceText,
      letterSpacing: "0.03em",
      textTransform: "uppercase",
      textAlign: "center",
      padding: size * 0.08,
      lineHeight: 1.15,
      boxSizing: "border-box",
    });

    // Expose roll method
    useImperativeHandle(ref, () => ({
      roll: (targetFaceIndex: number) =>
        new Promise<string>((resolve) => {
          if (isRolling.current) { resolve(labelsRef.current[targetFaceIndex] ?? ""); return; }
          isRolling.current = true;
          velocity.current = { x: 0, y: 0 };
          const target = FACE_TARGET[targetFaceIndex];
          if (!target) { isRolling.current = false; resolve(""); return; }

          // Compute final rotation: target + full spins for drama
          // Find the nearest equivalent target angle from current position
          const cur = rotRef.current;
          const normX = target.x + Math.round((cur.x - target.x) / 360) * 360;
          const normY = target.y + Math.round((cur.y - target.y) / 360) * 360;
          // Add 2-3 full spins in a random direction
          const extraX = (Math.random() > 0.5 ? 1 : -1) * (720 + Math.random() * 360);
          const extraY = (Math.random() > 0.5 ? 1 : -1) * (720 + Math.random() * 360);
          const finalX = normX + extraX;
          const finalY = normY + extraY;

          const startX = cur.x, startY = cur.y;
          const duration = 2200;
          const startTime = performance.now();

          // Quintic ease-out — very smooth deceleration, nearly zero velocity at end
          const ease = (t: number) => 1 - Math.pow(1 - t, 5);

          const anim = () => {
            const elapsed = performance.now() - startTime;
            const t = Math.min(elapsed / duration, 1);
            const e = ease(t);
            const x = startX + (finalX - startX) * e;
            const y = startY + (finalY - startY) * e;
            rotRef.current = { x, y };
            setRotX(x);
            setRotY(y);

            if (t < 1) {
              animRef.current = requestAnimationFrame(anim);
            } else {
              // Animation naturally reached finalX/finalY — no snap needed
              // finalX/finalY are visually identical to target (differ by full rotations)
              isRolling.current = false;
              velocity.current = { x: 0, y: 0 };
              const label = labelsRef.current[targetFaceIndex] ?? "";
              onRollComplete?.(label);
              resolve(label);
            }
          };
          cancelAnimationFrame(animRef.current);
          animRef.current = requestAnimationFrame(anim);
        }),
    }));

    // Idle auto-rotation
    useEffect(() => {
      const spin = () => {
        if (!isDragging.current && !isRolling.current) {
          velocity.current.x *= 0.97;
          velocity.current.y *= 0.97;
          if (Math.abs(velocity.current.x) + Math.abs(velocity.current.y) < 0.05) {
            velocity.current.x = 0.12;
            velocity.current.y = 0.06;
          }
          rotRef.current.x += velocity.current.y;
          rotRef.current.y += velocity.current.x;
          setRotX(rotRef.current.x);
          setRotY(rotRef.current.y);
        }
        animRef.current = requestAnimationFrame(spin);
      };
      animRef.current = requestAnimationFrame(spin);
      return () => cancelAnimationFrame(animRef.current);
    }, []);

    // Drag interaction
    const getPos = (e: React.MouseEvent | React.TouchEvent) => {
      if ("touches" in e) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
      return { x: e.clientX, y: e.clientY };
    };

    const onDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
      if (isRolling.current) return;
      isDragging.current = true;
      lastMouse.current = getPos(e);
      velocity.current = { x: 0, y: 0 };
    }, []);

    const onMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
      if (!isDragging.current || isRolling.current) return;
      const p = getPos(e);
      const dx = p.x - lastMouse.current.x;
      const dy = p.y - lastMouse.current.y;
      rotRef.current.x -= dy * 0.5;
      rotRef.current.y += dx * 0.5;
      velocity.current = { x: dx * 0.5, y: -dy * 0.5 };
      setRotX(rotRef.current.x);
      setRotY(rotRef.current.y);
      lastMouse.current = p;
    }, []);

    const onUp = useCallback(() => { isDragging.current = false; }, []);

    return (
      <div
        style={{
          width: size,
          height: size,
          perspective: size * 3,
          cursor: "grab",
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
        onMouseDown={onDown}
        onMouseMove={onMove}
        onMouseUp={onUp}
        onMouseLeave={onUp}
        onTouchStart={onDown}
        onTouchMove={onMove}
        onTouchEnd={onUp}
      >
        <div
          style={{
            width: half * 2,
            height: half * 2,
            position: "relative",
            transformStyle: "preserve-3d",
            transform: `translate(${(size - half * 2) / 2}px, ${(size - half * 2) / 2}px) rotateX(${rotX}deg) rotateY(${rotY}deg)`,
          }}
        >
          {/* 6 faces */}
          {[
            `translateZ(${half}px)`,
            `rotateY(180deg) translateZ(${half}px)`,
            `rotateY(90deg) translateZ(${half}px)`,
            `rotateY(-90deg) translateZ(${half}px)`,
            `rotateX(90deg) translateZ(${half}px)`,
            `rotateX(-90deg) translateZ(${half}px)`,
          ].map((transform, i) => (
            <div key={i} style={faceStyle(labels[i], transform)}>
              <div style={{
                position: "absolute",
                inset: size * 0.04,
                border: `1px solid ${innerBorder}`,
                borderRadius: size * 0.03,
                pointerEvents: "none",
              }} />
              {labels[i]}
            </div>
          ))}
        </div>
      </div>
    );
  }
);

InteractiveDie.displayName = "InteractiveDie";
export default InteractiveDie;
