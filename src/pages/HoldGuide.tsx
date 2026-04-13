import { useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageMeta from "@/components/PageMeta";
import JsonLd, { webPageSchema } from "@/components/JsonLd";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowDown, GraduationCap, Users, Building, Lightbulb } from "lucide-react";
import { openCalendlyPopup } from "@/components/Calendly";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" as const },
  transition: { duration: 0.8 },
};

interface PhaseData {
  letter: string;
  name: string;
  tagline: string;
  philosophy: string;
  question: string;
  examples: { icon: typeof GraduationCap; segment: string; text: string }[];
  reflection: { prompt: string; placeholder: string };
}

const phases: PhaseData[] = [
  {
    letter: "H",
    name: "Honor",
    tagline: "Name what you actually value.",
    philosophy:
      "Honoring begins with honesty. Most people — and most institutions — have never done the slow, uncomfortable work of naming what they truly hold sacred. Not the aspirational list. Not the polished version for the brochure. The real commitments — the ones that shape your decisions when no one is watching, when resources are scarce, when the easy path diverges from the right one. Honor means looking at your life, your family, your organization, and saying: this is what we actually orient around. And being willing to discover that it might not be what you expected.",
    question: "What would someone learn about your values by watching your life for a week — without hearing a word you say?",
    examples: [
      {
        icon: Users,
        segment: "For Families",
        text: "A couple sits down after the kids are in bed. They don't start with a values exercise — they start with a question: 'What did we fight about this month?' The patterns in conflict reveal what each person is actually protecting. That's where values live — not in the aspirational, but in the defended.",
      },
      {
        icon: GraduationCap,
        segment: "For Schools",
        text: "The principal doesn't begin with the charism document. She begins by asking: 'When a student is struggling, what does every teacher here do instinctively?' The answer reveals what the school actually values — whether it's compliance, compassion, performance, or formation. The charism matters only if it matches.",
      },
      {
        icon: Building,
        segment: "For Organizations",
        text: "The executive team reviews the last ten hires. Not the job descriptions — the actual people they chose and why. The pattern in hiring decisions reveals organizational values more honestly than any strategic plan. If every hire optimizes for output, 'people-first culture' is aspirational, not actual.",
      },
    ],
    reflection: {
      prompt: "Name one value you claim but suspect you don't consistently live. What would it look like to get honest about the gap?",
      placeholder: "I claim to value _____, but if I'm honest...",
    },
  },
  {
    letter: "O",
    name: "Observe",
    tagline: "See where values are already alive — and where they aren't.",
    philosophy:
      "Observation is the diagnostic discipline. It requires setting aside what you think is happening and looking at what is actually happening — in the rhythms of your household, in the hallways of your school, in the meeting rooms of your organization. Values show up in time allocation, in attention, in what gets celebrated and what gets punished. They show up in the stories people tell about their best days and their worst ones. Observe doesn't judge. It maps. It builds a truthful picture of the gap between stated values and lived reality, so you can close it with precision instead of wishful thinking.",
    question: "Where is the value you named in Honor already alive in your daily life? Where is it conspicuously absent?",
    examples: [
      {
        icon: Users,
        segment: "For Families",
        text: "The family decides 'presence' is their core value. So they audit a typical week: How many meals are eaten together without screens? How many bedtimes include conversation instead of just routine? Where is presence already thriving — and where has efficiency quietly displaced it?",
      },
      {
        icon: GraduationCap,
        segment: "For Schools",
        text: "Faculty take the values assessment individually, then compare results as a department. The gaps aren't failures — they're diagnostic. Where the English department and the Athletics department diverge on priorities tells you exactly where formation is working and where it's disconnected.",
      },
      {
        icon: Building,
        segment: "For Organizations",
        text: "A nonprofit maps its decision-making over 90 days. They track: when a tough call came up, what actually drove the decision? Budget? Optics? Mission? The pattern reveals the real operating values — and it's often not what leadership assumes.",
      },
    ],
    reflection: {
      prompt: "Pick one ordinary day this week. Where did your stated values show up in your actual choices? Where didn't they?",
      placeholder: "On a typical Tuesday, my value of _____ showed up when I... but was absent when I...",
    },
  },
  {
    letter: "L",
    name: "Live",
    tagline: "Build the architecture that makes values real.",
    philosophy:
      "Living your values is not a feeling — it's infrastructure. It's the systems, rituals, habits, and environments you build so that the right thing becomes the default thing. A family that values togetherness needs a weekly rhythm that protects it — not just good intentions. A school that values formation needs it embedded in discipline procedures, not just the mission statement. An organization that values integrity needs it in the hiring rubric, not just the employee handbook. Live is the design phase: taking what you've honored and observed and engineering the daily conditions that make it sustainable.",
    question: "What one practice, ritual, or system could you implement this week that would make your core value the default instead of the exception?",
    examples: [
      {
        icon: Users,
        segment: "For Families",
        text: "The family installs 'presence' into their weekly rhythm: Sunday dinner is device-free — no exceptions, no negotiations. Wednesday bedtime includes a 'rose and thorn' conversation with each child. These aren't ideas. They're structures. They work because they're scheduled, not spontaneous.",
      },
      {
        icon: GraduationCap,
        segment: "For Schools",
        text: "The school redesigns its advisory period. Instead of administrative announcements, advisory becomes a weekly 15-minute formation experience — structured around one value, one question, one conversation. The curriculum doesn't change. The culture container changes.",
      },
      {
        icon: Building,
        segment: "For Organizations",
        text: "The nonprofit adds a 'mission alignment check' to every major decision memo: a three-sentence section answering 'How does this decision serve the people we exist for?' It takes 90 seconds to write. It changes the trajectory of decisions that would otherwise drift toward internal optimization.",
      },
    ],
    reflection: {
      prompt: "What is one concrete, schedulable practice you could install this week to close the gap between your stated values and your daily life?",
      placeholder: "This week I will _____ every _____ at _____ to live out my value of _____.",
    },
  },
  {
    letter: "D",
    name: "Declare",
    tagline: "Make your values visible and accountable.",
    philosophy:
      "Declaration is the act of making private conviction public. It's putting language around what you stand for and sharing it — with your children, your faculty, your team, your community. Declaration creates accountability. It invites others into the commitment. And it produces artifacts — family charters, school values architecture, organizational culture documents — that outlast any single conversation or workshop. Declaring isn't performative. It's operational. It gives people words to use, standards to hold, and a shared story to inhabit. Without declaration, values remain private preferences. With it, they become shared culture.",
    question: "If your family, school, or organization had a one-page document that declared who you are and what you stand for — what would be on it?",
    examples: [
      {
        icon: Users,
        segment: "For Families",
        text: "The family creates a values charter — a single page, framed in the kitchen. Six values, each with one sentence explaining what it means for their family specifically. The kids helped write it. When conflict arises, someone points to the wall. It's not a lecture — it's a shared language.",
      },
      {
        icon: GraduationCap,
        segment: "For Schools",
        text: "The school publishes its 'values architecture' — a visible, shareable framework that connects the founding charism to daily practices. It appears in the hallways, on the website, in faculty onboarding, and in the student handbook. It becomes the grammar of the school's culture.",
      },
      {
        icon: Building,
        segment: "For Organizations",
        text: "The nonprofit's culture document isn't a poster in the break room. It's a living operational tool: referenced in performance reviews, embedded in onboarding, and updated annually. When someone asks 'why did we make that decision?' — the answer points back to a declared commitment.",
      },
    ],
    reflection: {
      prompt: "Write one sentence declaring your most important value — in language specific enough that someone could hold you accountable to it.",
      placeholder: "We are a family/school/organization that _____.",
    },
  },
];

const ReflectionBox = ({ reflection }: { reflection: PhaseData["reflection"] }) => {
  const [text, setText] = useState("");
  return (
    <motion.div
      className="mt-12 mx-auto max-w-2xl rounded-xl border border-primary/20 bg-primary/5 p-8"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-start gap-3 mb-4">
        <Lightbulb className="h-5 w-5 text-primary mt-0.5 shrink-0" />
        <p className="text-sm font-semibold text-foreground">Reflect</p>
      </div>
      <p className="text-foreground leading-relaxed mb-4">{reflection.prompt}</p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={reflection.placeholder}
        rows={3}
        className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
      />
      <p className="mt-2 text-xs text-muted-foreground">
        This stays in your browser — nothing is saved or sent.
      </p>
    </motion.div>
  );
};

const HoldGuide = () => {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <div className="min-h-screen bg-background">
      <PageMeta
        title="The HOLD Method | Words Incarnate"
        description="An in-depth guide to the HOLD formation framework: Honor, Observe, Live, Declare. A structured methodology for making values real."
        path="/hold"
      />
      <JsonLd data={webPageSchema("The HOLD Method | Words Incarnate", "An in-depth guide to the HOLD formation framework.", "/hold")} />
      <Navigation />

      {/* Progress bar */}
      <motion.div
        className="fixed top-16 left-0 right-0 z-40 h-0.5 bg-primary origin-left"
        style={{ width: progressWidth }}
      />

      <main id="main" className="pt-16">
        {/* ─── HERO ─── */}
        <section className="relative py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-card to-background" />
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              className="mx-auto max-w-3xl text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              <div className="flex items-center justify-center gap-4 mb-8">
                {["H", "O", "L", "D"].map((letter, i) => (
                  <motion.span
                    key={letter}
                    className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-primary/30 text-2xl font-bold text-primary font-serif"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + i * 0.15, duration: 0.5 }}
                  >
                    {letter}
                  </motion.span>
                ))}
              </div>
              <h1 className="text-4xl font-semibold text-foreground sm:text-5xl font-serif">
                The HOLD Method
              </h1>
              <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                A formation framework for families, schools, and organizations who want
                their values to shape their culture — not just decorate it.
              </p>
              <motion.div
                className="mt-12 flex justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                <ArrowDown className="h-5 w-5 text-muted-foreground/50 animate-bounce" />
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ─── PREMISE ─── */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div {...fadeUp} className="mx-auto max-w-2xl">
              <p className="text-lg text-foreground leading-relaxed font-serif">
                Everyone has values. Families, schools, organizations — they all claim to
                stand for something. The question is whether those values are forming the
                people inside them, or just sitting on a wall somewhere.
              </p>
              <p className="mt-6 text-lg text-foreground leading-relaxed font-serif">
                The HOLD method exists because values don't transmit themselves. They require
                architecture — a structured process of naming, diagnosing, building, and
                declaring. What follows is that process, in depth.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ─── PHASES ─── */}
        {phases.map((phase, phaseIndex) => (
          <section
            key={phase.letter}
            className={phaseIndex % 2 === 0 ? "bg-card" : "bg-background"}
          >
            <div className="container mx-auto px-4 py-24">
              {/* Phase header */}
              <motion.div
                className="mx-auto max-w-3xl mb-16"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.8 }}
              >
                <div className="flex items-center gap-4 mb-6">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-3xl font-bold text-primary font-serif">
                    {phase.letter}
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      Phase {phaseIndex + 1} of 4
                    </p>
                    <h2 className="text-3xl font-semibold text-foreground font-serif">
                      {phase.name}
                    </h2>
                  </div>
                </div>
                <p className="text-xl text-primary font-medium font-serif">
                  {phase.tagline}
                </p>
              </motion.div>

              {/* Philosophy */}
              <motion.div
                className="mx-auto max-w-2xl mb-16"
                {...fadeUp}
              >
                <p className="text-foreground leading-[1.9] font-serif text-[17px]">
                  {phase.philosophy}
                </p>
                <p className="mt-8 text-lg text-primary/80 font-serif italic">
                  {phase.question}
                </p>
              </motion.div>

              {/* Context examples */}
              <div className="mx-auto max-w-4xl mb-8">
                <motion.p
                  className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground text-center mb-8"
                  {...fadeUp}
                >
                  What this looks like in practice
                </motion.p>
                <div className="grid gap-6 md:grid-cols-3">
                  {phase.examples.map((ex, i) => {
                    const Icon = ex.icon;
                    return (
                      <motion.div
                        key={ex.segment}
                        className="rounded-xl border border-border bg-background p-6"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: i * 0.12 }}
                      >
                        <div className="flex items-center gap-2 mb-4">
                          <Icon className="h-4 w-4 text-primary" />
                          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            {ex.segment}
                          </p>
                        </div>
                        <p className="text-sm text-foreground leading-relaxed">
                          {ex.text}
                        </p>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Reflection */}
              <ReflectionBox reflection={phase.reflection} />
            </div>
          </section>
        ))}

        {/* ─── WHAT NOW ─── */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-semibold text-foreground font-serif">
                The method works. The question is where to start.
              </h2>
              <p className="mt-6 text-muted-foreground leading-relaxed">
                The HOLD framework is the same whether you're a family of four, a school of
                four hundred, or an organization of four thousand. What changes is the scale,
                the context, and the specific practices we design together. Every engagement
                begins with a conversation.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button size="lg" onClick={() => openCalendlyPopup()}>
                  Book a Discovery Call
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate("/quiz")}>
                  Try the Free Assessment
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HoldGuide;
