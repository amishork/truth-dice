import { motion } from 'framer-motion';
import { Lock, ChevronRight, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export interface AreaOfLife {
  id: string;
  label: string;
  /** Label variant for female users, if different */
  labelFemale?: string;
  icon: string;
  requiresPersonal: boolean;
}

export const AREAS_OF_LIFE: AreaOfLife[] = [
  { id: 'personal',        label: 'Personally I value...',                   icon: '🪞', requiresPersonal: false },
  { id: 'leader',          label: 'As a leader I value...',                  icon: '🧭', requiresPersonal: true },
  { id: 'spouse',          label: 'My ideal spouse values...',               icon: '💍', requiresPersonal: true },
  { id: 'parent',          label: 'As a Father I value...',     labelFemale: 'As a Mother I value...',              icon: '🏠', requiresPersonal: true },
  { id: 'children',        label: 'I want my children to value...',          icon: '🌱', requiresPersonal: true },
  { id: 'spouse-values',   label: "I want my children's mother to value...", labelFemale: "I want my children's father to value...", icon: '❤️', requiresPersonal: true },
  { id: 'friends',         label: 'I want my friends to value...',           icon: '🤝', requiresPersonal: true },
  { id: 'work',            label: 'When I am at work I value...',            icon: '⚒️', requiresPersonal: true },
  { id: 'leisure',         label: 'When I am taking leisure I value...',     icon: '☀️', requiresPersonal: true },
];

export function getAreaLabel(area: AreaOfLife, gender: 'male' | 'female' | null): string {
  if (gender === 'female' && area.labelFemale) return area.labelFemale;
  return area.label;
}

interface AreaOfLifePickerProps {
  completedAreas: string[];
  onSelect: (area: AreaOfLife) => void;
  onBack: () => void;
}

export default function AreaOfLifePicker({ completedAreas, onSelect, onBack }: AreaOfLifePickerProps) {
  const { gender, isAuthenticated } = useAuth();
  const hasPersonal = completedAreas.includes('personal');

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-2xl px-6 pt-16 pb-20">
        {/* Header */}
        <motion.div
          className="mb-10 text-center"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="font-serif text-3xl font-semibold text-foreground tracking-tight">
            Choose Your Focus
          </h1>
          <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            Which area of your life do you want to discover your values in?
          </p>
        </motion.div>

        {/* Area grid */}
        <div className="space-y-3">
          {AREAS_OF_LIFE.map((area, i) => {
            const label = getAreaLabel(area, gender);
            const isCompleted = completedAreas.includes(area.id);
            const isLocked = area.requiresPersonal && !hasPersonal;
            const isAvailable = !isLocked;

            return (
              <motion.button
                key={area.id}
                onClick={() => isAvailable && onSelect(area)}
                disabled={isLocked}
                className={`group relative flex w-full items-center gap-4 rounded-lg border px-5 py-4 text-left transition-all ${
                  isLocked
                    ? 'border-border/50 bg-muted/20 cursor-not-allowed'
                    : isCompleted
                    ? 'border-primary/30 bg-primary/5 hover:border-primary/50 hover:bg-primary/10'
                    : 'border-border bg-background hover:border-foreground/30 hover:shadow-sm'
                }`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.04 }}
              >
                <span className={`text-xl ${isLocked ? 'opacity-30 grayscale' : ''}`}>{area.icon}</span>
                <div className="flex-1 min-w-0">
                  <span className={`text-sm font-medium ${
                    isLocked ? 'text-muted-foreground/40' : 'text-foreground'
                  }`}>
                    {label}
                  </span>
                  {isCompleted && (
                    <span className="ml-2 inline-flex items-center gap-1 text-xs text-primary font-medium">
                      <Sparkles className="h-3 w-3" /> Completed
                    </span>
                  )}
                </div>
                {isLocked ? (
                  <Lock className="h-4 w-4 text-muted-foreground/30 flex-shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Unlock note for first-time users */}
        {!hasPersonal && (
          <motion.div
            className="mt-8 rounded-lg border border-dashed border-primary/30 bg-primary/5 px-5 py-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-sm text-foreground leading-relaxed">
              <span className="font-medium">Start with your personal values.</span>{' '}
              Once you discover what you value personally, you'll unlock every other area of life — and begin seeing which values you hold most deeply across all of them.
            </p>
          </motion.div>
        )}

        {/* Back / guest note */}
        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={onBack}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back
          </button>
          {!isAuthenticated && hasPersonal && (
            <p className="text-xs text-muted-foreground">
              Create an account to save results & unlock all areas.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
