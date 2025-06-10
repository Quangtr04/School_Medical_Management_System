import React, { useState } from "react";
import "./App.css";

// Temporary simple components until we create separate files
const Header = ({ currentPage, setCurrentPage }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <span>🏥 Sức khỏe gia đình</span>
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
          <button
            className={
              currentPage === "health-declaration"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() => setCurrentPage("health-declaration")}
          >
            Khai báo sức khỏe
          </button>
          <button className="nav-item">Blog chia sẻ</button>
          <button className="nav-item">Hỗ trợ</button>
        </nav>

        <div className="header-actions">
          <button
            className="btn-primary"
            onClick={() => setCurrentPage("appointment")}
          >
            Đặt lịch hẹn
          </button>
          <div className="user-menu-container">
            <div
              className="user-menu"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <span>👤</span>
            </div>
            {showUserMenu && (
              <div className="user-dropdown">
                <button
                  className="dropdown-item"
                  onClick={() => {
                    setCurrentPage("profile");
                    setShowUserMenu(false);
                  }}
                >
                  👤 Hồ sơ của tôi
                </button>
                <button className="dropdown-item">⚙️ Cài đặt</button>
                <button className="dropdown-item">🚪 Đăng xuất</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

const HomePage = () => {
  const [showMedicineModal, setShowMedicineModal] = useState(false);
  const [selectedChild, setSelectedChild] = useState(0);

  // Dữ liệu các con
  const children = [
    {
      id: 1,
      name: "Nguyễn Văn An",
      age: 7,
      class: "2A2",
      avatar: "👦",
      health: {
        height: "125 cm",
        weight: "26 kg",
        status: "Bình thường",
      },
      medicines: [
        {
          id: 1,
          name: "Vitamin tổng hợp",
          dosage: "1 viên mỗi sáng sau bữa ăn",
          remaining: "20 viên",
          type: "💊",
        },
        {
          id: 2,
          name: "Thuốc dị ứng",
          dosage: "Khi có triệu chứng dị ứng",
          remaining: "5 viên",
          type: "🧴",
        },
      ],
      notifications: [
        {
          id: 1,
          type: "warning",
          title: "Xác nhận tiêm vắc-xin MMR",
          content:
            "Vui lòng xác nhận cho Nguyễn Văn An tiêm chủng vắc-xin MMR tại trường vào ngày 10/06/2023.",
          deadline: "05/06/2023",
        },
        {
          id: 2,
          type: "info",
          title: "Kiểm tra sức khỏe định kỳ",
          content:
            "Lịch kiểm tra sức khỏe định kỳ cho Nguyễn Văn An tại trường vào ngày 15/06/2023.",
          deadline: "10/06/2023",
        },
      ],
      schedule: [
        {
          id: 1,
          title: "Vắc-xin MMR (Sởi, Quai bị, Rubella)",
          date: "10/06/2023",
          location: "Tại trường học",
        },
      ],
    },
    {
      id: 2,
      name: "Nguyễn Thị Bình",
      age: 5,
      class: "Kích",
      avatar: "👧",
      health: {
        height: "108 cm",
        weight: "18 kg",
        status: "Bình thường",
      },
      medicines: [
        {
          id: 3,
          name: "Vitamin D3",
          dosage: "2 giọt mỗi ngày",
          remaining: "50 ml",
          type: "🧴",
        },
      ],
      notifications: [
        {
          id: 3,
          type: "info",
          title: "Khám răng định kỳ",
          content:
            "Lịch khám răng định kỳ cho Nguyễn Thị Bình tại phòng y tế trường vào ngày 20/06/2023.",
          deadline: "15/06/2023",
        },
      ],
      schedule: [
        {
          id: 2,
          title: "Khám răng định kỳ",
          date: "20/06/2023",
          location: "Phòng y tế trường",
        },
      ],
    },
  ];

  const [medicines, setMedicines] = useState(children[selectedChild].medicines);

  const [medicineForm, setMedicineForm] = useState({
    name: "",
    type: "💊",
    dosage: "",
    instructions: "",
    quantity: "",
    expiry: "",
    notes: "",
  });

  // Cập nhật medicines khi chọn con khác
  const handleChildSelect = (index) => {
    setSelectedChild(index);
    setMedicines(children[index].medicines);
  };

  const handleMedicineFormChange = (e) => {
    setMedicineForm({
      ...medicineForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmitMedicine = (e) => {
    e.preventDefault();
    const newMedicine = {
      id: Date.now(),
      name: medicineForm.name,
      dosage: medicineForm.instructions,
      remaining: `${medicineForm.quantity} viên`,
      type: medicineForm.type,
    };

    const updatedMedicines = [...medicines, newMedicine];
    setMedicines(updatedMedicines);

    // Cập nhật dữ liệu cho con được chọn
    children[selectedChild].medicines = updatedMedicines;

    setMedicineForm({
      name: "",
      type: "💊",
      dosage: "",
      instructions: "",
      quantity: "",
      expiry: "",
      notes: "",
    });
    setShowMedicineModal(false);
    alert("Đã gửi thông tin thuốc cho trường thành công!");
  };

  const removeMedicine = (id) => {
    const updatedMedicines = medicines.filter((med) => med.id !== id);
    setMedicines(updatedMedicines);
    children[selectedChild].medicines = updatedMedicines;
  };

  const currentChild = children[selectedChild];

  return (
    <div className="medical-page">
      <div className="container">
        <div className="welcome-section">
          <h1>Xin chào, Nguyễn Thị Hoa!</h1>
          <p>Chào mừng đến với trang quản lý sức khỏe cho bạn</p>

          <div className="action-buttons">
            <button
              className="btn-primary"
              onClick={() => window.App.setCurrentPage("health-declaration")}
            >
              🗒️ Khai báo sức khỏe
            </button>
            <button
              className="btn-secondary"
              onClick={() => setShowMedicineModal(true)}
            >
              💊 Gửi thuốc cho trường
            </button>
          </div>
        </div>

        <div className="children-section">
          <h2>Chọn con của bạn</h2>
          <div className="children-cards">
            {children.map((child, index) => (
              <div
                key={child.id}
                className={`child-card ${
                  index === selectedChild ? "active" : ""
                }`}
                onClick={() => handleChildSelect(index)}
              >
                <span className="child-icon">{child.avatar}</span>
                <div>
                  <h4>
                    {child.name} ({child.age} tuổi)
                  </h4>
                  <p>Lớp {child.class}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="current-child-info">
          <h2>Thông tin sức khỏe - {currentChild.name}</h2>
        </div>

        <div className="content-grid">
          <div className="left-column">
            <div className="health-info">
              <h3>Sức khỏe của {currentChild.name}</h3>
              <div className="health-stats">
                <div className="stat">
                  <label>Chiều cao</label>
                  <div className="stat-value">
                    <strong>{currentChild.health.height}</strong>
                    <span className="normal">{currentChild.health.status}</span>
                  </div>
                </div>
                <div className="stat">
                  <label>Cân nặng</label>
                  <div className="stat-value">
                    <strong>{currentChild.health.weight}</strong>
                    <span className="normal">{currentChild.health.status}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="medications">
              <h3>Thuốc đã gửi cho trường</h3>
              {medicines.length > 0 ? (
                medicines.map((medicine) => (
                  <div key={medicine.id} className="medication-item">
                    <div className="med-icon">{medicine.type}</div>
                    <div className="med-info">
                      <h4>{medicine.name}</h4>
                      <p>{medicine.dosage}</p>
                      <span className="med-status">
                        Còn {medicine.remaining}
                      </span>
                    </div>
                    <button
                      className="btn-remove"
                      onClick={() => removeMedicine(medicine.id)}
                    >
                      ❌
                    </button>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <p>Chưa có thuốc nào được gửi cho trường</p>
                </div>
              )}
              <button
                className="btn-add"
                onClick={() => setShowMedicineModal(true)}
              >
                + Gửi thêm thuốc cho {currentChild.name}
              </button>
            </div>
          </div>

          <div className="right-column">
            <div className="notifications">
              <h3>Thông báo & Yêu cầu cần xác nhận</h3>
              {currentChild.notifications.length > 0 ? (
                currentChild.notifications.map((notification) => (
                  <div key={notification.id} className="notification-item">
                    <div className={`notif-icon ${notification.type}`}>
                      {notification.type === "warning" ? "⚠️" : "ℹ️"}
                    </div>
                    <div className="notif-content">
                      <h4>{notification.title}</h4>
                      <p>{notification.content}</p>
                      <span className="time">
                        Hạn xác nhận: {notification.deadline}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <p>Không có thông báo nào</p>
                </div>
              )}
            </div>

            <div className="schedule">
              <h3>Lịch tiêm chủng sắp tới</h3>
              {currentChild.schedule.length > 0 ? (
                currentChild.schedule.map((item) => (
                  <div key={item.id} className="schedule-item">
                    <div className="schedule-icon">💉</div>
                    <div className="schedule-info">
                      <h4>{item.title}</h4>
                      <p>
                        Ngày {item.date} - {item.location}
                      </p>
                      <div className="schedule-actions">
                        <button className="btn-confirm">Xác nhận</button>
                        <button className="btn-view">Xem</button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <p>Không có lịch tiêm chủng nào</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Medicine Modal */}
      {showMedicineModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowMedicineModal(false)}
        >
          <div
            className="modal-content medicine-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="breadcrumb">
                <span>Trang chủ</span> / <span>Gửi thuốc cho trường</span>
              </div>
              <button
                className="close-btn"
                onClick={() => setShowMedicineModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <h1 className="page-title">Gửi thuốc cho trường</h1>
              <p className="page-subtitle">
                ℹ️ Xin lưu ý rằng bộ Đổi Công này để gửi yêu cầu cho giáo viên
                nhận thuốc, đồng thời.
              </p>

              <form onSubmit={handleSubmitMedicine} className="medicine-form">
                <div className="form-section">
                  <h3>1. Thông tin về thuốc</h3>

                  <div className="form-grid">
                    <div className="form-group">
                      <label>
                        Tên thuốc <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={medicineForm.name}
                        onChange={handleMedicineFormChange}
                        placeholder="VD: Paracetamol 500mg"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Đơn vị</label>
                      <select
                        name="unit"
                        value={medicineForm.unit || "Viên"}
                        onChange={handleMedicineFormChange}
                      >
                        <option value="Viên">Viên</option>
                        <option value="ml">ml</option>
                        <option value="Gói">Gói</option>
                        <option value="Ống">Ống</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>
                        Loại thuốc <span className="required">*</span>
                      </label>
                      <select
                        name="type"
                        value={medicineForm.type}
                        onChange={handleMedicineFormChange}
                        required
                      >
                        <option value="">Chọn loại thuốc</option>
                        <option value="💊">💊 Thuốc viên</option>
                        <option value="🧴">🧴 Thuốc nước</option>
                        <option value="💉">💉 Thuốc tiêm</option>
                        <option value="🩹">🩹 Thuốc bôi ngoài</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>
                        Liều lượng <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        name="dosage"
                        value={medicineForm.dosage}
                        onChange={handleMedicineFormChange}
                        placeholder="VD: 1 viên"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>
                        Cách thức dùng <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        name="instructions"
                        value={medicineForm.instructions}
                        onChange={handleMedicineFormChange}
                        placeholder="VD: Uống sau bữa ăn"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>
                        Số lượng gửi đến trường{" "}
                        <span className="required">*</span>
                      </label>
                      <input
                        type="number"
                        name="quantity"
                        value={medicineForm.quantity}
                        onChange={handleMedicineFormChange}
                        placeholder="VD: 10"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>2. Thời gian sử dụng</h3>

                  <div className="form-grid">
                    <div className="form-group">
                      <label>
                        Ngày bắt đầu dùng <span className="required">*</span>
                      </label>
                      <input
                        type="date"
                        name="startDate"
                        value={medicineForm.startDate || ""}
                        onChange={handleMedicineFormChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Ngày kết thúc dùng</label>
                      <input
                        type="date"
                        name="endDate"
                        value={medicineForm.endDate || ""}
                        onChange={handleMedicineFormChange}
                      />
                    </div>

                    <div className="form-group full-width">
                      <label>Ghi chú về cách sử dụng</label>
                      <textarea
                        name="notes"
                        value={medicineForm.notes}
                        onChange={handleMedicineFormChange}
                        placeholder="VD: Chỉ cho uống khi có triệu chứng sốt trên 38.5°C. Không cho uống quá 3 lần trong ngày."
                        rows="4"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>3. Lưu ý đặc biệt</h3>

                  <div className="info-box warning">
                    <h4>⚠️ Lưu ý quan trọng:</h4>
                    <ul>
                      <li>Thuốc phải còn hạn sử dụng ít nhất 30 ngày</li>
                      <li>Bao bì thuốc phải nguyên vẹn, có nhãn mác rõ ràng</li>
                      <li>
                        Cung cấp đầy đủ thông tin về liều lượng và cách sử dụng
                      </li>
                      <li>
                        Thông báo cho giáo viên về tác dụng phụ có thể xảy ra
                      </li>
                      <li>
                        Đơn thuốc/toa thuốc từ bác sĩ (nếu có) cần được đính kèm
                      </li>
                    </ul>
                  </div>

                  <div className="form-group full-width">
                    <label className="checkbox-label">
                      <input type="checkbox" name="agreement" required />
                      <span className="checkmark"></span>
                      <span>
                        Tôi cam đoan thông tin trên là chính xác và chịu trách
                        nhiệm về việc sử dụng thuốc cho con
                      </span>
                    </label>
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => setShowMedicineModal(false)}
                  >
                    Hủy bỏ
                  </button>
                  <button type="submit" className="btn-submit">
                    🗒️ Gửi thuốc cho trường
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AppointmentPage = () => {
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false);
  const [selectedChild, setSelectedChild] = useState(0);
  const [activeTab, setActiveTab] = useState("upcoming");

  // Dữ liệu các con
  const children = [
    {
      id: 1,
      name: "Nguyễn Minh Anh",
      age: 7,
      class: "2A2",
      avatar: "👦",
    },
    {
      id: 2,
      name: "Nguyễn Thị Bình",
      age: 5,
      class: "Kích",
      avatar: "👧",
    },
  ];

  // Dữ liệu lịch hẹn
  const [appointments, setAppointments] = useState([
    {
      id: 1,
      date: "15/05/2023",
      time: "14:30 - 15:00",
      studentName: "Nguyễn Minh Anh",
      issue: "Tư vấn định hướng nghề nghiệp",
      status: "confirmed",
      statusText: "Đã xác nhận",
    },
    {
      id: 2,
      date: "22/05/2023",
      time: "10:00 - 10:30",
      studentName: "Nguyễn Minh Anh",
      issue: "Tư vấn kết quả học tập học kỳ I",
      status: "pending",
      statusText: "Chờ xác nhận",
    },
  ]);

  const [appointmentForm, setAppointmentForm] = useState({
    studentId: "",
    date: "",
    time: "",
    issue: "",
    description: "",
    contactMethod: "phone",
    urgency: "normal",
  });

  const handleFormChange = (e) => {
    setAppointmentForm({
      ...appointmentForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmitAppointment = (e) => {
    e.preventDefault();
    const selectedStudent = children.find(
      (child) => child.id == appointmentForm.studentId
    );
    const newAppointment = {
      id: Date.now(),
      date: new Date(appointmentForm.date).toLocaleDateString("vi-VN"),
      time: appointmentForm.time,
      studentName: selectedStudent?.name || "",
      issue: appointmentForm.issue,
      status: "pending",
      statusText: "Chờ xác nhận",
    };

    setAppointments([...appointments, newAppointment]);
    setAppointmentForm({
      studentId: "",
      date: "",
      time: "",
      issue: "",
      description: "",
      contactMethod: "phone",
      urgency: "normal",
    });
    setShowNewAppointmentModal(false);
    alert("Đã gửi yêu cầu đặt lịch hẹn thành công!");
  };

  const upcomingAppointments = appointments.filter(
    (apt) => apt.status !== "completed"
  );
  const pastAppointments = appointments.filter(
    (apt) => apt.status === "completed"
  );

  return (
    <div className="appointment-page">
      <div className="container">
        <div className="page-header">
          <div className="breadcrumb">
            <span>Trang chủ</span> / <span>Lịch hẹn Tư vấn</span>
          </div>
          <h1>Lịch hẹn Tư vấn của con</h1>
          <p>Quản lý và theo dõi các cuộc hẹn tư vấn với nhà trường</p>
        </div>

        <div className="appointment-actions">
          <button
            className="btn-primary"
            onClick={() => setShowNewAppointmentModal(true)}
          >
            + Yêu cầu đặt lịch hẹn mới
          </button>
        </div>

        <div className="appointment-tabs">
          <button
            className={`tab-btn ${activeTab === "upcoming" ? "active" : ""}`}
            onClick={() => setActiveTab("upcoming")}
          >
            Các cuộc hẹn sắp tới
          </button>
          <button
            className={`tab-btn ${activeTab === "past" ? "active" : ""}`}
            onClick={() => setActiveTab("past")}
          >
            Lịch sử các cuộc hẹn đã qua
          </button>
        </div>

        <div className="appointments-content">
          {activeTab === "upcoming" && (
            <div className="appointments-table">
              <table>
                <thead>
                  <tr>
                    <th>NGÀY</th>
                    <th>GIỜ</th>
                    <th>HỌC SINH</th>
                    <th>VẤN ĐỀ TƯ VẤN</th>
                    <th>TRẠNG THÁI</th>
                    <th>THAO TÁC</th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingAppointments.length > 0 ? (
                    upcomingAppointments.map((appointment) => (
                      <tr key={appointment.id}>
                        <td>{appointment.date}</td>
                        <td>{appointment.time}</td>
                        <td>{appointment.studentName}</td>
                        <td>{appointment.issue}</td>
                        <td>
                          <span
                            className={`status-badge ${appointment.status}`}
                          >
                            {appointment.statusText}
                          </span>
                        </td>
                        <td>
                          <button className="btn-view-detail">
                            👁️ Xem chi tiết
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="no-data">
                        Không có cuộc hẹn nào
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              {upcomingAppointments.length > 0 && (
                <div className="table-footer">
                  <p>
                    Hiển thị {upcomingAppointments.length} trên tổng số{" "}
                    {upcomingAppointments.length} cuộc hẹn
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "past" && (
            <div className="appointments-table">
              <table>
                <thead>
                  <tr>
                    <th>NGÀY</th>
                    <th>GIỜ</th>
                    <th>HỌC SINH</th>
                    <th>VẤN ĐỀ TƯ VẤN</th>
                    <th>TRẠNG THÁI</th>
                    <th>THAO TÁC</th>
                  </tr>
                </thead>
                <tbody>
                  {pastAppointments.length > 0 ? (
                    pastAppointments.map((appointment) => (
                      <tr key={appointment.id}>
                        <td>{appointment.date}</td>
                        <td>{appointment.time}</td>
                        <td>{appointment.studentName}</td>
                        <td>{appointment.issue}</td>
                        <td>
                          <span
                            className={`status-badge ${appointment.status}`}
                          >
                            {appointment.statusText}
                          </span>
                        </td>
                        <td>
                          <button className="btn-view-detail">
                            👁️ Xem chi tiết
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="no-data">
                        Chưa có cuộc hẹn nào đã hoàn thành
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* New Appointment Modal */}
      {showNewAppointmentModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowNewAppointmentModal(false)}
        >
          <div
            className="modal-content appointment-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="breadcrumb">
                <span>Lịch hẹn Tư vấn</span> / <span>Đặt lịch hẹn mới</span>
              </div>
              <button
                className="close-btn"
                onClick={() => setShowNewAppointmentModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <h1 className="page-title">Đặt lịch hẹn Tư vấn</h1>
              <p className="page-subtitle">
                📅 Vui lòng điền đầy đủ thông tin để đặt lịch hẹn tư vấn với
                giáo viên
              </p>

              <form
                onSubmit={handleSubmitAppointment}
                className="appointment-form"
              >
                <div className="form-section">
                  <h3>📋 Thông tin cơ bản</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>
                        Chọn con <span className="required">*</span>
                      </label>
                      <select
                        name="studentId"
                        value={appointmentForm.studentId}
                        onChange={handleFormChange}
                        required
                      >
                        <option value="">Chọn con của bạn</option>
                        {children.map((child) => (
                          <option key={child.id} value={child.id}>
                            {child.name} - Lớp {child.class}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>
                        Ngày hẹn <span className="required">*</span>
                      </label>
                      <input
                        type="date"
                        name="date"
                        value={appointmentForm.date}
                        onChange={handleFormChange}
                        min={new Date().toISOString().split("T")[0]}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>
                        Khung giờ mong muốn <span className="required">*</span>
                      </label>
                      <select
                        name="time"
                        value={appointmentForm.time}
                        onChange={handleFormChange}
                        required
                      >
                        <option value="">Chọn khung giờ</option>
                        <option value="08:00 - 08:30">08:00 - 08:30</option>
                        <option value="08:30 - 09:00">08:30 - 09:00</option>
                        <option value="09:00 - 09:30">09:00 - 09:30</option>
                        <option value="09:30 - 10:00">09:30 - 10:00</option>
                        <option value="10:00 - 10:30">10:00 - 10:30</option>
                        <option value="10:30 - 11:00">10:30 - 11:00</option>
                        <option value="14:00 - 14:30">14:00 - 14:30</option>
                        <option value="14:30 - 15:00">14:30 - 15:00</option>
                        <option value="15:00 - 15:30">15:00 - 15:30</option>
                        <option value="15:30 - 16:00">15:30 - 16:00</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>
                        Vấn đề cần tư vấn <span className="required">*</span>
                      </label>
                      <select
                        name="issue"
                        value={appointmentForm.issue}
                        onChange={handleFormChange}
                        required
                      >
                        <option value="">Chọn vấn đề</option>
                        <option value="Học tập và thành tích">
                          Học tập và thành tích
                        </option>
                        <option value="Hành vi và kỷ luật">
                          Hành vi và kỷ luật
                        </option>
                        <option value="Sức khỏe và tâm lý">
                          Sức khỏe và tâm lý
                        </option>
                        <option value="Định hướng nghề nghiệp">
                          Định hướng nghề nghiệp
                        </option>
                        <option value="Quan hệ bạn bè">Quan hệ bạn bè</option>
                        <option value="Khác">Khác</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Mức độ ưu tiên</label>
                      <select
                        name="urgency"
                        value={appointmentForm.urgency}
                        onChange={handleFormChange}
                      >
                        <option value="normal">Bình thường</option>
                        <option value="urgent">Khẩn cấp</option>
                        <option value="high">Cao</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Hình thức tư vấn</label>
                      <select
                        name="contactMethod"
                        value={appointmentForm.contactMethod}
                        onChange={handleFormChange}
                      >
                        <option value="phone">Điện thoại</option>
                        <option value="video">Video call</option>
                        <option value="inperson">Trực tiếp tại trường</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>📝 Mô tả chi tiết</h3>
                  <div className="form-group full-width">
                    <label>Mô tả vấn đề cần tư vấn</label>
                    <textarea
                      name="description"
                      value={appointmentForm.description}
                      onChange={handleFormChange}
                      placeholder="Vui lòng mô tả chi tiết vấn đề cần tư vấn để giáo viên có thể chuẩn bị tốt nhất..."
                      rows="5"
                    />
                  </div>
                </div>

                <div className="form-section">
                  <h3>ℹ️ Lưu ý</h3>
                  <div className="info-box">
                    <ul>
                      <li>Thời gian tư vấn mỗi buổi là 30 phút</li>
                      <li>Nhà trường sẽ xác nhận lịch hẹn trong vòng 24 giờ</li>
                      <li>
                        Nếu cần thay đổi lịch hẹn, vui lòng liên hệ trước 4 giờ
                      </li>
                      <li>
                        Đối với vấn đề khẩn cấp, vui lòng gọi trực tiếp hotline
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => setShowNewAppointmentModal(false)}
                  >
                    Hủy bỏ
                  </button>
                  <button type="submit" className="btn-submit">
                    📅 Gửi yêu cầu đặt lịch
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ProfilePage = () => {
  const [formData, setFormData] = useState({
    name: "Nguyễn Văn A",
    birthDate: "15/04/1985",
    phone: "0912345678",
    email: "nguyenvana@gmail.com",
    address: "123 Đường Nguyễn Trãi, Quận 1, TP.HCM",
    relationship: "Cha mẹ",
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsEditing(false);
    alert("Cập nhật thông tin thành công!");
  };

  const children = [
    {
      id: 1,
      name: "Nguyễn Văn B",
      gender: "Nam",
      age: 7,
      class: "2A2",
      avatar: "👦",
      status: "verified",
      statusText: "Đã xác nhận số điện thoại thành công",
    },
    {
      id: 2,
      name: "Nguyễn Thị C",
      gender: "Nữ",
      age: 5,
      class: "Kích",
      avatar: "👧",
      status: "pending",
      statusText: "Chưa xác nhận",
    },
  ];

  return (
    <div className="profile-page">
      <div className="container">
        <div className="page-header">
          <h1>Hồ sơ của tôi</h1>
          <p>Quản lý thông tin cá nhân và gia đình</p>
        </div>

        <div className="profile-content">
          <div className="profile-card">
            <div className="card-header">
              <h2>Thông tin cá nhân</h2>
              <button
                className={`btn-edit ${isEditing ? "editing" : ""}`}
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? "❌ Hủy" : "✏️ Chỉnh sửa"}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Họ và tên *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Nguyễn Văn A"
                    readOnly={!isEditing}
                    className={!isEditing ? "readonly" : ""}
                  />
                </div>

                <div className="form-group">
                  <label>Ngày sinh</label>
                  <input
                    type="text"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleChange}
                    placeholder="15/04/1985"
                    readOnly={!isEditing}
                    className={!isEditing ? "readonly" : ""}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Số điện thoại</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="0912345678"
                    readOnly={!isEditing}
                    className={!isEditing ? "readonly" : ""}
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="nguyenvana@gmail.com"
                    readOnly={!isEditing}
                    className={!isEditing ? "readonly" : ""}
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
                  readOnly={!isEditing}
                  className={!isEditing ? "readonly" : ""}
                />
              </div>

              <div className="form-section">
                <h3>Quan hệ gia đình</h3>
                <div className="relationship-options">
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="relationship"
                      value="Cha mẹ"
                      checked={formData.relationship === "Cha mẹ"}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                    <span>Cha mẹ</span>
                  </label>
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="relationship"
                      value="Người giám hộ"
                      checked={formData.relationship === "Người giám hộ"}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                    <span>Người giám hộ</span>
                  </label>
                </div>
              </div>

              {isEditing && (
                <div className="form-actions">
                  <button type="submit" className="btn-submit">
                    💾 Lưu thay đổi
                  </button>
                </div>
              )}
            </form>
          </div>

          <div className="children-section">
            <div className="section-header">
              <h2>Các con của tôi</h2>
              <button className="btn-add-child">+ Thêm con mới</button>
            </div>

            <div className="children-list">
              {children.map((child) => (
                <div key={child.id} className="child-profile-card">
                  <div className="child-avatar-section">
                    <span className="child-avatar">{child.avatar}</span>
                    <div className="child-basic-info">
                      <h4>{child.name}</h4>
                      <p>
                        {child.gender} • {child.age} tuổi, học lớp {child.class}
                      </p>
                    </div>
                  </div>

                  <div className="child-status">
                    <span className={`status-badge ${child.status}`}>
                      {child.statusText}
                    </span>
                  </div>

                  <div className="child-actions">
                    <button className="btn-view-health">
                      🏥 Xem hồ sơ sức khỏe
                    </button>
                    <button className="btn-edit-child">✏️ Sửa thông tin</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MedicalPage = () => {
  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-content">
          <h1>Giới thiệu về Trường Tiểu học XYZ</h1>
          <p>Chúng tôi luôn chăm sóc sức khỏe cho con em bạn</p>
        </div>
      </section>

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

const HealthDeclarationPage = () => {
  const [selectedChildIndex, setSelectedChildIndex] = useState(0);

  // Dữ liệu các con (có thể share từ HomePage hoặc context)
  const children = [
    {
      id: 1,
      name: "Nguyễn Văn An",
      age: 7,
      class: "2A2",
      avatar: "👦",
    },
    {
      id: 2,
      name: "Nguyễn Thị Bình",
      age: 5,
      class: "Kích",
      avatar: "👧",
    },
  ];

  const selectedChild = children[selectedChildIndex];

  const [healthForm, setHealthForm] = useState({
    studentName: selectedChild.name,
    class: selectedChild.class,
    date: new Date().toISOString().split("T")[0],

    // Thông tin cơ bản
    temperature: "",
    weight: "",
    height: "",
    bloodPressure: "",
    heartRate: "",

    // Triệu chứng
    symptoms: {
      fever: false,
      cough: false,
      soreThroat: false,
      runnyNose: false,
      shortBreath: false,
      headache: false,
      fatigue: false,
      nausea: false,
      diarrhea: false,
      musclePain: false,
      lossOfTaste: false,
      skinRash: false,
    },

    // Triệu chứng khác
    otherSymptoms: "",

    // Tiền sử bệnh
    medicalHistory: {
      chronicDiseases: "",
      allergies: "",
      currentMedications: "",
      recentSurgery: false,
      recentSurgeryDetails: "",
    },

    // Tiếp xúc
    exposure: {
      covid19Contact: false,
      covid19ContactDetails: "",
      travelHistory: false,
      travelDetails: "",
      crowdedPlaces: false,
      crowdedPlacesDetails: "",
    },

    // Vắc xin
    vaccination: {
      covidVaccine: "",
      vaccineDate: "",
      vaccineDose: "",
      otherVaccines: "",
    },

    // Ghi chú
    notes: "",
    parentSignature: false,
  });

  // Cập nhật form khi chọn con khác
  const handleChildSelect = (index) => {
    setSelectedChildIndex(index);
    const child = children[index];
    setHealthForm((prev) => ({
      ...prev,
      studentName: child.name,
      class: child.class,
      // Reset form khi chọn con khác
      temperature: "",
      weight: "",
      height: "",
      bloodPressure: "",
      heartRate: "",
      symptoms: {
        fever: false,
        cough: false,
        soreThroat: false,
        runnyNose: false,
        shortBreath: false,
        headache: false,
        fatigue: false,
        nausea: false,
        diarrhea: false,
        musclePain: false,
        lossOfTaste: false,
        skinRash: false,
      },
      otherSymptoms: "",
      medicalHistory: {
        chronicDiseases: "",
        allergies: "",
        currentMedications: "",
        recentSurgery: false,
        recentSurgeryDetails: "",
      },
      exposure: {
        covid19Contact: false,
        covid19ContactDetails: "",
        travelHistory: false,
        travelDetails: "",
        crowdedPlaces: false,
        crowdedPlacesDetails: "",
      },
      vaccination: {
        covidVaccine: "",
        vaccineDate: "",
        vaccineDose: "",
        otherVaccines: "",
      },
      notes: "",
      parentSignature: false,
    }));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes(".")) {
      const [section, field] = name.split(".");
      setHealthForm((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: type === "checkbox" ? checked : value,
        },
      }));
    } else {
      setHealthForm((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleSymptomChange = (symptom) => {
    setHealthForm((prev) => ({
      ...prev,
      symptoms: {
        ...prev.symptoms,
        [symptom]: !prev.symptoms[symptom],
      },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Health Declaration:", healthForm);
    alert(`Đã gửi khai báo sức khỏe cho ${selectedChild.name} thành công!`);
  };

  return (
    <div className="health-declaration-page">
      <div className="container">
        <div className="page-header">
          <h1>Khai báo Sức khỏe</h1>
          <p>
            Vui lòng khai báo tình trạng sức khỏe hàng ngày để đảm bảo an toàn
            cho cộng đồng trường học
          </p>
        </div>

        {/* Child Selection Section */}
        <div className="child-selection-section">
          <h2>Chọn con của bạn</h2>
          <div className="child-selection-cards">
            {children.map((child, index) => (
              <div
                key={child.id}
                className={`child-selection-card ${
                  index === selectedChildIndex ? "active" : ""
                }`}
                onClick={() => handleChildSelect(index)}
              >
                <span className="child-avatar">{child.avatar}</span>
                <div className="child-details">
                  <h4>{child.name}</h4>
                  <p>
                    Lớp {child.class} • {child.age} tuổi
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="health-form">
          {/* Thông tin học sinh */}
          <div className="form-section">
            <h3>📋 Thông tin học sinh</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Họ và tên học sinh</label>
                <input
                  type="text"
                  name="studentName"
                  value={healthForm.studentName}
                  onChange={handleInputChange}
                  readOnly
                />
              </div>
              <div className="form-group">
                <label>Lớp</label>
                <input
                  type="text"
                  name="class"
                  value={healthForm.class}
                  onChange={handleInputChange}
                  readOnly
                />
              </div>
              <div className="form-group">
                <label>Ngày khai báo</label>
                <input
                  type="date"
                  name="date"
                  value={healthForm.date}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* Chỉ số sức khỏe */}
          <div className="form-section">
            <h3>🌡️ Chỉ số sức khỏe cơ bản</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>
                  Nhiệt độ cơ thể (°C) <span className="required">*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="temperature"
                  value={healthForm.temperature}
                  onChange={handleInputChange}
                  placeholder="36.5"
                  required
                />
              </div>
              <div className="form-group">
                <label>Cân nặng (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  name="weight"
                  value={healthForm.weight}
                  onChange={handleInputChange}
                  placeholder="26.0"
                />
              </div>
              <div className="form-group">
                <label>Chiều cao (cm)</label>
                <input
                  type="number"
                  name="height"
                  value={healthForm.height}
                  onChange={handleInputChange}
                  placeholder="125"
                />
              </div>
              <div className="form-group">
                <label>Huyết áp</label>
                <input
                  type="text"
                  name="bloodPressure"
                  value={healthForm.bloodPressure}
                  onChange={handleInputChange}
                  placeholder="120/80"
                />
              </div>
              <div className="form-group">
                <label>Nhịp tim (lần/phút)</label>
                <input
                  type="number"
                  name="heartRate"
                  value={healthForm.heartRate}
                  onChange={handleInputChange}
                  placeholder="80"
                />
              </div>
            </div>
          </div>

          {/* Triệu chứng */}
          <div className="form-section">
            <h3>🤒 Triệu chứng trong 24h qua</h3>
            <p className="section-note">
              Vui lòng đánh dấu các triệu chứng mà con bạn có trong 24h qua:
            </p>
            <div className="symptoms-grid">
              {Object.entries({
                fever: "Sốt (≥37.5°C)",
                cough: "Ho",
                soreThroat: "Đau họng",
                runnyNose: "Sổ mũi",
                shortBreath: "Khó thở",
                headache: "Đau đầu",
                fatigue: "Mệt mỏi",
                nausea: "Buồn nôn",
                diarrhea: "Tiêu chảy",
                musclePain: "Đau cơ",
                lossOfTaste: "Mất vị giác/khứu giác",
                skinRash: "Phát ban da",
              }).map(([key, label]) => (
                <label key={key} className="symptom-checkbox">
                  <input
                    type="checkbox"
                    checked={healthForm.symptoms[key]}
                    onChange={() => handleSymptomChange(key)}
                  />
                  <span className="checkmark"></span>
                  <span>{label}</span>
                </label>
              ))}
            </div>

            {/* Triệu chứng khác */}
            <div className="form-group full-width symptoms-other">
              <label>Triệu chứng khác (nếu có)</label>
              <textarea
                name="otherSymptoms"
                value={healthForm.otherSymptoms}
                onChange={handleInputChange}
                placeholder="VD: Chảy nước mắt, ngứa mắt, đau bụng, buồn ngủ, khó tập trung..."
                rows="3"
              />
              <small className="form-note">
                💡 Mô tả chi tiết các triệu chứng khác mà con bạn gặp phải nhưng
                không có trong danh sách trên
              </small>
            </div>
          </div>

          {/* Tiền sử bệnh */}
          <div className="form-section">
            <h3>🏥 Tiền sử bệnh và điều trị</h3>
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Bệnh mãn tính (nếu có)</label>
                <textarea
                  name="medicalHistory.chronicDiseases"
                  value={healthForm.medicalHistory.chronicDiseases}
                  onChange={handleInputChange}
                  placeholder="VD: Hen suyễn, tim mạch, tiểu đường..."
                  rows="3"
                />
              </div>
              <div className="form-group full-width">
                <label>Dị ứng (nếu có)</label>
                <textarea
                  name="medicalHistory.allergies"
                  value={healthForm.medicalHistory.allergies}
                  onChange={handleInputChange}
                  placeholder="VD: Dị ứng thực phẩm, thuốc, phấn hoa..."
                  rows="3"
                />
              </div>
              <div className="form-group full-width">
                <label>Thuốc đang sử dụng</label>
                <textarea
                  name="medicalHistory.currentMedications"
                  value={healthForm.medicalHistory.currentMedications}
                  onChange={handleInputChange}
                  placeholder="Liệt kê các loại thuốc đang dùng (nếu có)"
                  rows="3"
                />
              </div>
              <div className="form-group full-width">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="medicalHistory.recentSurgery"
                    checked={healthForm.medicalHistory.recentSurgery}
                    onChange={handleInputChange}
                  />
                  <span className="checkmark"></span>
                  <span>Có phẫu thuật trong 30 ngày qua</span>
                </label>
                {healthForm.medicalHistory.recentSurgery && (
                  <textarea
                    name="medicalHistory.recentSurgeryDetails"
                    value={healthForm.medicalHistory.recentSurgeryDetails}
                    onChange={handleInputChange}
                    placeholder="Chi tiết về phẫu thuật..."
                    rows="2"
                    className="mt-2"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Tiếp xúc */}
          <div className="form-section">
            <h3>👥 Lịch sử tiếp xúc (14 ngày qua)</h3>
            <div className="form-grid">
              <div className="form-group full-width">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="exposure.covid19Contact"
                    checked={healthForm.exposure.covid19Contact}
                    onChange={handleInputChange}
                  />
                  <span className="checkmark"></span>
                  <span>Có tiếp xúc với người mắc COVID-19 hoặc F1</span>
                </label>
                {healthForm.exposure.covid19Contact && (
                  <textarea
                    name="exposure.covid19ContactDetails"
                    value={healthForm.exposure.covid19ContactDetails}
                    onChange={handleInputChange}
                    placeholder="Chi tiết về việc tiếp xúc..."
                    rows="2"
                    className="mt-2"
                  />
                )}
              </div>

              <div className="form-group full-width">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="exposure.travelHistory"
                    checked={healthForm.exposure.travelHistory}
                    onChange={handleInputChange}
                  />
                  <span className="checkmark"></span>
                  <span>Có đi du lịch/công tác xa</span>
                </label>
                {healthForm.exposure.travelHistory && (
                  <textarea
                    name="exposure.travelDetails"
                    value={healthForm.exposure.travelDetails}
                    onChange={handleInputChange}
                    placeholder="Địa điểm và thời gian đi lại..."
                    rows="2"
                    className="mt-2"
                  />
                )}
              </div>

              <div className="form-group full-width">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="exposure.crowdedPlaces"
                    checked={healthForm.exposure.crowdedPlaces}
                    onChange={handleInputChange}
                  />
                  <span className="checkmark"></span>
                  <span>Có đến nơi đông người (50 người)</span>
                </label>
                {healthForm.exposure.crowdedPlaces && (
                  <textarea
                    name="exposure.crowdedPlacesDetails"
                    value={healthForm.exposure.crowdedPlacesDetails}
                    onChange={handleInputChange}
                    placeholder="Địa điểm và thời gian..."
                    rows="2"
                    className="mt-2"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Vắc xin */}
          <div className="form-section">
            <h3>💉 Tình trạng tiêm chủng</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Vắc xin COVID-19</label>
                <select
                  name="vaccination.covidVaccine"
                  value={healthForm.vaccination.covidVaccine}
                  onChange={handleInputChange}
                >
                  <option value="">Chọn loại vắc xin</option>
                  <option value="pfizer">Pfizer-BioNTech</option>
                  <option value="moderna">Moderna</option>
                  <option value="astrazeneca">AstraZeneca</option>
                  <option value="sinovac">Sinovac</option>
                  <option value="other">Khác</option>
                  <option value="none">Chưa tiêm</option>
                </select>
              </div>

              <div className="form-group">
                <label>Ngày tiêm gần nhất</label>
                <input
                  type="date"
                  name="vaccination.vaccineDate"
                  value={healthForm.vaccination.vaccineDate}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Số mũi đã tiêm</label>
                <select
                  name="vaccination.vaccineDose"
                  value={healthForm.vaccination.vaccineDose}
                  onChange={handleInputChange}
                >
                  <option value="">Chọn số mũi</option>
                  <option value="1">1 mũi</option>
                  <option value="2">2 mũi</option>
                  <option value="3">3 mũi</option>
                  <option value="4+">4 mũi trở lên</option>
                </select>
              </div>

              <div className="form-group full-width">
                <label>Vắc xin khác (trong 30 ngày qua)</label>
                <textarea
                  name="vaccination.otherVaccines"
                  value={healthForm.vaccination.otherVaccines}
                  onChange={handleInputChange}
                  placeholder="VD: Vắc xin cúm, vắc xin viêm gan B..."
                  rows="2"
                />
              </div>
            </div>
          </div>

          {/* Ghi chú */}
          <div className="form-section">
            <h3>📝 Ghi chú thêm</h3>
            <div className="form-group full-width">
              <label>Thông tin bổ sung</label>
              <textarea
                name="notes"
                value={healthForm.notes}
                onChange={handleInputChange}
                placeholder="Bất kỳ thông tin nào khác mà bạn muốn chia sẻ về sức khỏe của con..."
                rows="4"
              />
            </div>
          </div>

          {/* Cam kết */}
          <div className="form-section">
            <h3>✍️ Cam kết</h3>
            <div className="commitment-box">
              <p>
                Tôi cam đoan rằng tất cả thông tin khai báo trên là chính xác và
                trung thực. Tôi hiểu rằng việc khai báo không đúng sự thật có
                thể ảnh hưởng đến sức khỏe của cộng đồng và có thể bị xử lý theo
                quy định pháp luật.
              </p>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="parentSignature"
                  checked={healthForm.parentSignature}
                  onChange={handleInputChange}
                  required
                />
                <span className="checkmark"></span>
                <span>Tôi đồng ý và cam kết thông tin trên là chính xác</span>
              </label>
            </div>
          </div>

          {/* Submit buttons */}
          <div className="form-actions">
            <button type="button" className="btn-save-draft">
              💾 Lưu nháp
            </button>
            <button type="submit" className="btn-submit">
              📤 Gửi khai báo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

function App() {
  const [currentPage, setCurrentPage] = useState("home");

  // Expose setCurrentPage to global scope for HomePage component
  window.App = { setCurrentPage };

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <HomePage />;
      case "profile":
        return <ProfilePage />;
      case "appointment":
        return <AppointmentPage />;
      case "medical":
        return <MedicalPage />;
      case "health-declaration":
        return <HealthDeclarationPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="App">
      <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main className="main-content">{renderPage()}</main>
    </div>
  );
}

export default App;
