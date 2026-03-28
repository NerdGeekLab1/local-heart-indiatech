import { Star } from "lucide-react";
import { motion } from "framer-motion";
import type { Experience } from "@/lib/data";
import { useCurrency } from "@/contexts/CurrencyContext";

interface ExperienceCardProps {
  experience: Experience;
  index?: number;
}

const ExperienceCard = ({ experience, index = 0 }: ExperienceCardProps) => {
  const { format } = useCurrency();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="group cursor-pointer"
    >
      <div className="relative overflow-hidden rounded-lg shadow-card transition-all duration-300 hover:shadow-card-hover">
        <div className="aspect-[4/3] overflow-hidden">
          <img src={experience.image} alt={experience.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <span className="inline-block text-[10px] uppercase tracking-wider font-bold text-primary-foreground/80 bg-primary/80 px-2 py-0.5 rounded-sm mb-2">
            {experience.category}
          </span>
          <h3 className="text-lg font-semibold text-primary-foreground">{experience.title}</h3>
          <p className="text-sm text-primary-foreground/80 line-clamp-1 mt-1">{experience.description}</p>
          <div className="flex items-center justify-between mt-3">
            <span className="text-sm font-semibold text-primary-foreground">
              {format(experience.price)} <span className="font-normal text-primary-foreground/70">· {experience.duration}</span>
            </span>
            <span className="flex items-center gap-1 text-sm text-primary-foreground/90">
              <Star className="w-3 h-3 fill-primary text-primary" /> {experience.rating}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ExperienceCard;
