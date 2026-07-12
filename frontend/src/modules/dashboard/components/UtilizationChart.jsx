import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const mockData = [
  { name: "Week 1", utilization: 65 },
  { name: "Week 2", utilization: 72 },
  { name: "Week 3", utilization: 68 },
  { name: "Week 4", utilization: 78 },
  { name: "Week 5", utilization: 74 },
  { name: "Week 6", utilization: 82 },
  { name: "Week 7", utilization: 79 },
  { name: "Week 8", utilization: 85 },
];

export default function UtilizationChart() {
  return (
    <div className="glass-card chart-card">
      <h3 style={{ marginBottom: "1.25rem", fontSize: "1rem" }}>Fleet Utilization Trend</h3>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={mockData}>
          <defs>
            <linearGradient id="utilGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
          <YAxis stroke="#6b7280" fontSize={12} domain={[0, 100]} unit="%" />
          <Tooltip
            contentStyle={{
              background: "rgba(17,24,39,0.95)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              color: "#f3f4f6",
            }}
            formatter={(value) => [`${value}%`, "Utilization"]}
          />
          <Area
            type="monotone"
            dataKey="utilization"
            stroke="#6366f1"
            strokeWidth={2}
            fill="url(#utilGradient)"
            dot={{ r: 4, fill: "#6366f1" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
