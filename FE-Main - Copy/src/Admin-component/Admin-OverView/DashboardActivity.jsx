// src/pages/AdminPage/DashboardActivity.jsx
import React from "react";
import { Card, Empty } from "antd";

const DashboardActivity = () => {
  // Dữ liệu giả định cho hoạt động hệ thống
  const activityData = [
    { day: "T2", value: 10 },
    { day: "T3", value: 15 },
    { day: "T4", value: 8 },
    { day: "T5", value: 20 },
    { day: "T6", value: 12 },
    { day: "T7", value: 25 },
    { day: "CN", value: 18 },
  ];

  return (
    <div className="p-6">
      <Card className="shadow-sm rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Hoạt động hệ thống (7 ngày qua)
        </h3>
        <div className="h-40 w-full flex items-center justify-center bg-gray-50 rounded-md text-gray-500">
          {/* Đây là placeholder cho biểu đồ thanh hoạt động */}
          <p>
            Biểu đồ hoạt động hệ thống sẽ hiển thị ở đây (dạng cột hoặc thanh)
          </p>
          {/* Ví dụ đơn giản hóa: */}
          <div className="flex w-full h-full p-4 items-end justify-around">
            {activityData.map((item, index) => (
              <div key={index} className="flex flex-col items-center mx-1">
                <div
                  className="w-8 bg-blue-500 rounded-t-lg transition-all duration-300 ease-in-out"
                  style={{ height: `${item.value * 5}px` }} // Điều chỉnh scale cho phù hợp
                ></div>
                <span className="text-xs text-gray-600 mt-1">{item.day}</span>
              </div>
            ))}
          </div>
        </div>
        {/* <Empty description="Chưa có dữ liệu hoạt động" image={Empty.PRESENTED_IMAGE_SIMPLE} className="py-10" /> */}
      </Card>
    </div>
  );
};

export default DashboardActivity;
