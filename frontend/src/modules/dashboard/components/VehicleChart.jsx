import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const mockData = [
  { name: "Mon", active: 5, available: 4, maintenance: 1 },
  { name: "Tue", active: 6, available: 3, maintenance: 1 },
  { name: "Wed", active: 4, available: 5, maintenance: 1 },
  { name: "Thu", active: 7, available: 2, maintenance: 1 },
  { name: "Fri", active: 5, available: 3, maintenance: 2 },
  { name: "Sat", active: 3, available: 6, maintenance: 1 },
  { name: "Sun", active: 2, available: 7, maintenance: 1 },
];

export default function VehicleChart() {
  return (
    <div className="glass-card chart-card">
      <h3 style={{ marginBottom: "1.25rem", fontSize: "1rem" }}>Vehicle Status (Weekly)</h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={mockData} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
          <YAxis stroke="#6b7280" fontSize={12} />
          <Tooltip
            contentStyle={{
              background: "rgba(17,24,39,0.95)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              color: "#f3f4f6",
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: "#9ca3af" }} />
          <Bar dataKey="active" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Active" />
          <Bar dataKey="available" fill="#10b981" radius={[4, 4, 0, 0]} name="Available" />
          <Bar dataKey="maintenance" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Maintenance" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
