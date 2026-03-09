import { useEffect, useRef } from "react";

// Maps value keywords to mood palettes (HSL accent shifts)
const VALUE_MOODS: Record<string, { hue: number; sat: number; label: string }> = {
  // Relational / warm
  love: { hue: 15, sat: 80, label: "warm" },
  family: { hue: 25, sat: 75, label: "warm" },
  caring: { hue: 20, sat: 70, label: "warm" },
  kindness: { hue: 30, sat: 72, label: "warm" },
  compassion: { hue: 10, sat: 78, label: "warm" },
  friendship: { hue: 22, sat: 68, label: "warm" },
  tenderness: { hue: 18, sat: 74, label: "warm" },
  nurturing: { hue: 28, sat: 70, label: "warm" },
  togetherness: { hue: 24, sat: 72, label: "warm" },
  affection: { hue: 12, sat: 76, label: "warm" },

  // Intellectual / cool
  wisdom: { hue: 220, sat: 60, label: "cool" },
  knowledge: { hue: 210, sat: 55, label: "cool" },
  learning: { hue: 215, sat: 58, label: "cool" },
  clarity: { hue: 200, sat: 50, label: "cool" },
  truth: { hue: 225, sat: 62, label: "cool" },
  discernment: { hue: 230, sat: 56, label: "cool" },
  intelligence: { hue: 205, sat: 54, label: "cool" },

  // Achievement / gold
  excellence: { hue: 42, sat: 85, label: "gold" },
  achievement: { hue: 45, sat: 80, label: "gold" },
  success: { hue: 40, sat: 82, label: "gold" },
  leadership: { hue: 38, sat: 78, label: "gold" },
  courage: { hue: 35, sat: 84, label: "gold" },
  strength: { hue: 32, sat: 80, label: "gold" },
  perseverance: { hue: 44, sat: 76, label: "gold" },

  // Spiritual / violet
  god: { hue: 280, sat: 50, label: "violet" },
  religion: { hue: 275, sat: 48, label: "violet" },
  spiritual: { hue: 270, sat: 52, label: "violet" },
  soul: { hue: 285, sat: 46, label: "violet" },
  peace: { hue: 260, sat: 44, label: "violet" },
  meditation: { hue: 265, sat: 48, label: "violet" },

  // Nature / green
  nature: { hue: 150, sat: 55, label: "green" },
  environment: { hue: 145, sat: 52, label: "green" },
  health: { hue: 155, sat: 58, label: "green" },
  vitality: { hue: 140, sat: 60, label: "green" },
};

function getMoodForValue(valueName: string): { hue: number; sat: number } | null {
  if (!valueName) return null;
  const lower = valueName.toLowerCase();
  for (const [keyword, mood] of Object.entries(VALUE_MOODS)) {
    if (lower.includes(keyword)) return mood;
  }
  return null;
}

/**
 * Applies a subtle ambient hue shift to the page background
 * based on the most recently selected value.
 */
export function useAmbientMood(
  active: boolean,
  recentValues: string[]
) {
  const prevHue = useRef<number | null>(null);

  useEffect(() => {
    if (!active || recentValues.length === 0) {
      // Reset
      document.documentElement.style.removeProperty("--ambient-glow");
      return;
    }

    // Use the last selected value to determine mood
    const lastValue = recentValues[recentValues.length - 1];
    const mood = getMoodForValue(lastValue);

    if (!mood) {
      // Default warm ember
      document.documentElement.style.setProperty(
        "--ambient-glow",
        `radial-gradient(ellipse at 50% 80%, hsla(20, 70%, 50%, 0.04) 0%, transparent 60%)`
      );
      return;
    }

    prevHue.current = mood.hue;
    document.documentElement.style.setProperty(
      "--ambient-glow",
      `radial-gradient(ellipse at 50% 80%, hsla(${mood.hue}, ${mood.sat}%, 50%, 0.06) 0%, transparent 60%)`
    );

    return () => {
      document.documentElement.style.removeProperty("--ambient-glow");
    };
  }, [active, recentValues]);
}
