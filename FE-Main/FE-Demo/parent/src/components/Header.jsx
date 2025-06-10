import React from "react";
import "./Header.css";

const Header = ({ currentPage, setCurrentPage }) => {
  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <img src="/logo.png" alt="Logo" className="logo-img" />
          <span>Sức khỏe gia đình</span>
        </div>

        <nav className="nav-menu">
          <button
            className={currentPage === "home" ? "nav-item active" : "nav-item"}
            onClick={() => setCurrentPage("home")}
          >
            Trang chủ
          </button>
          <button
            className={
              currentPage === "medical" ? "nav-item active" : "nav-item"
            }
            onClick={() => setCurrentPage("medical")}
          >
            Giới thiệu trường học
          </button>
          <button className="nav-item">Tài liệu sức khỏe</button>
          <button className="nav-item">Blog chia sẻ</button>
          <button className="nav-item">Hỗ trợ</button>
        </nav>

        <div className="header-actions">
          <button
            className="btn-primary"
            onClick={() => setCurrentPage("profile")}
          >
            Đặt lịch hẹn
          </button>
          <div className="user-menu">
            <span>👤</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
