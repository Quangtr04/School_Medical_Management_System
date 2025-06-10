import React from "react";
import "./MedicalPage.css";

const MedicalPage = () => {
  return (
    <div className="medical-page">
      <div className="container">
        <div className="welcome-section">
          <h1>Xin chào, Nguyễn Thị Hoa!</h1>
          <p>Chào mừng đến với trang quản lý sức khỏe cho bạn</p>

          <div className="action-buttons">
            <button className="btn-primary">🗒️ Tạo báo cáo sức khỏe</button>
            <button className="btn-secondary">💊 Gửi thuốc cho trường</button>
          </div>
        </div>

        <div className="children-section">
          <h2>Chọn con của bạn</h2>
          <div className="children-cards">
            <div className="child-card active">
              <span className="child-icon">👦</span>
              <div>
                <h4>Nguyễn Văn An (7 tuổi)</h4>
              </div>
            </div>
            <div className="child-card">
              <span className="child-icon">👧</span>
              <div>
                <h4>Nguyễn Thị Bình (5 tuổi)</h4>
              </div>
            </div>
          </div>
        </div>

        <div className="content-grid">
          <div className="left-column">
            <div className="health-info">
              <h3>Sức khỏe của con bạn</h3>
              <div className="health-stats">
                <div className="stat">
                  <label>Chiều cao</label>
                  <div className="stat-value">
                    <strong>125 cm</strong>
                    <span className="normal">Bình thường</span>
                  </div>
                </div>
                <div className="stat">
                  <label>Cân nặng</label>
                  <div className="stat-value">
                    <strong>26 kg</strong>
                    <span className="normal">Bình thường</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="health-status">
              <h3>Tình trạng sức khỏe</h3>
              <ul className="status-list">
                <li className="status-item">
                  <span className="status-icon">✅</span>
                  Đã tiêm chủng đầy đủ theo lịch
                </li>
                <li className="status-item">
                  <span className="status-icon">✅</span>
                  Đã chạy tét đau bụng
                </li>
                <li className="status-item">
                  <span className="status-icon">✅</span>
                  Kiểm tra sức khỏe định kỳ 13/05/2023
                </li>
              </ul>
            </div>

            <div className="medications">
              <h3>Thuốc đã gửi cho trường</h3>
              <div className="medication-item">
                <div className="med-icon">💊</div>
                <div className="med-info">
                  <h4>Vitamin tổng hợp</h4>
                  <p>1 viên mỗi sáu khoa trưa</p>
                  <span className="med-status">Còn 20 viên</span>
                </div>
              </div>
              <div className="medication-item">
                <div className="med-icon">🧴</div>
                <div className="med-info">
                  <h4>Thuốc dị ứng</h4>
                  <p>Khi có triệu chứng dị ứng</p>
                  <span className="med-status">Còn 5 viên</span>
                </div>
              </div>
              <button className="btn-add">+ Gửi thêm thuốc</button>
            </div>
          </div>

          <div className="right-column">
            <div className="notifications">
              <h3>Thông báo & Yêu cầu cần xác nhận</h3>
              <div className="notification-item">
                <div className="notif-icon warning">⚠️</div>
                <div className="notif-content">
                  <h4>Xác nhận tiêm vắc-xin MMR</h4>
                  <p>
                    Vui lòng xác nhận cho Nguyễn Văn An tiêm chủng vắc-xin MMR
                    tại trường vào ngày 10/06/2023.
                  </p>
                  <span className="time">Hạn xác nhận: 05/06/2023</span>
                </div>
              </div>

              <div className="notification-item">
                <div className="notif-icon info">ℹ️</div>
                <div className="notif-content">
                  <h4>Kiểm tra sức khỏe định kỳ</h4>
                  <p>
                    Lịch kiểm tra sức khỏe định kỳ cho Nguyễn Văn An tại trường
                    vào ngày 15/06/2023.
                  </p>
                  <span className="time">Hạn xác nhận: 10/06/2023</span>
                </div>
              </div>

              <div className="notification-item">
                <div className="notif-icon success">✅</div>
                <div className="notif-content">
                  <h4>Cập nhật hồ sơ sức khỏe</h4>
                  <p>
                    Vui lòng cập nhật thông tin sức khỏe mới nhất cho Nguyễn Văn
                    An.
                  </p>
                  <span className="time">Hạn cập nhật: 20/06/2023</span>
                </div>
              </div>
            </div>

            <div className="schedule">
              <h3>Lịch tiêm chủng sắp tới</h3>
              <div className="schedule-item">
                <div className="schedule-icon">💉</div>
                <div className="schedule-info">
                  <h4>Vắc-xin MMR (Sởi, Quai bị, Rubella)</h4>
                  <p>Ngày 10/06/2023 - Tại trường học</p>
                  <div className="schedule-actions">
                    <button className="btn-confirm">Xác nhận</button>
                    <button className="btn-view">Xem</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="upcoming-schedule">
              <h3>Lịch tiêm chủng tiếp theo</h3>
              <div className="upcoming-item">
                <div className="upcoming-icon">📋</div>
                <div className="upcoming-info">
                  <h4>Vắc-xin cúm mùa</h4>
                  <p>Dự kiến: Tháng 9/2023</p>
                </div>
              </div>

              <div className="upcoming-item">
                <div className="upcoming-icon">📋</div>
                <div className="upcoming-info">
                  <h4>Vắc-xin Viêm não Nhật Bản</h4>
                  <p>Dự kiến: Tháng 12/2023</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalPage;
