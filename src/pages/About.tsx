import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";

const About = () => {
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
          <div className="text-center mb-16">
            <motion.h1 
              className="brand-heading text-5xl md:text-6xl mb-6 ink-red"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              About Words Incarnate
            </motion.h1>
            <motion.p 
              className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              We believe that your deepest values, when clearly understood and boldly lived, 
              become the foundation for authentic connection, lasting delight, and true belonging.
            </motion.p>
          </div>

          {/* Mission Section */}
          <motion.div 
            className="sketch-card p-8 mb-12"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <h2 className="brand-heading text-3xl mb-6 ink-red">Our Mission</h2>
            <p className="text-lg leading-relaxed text-foreground mb-4">
              Words Incarnate exists to help individuals, families, schools, and organizations 
              discover their core values and transform them from abstract concepts into 
              living principles that guide daily decisions and relationships.
            </p>
            <p className="text-lg leading-relaxed text-foreground">
              Through our values discovery process, we create pathways for deeper self-understanding, 
              more authentic relationships, and communities built on shared purpose.
            </p>
          </motion.div>

          {/* Story Section */}
          <motion.div 
            className="grid md:grid-cols-2 gap-12 mb-12"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            <div className="sketch-card p-8">
              <h3 className="brand-heading text-2xl mb-4 ink-red">The Challenge</h3>
              <p className="text-foreground leading-relaxed">
                In our fast-paced world, many people live disconnected from their deepest values. 
                They make decisions based on external pressures rather than internal compass, 
                leading to stress, conflict, and a sense of living someone else's life.
              </p>
            </div>
            <div className="sketch-card p-8">
              <h3 className="brand-heading text-2xl mb-4 ink-red">Our Solution</h3>
              <p className="text-foreground leading-relaxed">
                We've created an engaging, interactive process that helps people identify 
                their core values and provides practical tools to incarnate those values 
                in their daily lives, relationships, and communities.
              </p>
            </div>
          </motion.div>

          {/* Values Section */}
          <motion.div 
            className="sketch-card p-8 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.0, duration: 0.8 }}
          >
            <h2 className="brand-heading text-3xl mb-8 ink-red">What We Stand For</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                  <div className="w-8 h-8 bg-primary rounded-full"></div>
                </div>
                <h4 className="brand-heading text-xl">Connection</h4>
                <p className="text-muted-foreground">
                  Authentic relationships built on shared understanding and mutual respect.
                </p>
              </div>
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                  <div className="w-8 h-8 bg-primary rounded-full"></div>
                </div>
                <h4 className="brand-heading text-xl">Delight</h4>
                <p className="text-muted-foreground">
                  The joy that comes from living aligned with your deepest values.
                </p>
              </div>
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                  <div className="w-8 h-8 bg-primary rounded-full"></div>
                </div>
                <h4 className="brand-heading text-xl">Belonging</h4>
                <p className="text-muted-foreground">
                  Finding your place in communities that honor who you truly are.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default About;