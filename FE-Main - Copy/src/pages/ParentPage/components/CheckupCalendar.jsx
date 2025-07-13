// File: CheckupCalendar.jsx
import React from "react";
import { Calendar, Badge, Tooltip } from "antd";
import moment from "moment";

const CheckupCalendar = ({ campaigns = [], loading }) => {
  const getListData = (value) => {
    const dateStr = value.format("YYYY-MM-DD");
    return campaigns.filter(
      (campaign) =>
        campaign.scheduled_date &&
        moment(campaign.scheduled_date).format("YYYY-MM-DD") === dateStr
    );
  };

  const dateCellRender = (value) => {
    const listData = getListData(value);
    return (
      <ul className="events">
        {listData.map((item, index) => (
          <li key={index}>
            <Tooltip title={item.title}>
              <Badge status="processing" text={item.title} />
            </Tooltip>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <Calendar
      fullscreen={false}
      dateCellRender={dateCellRender}
      className="checkup-calendar"
    />
  );
};

export default CheckupCalendar;
