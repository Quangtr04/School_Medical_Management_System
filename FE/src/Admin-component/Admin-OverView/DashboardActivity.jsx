// src/pages/AdminPage/DashboardActivity.jsx
import React, { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { FaRegListAlt, FaSyringe, FaStethoscope } from "react-icons/fa";
import { useSelector } from "react-redux";
import { addDays, isWithinInterval, parseISO, startOfDay, format } from "date-fns";

const activities = [
  { time: "08:00", content: "Khám sức khỏe định kỳ cho khối 1" },
  { time: "09:30", content: "Tiêm chủng phòng bệnh cho khối 2" },
  { time: "11:00", content: "Tư vấn dinh dưỡng cho phụ huynh" },
  { time: "14:00", content: "Kiểm tra y tế đột xuất khối 3" },
];


const DashboardActivity = () => {
  const vaccineCampains = useSelector((state) => state.vaccination.campaigns);
  
  const examinations = useSelector((state) => state.examination.records);

  function getUpcomingAppointments(vaccineCampains, examinations) {
    const today = startOfDay(new Date());
    const endDate = addDays(today, 14);
    const mappedVaccinations = vaccineCampains
      .filter((item) => {
        if (!item || !item.scheduled_date || item.approval_status?.toUpperCase() !== "APPROVED") return false;
        const parsedDate = parseISO(item.scheduled_date);
        return isWithinInterval(parsedDate, { start: today, end: endDate });
      })
      .map((item) => ({
        type: "Tiêm chủng",
        appointmentTime: item.scheduled_date,
        scheduled_date: item.scheduled_date,
        description: item.vaccine_name || "Tiêm chủng định kỳ",
        title: item.title,
      }));
    const mappedExaminations = examinations
      .filter((item) => {
        if (!item || !item.scheduled_date || item.approval_status?.toUpperCase() !== "APPROVED") return false;
        const parsedDate = parseISO(item.scheduled_date);
        return isWithinInterval(parsedDate, { start: today, end: endDate });
      })
      .map((item) => ({
        type: "Khám sức khỏe",
        appointmentTime: item.scheduled_date,
        scheduled_date: item.scheduled_date,
        description: item.description || "Khám định kỳ",
        title: item.title,
      }));
    return [...mappedVaccinations, ...mappedExaminations].sort(
      (a, b) => new Date(a.appointmentTime) - new Date(b.appointmentTime)
    );
  }
  console.log(examinations);
  


  const upComingNurseActivities = useMemo(() => getUpcomingAppointments(vaccineCampains, examinations), [vaccineCampains, examinations]);

  console.log(upComingNurseActivities);
  

  

  return(
    <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    className="bg-white rounded-2xl shadow-md p-8 mb-8 flex flex-col items-start"
    style={{ minHeight: 220 }}
  >
    <div className="flex items-center gap-3 mb-4">
      <FaRegListAlt className="text-green-500 text-2xl" />
      <h2 className="text-xl font-bold text-gray-800">Hoạt động y tế nổi bật gần đây</h2>
    </div>
    <ul className="w-full">
      {upComingNurseActivities.length === 0 ? (
        <li className="text-gray-400 italic py-8 text-center w-full text-lg">Không có hoạt động y tế nổi bật trong 7 ngày tới.</li>
      ) : (
        upComingNurseActivities.map((act, idx) => {
          const dateObj = act.scheduled_date ? parseISO(act.scheduled_date) : null;
          const badgeColor = act.type === "Tiêm chủng" ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600";
          const badgeIcon = act.type === "Tiêm chủng" ? <FaSyringe className="inline mr-1 text-blue-400" /> : <FaStethoscope className="inline mr-1 text-green-400" />;
          return (
            <li
              key={idx}
              className="flex items-center gap-4 py-4 border-b border-gray-100 last:border-b-0 group hover:bg-blue-50 transition-all rounded-lg px-2"
              style={{ minHeight: 56 }}
            >
              <span className="flex flex-col items-center w-16">
                <span className="bg-blue-100 text-blue-600 font-bold text-base rounded-full px-3 py-1 mb-1 shadow-sm">
                  {dateObj ? format(dateObj, "dd/MM") : "--/--"}
                </span>
              </span>
              <span className={`flex items-center px-2 py-1 rounded text-xs font-semibold ${badgeColor} min-w-[90px] justify-center`}>
                {badgeIcon}
                {act.type}
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-800 truncate text-base mb-1">{act.title}</div>
                <div className="text-gray-500 text-sm truncate">{act.description}</div>
              </div>
            </li>
          );
        })
      )}
    </ul>
  </motion.div>
  )
}


export default DashboardActivity;
