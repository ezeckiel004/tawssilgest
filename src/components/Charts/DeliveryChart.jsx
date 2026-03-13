import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const DeliveryChart = ({ data }) => {
  // Transformer les données pour Recharts
  const chartData = Object.entries(data || {}).map(([date, count]) => ({
    date,
    livraisons: count,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={chartData}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="livraisons"
          stroke="#6366f1"
          strokeWidth={2}
          activeDot={{ r: 8 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default DeliveryChart;
