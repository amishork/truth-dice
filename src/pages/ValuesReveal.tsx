import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useNavigate } from "react-router-dom";
import PageMeta from "@/components/PageMeta";

// ─── Decode values from URL ──────────────────────────────────────────────────
function decodeValues(encoded: string): string[] {
  try {
    const decoded = atob(encoded.replace(/-/g, "+").replace(/_/g, "/"));
    const values = decoded.split("|").filter(Boolean);
    return values.length === 6 ? values : [];
  } catch {
    return [];
  }
}

export function encodeValues(values: string[]): string {
  return btoa(values.join("|")).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// ─── Ember Particles ──────────────────────────────────────────────────────────
function Embers({ count = 35 }) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        size: Math.random() * 3 + 1,
        duration: Math.random() * 8 + 6,
        delay: Math.random() * 5,
        drift: (Math.random() - 0.5) * 30,
        opacity: Math.random() * 0.5 + 0.15,
      })),
    [count]
  );

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            bottom: -10,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: `radial-gradient(circle, rgba(200, 80, 70, ${p.opacity}) 0%, rgba(155, 27, 58, ${p.opacity * 0.5}) 60%, transparent 100%)`,
            boxShadow:
              p.size > 2
                ? `0 0 ${p.size * 2}px rgba(200, 80, 70, ${p.opacity * 0.4})`
                : "none",
          }}
          animate={{
            y: [0, -(window?.innerHeight ?? 900) - 40],
            x: [0, p.drift],
            opacity: [0, p.opacity, p.opacity, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}

// ─── Glow Ring ────────────────────────────────────────────────────────────────
function GlowRing({ delay = 0 }) {
  return (
    <motion.div
      style={{
        position: "absolute",
        width: 120,
        height: 120,
        borderRadius: "50%",
        border: "1px solid rgba(155, 27, 58, 0.15)",
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
      }}
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: [0.5, 1.8, 2.2], opacity: [0, 0.3, 0] }}
      transition={{ delay, duration: 2.5, ease: "easeOut" }}
    />
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const ValuesReveal = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const encoded = searchParams.get("d") ?? "";
  const values = useMemo(() => decodeValues(encoded), [encoded]);

  const [phase, setPhase] = useState(0);
  const [showComposed, setShowComposed] = useState(false);

  useEffect(() => {
    if (values.length === 0) return;
    const timers = [
      setTimeout(() => setPhase(1), 600),
      setTimeout(() => setPhase(2), 1800),
      setTimeout(() => setPhase(3), 2800),
      setTimeout(() => setPhase(4), 2800 + values.length * 500 + 800),
      setTimeout(
        () => setShowComposed(true),
        2800 + values.length * 500 + 1600
      ),
    ];
    return () => timers.forEach(clearTimeout);
  }, [values]);

  // Empty / invalid state
  if (values.length === 0) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 16,
          background: "#0C0A0D",
          color: "rgba(255,255,255,0.6)",
          fontFamily: "'EB Garamond', Georgia, serif",
        }}
      >
        <p style={{ fontSize: 18 }}>This link doesn't contain valid values.</p>
        <button
          onClick={() => navigate("/quiz")}
          style={{
            padding: "10px 28px",
            background: "transparent",
            color: "rgba(200, 80, 70, 0.8)",
            border: "1px solid rgba(155, 27, 58, 0.3)",
            fontSize: 12,
            fontFamily: "'EB Garamond', Georgia, serif",
            letterSpacing: "0.2em",
            textTransform: "uppercase" as const,
            cursor: "pointer",
          }}
        >
          Take the Assessment
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        padding: "60px 24px",
        background:
          "linear-gradient(170deg, #0C0A0D 0%, #140E14 30%, #1A0F16 50%, #110D12 80%, #0A080C 100%)",
      }}
    >
      <PageMeta
        title="My Core Values"
        description="Discover what drives me — my 6 core values, revealed through Words Incarnate."
        path="/v"
      />

      {/* Noise overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.03,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: "200px 200px",
          pointerEvents: "none",
        }}
      />

      {/* Radial glow */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "45%",
          transform: "translate(-50%, -50%)",
          width: "60vw",
          height: "60vh",
          background:
            "radial-gradient(ellipse, rgba(155, 27, 58, 0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <Embers />

      {/* ═══ Content ═══ */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          textAlign: "center",
          maxWidth: 540,
          width: "100%",
        }}
      >
        {/* Flame icon */}
        <AnimatePresence>
          {phase >= 1 && (
            <motion.div
              style={{
                position: "relative",
                display: "inline-flex",
                marginBottom: 36,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
            >
              <GlowRing delay={0} />
              <GlowRing delay={0.4} />
              <motion.svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgba(200, 80, 70, 0.9)"
                strokeWidth={1.4}
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  delay: 0.2,
                  duration: 1,
                  ease: [0.22, 1, 0.36, 1],
                }}
                style={{
                  filter: "drop-shadow(0 0 12px rgba(155, 27, 58, 0.4))",
                }}
              >
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
              </motion.svg>
            </motion.div>
          )}
        </AnimatePresence>

        {/* "MY VALUES" */}
        {phase >= 2 && (
          <motion.div
            style={{ marginBottom: 48, overflow: "hidden" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.p
              style={{
                fontFamily:
                  "'EB Garamond', 'Cormorant Garamond', Georgia, serif",
                fontSize: 13,
                fontWeight: 400,
                letterSpacing: "0.4em",
                color: "rgba(255,255,255,0.35)",
                textTransform: "uppercase" as const,
              }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              My Values
            </motion.p>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: 16,
              }}
            >
              <motion.div
                style={{
                  height: 0.5,
                  background: "rgba(255,255,255,0.1)",
                  width: 80,
                }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.4, duration: 0.8, ease: "easeInOut" }}
              />
            </div>
          </motion.div>
        )}

        {/* Values — animated reveal */}
        {phase >= 3 && !showComposed && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
            }}
          >
            {values.map((value, i) => (
              <motion.div
                key={value}
                style={{ overflow: "hidden", padding: "8px 0" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.5, duration: 0.1 }}
              >
                <motion.span
                  style={{
                    display: "block",
                    fontFamily: "'IBM Plex Mono', 'SF Mono', monospace",
                    fontSize: 10,
                    color: "rgba(155, 27, 58, 0.5)",
                    letterSpacing: "0.15em",
                    marginBottom: 6,
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.5 + 0.15, duration: 0.3 }}
                >
                  {String(i + 1).padStart(2, "0")}
                </motion.span>

                <div style={{ overflow: "hidden" }}>
                  <motion.div
                    style={{
                      fontFamily:
                        "'EB Garamond', 'Cormorant Garamond', Georgia, serif",
                      fontSize: "clamp(28px, 6vw, 44px)",
                      fontWeight: 400,
                      fontStyle: "italic",
                      letterSpacing: "0.02em",
                      color: "rgba(255,255,255,0.88)",
                      lineHeight: 1.15,
                    }}
                    initial={{ y: "120%" }}
                    animate={{ y: "0%" }}
                    transition={{
                      delay: i * 0.5 + 0.05,
                      duration: 0.7,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    {value}
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Composed final state */}
        {showComposed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            {values.map((value, i) => (
              <motion.div
                key={value}
                style={{ padding: "7px 0" }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
              >
                <span
                  style={{
                    display: "block",
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 9,
                    color: "rgba(155, 27, 58, 0.45)",
                    letterSpacing: "0.15em",
                    marginBottom: 4,
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  style={{
                    fontFamily: "'EB Garamond', Georgia, serif",
                    fontSize: "clamp(24px, 5vw, 38px)",
                    fontWeight: 400,
                    fontStyle: "italic",
                    letterSpacing: "0.02em",
                    color: "rgba(255,255,255,0.88)",
                    lineHeight: 1.2,
                  }}
                >
                  {value}
                </span>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Footer */}
        {phase >= 4 && (
          <motion.div
            style={{ marginTop: 48 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <motion.div
              style={{
                height: 0.5,
                background: "rgba(255,255,255,0.08)",
                width: 60,
                margin: "0 auto 20px",
              }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            />

            <p
              style={{
                fontFamily: "'EB Garamond', Georgia, serif",
                fontSize: 11,
                fontWeight: 400,
                letterSpacing: "0.3em",
                color: "rgba(255,255,255,0.22)",
                textTransform: "uppercase" as const,
                marginBottom: 24,
              }}
            >
              Words Incarnate
            </p>

            <motion.button
              onClick={() => navigate("/quiz")}
              style={{
                padding: "12px 32px",
                background: "transparent",
                color: "rgba(200, 80, 70, 0.8)",
                border: "1px solid rgba(155, 27, 58, 0.3)",
                fontSize: 11,
                fontFamily: "'EB Garamond', Georgia, serif",
                fontWeight: 400,
                letterSpacing: "0.22em",
                textTransform: "uppercase" as const,
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              whileHover={{
                borderColor: "rgba(155, 27, 58, 0.6)",
                color: "rgba(200, 80, 70, 1)",
                boxShadow: "0 0 20px rgba(155, 27, 58, 0.15)",
              }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
            >
              Discover Yours
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ValuesReveal;
