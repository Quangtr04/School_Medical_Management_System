import React, { useState } from "react";
import "./ProfilePage.css";

const ProfilePageParent = () => {
  const [formData, setFormData] = useState({
    name: "",
    birthDate: "",
    phone: "",
    email: "",
    address: "",
    relationship: "Cha",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="profile-page">
      <div className="container">
        <h1>Hồ sơ của tôi</h1>

        <form className="profile-form">
          <div className="form-section">
            <h3>Thông tin cá nhân</h3>

            <div className="form-row">
              <div className="form-group">
                <label>Họ và tên *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Nguyễn Văn A"
                />
              </div>

              <div className="form-group">
                <label>Ngày sinh</label>
                <input
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Số điện thoại</label>
                <div className="phone-input">
                  <span>+84</span>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="912345678"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="nguyenvana@email.com"
                />
              </div>
            </div>

            <div className="form-group full-width">
              <label>Địa chỉ</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="123 Đường Nguyễn Trãi, Quận 1, TP.HCM"
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Quan hệ gia đình</h3>
            <div className="relationship-options">
              <label className="radio-option">
                <input
                  type="radio"
                  name="relationship"
                  value="Cha"
                  checked={formData.relationship === "Cha"}
                  onChange={handleChange}
                />
                <span>Cha mẹ (Hủy)</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="relationship"
                  value="Con"
                  checked={formData.relationship === "Con"}
                  onChange={handleChange}
                />
                <span>Con cái, nhóm báu</span>
              </label>
            </div>
          </div>

          <button type="submit" className="btn-submit">
            Thêm thành viên mới
          </button>
        </form>

        <div className="family-members">
          <h3>Các con của tôi</h3>
          <div className="member-card">
            <div className="member-icon">👤</div>
            <div className="member-info">
              <h4>Nguyễn Văn B</h4>
              <p>Con trai • 7 tuổi, học lớp 2A2</p>
              <span className="status">
                Đã xác nhận số điện thoại thành công
              </span>
            </div>
            <button className="btn-link">Xem hồ sơ sức khỏe</button>
          </div>

          <div className="member-card">
            <div className="member-icon">👤</div>
            <div className="member-info">
              <h4>Nguyễn Thị C</h4>
              <p>Con gái • 5 tuổi, học lớp Kích</p>
              <span className="status">Chưa xác nhận</span>
            </div>
            <button className="btn-link">Xem hồ sơ sức khỏe</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePageParent;
