import React from "react";
import { Contact, HeartIcon } from "lucide-react";
import {
  ExclamationCircleOutlined,
  CalendarOutlined,
  FileTextOutlined,
  MessageOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import { Col, Row, Button, Card } from "antd";
import { AiOutlinePhone } from "react-icons/ai";
import { Header } from "../../User-HomePage-components/Header";
import ContactSection from "./ContactSection";
import AppointmentSection from "./AppointmentSection";

export default function SupportPage() {
  const HeroSection = () => {
    return (
      <section className="bg-blue-600 text-white text-center py-10 md:mt-16==">
        {" "}
        {/* Adjust mt- to account for fixed header */}
        {/* The icon and its circular background, now positioned above the h1 */}
        <div className="flex justify-center mb-6">
          {" "}
          {/* flex justify-center to center the icon; mb-6 for spacing below */}
          <div
            className="
            bg-blue-500           /* Solid lighter blue background */
            rounded-full          /* Makes it a perfect circle */
            h-24 w-24             /* Restored larger size for standalone icon */
            flex items-center justify-center /* Center the icon inside the circle */
          "
          >
            <HeartIcon className="h-12 w-12 text-white" />{" "}
            {/* Restored larger icon size */}
          </div>
        </div>
        {/* The main heading, restored to its original text */}
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Liên hệ phòng y tế
        </h1>
        <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
          Đội ngũ y tế chuyên nghiệp luôn sẵn sàng chăm sóc sức khỏe học sinh và
          hỗ trợ phụ huynh 24/7
        </p>
        <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-4">
          <button className="bg-white text-blue-600 px-8 py-3 rounded-full shadow-lg hover:bg-gray-100 transition duration-300 flex items-center justify-center">
            <AiOutlinePhone className="mr-2 text-xl" />
            <span className="text-lg font-semibold mr-2">
              Gọi ngay 0912.345.678
            </span>
          </button>
          {/* You can add another button here if needed based on the image */}
        </div>
      </section>
    );
  };

  const EmergencyMessage = () => {
    return (
      <div className="relative bg-red-50 border-l-4 border-red-500 p-4">
        <Row justify="center">
          <Col span={24} style={{ maxWidth: 1400 }}>
            <Row align="middle" gutter={16}>
              <Col>
                <ExclamationCircleOutlined
                  style={{ fontSize: "24px", color: "#ff4d4f" }}
                />
              </Col>
              <Col>
                <p className="text-red-800 text-base font-bold">
                  Khẩn cấp:{" "}
                  <span className="font-normal">
                    Trong trường hợp khẩn cấp, vui lòng gọi ngay hotline{" "}
                  </span>
                  0912.345.678{" "}
                  <span className="font-normal">
                    hoặc đến trực tiếp phòng y tế
                  </span>
                </p>
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
    );
  };

  return (
    <>
      <Header />
      <HeroSection />
      <EmergencyMessage />
      <div style={{ width: "100%", position: "relative" }}>
        <ContactSection />
        <AppointmentSection />
      </div>
    </>
  );
}
