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

// Target rotations so each face index faces the camera (+Z)
const FACE_ROTATIONS: THREE.Euler[] = [
  new THREE.Euler(0, Math.PI / 2, 0),   // 0 → +X
  new THREE.Euler(0, -Math.PI / 2, 0),  // 1 → -X
  new THREE.Euler(-Math.PI / 2, 0, 0),  // 2 → +Y
  new THREE.Euler(Math.PI / 2, 0, 0),   // 3 → -Y
  new THREE.Euler(0, 0, 0),             // 4 → +Z
  new THREE.Euler(0, Math.PI, 0),       // 5 → -Z
];

function createFaceTexture(text: string, variant: "light" | "dark"): THREE.CanvasTexture {
  const res = 2048;
  const canvas = document.createElement("canvas");
  canvas.width = res;
  canvas.height = res;
  const ctx = canvas.getContext("2d")!;

  const isLight = variant === "light";

  // Background
  ctx.fillStyle = isLight ? "#F2F0EC" : "#111111";
  ctx.fillRect(0, 0, res, res);

  // Subtle edge shading for depth
  const edgeGrad = ctx.createRadialGradient(res/2, res/2, res * 0.25, res/2, res/2, res * 0.7);
  edgeGrad.addColorStop(0, "transparent");
  edgeGrad.addColorStop(1, isLight ? "rgba(0,0,0,0.03)" : "rgba(0,0,0,0.15)");
  ctx.fillStyle = edgeGrad;
  ctx.fillRect(0, 0, res, res);

  // Inner border — crisp, refined
  const inset = res * 0.07;
  const cornerR = res * 0.06;
  ctx.strokeStyle = isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)";
  ctx.lineWidth = res * 0.003;
  ctx.beginPath();
  ctx.roundRect(inset, inset, res - inset * 2, res - inset * 2, cornerR);
  ctx.stroke();

  // Text
  const upperText = text.toUpperCase();
  ctx.fillStyle = isLight ? "#1A1A1A" : "#F0EDE8";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Size text to fit generously
  let fontSize = res * 0.16;
  const maxWidth = res * 0.68;
  ctx.font = `800 ${fontSize}px -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif`;
  let m = ctx.measureText(upperText);

  while (m.width > maxWidth && fontSize > res * 0.06) {
    fontSize -= res * 0.006;
    ctx.font = `800 ${fontSize}px -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif`;
    m = ctx.measureText(upperText);
  }

  // Multi-line for very long text
  if (m.width > maxWidth) {
    const words = upperText.split(" ");
    if (words.length >= 2) {
      const mid = Math.ceil(words.length / 2);
      const line1 = words.slice(0, mid).join(" ");
      const line2 = words.slice(mid).join(" ");
      fontSize = res * 0.11;
      ctx.font = `800 ${fontSize}px -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif`;
      const lineH = fontSize * 1.25;
      ctx.fillText(line1, res / 2, res / 2 - lineH / 2);
      ctx.fillText(line2, res / 2, res / 2 + lineH / 2);
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

/** Generate a simple environment cubemap for reflections */
function createEnvMap(renderer: THREE.WebGLRenderer): THREE.CubeTexture {
  const size = 128;
  const makeCanvas = (topColor: string, bottomColor: string) => {
    const c = document.createElement("canvas");
    c.width = size; c.height = size;
    const ctx = c.getContext("2d")!;
    const g = ctx.createLinearGradient(0, 0, 0, size);
    g.addColorStop(0, topColor);
    g.addColorStop(1, bottomColor);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    return c;
  };

  // px, nx, py, ny, pz, nz
  const faces = [
    makeCanvas("#e8e4e0", "#d0ccc8"), // +X
    makeCanvas("#ddd9d5", "#c8c4c0"), // -X
    makeCanvas("#f5f3f0", "#e0dcd8"), // +Y (top — brightest)
    makeCanvas("#b0aca8", "#a09c98"), // -Y (bottom — darkest)
    makeCanvas("#e0dcd8", "#ccc8c4"), // +Z
    makeCanvas("#d8d4d0", "#c0bcb8"), // -Z
  ];

  const cubeTexture = new THREE.CubeTexture(faces);
  cubeTexture.needsUpdate = true;
  return cubeTexture;
}

const InteractiveDie = forwardRef<DieHandle, InteractiveDieProps>(
  ({ faceLabels, variant, size = 160, onRollComplete }, ref) => {
    const mountRef = useRef<HTMLDivElement>(null);
    const internalsRef = useRef<{
      renderer: THREE.WebGLRenderer;
      die: THREE.Mesh;
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
      roll: (targetFaceIndex: number) => {
        return new Promise<string>((resolve) => {
          const state = internalsRef.current;
          if (!state || state.isRolling) {
            resolve(labelsRef.current[targetFaceIndex] ?? "");
            return;
          }
          state.isRolling = true;
          state.velocity = { x: 0, y: 0 };

          const die = state.die;
          const target = FACE_ROTATIONS[targetFaceIndex];
          if (!target) { state.isRolling = false; resolve(""); return; }

          const spinsX = (Math.random() > 0.5 ? 1 : -1) * (Math.PI * 6 + Math.random() * Math.PI * 3);
          const spinsY = (Math.random() > 0.5 ? 1 : -1) * (Math.PI * 6 + Math.random() * Math.PI * 3);
          const finalX = target.x + spinsX;
          const finalY = target.y + spinsY;
          const finalZ = target.z;

          const startX = die.rotation.x;
          const startY = die.rotation.y;
          const startZ = die.rotation.z;
          const duration = 1600;
          const startTime = performance.now();

          const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);

          const animateRoll = () => {
            const elapsed = performance.now() - startTime;
            const t = Math.min(elapsed / duration, 1);
            const eased = easeOutQuart(t);

            die.rotation.x = startX + (finalX - startX) * eased;
            die.rotation.y = startY + (finalY - startY) * eased;
            die.rotation.z = startZ + (finalZ - startZ) * eased;

            if (t < 1) {
              requestAnimationFrame(animateRoll);
            } else {
              die.rotation.set(target.x, target.y, 0);
              state.isRolling = false;
              const label = labelsRef.current[targetFaceIndex] ?? "";
              onRollComplete?.(label);
              resolve(label);
            }
          };
          requestAnimationFrame(animateRoll);
        });
      },
    }));

    useEffect(() => {
      if (!mountRef.current) return;
      cleanup();

      const container = mountRef.current;
      const w = size;
      const h = size;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(28, w / h, 0.1, 100);
      camera.position.set(0, 0, 5);

      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 3));
      renderer.setClearColor(0x000000, 0);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      container.appendChild(renderer.domElement);

      // Environment map for reflections
      const envMap = createEnvMap(renderer);
      scene.environment = envMap;

      // Studio lighting
      const ambient = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambient);

      const key = new THREE.DirectionalLight(0xffffff, 1.0);
      key.position.set(3, 4, 5);
      scene.add(key);

      const fill = new THREE.DirectionalLight(0xffffff, 0.4);
      fill.position.set(-4, 2, 3);
      scene.add(fill);

      const rim = new THREE.DirectionalLight(0xffffff, 0.3);
      rim.position.set(0, -3, -4);
      scene.add(rim);

      const topSpot = new THREE.PointLight(0xffffff, 0.3, 15);
      topSpot.position.set(0, 5, 2);
      scene.add(topSpot);

      // Build face materials
      const labels = [...faceLabels];
      while (labels.length < 6) labels.push("");

      const materials = labels.map((label) =>
        new THREE.MeshPhysicalMaterial({
          map: createFaceTexture(label, variant),
          roughness: 0.12,
          metalness: 0.0,
          clearcoat: 1.0,
          clearcoatRoughness: 0.05,
          reflectivity: 0.8,
          envMap,
          envMapIntensity: 0.4,
        })
      );

      // Rounded box
      const boxSize = 1.45;
      const geo = new THREE.BoxGeometry(boxSize, boxSize, boxSize, 8, 8, 8);
      const pos = geo.attributes.position;
      const v = new THREE.Vector3();
      const half = boxSize / 2;
      const rr = 0.13;
      for (let i = 0; i < pos.count; i++) {
        v.set(pos.getX(i), pos.getY(i), pos.getZ(i));
        const cx = Math.max(-half + rr, Math.min(half - rr, v.x));
        const cy = Math.max(-half + rr, Math.min(half - rr, v.y));
        const cz = Math.max(-half + rr, Math.min(half - rr, v.z));
        const dx = v.x - cx, dy = v.y - cy, dz = v.z - cz;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist > 0) {
          const s = rr / dist;
          v.set(cx + dx * s, cy + dy * s, cz + dz * s);
        }
        pos.setXYZ(i, v.x, v.y, v.z);
      }
      geo.computeVertexNormals();

      const die = new THREE.Mesh(geo, materials);
      scene.add(die);
      die.rotation.set(0.3, -0.45, 0.08);

      const state = {
        renderer, die, animId: 0,
        isDragging: false, isRolling: false,
        lastMouse: { x: 0, y: 0 },
        velocity: { x: 0, y: 0 },
      };

      const animate = () => {
        state.animId = requestAnimationFrame(animate);
        if (!state.isDragging && !state.isRolling) {
          state.velocity.x *= 0.97;
          state.velocity.y *= 0.97;
          const speed = Math.abs(state.velocity.x) + Math.abs(state.velocity.y);
          if (speed < 0.002) {
            state.velocity.x = 0.0012;
            state.velocity.y = 0.0006;
          }
          die.rotation.y += state.velocity.x;
          die.rotation.x += state.velocity.y;
        }
        renderer.render(scene, camera);
      };
      animate();

      // Interaction
      const getPos = (e: MouseEvent | TouchEvent) =>
        "touches" in e ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : { x: e.clientX, y: e.clientY };
      const onDown = (e: MouseEvent | TouchEvent) => {
        if (state.isRolling) return;
        state.isDragging = true; state.lastMouse = getPos(e); state.velocity = { x: 0, y: 0 };
      };
      const onMove = (e: MouseEvent | TouchEvent) => {
        if (!state.isDragging || state.isRolling) return;
        const p = getPos(e);
        const dx = (p.x - state.lastMouse.x) * 0.007;
        const dy = (p.y - state.lastMouse.y) * 0.007;
        die.rotation.y += dx; die.rotation.x += dy;
        state.velocity = { x: dx, y: dy }; state.lastMouse = p;
      };
      const onUp = () => { state.isDragging = false; };

      const el = renderer.domElement;
      el.style.cursor = "grab";
      el.style.touchAction = "none";
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
