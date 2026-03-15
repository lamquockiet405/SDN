import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color: "blue" | "green" | "purple" | "orange";
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const colorClasses = {
  blue: "bg-blue-50 text-blue-600",
  green: "bg-green-50 text-green-600",
  purple: "bg-purple-50 text-purple-600",
  orange: "bg-orange-50 text-orange-600",
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color,
  trend,
}) => {
  return (
    <div className="bg-white rounded-card p-6 shadow-soft-md hover:shadow-soft-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-600 text-sm font-medium">{title}</h3>
        <div className={`${colorClasses[color]} p-3 rounded-lg`}>{icon}</div>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p
              className={`text-sm mt-2 ${
                trend.isPositive ? "text-green-600" : "text-danger"
              }`}
            >
              {trend.isPositive ? "+" : "-"}
              {trend.value}% from last week
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
