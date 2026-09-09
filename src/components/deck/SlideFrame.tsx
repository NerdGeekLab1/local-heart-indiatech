import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/** Renders children on a fixed 1920x1080 canvas, scaled to fit the parent box. */
const SlideFrame = ({
  children,
  className,
  scaleToFit = true,
}: {
  children: ReactNode;
  className?: string;
  scaleToFit?: boolean;
}) => {
  const boxRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (!scaleToFit) return;
    const el = boxRef.current;
    if (!el) return;
    const fit = () => {
      const { width, height } = el.getBoundingClientRect();
      setScale(Math.min(width / 1920, height / 1080));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    window.addEventListener("resize", fit);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", fit);
    };
  }, [scaleToFit]);

  return (
    <div ref={boxRef} className={cn("relative w-full h-full overflow-hidden", className)}>
      <div
        className="slide-wrapper"
        style={{ ["--scale" as string]: scaleToFit ? scale : 1 }}
      >
        <div className="slide-content bg-background text-foreground">{children}</div>
      </div>
    </div>
  );
};

/** Fades and lifts its children in sequence — used for slide reveals. */
export const Reveal = ({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 28 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

export default SlideFrame;
