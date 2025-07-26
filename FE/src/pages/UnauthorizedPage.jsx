// src/pages/UnauthorizedPage.jsx
import React from "react";
import { Link } from "react-router-dom";
import FuzzyText from "../Animation/Text/FuzzyText";
import { ExclamationCircleFilled } from '@ant-design/icons';

const UnauthorizedPage = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        textAlign: "center",
        backgroundColor: "#f8d7da",
        color: "#721c24",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ marginBottom: 24 }}>
        <ExclamationCircleFilled style={{ fontSize: 80, color: '#ff9800', marginBottom: 8, filter: 'drop-shadow(0 2px 8px #ffecb3)' }} />
      </div>
      <h1 style={{ fontSize: "3em", marginBottom: "10px", background: "none" }}>
        <FuzzyText fontSize={"5em"} fontWeight={600} baseIntensity={0.08} hoverIntensity={0.18} color="#721c24">
          Truy cập bị từ chối
        </FuzzyText>
      </h1>
      <p style={{ fontSize: "3em", marginBottom: "20px" }}>
        <FuzzyText fontSize={"5em"} fontWeight={600} color="#721c24" baseIntensity={0.08} hoverIntensity={0.18}>
          Bạn không có quyền truy cập trang này.
        </FuzzyText>
      </p>
      <div style={{ fontSize: 20, color: '#444', marginBottom: 18, maxWidth: 600 }}>
        Có thể bạn chưa đăng nhập, phiên đăng nhập đã hết hạn, hoặc bạn không có quyền truy cập chức năng này.<br />
        Nếu bạn nghĩ đây là nhầm lẫn, hãy thử <b>đăng nhập lại</b> hoặc <b>liên hệ quản trị viên</b> để được hỗ trợ.
      </div>
      <Link
        to="/"
        style={{
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "white",
          textDecoration: "none",
          borderRadius: "5px",
          transition: "background-color 0.3s ease",
        }}
        onMouseEnter={(e) => (e.target.style.backgroundColor = "#0056b3")}
        onMouseLeave={(e) => (e.target.style.backgroundColor = "#007bff")}
      >
        Quay về trang chủ
      </Link>
    </div>
  );
};

export default UnauthorizedPage;
