import React from "react";

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  change?: string;
  highlight?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, change, highlight = false }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${highlight ? "border-l-4 border-red-500" : ""}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
          {change && <p className="text-xs text-gray-500 mt-2">{change}</p>}
        </div>
        <div>{icon}</div>
      </div>
    </div>
  );
};

export default StatCard;
