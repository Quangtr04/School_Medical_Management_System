// src/pages/AdminPage/DashboardCharts.jsx
import React from "react";
import { Card } from "antd";
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
// import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#a4de6c"]; // Màu sắc cho biểu đồ tròn

const DashboardCharts = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 p-6">
      {/* Biểu đồ Phân bổ người dùng */}
      <Card className="shadow-sm rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Phân bổ người dùng
        </h3>
        <div className="h-80 w-full flex flex-col items-center justify-center bg-gray-50 rounded-md text-gray-500">
          {/* Đây là placeholder. Thay thế bằng component PieChart thực tế */}
          <p>
            Biểu đồ tròn sẽ hiển thị ở đây (cần thư viện biểu đồ như Recharts)
          </p>
          {/*
          <ResponsiveContainer width="100%" height="80%">
            <PieChart>
              <Pie
                data={userDistributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {userDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center mt-4 text-sm">
            {userDistributionData.map((entry, index) => (
              <div key={index} className="flex items-center mx-2">
                <span className="inline-block w-3 h-3 rounded-full mr-1" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                {entry.name}: {entry.value}
              </div>
            ))}
          </div>
          */}
        </div>
      </Card>
    </div>
  );
};

export default DashboardCharts;
