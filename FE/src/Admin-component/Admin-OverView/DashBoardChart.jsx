// src/pages/AdminPage/DashboardCharts.jsx
import React from "react";
import { Doughnut } from "react-chartjs-2";
import { motion } from "framer-motion";
import { FaChartPie } from "react-icons/fa";
import { useSelector } from "react-redux";

const DashBoardChart = () => {
  // Demo data, bạn thay bằng data thực tế nếu có

  const { totalManagers, totalNurses, totalParents, totalStudent, loading } = useSelector(
    (state) => state.dashboard
  );




  const data = {
    labels: ["Học sinh", "Phụ huynh", "Quản lý", "Y tá"],
    datasets: [
      {
        data: [totalStudent, totalParents, totalManagers, totalNurses], // Thay bằng số liệu thực tế
        backgroundColor: [
          "#3b82f6", // Học sinh - xanh dương
          "#22c55e", // Phụ huynh - xanh lá
          "#facc15", // Quản lý - vàng
          "#ef4444", // Y tá - đỏ
        ],
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        position: "bottom",
        labels: { font: { size: 16 }, color: '#334155', boxWidth: 24, padding: 20 },
      },
      tooltip: { enabled: true },
    },
    cutout: "70%",
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white rounded-2xl shadow-md p-8 mb-8 flex flex-col items-start"
      style={{ minHeight: 340 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <FaChartPie className="text-blue-500 text-2xl" />
        <h2 className="text-xl font-bold text-gray-800" style={{ marginTop: 10 }}>Phân bổ người dùng</h2>
      </div>
      <div className="w-full flex items-center justify-center" style={{ minHeight: 260 }}>
        <Doughnut data={data} options={options} height={260} />
      </div>
    </motion.div>
  );
};

export default DashBoardChart;
