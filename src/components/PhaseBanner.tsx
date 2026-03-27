import { motion } from "framer-motion";

interface PhaseBannerProps {
  text: string;
}

const PhaseBanner: React.FC<PhaseBannerProps> = ({ text }) => (
  <motion.div
    className="quiz-phase-banner"
    initial={{ opacity: 0, y: -6 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: "easeOut" }}
  >
    <p>{text}</p>
  </motion.div>
);

export default PhaseBanner;
