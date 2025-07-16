import {
  CalendarOutlined,
  FileTextOutlined,
  MessageOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import { Link } from "lucide-react";
import React from "react";
import { NavLink } from "react-router-dom";

const ContactSection = () => {
  return (
    <div className="flex justify-center space-x-4">
      {/* Gọi điện Card */}
      <div className="w-1/5 border border-gray-200 rounded-lg shadow-sm text-center p-10 my-10">
        <div className="mx-auto bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center mb-4">
          <PhoneOutlined className="text-2xl text-green-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800">Gọi điện</h3>
        <p className="text-gray-500 text-sm mt-1">Hỗ trợ 24/7</p>
        <div className="mt-4 text-blue-600 font-medium">0912.345.678</div>
      </div>

      {/* Chat trực tuyến Card */}
      <div className="w-1/5 border border-gray-200 rounded-lg shadow-sm text-center p-6  my-10">
        <div className="mx-auto bg-green-50 w-12 h-12 rounded-full flex items-center justify-center mb-4">
          <MessageOutlined className="text-2xl text-green-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800">Chat trực tuyến</h3>
        <p className="text-gray-500 text-sm mt-1">Phản hồi trong 5 phút</p>
        <button className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
          Bắt đầu chat
        </button>
      </div>

      {/* Đặt lịch hẹn Card */}
      <div className="w-1/5 border border-gray-200 rounded-lg shadow-sm text-center p-6  my-10">
        <div className="mx-auto bg-purple-50 w-12 h-12 rounded-full flex items-center justify-center mb-4">
          <CalendarOutlined className="text-2xl text-purple-700" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800">Đặt lịch hẹn</h3>
        <p className="text-gray-500 text-sm mt-1">Tư vấn trực tiếp</p>
        <button className="mt-4 px-6 py-2 bg-purple-700 text-white rounded-md hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-700 focus:ring-opacity-50">
          Đặt lịch
        </button>
      </div>

      {/* Tài liệu y tế Card */}
      <div className="w-1/5 border border-gray-200 rounded-lg shadow-sm text-center p-6  my-10">
        <div className="mx-auto bg-orange-50 w-12 h-12 rounded-full flex items-center justify-center mb-4">
          <FileTextOutlined className="text-2xl text-orange-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800">Tài liệu y tế</h3>
        <p className="text-gray-500 text-sm mt-1 mb-6">
          Biểu mẫu &amp; hướng dẫn
        </p>
        <NavLink
          to="/#documents-section"
          className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
        >
          Tải xuống
        </NavLink>
      </div>
    </div>
  );
};

export default ContactSection;
