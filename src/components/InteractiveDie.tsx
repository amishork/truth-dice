import React, { useRef, useEffect, useCallback, useImperativeHandle, forwardRef } from "react";
import * as THREE from "three";

export interface DieHandle {
  roll: (targetFaceIndex: number) => Promise<string>;
}

interface InteractiveDieProps {
  faceLabels: string[];
  variant: "light" | "dark";
  size?: number;
  onRollComplete?: (label: string) => void;
}

// Each rotation makes material[i] face the camera at (0,0,5)
// Three.js BoxGeometry material order: +X, -X, +Y, -Y, +Z, -Z
const FACE_ROTATIONS: THREE.Euler[] = [
  new THREE.Euler(0, Math.PI / 2, 0),   // mat 0 (+X) faces camera
  new THREE.Euler(0, -Math.PI / 2, 0),  // mat 1 (-X) faces camera
  new THREE.Euler(-Math.PI / 2, 0, 0),  // mat 2 (+Y) faces camera
  new THREE.Euler(Math.PI / 2, 0, 0),   // mat 3 (-Y) faces camera
  new THREE.Euler(0, 0, 0),             // mat 4 (+Z) faces camera
  new THREE.Euler(0, Math.PI, 0),       // mat 5 (-Z) faces camera
];

function createFaceTexture(text: string, variant: "light" | "dark"): THREE.CanvasTexture {
  const res = 2048;
  const canvas = document.createElement("canvas");
  canvas.width = res;
  canvas.height = res;
  const ctx = canvas.getContext("2d")!;
  const isLight = variant === "light";

  const bg = isLight ? "#FAF9F6" : "#000000";
  const fg = isLight ? "#000000" : "#EDEBE7";
  const pencil = isLight ? "#D8D4CC" : "#2A2A2A";
  const hatch = isLight ? "#C8C4BC" : "#1E1E1E";
  const red = "#9B1B3A";

  // ─── Layer 0: Paper ────────────────────────────────────────────────
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, res, res);

  // ─── Layer 1: Construction geometry (pencil) ───────────────────────
  ctx.strokeStyle = pencil;
  ctx.lineWidth = res * 0.0015;
  ctx.globalAlpha = 0.35;

  // Center crosshair
  ctx.beginPath();
  ctx.moveTo(res * 0.3, res / 2);
  ctx.lineTo(res * 0.7, res / 2);
  ctx.moveTo(res / 2, res * 0.3);
  ctx.lineTo(res / 2, res * 0.7);
  ctx.stroke();

  // Corner registration marks
  const m = res * 0.08;
  const cLen = res * 0.05;
  [[m, m], [res - m, m], [m, res - m], [res - m, res - m]].forEach(([x, y]) => {
    ctx.beginPath();
    ctx.moveTo(x - cLen * (x < res / 2 ? -1 : 1), y);
    ctx.lineTo(x, y);
    ctx.lineTo(x, y - cLen * (y < res / 2 ? -1 : 1));
    ctx.stroke();
  });

  ctx.globalAlpha = 1;

  // ─── Layer 3: Cross-hatching along edges ───────────────────────────
  ctx.strokeStyle = hatch;
  ctx.lineWidth = res * 0.001;
  ctx.globalAlpha = isLight ? 0.06 : 0.08;

  const hatchInset = res * 0.03;
  const hatchDepth = res * 0.09;
  const step = res * 0.008;

  // Top edge hatching
  for (let x = hatchInset; x < res - hatchInset; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, hatchInset);
    ctx.lineTo(x + hatchDepth * 0.6, hatchInset + hatchDepth);
    ctx.stroke();
  }
  // Bottom edge hatching
  for (let x = hatchInset; x < res - hatchInset; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, res - hatchInset);
    ctx.lineTo(x - hatchDepth * 0.6, res - hatchInset - hatchDepth);
    ctx.stroke();
  }
  // Left edge hatching
  for (let y = hatchInset; y < res - hatchInset; y += step) {
    ctx.beginPath();
    ctx.moveTo(hatchInset, y);
    ctx.lineTo(hatchInset + hatchDepth, y + hatchDepth * 0.6);
    ctx.stroke();
  }
  // Right edge hatching
  for (let y = hatchInset; y < res - hatchInset; y += step) {
    ctx.beginPath();
    ctx.moveTo(res - hatchInset, y);
    ctx.lineTo(res - hatchInset - hatchDepth, y - hatchDepth * 0.6);
    ctx.stroke();
  }

  ctx.globalAlpha = 1;

  // ─── Layer 2: Commitment border (pen) ──────────────────────────────
  const borderInset = res * 0.055;
  const cornerR = res * 0.045;
  ctx.strokeStyle = fg;
  ctx.lineWidth = res * 0.003;
  ctx.globalAlpha = isLight ? 0.12 : 0.1;
  ctx.beginPath();
  ctx.roundRect(borderInset, borderInset, res - borderInset * 2, res - borderInset * 2, cornerR);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // ─── Layer 4: Red accent — small diamond at bottom center ──────────
  ctx.fillStyle = red;
  ctx.globalAlpha = 0.6;
  const dSize = res * 0.008;
  ctx.save();
  ctx.translate(res / 2, res - borderInset - res * 0.04);
  ctx.rotate(Math.PI / 4);
  ctx.fillRect(-dSize, -dSize, dSize * 2, dSize * 2);
  ctx.restore();
  ctx.globalAlpha = 1;

  // ─── Layer 2: Text (commitment — bold, clear) ─────────────────────
  const upperText = text.toUpperCase();
  ctx.fillStyle = fg;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  let fontSize = res * 0.17;
  const maxWidth = res * 0.68;
  ctx.font = `800 ${fontSize}px -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif`;
  let mt = ctx.measureText(upperText);
  while (mt.width > maxWidth && fontSize > res * 0.07) {
    fontSize -= res * 0.005;
    ctx.font = `800 ${fontSize}px -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif`;
    mt = ctx.measureText(upperText);
  }

  if (mt.width > maxWidth) {
    const words = upperText.split(" ");
    if (words.length >= 2) {
      const mid = Math.ceil(words.length / 2);
      fontSize = res * 0.12;
      ctx.font = `800 ${fontSize}px -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif`;
      const lineH = fontSize * 1.3;
      ctx.fillText(words.slice(0, mid).join(" "), res / 2, res / 2 - lineH / 2);
      ctx.fillText(words.slice(mid).join(" "), res / 2, res / 2 + lineH / 2);
    } else {
      ctx.fillText(upperText, res / 2, res / 2);
    }
  } else {
    ctx.fillText(upperText, res / 2, res / 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 16;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  return texture;
}

const InteractiveDie = forwardRef<DieHandle, InteractiveDieProps>(
  ({ faceLabels, variant, size = 160, onRollComplete }, ref) => {
    const mountRef = useRef<HTMLDivElement>(null);
    const internalsRef = useRef<{
      renderer: THREE.WebGLRenderer;
      group: THREE.Group;
      animId: number;
      isDragging: boolean;
      isRolling: boolean;
      lastMouse: { x: number; y: number };
      velocity: { x: number; y: number };
    } | null>(null);
    const labelsRef = useRef(faceLabels);
    labelsRef.current = faceLabels;

    const cleanup = useCallback(() => {
      if (internalsRef.current) {
        cancelAnimationFrame(internalsRef.current.animId);
        internalsRef.current.renderer.dispose();
        internalsRef.current = null;
      }
    }, []);

    useImperativeHandle(ref, () => ({
      roll: (targetFaceIndex: number) =>
        new Promise<string>((resolve) => {
          const state = internalsRef.current;
          if (!state || state.isRolling) { resolve(labelsRef.current[targetFaceIndex] ?? ""); return; }
          state.isRolling = true;
          state.velocity = { x: 0, y: 0 };
          const group = state.group;
          const target = FACE_ROTATIONS[targetFaceIndex];
          if (!target) { state.isRolling = false; resolve(""); return; }

          const spinsX = (Math.random() > 0.5 ? 1 : -1) * (Math.PI * 6 + Math.random() * Math.PI * 3);
          const spinsY = (Math.random() > 0.5 ? 1 : -1) * (Math.PI * 6 + Math.random() * Math.PI * 3);
          const startX = group.rotation.x, startY = group.rotation.y, startZ = group.rotation.z;
          const finalX = target.x + spinsX, finalY = target.y + spinsY, finalZ = target.z;
          const duration = 1600, startTime = performance.now();
          const ease = (t: number) => 1 - Math.pow(1 - t, 4);

          const anim = () => {
            const t = Math.min((performance.now() - startTime) / duration, 1);
            const e = ease(t);
            group.rotation.x = startX + (finalX - startX) * e;
            group.rotation.y = startY + (finalY - startY) * e;
            group.rotation.z = startZ + (finalZ - startZ) * e;
            if (t < 1) { requestAnimationFrame(anim); } else {
              group.rotation.set(target.x, target.y, 0);
              state.isRolling = false;
              const label = labelsRef.current[targetFaceIndex] ?? "";
              onRollComplete?.(label);
              resolve(label);
            }
          };
          requestAnimationFrame(anim);
        }),
    }));

    useEffect(() => {
      if (!mountRef.current) return;
      cleanup();
      const container = mountRef.current;
      const isLight = variant === "light";
      // Edge line color: pen black on light die, warm gray on dark die
      const edgeColor = isLight ? 0x000000 : 0xc8c4bc;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
      camera.position.set(0, 0, 5);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(size, size);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 3));
      renderer.setClearColor(0x000000, 0);
      container.appendChild(renderer.domElement);

      const labels = [...faceLabels];
      while (labels.length < 6) labels.push("");

      // Flat materials — no lighting, textures render exactly as drawn
      const materials = labels.map((label) =>
        new THREE.MeshBasicMaterial({ map: createFaceTexture(label, variant) })
      );

      const boxSize = 1.45;
      const geo = new THREE.BoxGeometry(boxSize, boxSize, boxSize, 8, 8, 8);

      // Round corners
      const half = boxSize / 2, rr = 0.14;
      const pos = geo.attributes.position;
      const v = new THREE.Vector3();
      for (let i = 0; i < pos.count; i++) {
        v.set(pos.getX(i), pos.getY(i), pos.getZ(i));
        const cx = Math.max(-half + rr, Math.min(half - rr, v.x));
        const cy = Math.max(-half + rr, Math.min(half - rr, v.y));
        const cz = Math.max(-half + rr, Math.min(half - rr, v.z));
        const dx = v.x - cx, dy = v.y - cy, dz = v.z - cz;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist > 0) { const s = rr / dist; v.set(cx + dx * s, cy + dy * s, cz + dz * s); }
        pos.setXYZ(i, v.x, v.y, v.z);
      }
      geo.computeVertexNormals();

      const dieMesh = new THREE.Mesh(geo, materials);

      // Edge lines — commitment lines (pen strokes on the form)
      const edgesGeo = new THREE.EdgesGeometry(geo, 12);
      const edgesMat = new THREE.LineBasicMaterial({
        color: edgeColor,
        linewidth: 1,
        transparent: true,
        opacity: isLight ? 0.5 : 0.35,
      });
      const edgeLines = new THREE.LineSegments(edgesGeo, edgesMat);

      const group = new THREE.Group();
      group.add(dieMesh);
      group.add(edgeLines);
      scene.add(group);
      group.rotation.set(0.35, -0.5, 0.08);

      const state = {
        renderer, group, animId: 0,
        isDragging: false, isRolling: false,
        lastMouse: { x: 0, y: 0 }, velocity: { x: 0, y: 0 },
      };

      const animate = () => {
        state.animId = requestAnimationFrame(animate);
        if (!state.isDragging && !state.isRolling) {
          state.velocity.x *= 0.97; state.velocity.y *= 0.97;
          if (Math.abs(state.velocity.x) + Math.abs(state.velocity.y) < 0.002) {
            state.velocity.x = 0.0012; state.velocity.y = 0.0006;
          }
          group.rotation.y += state.velocity.x;
          group.rotation.x += state.velocity.y;
        }
        renderer.render(scene, camera);
      };
      animate();

      const getPos = (e: MouseEvent | TouchEvent) =>
        "touches" in e ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : { x: e.clientX, y: e.clientY };
      const onDown = (e: MouseEvent | TouchEvent) => {
        if (state.isRolling) return;
        state.isDragging = true; state.lastMouse = getPos(e); state.velocity = { x: 0, y: 0 };
      };
      const onMove = (e: MouseEvent | TouchEvent) => {
        if (!state.isDragging || state.isRolling) return;
        const p = getPos(e);
        const dx = (p.x - state.lastMouse.x) * 0.007, dy = (p.y - state.lastMouse.y) * 0.007;
        group.rotation.y += dx; group.rotation.x += dy;
        state.velocity = { x: dx, y: dy }; state.lastMouse = p;
      };
      const onUp = () => { state.isDragging = false; };

      const el = renderer.domElement;
      el.style.cursor = "grab"; el.style.touchAction = "none";
      el.addEventListener("mousedown", onDown);
      el.addEventListener("mousemove", onMove);
      el.addEventListener("mouseup", onUp);
      el.addEventListener("mouseleave", onUp);
      el.addEventListener("touchstart", onDown, { passive: true });
      el.addEventListener("touchmove", onMove, { passive: true });
      el.addEventListener("touchend", onUp);
      internalsRef.current = state;

      return () => {
        el.removeEventListener("mousedown", onDown);
        el.removeEventListener("mousemove", onMove);
        el.removeEventListener("mouseup", onUp);
        el.removeEventListener("mouseleave", onUp);
        el.removeEventListener("touchstart", onDown);
        el.removeEventListener("touchmove", onMove);
        el.removeEventListener("touchend", onUp);
        cleanup();
        if (container.contains(el)) container.removeChild(el);
      };
    }, [faceLabels.join("|"), variant, size, cleanup]);

    return <div ref={mountRef} style={{ width: size, height: size }} />;
  }
);

InteractiveDie.displayName = "InteractiveDie";
export default InteractiveDie;
