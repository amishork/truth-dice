import { motion } from "framer-motion";

interface ScrollTextRevealProps {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p";
}

const ScrollTextReveal: React.FC<ScrollTextRevealProps> = ({ text, className = "", as: Tag = "h2" }) => {
  const words = text.split(" ");

  return (
    <Tag className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="inline-block mr-[0.3em]"
          initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.4, delay: i * 0.06, ease: "easeOut" }}
        >
          {word}
        </motion.span>
      ))}
    </Tag>
  );
};

export default ScrollTextReveal;
