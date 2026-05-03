import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DeliveryStats {
  day: string;
  completed: number;
  pending: number;
}

const DeliveryChart = ({ data }: { data: DeliveryStats[] }) => {
  return (
    <div style={{ width: '100%', height: 300 }}>
      <h3>Delivery Performance</h3>
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="completed" fill="#82ca9d" name="Completed" />
          <Bar dataKey="pending" fill="#8884d8" name="Pending" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DeliveryChart;