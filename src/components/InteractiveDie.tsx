import React, { useRef, useEffect, useCallback, useImperativeHandle, forwardRef } from "react";
import * as THREE from "three";

export interface DieHandle {
  /** Spin the die and land on the given face index (0-5). Returns the label. */
  roll: (targetFaceIndex: number) => Promise<string>;
}

interface InteractiveDieProps {
  faceLabels: string[];
  variant: "light" | "dark";
  size?: number;
  onRollComplete?: (label: string) => void;
}

// Target rotations for each face to be camera-facing (+Z direction)
const FACE_ROTATIONS: THREE.Euler[] = [
  new THREE.Euler(0, Math.PI / 2, 0),   // face 0 → +X (right)
  new THREE.Euler(0, -Math.PI / 2, 0),  // face 1 → -X (left)
  new THREE.Euler(-Math.PI / 2, 0, 0),  // face 2 → +Y (top)
  new THREE.Euler(Math.PI / 2, 0, 0),   // face 3 → -Y (bottom)
  new THREE.Euler(0, 0, 0),             // face 4 → +Z (front)
  new THREE.Euler(0, Math.PI, 0),       // face 5 → -Z (back)
];

function createFaceTexture(
  text: string,
  variant: "light" | "dark",
  resolution = 1024
): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = resolution;
  canvas.height = resolution;
  const ctx = canvas.getContext("2d")!;

  const isLight = variant === "light";
  const bg = isLight ? "#F8F6F3" : "#141414";
  const fg = isLight ? "#1A1A1A" : "#F0EDE8";
  const accent = isLight ? "#E0DCD5" : "#2A2A2A";

  // Fill
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, resolution, resolution);

  // Subtle inner border
  const inset = resolution * 0.06;
  const r = resolution * 0.08;
  ctx.strokeStyle = accent;
  ctx.lineWidth = resolution * 0.004;
  ctx.beginPath();
  ctx.moveTo(inset + r, inset);
  ctx.lineTo(resolution - inset - r, inset);
  ctx.quadraticCurveTo(resolution - inset, inset, resolution - inset, inset + r);
  ctx.lineTo(resolution - inset, resolution - inset - r);
  ctx.quadraticCurveTo(resolution - inset, resolution - inset, resolution - inset - r, resolution - inset);
  ctx.lineTo(inset + r, resolution - inset);
  ctx.quadraticCurveTo(inset, resolution - inset, inset, resolution - inset - r);
  ctx.lineTo(inset, inset + r);
  ctx.quadraticCurveTo(inset, inset, inset + r, inset);
  ctx.closePath();
  ctx.stroke();

  // Text — dynamically sized to fit
  ctx.fillStyle = fg;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const upperText = text.toUpperCase();

  let fontSize = resolution * 0.12;
  ctx.font = `800 ${fontSize}px 'Inter', 'Helvetica Neue', sans-serif`;
  let metrics = ctx.measureText(upperText);
  const maxWidth = resolution * 0.72;
  while (metrics.width > maxWidth && fontSize > resolution * 0.04) {
    fontSize -= resolution * 0.005;
    ctx.font = `800 ${fontSize}px 'Inter', 'Helvetica Neue', sans-serif`;
    metrics = ctx.measureText(upperText);
  }

  ctx.fillText(upperText, resolution / 2, resolution / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 8;
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
      scene: THREE.Scene;
      camera: THREE.PerspectiveCamera;
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

    // Expose roll method
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

          // Add full spins for drama
          const spinsX = (Math.random() > 0.5 ? 1 : -1) * (Math.PI * 4 + Math.random() * Math.PI * 2);
          const spinsY = (Math.random() > 0.5 ? 1 : -1) * (Math.PI * 4 + Math.random() * Math.PI * 2);
          const finalX = target.x + spinsX;
          const finalY = target.y + spinsY;
          const finalZ = target.z + (Math.random() - 0.5) * 0.3;

          const startX = die.rotation.x;
          const startY = die.rotation.y;
          const startZ = die.rotation.z;
          const duration = 1400;
          const startTime = performance.now();

          const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

          const animateRoll = () => {
            const elapsed = performance.now() - startTime;
            const t = Math.min(elapsed / duration, 1);
            const eased = easeOutCubic(t);

            die.rotation.x = startX + (finalX - startX) * eased;
            die.rotation.y = startY + (finalY - startY) * eased;
            die.rotation.z = startZ + (finalZ - startZ) * eased;

            if (t < 1) {
              requestAnimationFrame(animateRoll);
            } else {
              // Normalize rotations
              die.rotation.x = target.x;
              die.rotation.y = target.y;
              die.rotation.z = 0;
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
      const camera = new THREE.PerspectiveCamera(30, w / h, 0.1, 100);
      camera.position.set(0, 0, 5.5);

      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 3));
      renderer.setClearColor(0x000000, 0);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.1;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      container.appendChild(renderer.domElement);

      // Lighting — studio setup for glossy acrylic
      const ambient = new THREE.AmbientLight(0xffffff, 0.4);
      scene.add(ambient);

      const key = new THREE.DirectionalLight(0xffffff, 0.8);
      key.position.set(3, 4, 5);
      scene.add(key);

      const fill = new THREE.DirectionalLight(0xffffff, 0.3);
      fill.position.set(-3, 2, 3);
      scene.add(fill);

      const rim = new THREE.DirectionalLight(0xffffff, 0.25);
      rim.position.set(0, -2, -4);
      scene.add(rim);

      const topLight = new THREE.PointLight(0xffffff, 0.2, 20);
      topLight.position.set(0, 5, 2);
      scene.add(topLight);

      // Build textures
      const labels = [...faceLabels];
      while (labels.length < 6) labels.push("");

      // Three.js face order: +X, -X, +Y, -Y, +Z, -Z → our indices 0-5
      const materials = labels.map((label) => {
        const mat = new THREE.MeshPhysicalMaterial({
          map: createFaceTexture(label, variant, 1024),
          roughness: 0.15,
          metalness: 0.0,
          clearcoat: 1.0,
          clearcoatRoughness: 0.08,
          reflectivity: 0.6,
          envMapIntensity: 0.3,
        });
        return mat;
      });

      // Rounded box geometry
      const geo = new THREE.BoxGeometry(1.5, 1.5, 1.5, 6, 6, 6);
      const pos = geo.attributes.position;
      const v = new THREE.Vector3();
      const halfSize = 0.75;
      const roundRadius = 0.12;
      for (let i = 0; i < pos.count; i++) {
        v.set(pos.getX(i), pos.getY(i), pos.getZ(i));
        // Clamp each axis, then round the corners
        const cx = Math.max(-halfSize + roundRadius, Math.min(halfSize - roundRadius, v.x));
        const cy = Math.max(-halfSize + roundRadius, Math.min(halfSize - roundRadius, v.y));
        const cz = Math.max(-halfSize + roundRadius, Math.min(halfSize - roundRadius, v.z));
        const dx = v.x - cx;
        const dy = v.y - cy;
        const dz = v.z - cz;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist > 0) {
          const scale = roundRadius / dist;
          v.set(cx + dx * scale, cy + dy * scale, cz + dz * scale);
        }
        pos.setXYZ(i, v.x, v.y, v.z);
      }
      geo.computeVertexNormals();

      const die = new THREE.Mesh(geo, materials);
      scene.add(die);
      die.rotation.set(0.35, -0.5, 0.1);

      const state = {
        renderer, scene, camera, die,
        animId: 0,
        isDragging: false,
        isRolling: false,
        lastMouse: { x: 0, y: 0 },
        velocity: { x: 0, y: 0 },
      };

      const animate = () => {
        state.animId = requestAnimationFrame(animate);
        if (!state.isDragging && !state.isRolling) {
          const damping = 0.97;
          state.velocity.x *= damping;
          state.velocity.y *= damping;
          const speed = Math.abs(state.velocity.x) + Math.abs(state.velocity.y);
          if (speed < 0.003) {
            state.velocity.x = 0.0015;
            state.velocity.y = 0.0008;
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
        state.isDragging = true;
        state.lastMouse = getPos(e);
        state.velocity = { x: 0, y: 0 };
      };
      const onMove = (e: MouseEvent | TouchEvent) => {
        if (!state.isDragging || state.isRolling) return;
        const p = getPos(e);
        const dx = (p.x - state.lastMouse.x) * 0.008;
        const dy = (p.y - state.lastMouse.y) * 0.008;
        die.rotation.y += dx;
        die.rotation.x += dy;
        state.velocity = { x: dx, y: dy };
        state.lastMouse = p;
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
