import React from "react";
import { Card, Statistic } from "antd";

import {
  FaGraduationCap,
  FaUser,
  FaUsers,
  FaHeart,
  FaDollarSign,
  FaChartLine,
  FaExclamationTriangle,
} from "react-icons/fa";

const DashboardCards = () => {
  const data = [
    {
      title: "Tổng số sinh viên",
      value: 1247,
      percentChange: 5,
      icon: <FaGraduationCap />,
      // THAY ĐỔI Ở ĐÂY: Sử dụng 'iconWrapperClassName' để định nghĩa toàn bộ style icon
      iconWrapperClassName: "bg-blue-500 text-white", // Nền xanh nhạt, icon xanh đậm
    },
    {
      title: "Tổng số giáo viên",
      value: 89,
      percentChange: 2,
      icon: <FaUser />,
      iconWrapperClassName: "bg-green-500 text-white", // Nền xanh lá nhạt, icon xanh lá đậm
    },
    {
      title: "Tổng số phụ huynh",
      value: 1156,
      percentChange: 3,
      icon: <FaUsers />,
      iconWrapperClassName: "bg-purple-500 text-white", // Nền tím nhạt, icon tím đậm
    },
    {
      title: "Nhân viên y tế",
      value: 12,
      percentChange: 0,
      icon: <FaHeart />,
      iconWrapperClassName: "bg-red-500 text-white", // Nền đỏ nhạt, icon đỏ đậm
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-6 pb-6">
      {data.map((item, index) => (
        <Card
          key={index}
          className="shadow-sm rounded-lg hover:shadow-md transition-shadow duration-300"
          bodyStyle={{ padding: "20px" }}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">
                {item.title}
              </p>
              <Statistic
                value={item.value}
                className="text-xl font-semibold text-gray-800"
              />
              <p
                className={`text-xs font-medium mt-1 ${
                  item.percentChange >= 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                {item.percentChange > 0
                  ? `+${item.percentChange}%`
                  : `${item.percentChange}%`}
              </p>
            </div>
            <div
              className={`p-5  my-4 rounded-full flex items-center justify-center text-3xl ${item.iconWrapperClassName}`}
            >
              {item.icon}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default DashboardCards;
