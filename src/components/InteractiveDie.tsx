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

const FACE_ROTATIONS: THREE.Euler[] = [
  new THREE.Euler(0, Math.PI / 2, 0),
  new THREE.Euler(0, -Math.PI / 2, 0),
  new THREE.Euler(-Math.PI / 2, 0, 0),
  new THREE.Euler(Math.PI / 2, 0, 0),
  new THREE.Euler(0, 0, 0),
  new THREE.Euler(0, Math.PI, 0),
];

function createFaceTexture(text: string, variant: "light" | "dark"): THREE.CanvasTexture {
  const res = 2048;
  const canvas = document.createElement("canvas");
  canvas.width = res;
  canvas.height = res;
  const ctx = canvas.getContext("2d")!;
  const isLight = variant === "light";

  ctx.fillStyle = isLight ? "#F2F0EC" : "#0E0E0E";
  ctx.fillRect(0, 0, res, res);

  // Subtle border
  const inset = res * 0.065;
  const cornerR = res * 0.055;
  ctx.strokeStyle = isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.06)";
  ctx.lineWidth = res * 0.003;
  ctx.beginPath();
  ctx.roundRect(inset, inset, res - inset * 2, res - inset * 2, cornerR);
  ctx.stroke();

  // Text
  const upperText = text.toUpperCase();
  ctx.fillStyle = isLight ? "#1A1A1A" : "#E8E4E0";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  let fontSize = res * 0.16;
  const maxWidth = res * 0.68;
  ctx.font = `800 ${fontSize}px -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif`;
  let m = ctx.measureText(upperText);
  while (m.width > maxWidth && fontSize > res * 0.06) {
    fontSize -= res * 0.005;
    ctx.font = `800 ${fontSize}px -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif`;
    m = ctx.measureText(upperText);
  }

  if (m.width > maxWidth) {
    const words = upperText.split(" ");
    if (words.length >= 2) {
      const mid = Math.ceil(words.length / 2);
      fontSize = res * 0.11;
      ctx.font = `800 ${fontSize}px -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif`;
      const lineH = fontSize * 1.25;
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

/** Detect page dark/light mode from DOM */
function isDarkMode(): boolean {
  return document.documentElement.classList.contains("dark");
}

const InteractiveDie = forwardRef<DieHandle, InteractiveDieProps>(
  ({ faceLabels, variant, size = 160, onRollComplete }, ref) => {
    const mountRef = useRef<HTMLDivElement>(null);
    const internalsRef = useRef<{
      renderer: THREE.WebGLRenderer;
      die: THREE.Mesh;
      scene: THREE.Scene;
      camera: THREE.PerspectiveCamera;
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
          const die = state.die;
          const target = FACE_ROTATIONS[targetFaceIndex];
          if (!target) { state.isRolling = false; resolve(""); return; }

          const spinsX = (Math.random() > 0.5 ? 1 : -1) * (Math.PI * 6 + Math.random() * Math.PI * 3);
          const spinsY = (Math.random() > 0.5 ? 1 : -1) * (Math.PI * 6 + Math.random() * Math.PI * 3);
          const startX = die.rotation.x, startY = die.rotation.y, startZ = die.rotation.z;
          const finalX = target.x + spinsX, finalY = target.y + spinsY, finalZ = target.z;
          const duration = 1600, startTime = performance.now();
          const ease = (t: number) => 1 - Math.pow(1 - t, 4);

          const anim = () => {
            const t = Math.min((performance.now() - startTime) / duration, 1);
            const e = ease(t);
            die.rotation.x = startX + (finalX - startX) * e;
            die.rotation.y = startY + (finalY - startY) * e;
            die.rotation.z = startZ + (finalZ - startZ) * e;
            if (t < 1) { requestAnimationFrame(anim); } else {
              die.rotation.set(target.x, target.y, 0);
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
      const dark = isDarkMode();

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
      camera.position.set(0, 0, 5);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
      renderer.setSize(size, size);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 3));
      renderer.setClearColor(0x000000, 0);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = dark ? 0.9 : 1.2;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      // Enable shadows
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      container.appendChild(renderer.domElement);

      // ─── Lighting: single-source directional, environment-aware ───
      if (dark) {
        // DARK MODE: dramatic single key light, deep shadows
        const key = new THREE.DirectionalLight(0xffeedd, 1.6);
        key.position.set(3, 5, 4);
        key.castShadow = true;
        scene.add(key);

        // Extremely subtle fill — just enough to not lose the form
        const fill = new THREE.DirectionalLight(0x8899bb, 0.08);
        fill.position.set(-4, 1, 2);
        scene.add(fill);

        // Minimal ambient — dark environment
        const ambient = new THREE.AmbientLight(0x222233, 0.06);
        scene.add(ambient);
      } else {
        // LIGHT MODE: bright key + strong ambient bounce (white room)
        const key = new THREE.DirectionalLight(0xffffff, 1.2);
        key.position.set(3, 5, 4);
        key.castShadow = true;
        scene.add(key);

        // Ambient simulates light bouncing off white walls/table
        const ambient = new THREE.AmbientLight(0xffffff, 0.65);
        scene.add(ambient);

        // Gentle fill from opposite side (reflected light)
        const fill = new THREE.DirectionalLight(0xf0ece8, 0.25);
        fill.position.set(-3, 2, 3);
        scene.add(fill);

        // Subtle ground bounce
        const bounce = new THREE.DirectionalLight(0xf5f0eb, 0.1);
        bounce.position.set(0, -3, 2);
        scene.add(bounce);
      }

      // Materials
      const labels = [...faceLabels];
      while (labels.length < 6) labels.push("");

      const materials = labels.map((label) =>
        new THREE.MeshPhysicalMaterial({
          map: createFaceTexture(label, variant),
          roughness: dark ? 0.2 : 0.15,
          metalness: 0.0,
          clearcoat: 0.8,
          clearcoatRoughness: dark ? 0.12 : 0.06,
          reflectivity: dark ? 0.3 : 0.5,
        })
      );

      // Rounded box
      const boxSize = 1.45;
      const geo = new THREE.BoxGeometry(boxSize, boxSize, boxSize, 8, 8, 8);
      const pos = geo.attributes.position;
      const v = new THREE.Vector3();
      const half = boxSize / 2, rr = 0.13;
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

      const die = new THREE.Mesh(geo, materials);
      scene.add(die);
      die.rotation.set(0.3, -0.45, 0.08);

      const state = {
        renderer, die, scene, camera, animId: 0,
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
          die.rotation.y += state.velocity.x; die.rotation.x += state.velocity.y;
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
        die.rotation.y += dx; die.rotation.x += dy;
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
