import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PricingCards from "@/components/PricingCards";
import FAQ from "@/components/FAQ";
import PageMeta from "@/components/PageMeta";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, GraduationCap, Building } from "lucide-react";

const Services = () => {
  const navigate = useNavigate();
  const services = [
    {
      icon: Users,
      title: "For Families",
      subtitle: "Building Stronger Bonds",
      description: "Help your family discover shared values and create a home environment where every member can thrive authentically.",
      features: [
        "Family values discovery sessions",
        "Conflict resolution through values alignment",
        "Creating family mission statements",
        "Age-appropriate values activities for children"
      ],
      cta: "Apply Now"
    },
    {
      icon: GraduationCap,
      title: "For Schools",
      subtitle: "Cultivating Character",
      description: "Integrate values education into your curriculum to foster student well-being, academic success, and positive school culture.",
      features: [
        "Student values exploration programs",
        "Teacher professional development",
        "School culture transformation",
        "Anti-bullying through values alignment"
      ],
      cta: "Request a Proposal"
    },
    {
      icon: Building,
      title: "For Organizations",
      subtitle: "Aligning Purpose & Performance",
      description: "Build high-performing teams and authentic company culture through shared values and purposeful leadership.",
      features: [
        "Leadership values coaching",
        "Team alignment workshops",
        "Company culture assessment",
        "Values-based decision making frameworks"
      ],
      cta: "Request a Proposal"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <PageMeta title="Services" description="Values discovery workshops, family formation, school culture advisory, and organizational strategy. Tailored formation experiences for every context." path="/services" />
      <Navigation />
      
      <main className="pt-16">
        <div className="container mx-auto px-4 py-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-6xl mx-auto"
          >
            <div className="text-center mb-20 pt-8">
              <motion.h1 
                className="text-4xl sm:text-5xl font-semibold text-foreground mb-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
              >
                Our Services
              </motion.h1>
              <motion.p 
                className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                Tailored values discovery experiences for every context where authentic 
                relationships and purposeful living matter most.
              </motion.p>
            </div>

            <div className="space-y-16">
              {services.map((service, index) => {
                const Icon = service.icon;
                return (
                  <motion.div
                    key={service.title}
                    className="sketch-card p-8 md:p-12"
                    initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.2, duration: 0.8 }}
                  >
                    <div className={`grid md:grid-cols-2 gap-8 items-center ${index % 2 === 1 ? 'md:grid-flow-col-dense' : ''}`}>
                      <div className={index % 2 === 1 ? 'md:col-start-2' : ''}>
                        <div className="flex items-center mb-6">
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                            <Icon className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h2 className="text-3xl font-semibold text-primary">{service.title}</h2>
                            <p className="text-primary font-medium">{service.subtitle}</p>
                          </div>
                        </div>
                        
                        <p className="text-lg leading-relaxed text-foreground mb-6">
                          {service.description}
                        </p>
                        
                        <ul className="space-y-3 mb-8">
                          {service.features.map((feature, featureIndex) => (
                            <motion.li 
                              key={featureIndex}
                              className="flex items-center text-foreground"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.8 + index * 0.2 + featureIndex * 0.1, duration: 0.5 }}
                            >
                              <div className="w-2 h-2 bg-primary rounded-full mr-3 flex-shrink-0"></div>
                              {feature}
                            </motion.li>
                          ))}
                        </ul>
                        
                        <Button onClick={() => navigate("/contact")} className="group">
                          {service.cta}
                          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                      
                      <div className={`${index % 2 === 1 ? 'md:col-start-1 md:row-start-1' : ''}`}>
                        <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-8 h-64 flex items-center justify-center">
                          <Icon className="w-24 h-24 text-primary/30" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Pricing */}
        <PricingCards />

        {/* FAQ */}
        <FAQ />

        {/* Bottom CTA */}
        <motion.div 
          className="bg-primary py-16 text-center"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-semibold text-primary-foreground mb-6">
              Ready to Discover Your Values?
            </h2>
            <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
              Start your journey toward authentic living with our interactive values discovery process.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" onClick={() => navigate("/quiz")}>
                Free Values Assessment
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                onClick={() => navigate("/contact")}
              >
                Request a Proposal
              </Button>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default Services;
