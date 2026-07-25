import React, { useEffect, useState } from 'react';
import { useSpring, useTransform } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  suffix = '',
  prefix = '',
  className = ''
}) => {
  const spring = useSpring(0, { mass: 0.8, stiffness: 75, damping: 15 });
  const displayValue = useTransform(spring, (current) => Math.round(current));
  const [rendered, setRendered] = useState<number>(0);

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  useEffect(() => {
    const unsubscribe = displayValue.on("change", (latest) => {
      setRendered(latest);
    });
    return () => unsubscribe();
  }, [displayValue]);

  return (
    <span className={className}>
      {prefix}
      {rendered}
      {suffix}
    </span>
  );
};
