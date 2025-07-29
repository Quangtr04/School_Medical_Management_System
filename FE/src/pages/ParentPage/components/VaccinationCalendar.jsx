import React, { useState } from "react";
import { Empty, Spin } from "antd";
import moment from "moment";
import api from "../../../configs/config-axios";

const VaccinationCalendar = ({ campaigns, loading }) => {
  const [currentMonth, setCurrentMonth] = useState(moment());

  // Navigation handlers
  const goToPreviousMonth = () => {
    setCurrentMonth(moment(currentMonth).subtract(1, "month"));
  };

  const goToNextMonth = () => {
    setCurrentMonth(moment(currentMonth).add(1, "month"));
  };

  const goToToday = () => {
    setCurrentMonth(moment());
  };

  // Calculate the dates to show in the calendar
  const renderCalendar = () => {
    const startOfMonth = moment(currentMonth).startOf("month");
    const endOfMonth = moment(currentMonth).endOf("month");
    const startDate = moment(startOfMonth).startOf("week");
    const endDate = moment(endOfMonth).endOf("week");

    const calendarRows = [];
    let currentDate = startDate.clone();

    // Create header row with day names
    const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

    // Generate weeks
    while (currentDate.isSameOrBefore(endDate)) {
      const weekDays = [];

      for (let i = 0; i < 7; i++) {
        const dayEvents =
          campaigns?.filter(
            (c) =>
              moment(c.scheduled_date).format("YYYY-MM-DD") ===
                currentDate.format("YYYY-MM-DD") &&
              c.approval_status !== "DECLINED" &&
              c.status !== "DECLINED"
          ) || [];

        const isCurrentMonth = currentDate.month() === currentMonth.month();
        const isToday =
          currentDate.format("YYYY-MM-DD") === moment().format("YYYY-MM-DD");

        weekDays.push(
          <td key={currentDate.format("YYYY-MM-DD")}>
            <div className={`day-cell ${isCurrentMonth ? "" : "other-month"}`}>
              <div className={`day-number ${isToday ? "today" : ""}`}>
                {currentDate.format("DD")}
              </div>

              {dayEvents.map((event, idx) => (
                <div
                  key={`${event.id || idx}`}
                  className="event-item"
                  title={event.title}
                >
                  {event.title || "Tiêm chủng"}
                </div>
              ))}
            </div>
          </td>
        );

        currentDate.add(1, "day");
      }

      calendarRows.push(
        <tr key={`week-${calendarRows.length}`}>{weekDays}</tr>
      );
    }

    return (
      <table className="calendar-table">
        <thead>
          <tr>
            {dayNames.map((day) => (
              <th key={day}>{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>{calendarRows}</tbody>
      </table>
    );
  };

  // Filter out declined events before checking if there are any campaigns
  const activeCampaigns =
    campaigns?.filter(
      (c) => c.approval_status !== "DECLINED" && c.status !== "DECLINED"
    ) || [];

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "20px" }}>
        <Spin />
      </div>
    );
  }

  return (
    <div className="vaccination-calendar">
      <div className="simple-calendar">
        <div className="calendar-header">
          <div className="calendar-title">
            {currentMonth.format("MMMM YYYY")}
          </div>
          <div className="calendar-controls">
            <button className="nav-button" onClick={goToPreviousMonth}>
              &#8592;
            </button>
            <button className="today-button" onClick={goToToday}>
              Hôm nay
            </button>
            <button className="nav-button" onClick={goToNextMonth}>
              &#8594;
            </button>
          </div>
        </div>

        {activeCampaigns.length > 0 ? (
          renderCalendar()
        ) : (
          <Empty description="Không có dữ liệu lịch tiêm chủng" />
        )}
      </div>

      <style jsx>{`
        /* Simple Calendar Styles */
        .simple-calendar {
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          padding: 16px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            "Helvetica Neue", Arial, sans-serif;
        }

        /* Calendar header */
        .calendar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .calendar-title {
          font-size: 18px;
          font-weight: 500;
          color: #333;
        }

        .calendar-controls {
          display: flex;
          align-items: center;
        }

        .nav-button {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px 8px;
          color: #666;
          font-size: 14px;
        }

        .today-button {
          margin: 0 8px;
          padding: 4px 12px;
          background-color: #f5f5f5;
          border: 1px solid #d9d9d9;
          border-radius: 4px;
          color: #333;
          font-size: 14px;
          cursor: pointer;
        }

        .nav-button:hover,
        .today-button:hover {
          color: #1890ff;
        }

        /* Calendar table */
        .calendar-table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
        }

        .calendar-table th {
          padding: 8px;
          text-align: center;
          font-weight: normal;
          color: #666;
          border-bottom: 1px solid #f0f0f0;
        }

        .calendar-table td {
          padding: 0;
          border: 1px solid #f0f0f0;
          vertical-align: top;
          height: 100px;
        }

        /* Day cell */
        .day-cell {
          height: 100%;
          padding: 4px;
          position: relative;
        }

        /* Day number */
        .day-number {
          text-align: center;
          padding: 4px;
          font-size: 14px;
          color: #333;
        }

        /* Month label (for first day of month) */
        .month-label {
          display: flex;
          align-items: center;
          padding: 4px;
          font-size: 14px;
          color: #333;
        }

        /* Other month days */
        .other-month {
          color: #ccc;
        }

        /* Today */
        .today {
          color: #1890ff;
          font-weight: bold;
        }

        /* Current day (highlighted) */
        .current-day {
          background-color: #f5222d;
          color: white;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
        }

        /* Event item */
        .event-item {
          margin-top: 4px;
          padding: 2px 6px;
          background-color: #e6f7ff;
          border: 1px solid #91d5ff;
          border-radius: 4px;
          font-size: 12px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Responsive styles */
        @media (max-width: 768px) {
          .calendar-table td {
            height: 80px;
          }

          .day-number {
            font-size: 12px;
          }

          .event-item {
            font-size: 10px;
            padding: 1px 4px;
          }
        }
      `}</style>
    </div>
  );
};

export default VaccinationCalendar;
