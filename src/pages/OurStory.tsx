import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Heart, Lightbulb, Target, Compass } from "lucide-react";

const OurStory = () => {
  const milestones = [
    {
      icon: Heart,
      year: "The Beginning",
      title: "A Personal Journey",
      description: "It started with a simple question: 'What do I truly value?' This personal exploration revealed the transformative power of values clarity in creating authentic relationships and meaningful decisions."
    },
    {
      icon: Lightbulb,
      year: "The Discovery",
      title: "Values as Bridge-Builders",
      description: "We discovered that when people understand their core values, they connect more deeply with others, resolve conflicts more effectively, and build communities based on mutual understanding."
    },
    {
      icon: Target,
      year: "The Method",
      title: "From Concept to Practice",
      description: "We developed an interactive, engaging process that makes values discovery accessible and actionable. Not just philosophical exploration, but practical tools for daily living."
    },
    {
      icon: Compass,
      year: "The Mission",
      title: "Words Made Incarnate",
      description: "Today, Words Incarnate helps thousands discover their values and transform them from abstract ideas into lived principles that create connection, delight, and belonging."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          {/* Hero Section */}
          <div className="text-center mb-20">
            <motion.h1 
              className="brand-heading text-5xl md:text-6xl mb-6 ink-red"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              Our Story
            </motion.h1>
            <motion.p 
              className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              Every great movement begins with a simple truth. Ours started with the recognition 
              that values, when truly understood and lived, have the power to transform everything.
            </motion.p>
          </div>

          {/* Origin Story */}
          <motion.div 
            className="sketch-card p-8 mb-16"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <h2 className="brand-heading text-3xl mb-6 ink-red text-center">The Spark</h2>
            <div className="prose prose-lg mx-auto text-foreground">
              <p className="leading-relaxed mb-4">
                It was during a particularly challenging time in our founder's life that the question arose: 
                <em>"If I could only choose five values to guide every decision I make, what would they be?"</em>
              </p>
              <p className="leading-relaxed mb-4">
                What seemed like a simple exercise became a profound journey of self-discovery. 
                As clarity emerged around core values, decisions became easier, relationships deepened, 
                and a sense of authentic purpose took root.
              </p>
              <p className="leading-relaxed">
                But the real revelation came when sharing this process with others. Family dinners became 
                meaningful conversations. Workplace conflicts found resolution. Communities discovered 
                shared purpose. Values weren't just personal—they were the key to connection.
              </p>
            </div>
          </motion.div>

          {/* Timeline */}
          <div className="space-y-12 mb-16">
            {milestones.map((milestone, index) => {
              const Icon = milestone.icon;
              return (
                <motion.div
                  key={index}
                  className="flex items-start space-x-6"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.2, duration: 0.8 }}
                >
                  <div className="flex-shrink-0 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center mb-2">
                      <span className="text-primary font-medium mr-3">{milestone.year}</span>
                      <h3 className="brand-heading text-xl ink-red">{milestone.title}</h3>
                    </div>
                    <p className="text-foreground leading-relaxed">{milestone.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Vision Section */}
          <motion.div 
            className="sketch-card p-8 text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6, duration: 0.8 }}
          >
            <h2 className="brand-heading text-3xl mb-6 ink-red">Our Vision</h2>
            <p className="text-lg leading-relaxed text-foreground max-w-2xl mx-auto mb-6">
              We envision a world where every person knows their core values and has the tools 
              to live them out boldly. Where families, schools, and organizations are built on 
              foundations of shared understanding and mutual respect.
            </p>
            <p className="text-lg leading-relaxed text-foreground max-w-2xl mx-auto">
              A world where values aren't just words on a wall, but living principles that 
              create genuine connection, authentic delight, and deep belonging.
            </p>
          </motion.div>

          {/* Team Values */}
          <motion.div 
            className="sketch-card p-8 mb-16"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.8, duration: 0.8 }}
          >
            <h2 className="brand-heading text-3xl mb-8 ink-red text-center">What Drives Us</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="brand-heading text-xl">Authenticity Over Perfection</h4>
                <p className="text-foreground">
                  We believe in real conversations, honest struggles, and the beauty of being genuinely human.
                </p>
              </div>
              <div className="space-y-4">
                <h4 className="brand-heading text-xl">Connection Over Competition</h4>
                <p className="text-foreground">
                  Our success is measured by the depth of relationships and communities we help create.
                </p>
              </div>
              <div className="space-y-4">
                <h4 className="brand-heading text-xl">Growth Over Comfort</h4>
                <p className="text-foreground">
                  We embrace the discomfort that comes with honest self-reflection and meaningful change.
                </p>
              </div>
              <div className="space-y-4">
                <h4 className="brand-heading text-xl">Impact Over Income</h4>
                <p className="text-foreground">
                  While we value sustainability, our primary measure is the transformation we facilitate.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Call to Action */}
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.0, duration: 0.8 }}
          >
            <h2 className="brand-heading text-3xl mb-6 ink-red">Join Our Story</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Your values journey is waiting to be discovered. Become part of a growing community 
              committed to authentic living and meaningful connection.
            </p>
            <Button size="lg" className="interactive-glow">
              Start Your Values Journey
            </Button>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default OurStory;