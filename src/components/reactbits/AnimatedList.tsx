"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";

interface AnimatedListProps {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
}

export const AnimatedList: React.FC<AnimatedListProps> = ({
  children,
  className = "",
  stagger = 0.08,
  delay = 0,
}) => {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (ref.current) observer.unobserve(ref.current);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const items = React.Children.toArray(children);

  return (
    <div ref={ref} className={className}>
      {items.map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          transition={{
            duration: 0.45,
            delay: delay + index * stagger,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {item}
        </motion.div>
      ))}
    </div>
  );
};
