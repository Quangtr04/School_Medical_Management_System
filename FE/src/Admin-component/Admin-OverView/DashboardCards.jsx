import React, { useEffect } from "react";
import { Skeleton } from "antd";
import { FaGraduationCap, FaUser, FaUsers, FaHeart } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserCounts } from "../../redux/dashboard/dashboardSlice";
import { motion } from "framer-motion";

const DashboardCards = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchUserCounts());
  }, [dispatch]);

  const { totalManagers, totalNurses, totalParents, totalStudent, loading } = useSelector(
    (state) => state.dashboard
  );

  const data = [
    {
      title: "Tổng số phụ huynh",
      value: totalParents,
      icon: <FaUsers className="text-purple-600" />,
      bg: "bg-purple-100",
      ring: "ring-2 ring-purple-300",
    },
    {
      title: "Tổng số nhân viên y tế",
      value: totalNurses,
      icon: <FaHeart className="text-red-500" />,
      bg: "bg-red-100",
      ring: "ring-2 ring-red-300",
    },
    {
      title: "Tổng số quản lý trường",
      value: totalManagers,
      icon: <FaUser className="text-green-600" />,
      bg: "bg-green-100",
      ring: "ring-2 ring-green-300",
    },
    {
      title: "Tổng số học sinh",
      value: totalStudent,
      icon: <FaGraduationCap className="text-blue-600" />,
      bg: "bg-blue-100",
      ring: "ring-2 ring-blue-300",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 px-6 pb-8">
      {data.map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.12 }}
          className={
            `relative bg-white rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 p-6 flex flex-col justify-between min-h-[170px]`
          }
        >
          <div className="flex items-center justify-between w-full">
            <div>
              <p className="text-base font-medium text-gray-500 mb-2">{item.title}</p>
              {loading ? (
                <Skeleton active paragraph={false} title={{ width: 80 }} />
              ) : (
                <div className="text-2xl font-bold text-gray-800 transition-all duration-300">
                  {item.value}
                </div>
              )}
            </div>
            <div
              className={`flex items-center justify-center w-16 h-16 ${item.bg} rounded-full ${item.ring} shadow-md`}
              style={{ minWidth: 64, minHeight: 64 }}
            >
              <span className="text-3xl flex items-center justify-center">
                {item.icon}
              </span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default DashboardCards;
