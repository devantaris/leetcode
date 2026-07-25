import React from 'react';
import { WeekPillNavigation } from '../components/WeekPillNavigation';
import { SearchAndFilter } from '../components/SearchAndFilter';
import { WeekAccordion } from '../components/WeekAccordion';
import { motion } from 'framer-motion';

export const CurriculumPage: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col gap-2 pb-16"
    >
      {/* WEEK PILLS NAVIGATION */}
      <WeekPillNavigation />

      {/* SEARCH AND FILTER BAR */}
      <SearchAndFilter />

      {/* CURRICULUM ACCORDION */}
      <WeekAccordion />
    </motion.div>
  );
};
