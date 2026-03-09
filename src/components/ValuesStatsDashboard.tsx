import React from "react";
import { motion } from "framer-motion";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

// Value category mapping
const VALUE_CATEGORIES: Record<string, string> = {
  // Relational
  "Affection (love and caring)": "Relational", Caring: "Relational", Friendship: "Relational", Giving: "Relational",
  Kindness: "Relational", Loyalty: "Relational", Love: "Relational", Nurturing: "Relational", Tenderness: "Relational",
  Trust: "Relational", Companionship: "Relational", Cooperation: "Relational", Togetherness: "Relational",
  "Close Relationships": "Relational", "Quality Relationships": "Relational", Intimacy: "Relational",
  Compassion: "Relational", Empathy: "Relational", Forgiveness: "Relational", Gratitude: "Relational",
  Connection: "Relational", Sharing: "Relational", "Team/Teamwork": "Relational", Partnership: "Relational",

  // Character
  Honesty: "Character", Integrity: "Character", Courage: "Character", Honor: "Character",
  Humility: "Character", Patience: "Character", Trustworthiness: "Character", Dependability: "Character",
  Reliability: "Character", Chivalry: "Character", Considerate: "Character", Conscientiousness: "Character",
  Conviction: "Character", Courteousness: "Character", Fairness: "Character", Justice: "Character",
  Respect: "Character", "Responsibility and accountability": "Character", "Self-Respect": "Character",
  Authenticity: "Character", "Ethical Practice": "Character", Truth: "Character", Commitment: "Character",

  // Growth
  Growth: "Growth", Learning: "Growth", "Personal Growth & Development (living up to the fullest potential)": "Growth",
  Wisdom: "Growth", Knowledge: "Growth", Discovery: "Growth", Creativity: "Growth", Awareness: "Growth",
  "Adding Value": "Growth", Excellence: "Growth", Competence: "Growth", Effectiveness: "Growth",
  Expertise: "Growth", "Challenging Problems": "Growth", Mentorship: "Growth", Coaching: "Growth",

  // Purpose
  Purpose: "Purpose", "Meaningful Work": "Purpose", "Helping Other People": "Purpose",
  "Helping Society": "Purpose", "Making a difference": "Purpose", "Public Service": "Purpose",
  Contribution: "Purpose", Community: "Purpose", Charity: "Purpose", Leadership: "Purpose",
  "Influencing Others": "Purpose", Inspiration: "Purpose", Vision: "Purpose",

  // Joy & Vitality
  Joy: "Joy & Vitality", Fun: "Joy & Vitality", Happiness: "Joy & Vitality", Cheerfulness: "Joy & Vitality",
  Playfulness: "Joy & Vitality", Spontaneity: "Joy & Vitality", Excitement: "Joy & Vitality",
  Adventure: "Joy & Vitality", Humor: "Joy & Vitality", Bliss: "Joy & Vitality", Aliveness: "Joy & Vitality",
  Energy: "Joy & Vitality", Enthusiasm: "Joy & Vitality", Vigor: "Joy & Vitality", Vitality: "Joy & Vitality",
  Passion: "Joy & Vitality", Pleasure: "Joy & Vitality",

  // Spiritual
  Religion: "Spiritual", God: "Spiritual", "Inner Harmony": "Spiritual", Peace: "Spiritual",
  Serenity: "Spiritual", Soul: "Spiritual", Spirit: "Spiritual", Spiritual: "Spiritual",
  Meditation: "Spiritual", Purity: "Spiritual", Faith: "Spiritual",

  // Freedom & Independence
  Freedom: "Freedom", Independence: "Freedom", "Self-determinism": "Freedom",
  "Time Freedom": "Freedom", Flexibility: "Freedom", "Change and Variety": "Freedom",
  Adaptability: "Freedom", Openness: "Freedom", Travel: "Freedom",
};

const CATEGORY_COLORS = [
  "hsl(350, 78%, 45%)",
  "hsl(20, 80%, 50%)",
  "hsl(45, 85%, 48%)",
  "hsl(160, 60%, 40%)",
  "hsl(220, 60%, 50%)",
  "hsl(280, 50%, 50%)",
  "hsl(190, 70%, 40%)",
];

interface ValuesStatsDashboardProps {
  finalValues: string[];
  selectionCounts: Record<string, number>;
  allWinners: string[];
}

const ValuesStatsDashboard: React.FC<ValuesStatsDashboardProps> = ({
  finalValues,
  selectionCounts,
  allWinners,
}) => {
  // Calculate category distribution from final 6
  const categoryCount: Record<string, number> = {};
  finalValues.forEach((v) => {
    const cat = VALUE_CATEGORIES[v] || "Other";
    categoryCount[cat] = (categoryCount[cat] || 0) + 1;
  });

  const pieData = Object.entries(categoryCount).map(([name, value]) => ({ name, value }));

  // Radar data: average selection count per category across all winners
  const catTotals: Record<string, { sum: number; count: number }> = {};
  allWinners.forEach((v) => {
    const cat = VALUE_CATEGORIES[v] || "Other";
    if (!catTotals[cat]) catTotals[cat] = { sum: 0, count: 0 };
    catTotals[cat].sum += selectionCounts[v] || 0;
    catTotals[cat].count += 1;
  });

  const radarData = Object.entries(catTotals)
    .map(([category, { sum, count }]) => ({
      category,
      strength: Math.round((sum / count) * 10) / 10,
    }))
    .sort((a, b) => b.strength - a.strength)
    .slice(0, 7);

  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="text-center">
        <h3 className="text-xl font-semibold text-foreground">Your Values Profile</h3>
        <p className="mt-1 text-sm text-muted-foreground">A visual breakdown of your value categories</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Pie Chart — Final 6 category breakdown */}
        <div className="sketch-card p-5">
          <p className="label-technical mb-4">Core 6 Categories</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={40}
                strokeWidth={2}
                stroke="hsl(var(--background))"
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.4rem",
                  fontSize: "0.75rem",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {pieData.map((d, i) => (
              <span key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span
                  className="inline-block w-2 h-2 rounded-full"
                  style={{ backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }}
                />
                {d.name}
              </span>
            ))}
          </div>
        </div>

        {/* Radar Chart — Category strength */}
        <div className="sketch-card p-5">
          <p className="label-technical mb-4">Category Strength</p>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis
                dataKey="category"
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              />
              <Radar
                dataKey="strength"
                stroke="hsl(350, 78%, 45%)"
                fill="hsl(350, 78%, 45%)"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top values by selection count */}
      <div className="sketch-card p-5">
        <p className="label-technical mb-4">Selection intensity</p>
        <div className="space-y-2">
          {finalValues
            .sort((a, b) => (selectionCounts[b] || 0) - (selectionCounts[a] || 0))
            .map((value) => {
              const count = selectionCounts[value] || 0;
              const maxCount = Math.max(...finalValues.map((v) => selectionCounts[v] || 0), 1);
              const pct = (count / maxCount) * 100;
              return (
                <div key={value} className="flex items-center gap-3">
                  <span className="w-32 text-xs text-foreground truncate">{value}</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-6 text-right">{count}</span>
                </div>
              );
            })}
        </div>
      </div>
    </motion.div>
  );
};

export default ValuesStatsDashboard;
