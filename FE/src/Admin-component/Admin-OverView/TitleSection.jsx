import React from "react";
import { FaSchool } from "react-icons/fa";
import { motion } from "framer-motion";

const TitleSection = () => (
  <motion.div
    initial={{ opacity: 0, y: -30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    className="w-full mb-8"
    style={{
      background: "linear-gradient(90deg, #e3f2fd 0%, #e0f7fa 100%)",
      borderRadius: 24,
      boxShadow: "0 4px 24px #e0f0ff",
      padding: '32px 0',
      display: 'flex',
      alignItems: 'center',
      gap: 24,
      justifyContent: 'center',
    }}
  >
    <div style={{ background: '#fff', borderRadius: '50%', width: 72, height: 72, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px #e0f0ff', marginRight: 24 }}>
      <FaSchool style={{ fontSize: 40, color: '#1677ff' }} />
    </div>
    <div>
      <h1 style={{ fontSize: 36, fontWeight: 800, color: '#1677ff', margin: 0, letterSpacing: 1 }}>Tổng quan hệ thống Quản lý Y tế Trường học</h1>
      <div style={{ color: '#607d8b', fontSize: 18, marginTop: 8, fontWeight: 500 }}>
        Theo dõi, chăm sóc và bảo vệ sức khỏe học sinh toàn diện
      </div>
    </div>
  </motion.div>
);

export default TitleSection;
