import React, { useEffect } from "react";
import { Card, Statistic, Skeleton } from "antd";
import { FaGraduationCap, FaUser, FaUsers, FaHeart } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserCounts } from "../../redux/dashboard/dashboardSlice";

const DashboardCards = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchUserCounts());
  }, [dispatch]);

  const { totalManagers, totalNurses, totalParents, loading } = useSelector(
    (state) => state.dashboard
  );

  const data = [
    {
      title: "Tổng số phụ huynh",
      value: totalParents,
      icon: <FaUsers />,
      iconWrapperClassName: "bg-purple-500 text-white",
    },
    {
      title: "Tổng số nhân viên y tế",
      value: totalNurses,
      icon: <FaHeart />,
      iconWrapperClassName: "bg-red-500 text-white",
    },
    {
      title: "Tổng số quản lý trường",
      value: totalManagers,
      icon: <FaUser />,
      iconWrapperClassName: "bg-green-500 text-white",
    },
    {
      title: "Tổng số sinh viên (giả lập)",
      value: 1247, // Hoặc thay bằng state nếu có
      icon: <FaGraduationCap />,
      iconWrapperClassName: "bg-blue-500 text-white",
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
              {loading ? (
                <Skeleton active paragraph={false} title={{ width: 60 }} />
              ) : (
                <Statistic
                  value={item.value}
                  className="text-xl font-semibold text-gray-800"
                />
              )}
            </div>
            <div
              className={`p-5 my-4 rounded-full flex items-center justify-center text-3xl ${item.iconWrapperClassName}`}
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
