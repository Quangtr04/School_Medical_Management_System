// src/pages/AdminPage/DashboardCharts.jsx
import React from "react";
import { Card } from "antd";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useSelector } from "react-redux";

// Màu sắc từng phần tử
const COLORS = ["#4caf50", "#f44336", "#ffc107", "#2196f3"];

const DashboardCharts = () => {
  const { totalManagers, totalNurses, totalParents } = useSelector(
    (state) => state.dashboard
  );

  const userDistributionData = [
    { name: "Phụ huynh", value: totalParents },
    { name: "Y tá", value: totalNurses },
    { name: "Quản lý", value: totalManagers },
    { name: "Admin", value: 1 },
  ];
  return (
    <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 p-6">
      {/* Biểu đồ Phân bổ người dùng */}
      <Card className="shadow-sm rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Phân bổ người dùng
        </h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={userDistributionData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                label
              >
                {userDistributionData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

export default DashboardCharts;
