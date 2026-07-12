import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const mockData = [
  { name: "Mon", completed: 8, active: 3, pending: 2 },
  { name: "Tue", completed: 12, active: 5, pending: 1 },
  { name: "Wed", completed: 10, active: 4, pending: 3 },
  { name: "Thu", completed: 15, active: 6, pending: 2 },
  { name: "Fri", completed: 11, active: 3, pending: 4 },
  { name: "Sat", completed: 7, active: 2, pending: 1 },
  { name: "Sun", completed: 5, active: 1, pending: 0 },
];

export default function TripChart() {
  return (
    <div className="glass-card chart-card">
      <h3 style={{ marginBottom: "1.25rem", fontSize: "1rem" }}>Trip Activity (Weekly)</h3>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={mockData}>
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
          <Line
            type="monotone"
            dataKey="completed"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ r: 4, fill: "#10b981" }}
            name="Completed"
          />
          <Line
            type="monotone"
            dataKey="active"
            stroke="#6366f1"
            strokeWidth={2}
            dot={{ r: 4, fill: "#6366f1" }}
            name="Active"
          />
          <Line
            type="monotone"
            dataKey="pending"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={{ r: 4, fill: "#f59e0b" }}
            name="Pending"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
