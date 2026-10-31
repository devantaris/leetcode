import React from 'react';
import { TodayMission } from '../components/TodayMission';

export const DashboardPage: React.FC = () => {
  return (
    <div className="app-container">
      <TodayMission />
    </div>
  );
};
