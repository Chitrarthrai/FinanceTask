import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useThemeColors } from "../lib/theme";

interface SpendingOverviewProps {
  data: { name: string; value: number; secondary: number }[];
}

export const SpendingOverview = ({ data }: SpendingOverviewProps) => {
  const colors = useThemeColors();

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors.chart2} stopOpacity={0.3} />
              <stop offset="95%" stopColor={colors.chart2} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorSec" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor={colors.secondary}
                stopOpacity={0.2}
              />
              <stop offset="95%" stopColor={colors.secondary} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke={colors.muted}
            strokeOpacity={0.2}
          />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: colors.muted, fontSize: 12 }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: colors.muted, fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              borderRadius: "12px",
              border: "none",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              backgroundColor: "var(--tooltip-bg)",
              color: colors.primary,
            }}
            cursor={{
              stroke: colors.muted,
              strokeWidth: 1,
              strokeDasharray: "4 4",
            }}
            itemStyle={{ color: colors.primary }}
            labelStyle={{ color: colors.secondary }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={colors.chart2}
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorValue)"
            animationDuration={1500}
            animationEasing="ease-out"
          />
          {/* Removed secondary area for now as we might only have one series */}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

interface CategoryDistributionProps {
  data: { name: string; value: number }[];
}

export const CategoryDistribution = ({ data }: CategoryDistributionProps) => {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);
  const colors = useThemeColors();
  const CHART_COLORS = [
    colors.chart1,
    colors.chart2,
    colors.chart3,
    colors.chart4,
    colors.chart5,
  ];

  return (
    <div className="h-[300px] w-full flex items-center justify-center relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            animationDuration={1500}
            animationBegin={300}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={CHART_COLORS[index % CHART_COLORS.length]}
                stroke="none"
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: "8px",
              border: "none",
              backgroundColor: "var(--tooltip-bg)",
              color: colors.primary,
            }}
            itemStyle={{ color: colors.primary }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Center Text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-sm font-medium" style={{ color: colors.muted }}>
          Total
        </span>
        <span className="text-xl font-bold" style={{ color: colors.primary }}>
          ${total.toLocaleString()}
        </span>
      </div>
    </div>
  );
};
