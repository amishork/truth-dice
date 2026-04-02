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

// To show face[i] to the viewer, rotate the cube container by these amounts
const FACE_TARGET_ROTATIONS: { x: number; y: number }[] = [
  { x: 0, y: 0 },       // face 0 = front → no rotation
  { x: 0, y: 180 },     // face 1 = back → rotate 180° around Y
  { x: 0, y: -90 },     // face 2 = right → rotate -90° around Y
  { x: 0, y: 90 },      // face 3 = left → rotate 90° around Y
  { x: -90, y: 0 },     // face 4 = top → rotate -90° around X
  { x: 90, y: 0 },      // face 5 = bottom → rotate 90° around X
];

const InteractiveDie = forwardRef<DieHandle, InteractiveDieProps>(
  ({ faceLabels, variant, size = 160, onRollComplete }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
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
    const half = size * 0.42; // half the cube face size

    // Colors from style constitution
    const bg = isLight ? "#FAF9F6" : "#000000";
    const fg = isLight ? "#000000" : "#EDEBE7";
    const pencil = isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.06)";
    const borderColor = isLight ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.08)";
    const edgeColor = isLight ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.25)";
    const red = "#9B1B3A";

    // Face style
    const faceStyle = (label: string, transform: string): React.CSSProperties => ({
      position: "absolute",
      width: half * 2,
      height: half * 2,
      backfaceVisibility: "hidden",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: bg,
      border: `1px solid ${edgeColor}`,
      borderRadius: size * 0.04,
      transform,
      fontFamily: "-apple-system, 'Segoe UI', Helvetica, Arial, sans-serif",
      fontWeight: 800,
      fontSize: label.length > 10 ? size * 0.085 : size * 0.11,
      color: fg,
      letterSpacing: "0.02em",
      textTransform: "uppercase" as const,
      textAlign: "center" as const,
      padding: size * 0.06,
      lineHeight: 1.2,
      boxSizing: "border-box" as const,
    });

    // Expose roll method
    useImperativeHandle(ref, () => ({
      roll: (targetFaceIndex: number) =>
        new Promise<string>((resolve) => {
          if (isRolling.current) {
            resolve(labelsRef.current[targetFaceIndex] ?? "");
            return;
          }
          isRolling.current = true;
          const target = FACE_TARGET_ROTATIONS[targetFaceIndex];
          if (!target) { isRolling.current = false; resolve(""); return; }

          // Add full spins for drama
          const spinsX = (Math.random() > 0.5 ? 1 : -1) * 720 + (Math.random() * 360);
          const spinsY = (Math.random() > 0.5 ? 1 : -1) * 720 + (Math.random() * 360);
          const finalX = target.x + spinsX;
          const finalY = target.y + spinsY;
          const startX = rotRef.current.x;
          const startY = rotRef.current.y;
          const duration = 1600;
          const startTime = performance.now();
          const ease = (t: number) => 1 - Math.pow(1 - t, 4);

          const anim = () => {
            const t = Math.min((performance.now() - startTime) / duration, 1);
            const e = ease(t);
            const x = startX + (finalX - startX) * e;
            const y = startY + (finalY - startY) * e;
            rotRef.current = { x, y };
            setRotX(x);
            setRotY(y);
            if (t < 1) {
              requestAnimationFrame(anim);
            } else {
              rotRef.current = { x: target.x, y: target.y };
              setRotX(target.x);
              setRotY(target.y);
              isRolling.current = false;
              velocity.current = { x: 0, y: 0 };
              const label = labelsRef.current[targetFaceIndex] ?? "";
              onRollComplete?.(label);
              resolve(label);
            }
          };
          cancelAnimationFrame(animRef.current);
          requestAnimationFrame(anim);
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
          perspectiveOrigin: "50% 50%",
          cursor: "grab",
          userSelect: "none",
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
          ref={containerRef}
          style={{
            width: half * 2,
            height: half * 2,
            position: "relative",
            transformStyle: "preserve-3d",
            transform: `translateX(${(size - half * 2) / 2}px) translateY(${(size - half * 2) / 2}px) rotateX(${rotX}deg) rotateY(${rotY}deg)`,
            transition: isRolling.current ? "none" : undefined,
          }}
        >
          {/* Front — face 0 */}
          <div style={faceStyle(labels[0], `translateZ(${half}px)`)}>
            <div style={{ position: "absolute", inset: 6, border: `1px solid ${borderColor}`, borderRadius: size * 0.025, pointerEvents: "none" }} />
            {labels[0]}
          </div>

          {/* Back — face 1 */}
          <div style={faceStyle(labels[1], `rotateY(180deg) translateZ(${half}px)`)}>
            <div style={{ position: "absolute", inset: 6, border: `1px solid ${borderColor}`, borderRadius: size * 0.025, pointerEvents: "none" }} />
            {labels[1]}
          </div>

          {/* Right — face 2 */}
          <div style={faceStyle(labels[2], `rotateY(90deg) translateZ(${half}px)`)}>
            <div style={{ position: "absolute", inset: 6, border: `1px solid ${borderColor}`, borderRadius: size * 0.025, pointerEvents: "none" }} />
            {labels[2]}
          </div>

          {/* Left — face 3 */}
          <div style={faceStyle(labels[3], `rotateY(-90deg) translateZ(${half}px)`)}>
            <div style={{ position: "absolute", inset: 6, border: `1px solid ${borderColor}`, borderRadius: size * 0.025, pointerEvents: "none" }} />
            {labels[3]}
          </div>

          {/* Top — face 4 */}
          <div style={faceStyle(labels[4], `rotateX(90deg) translateZ(${half}px)`)}>
            <div style={{ position: "absolute", inset: 6, border: `1px solid ${borderColor}`, borderRadius: size * 0.025, pointerEvents: "none" }} />
            {labels[4]}
          </div>

          {/* Bottom — face 5 */}
          <div style={faceStyle(labels[5], `rotateX(-90deg) translateZ(${half}px)`)}>
            <div style={{ position: "absolute", inset: 6, border: `1px solid ${borderColor}`, borderRadius: size * 0.025, pointerEvents: "none" }} />
            {labels[5]}
          </div>
        </div>
      </div>
    );
  }
);

InteractiveDie.displayName = "InteractiveDie";
export default InteractiveDie;
