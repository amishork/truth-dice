import { useRef, useEffect, useCallback } from "react";
import * as THREE from "three";

interface InteractiveDieProps {
  faceLabels: string[];
  variant: "light" | "dark";
  size?: number;
}

const FACE_CONFIG: { rotation: THREE.Euler; textRotation?: number }[] = [
  { rotation: new THREE.Euler(0, 0, 0) },           // front
  { rotation: new THREE.Euler(0, Math.PI, 0) },     // back
  { rotation: new THREE.Euler(0, Math.PI / 2, 0) }, // right
  { rotation: new THREE.Euler(0, -Math.PI / 2, 0) },// left
  { rotation: new THREE.Euler(-Math.PI / 2, 0, 0) },// top
  { rotation: new THREE.Euler(Math.PI / 2, 0, 0) }, // bottom
];

function createFaceTexture(
  text: string,
  variant: "light" | "dark",
  resolution = 512
): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = resolution;
  canvas.height = resolution;
  const ctx = canvas.getContext("2d")!;

  const bg = variant === "light" ? "#F5F3F0" : "#1A1A1A";
  const fg = variant === "light" ? "#1A1A1A" : "#F5F3F0";
  const border = variant === "light" ? "#D8D4CC" : "#333333";

  // Fill background
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, resolution, resolution);

  // Subtle inner border
  ctx.strokeStyle = border;
  ctx.lineWidth = 2;
  const inset = 16;
  const r = 20;
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
  ctx.stroke();

  // Text
  ctx.fillStyle = fg;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Dynamically size font to fit
  let fontSize = 52;
  ctx.font = `700 ${fontSize}px 'Inter', 'Helvetica Neue', Arial, sans-serif`;
  const upperText = text.toUpperCase();
  let metrics = ctx.measureText(upperText);
  while (metrics.width > resolution - 80 && fontSize > 18) {
    fontSize -= 2;
    ctx.font = `700 ${fontSize}px 'Inter', 'Helvetica Neue', Arial, sans-serif`;
    metrics = ctx.measureText(upperText);
  }

  ctx.fillText(upperText, resolution / 2, resolution / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  return texture;
}

const InteractiveDie: React.FC<InteractiveDieProps> = ({
  faceLabels,
  variant,
  size = 160,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    die: THREE.Mesh;
    animId: number;
    isDragging: boolean;
    lastMouse: { x: number; y: number };
    velocity: { x: number; y: number };
    targetQuat: THREE.Quaternion;
  } | null>(null);

  const cleanup = useCallback(() => {
    if (sceneRef.current) {
      cancelAnimationFrame(sceneRef.current.animId);
      sceneRef.current.renderer.dispose();
      sceneRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!mountRef.current) return;
    cleanup();

    const container = mountRef.current;
    const w = size;
    const h = size;

    // Scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, w / h, 0.1, 100);
    camera.position.set(0, 0, 5);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambient);
    const directional = new THREE.DirectionalLight(0xffffff, 0.5);
    directional.position.set(2, 3, 4);
    scene.add(directional);
    const backLight = new THREE.DirectionalLight(0xffffff, 0.15);
    backLight.position.set(-2, -1, -3);
    scene.add(backLight);

    // Build textures for 6 faces
    const labels = [...faceLabels];
    while (labels.length < 6) labels.push("");

    // Three.js cube face order: +X, -X, +Y, -Y, +Z, -Z
    // Map our labels: front(+Z)=0, back(-Z)=1, right(+X)=2, left(-X)=3, top(+Y)=4, bottom(-Y)=5
    const faceOrder = [2, 3, 4, 5, 0, 1]; // maps Three.js face index to our label index
    const materials = faceOrder.map((labelIdx) =>
      new THREE.MeshStandardMaterial({
        map: createFaceTexture(labels[labelIdx] || "", variant),
        roughness: 0.4,
        metalness: 0.0,
      })
    );

    // Geometry — rounded box approximation
    const geometry = new THREE.BoxGeometry(1.6, 1.6, 1.6, 4, 4, 4);

    // Round the vertices slightly
    const pos = geometry.attributes.position;
    const v = new THREE.Vector3();
    const radius = 1.6 / 2;
    const roundness = 0.12;
    for (let i = 0; i < pos.count; i++) {
      v.set(pos.getX(i), pos.getY(i), pos.getZ(i));
      // Normalize toward sphere for rounding effect
      const len = v.length();
      const sphereV = v.clone().normalize().multiplyScalar(radius * Math.sqrt(3));
      v.lerp(sphereV, roundness);
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    geometry.computeVertexNormals();

    const die = new THREE.Mesh(geometry, materials);
    scene.add(die);

    // Initial rotation — show a corner for visual interest
    die.rotation.set(0.4, -0.6, 0.15);

    // Interaction state
    const state = {
      renderer,
      scene,
      camera,
      die,
      animId: 0,
      isDragging: false,
      lastMouse: { x: 0, y: 0 },
      velocity: { x: 0, y: 0 },
      targetQuat: new THREE.Quaternion(),
    };

    // Animation loop
    const animate = () => {
      state.animId = requestAnimationFrame(animate);

      if (!state.isDragging) {
        // Apply velocity with damping
        const damping = 0.96;
        state.velocity.x *= damping;
        state.velocity.y *= damping;

        // Minimum auto-rotation when idle
        const minRotation = 0.002;
        const speed = Math.abs(state.velocity.x) + Math.abs(state.velocity.y);
        if (speed < 0.005) {
          state.velocity.x = minRotation;
          state.velocity.y = minRotation * 0.5;
        }

        die.rotation.y += state.velocity.x;
        die.rotation.x += state.velocity.y;
      }

      renderer.render(scene, camera);
    };
    animate();

    // Mouse / touch interaction
    const getEventPos = (e: MouseEvent | TouchEvent) => {
      if ("touches" in e) {
        return { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
      return { x: e.clientX, y: e.clientY };
    };

    const onDown = (e: MouseEvent | TouchEvent) => {
      state.isDragging = true;
      const pos = getEventPos(e);
      state.lastMouse = pos;
      state.velocity = { x: 0, y: 0 };
    };

    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!state.isDragging) return;
      const pos = getEventPos(e);
      const dx = (pos.x - state.lastMouse.x) * 0.008;
      const dy = (pos.y - state.lastMouse.y) * 0.008;
      die.rotation.y += dx;
      die.rotation.x += dy;
      state.velocity = { x: dx, y: dy };
      state.lastMouse = pos;
    };

    const onUp = () => {
      state.isDragging = false;
    };

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

    sceneRef.current = state;

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
  }, [faceLabels.join(","), variant, size, cleanup]);

  return (
    <div
      ref={mountRef}
      style={{ width: size, height: size, display: "inline-block" }}
    />
  );
};

export default InteractiveDie;
