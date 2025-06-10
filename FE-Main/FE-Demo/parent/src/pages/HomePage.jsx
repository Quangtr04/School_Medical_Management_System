import React from "react";
import "./HomePage.css";

const HomePage = () => {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Giới thiệu về Trường Tiểu học XYZ</h1>
          <p>Chúng tôi luôn chăm sóc sức khỏe cho con em bạn</p>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="intro-section">
        <div className="container">
          <h2>Lời chào từ Ban Giám hiệu</h2>
          <div className="intro-content">
            <div className="principal-info">
              <div className="principal-card">
                <strong>Ông Nguyễn Văn A</strong>
                <p>Hiệu trường</p>
              </div>
              <div className="principal-card">
                <strong>Ông Nguyễn Văn B</strong>
                <p>Phó Hiệu trường</p>
              </div>
            </div>
            <div className="message">
              <p>
                Chúng tôi rất hân hạnh được phục vụ và chăm sóc sức khỏe cho các
                con. Với đội ngũ y bác sĩ giàu kinh nghiệm và trang thiết bị
                hiện đại, chúng tôi cam kết mang lại dịch vụ tốt nhất cho sức
                khỏe của các con.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="services-section">
        <div className="container">
          <h2>Lịch sử hoạt động & Phát triển</h2>
          <div className="timeline">
            <div className="timeline-item">
              <div className="timeline-icon">📘</div>
              <div className="timeline-content">
                <h4>Sức khỏe học đường</h4>
                <p>
                  Chương trình khám sức khỏe định kỳ cho học sinh với đội ngũ y
                  bác sĩ chuyên nghiệp.
                </p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-icon">🏥</div>
              <div className="timeline-content">
                <h4>Chăm sóc y tế toàn diện</h4>
                <p>
                  Dịch vụ chăm sóc sức khỏe toàn diện từ phòng bệnh đến điều trị
                  các vấn đề sức khỏe thường gặp.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <h3>23</h3>
              <p>Năm kinh nghiệm</p>
            </div>
            <div className="stat-item">
              <h3>1200+</h3>
              <p>Học sinh</p>
            </div>
            <div className="stat-item">
              <h3>80+</h3>
              <p>Giáo viên và nhân viên</p>
            </div>
            <div className="stat-item">
              <h3>95%</h3>
              <p>Học sinh đạt chuẩn</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
