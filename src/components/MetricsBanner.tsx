import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

interface Metric {
  label: string;
  value: string;
}

const MetricsBanner = () => {
  const [metrics, setMetrics] = useState<Metric[]>([]);

  useEffect(() => {
    supabase
      .from("dashboard_config")
      .select("key, value")
      .in("key", ["metric_families_served", "metric_schools_partnered", "metric_hours_delivered"])
      .then(({ data }) => {
        if (!data) return;
        const map: Record<string, string> = {};
        for (const row of data) {
          map[row.key] = String(row.value);
        }
        const items: Metric[] = [];
        if (map.metric_families_served) items.push({ value: `${map.metric_families_served}+`, label: "Families Served" });
        if (map.metric_schools_partnered) items.push({ value: map.metric_schools_partnered, label: "Schools Partnered" });
        if (map.metric_hours_delivered) items.push({ value: `${map.metric_hours_delivered}+`, label: "Hours of Formation" });
        setMetrics(items);
      });
  }, []);

  if (metrics.length === 0) return null;

  return (
    <section className="border-y border-border bg-card/50 py-10">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-16">
          {metrics.map((m, i) => (
            <motion.div
              key={m.label}
              className="text-center"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <p className="text-3xl font-semibold text-foreground">{m.value}</p>
              <p className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {m.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MetricsBanner;
