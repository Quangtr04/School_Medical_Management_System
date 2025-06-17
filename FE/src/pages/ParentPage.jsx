import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaBell,
  FaCalendarAlt,
  FaEdit,
  FaChevronRight,
} from "react-icons/fa";
import {
  parentData,
  getRequestStatusText,
  getRequestStatusColor,
  getConsentStatusText,
  getFeeStatusText,
  getNotificationPriorityClass,
  getHealthConditionIcon,
} from "../data/parentData";

const ParentPage = () => {
  const navigate = useNavigate();
  const [selectedChildIndex, setSelectedChildIndex] = useState(0);
  const [showHealthDeclarationModal, setShowHealthDeclarationModal] =
    useState(false);
  const [showAppointmentDropdown, setShowAppointmentDropdown] = useState(false);
  const { parent, welcomeMessage, children } = parentData;
  // Get current selected child data
  const currentChild = children[selectedChildIndex];
  const {
    medication_requests,
    vaccination_campaigns,
    vaccination_consent_forms,
    checkup_schedules,
    checkup_consent_forms,
    checkup_results,
    health_record,
  } = currentChild;

  // Generate notifications from database data
  const generateNotifications = (child) => {
    const notifications = [];

    // Add vaccination notifications
    child.vaccination_consent_forms?.forEach((form, index) => {
      const campaign = child.vaccination_campaigns[index];
      if (form.status === "PENDING") {
        notifications.push({
          id: `vac_${form.form_id}`,
          type: "vaccination",
          icon: "🔴",
          title: `Xác nhận ${campaign.campaign_name}`,
          description: `Vui lòng xác nhận cho ${child.full_name} tham gia ${
            campaign.campaign_name
          } từ ngày ${new Date(campaign.start_date).toLocaleDateString(
            "vi-VN"
          )}`,
          deadline: `Phí: ${campaign.fee.toLocaleString()}đ - Trạng thái: ${getFeeStatusText(
            form.status_fee
          )}`,
          priority: "high",
        });
      }
    });

    // Add checkup notifications
    child.checkup_consent_forms?.forEach((form, index) => {
      const checkup = child.checkup_schedules[index];
      if (form.status === "PENDING") {
        notifications.push({
          id: `checkup_${form.form_id}`,
          type: "health_check",
          icon: "🔵",
          title: checkup.checkup_title,
          description: `Lịch ${checkup.checkup_title.toLowerCase()} cho ${
            child.full_name
          } vào ngày ${new Date(checkup.scheduled_date).toLocaleDateString(
            "vi-VN"
          )}`,
          deadline: `Phí: ${checkup.fee.toLocaleString()}đ - Trạng thái: ${getFeeStatusText(
            form.fee
          )}`,
          priority: "medium",
        });
      }
    });
    // Add health record update notification
    const lastUpdate = new Date(child.health_record.updated_at);
    const daysSinceUpdate = Math.floor(
      (new Date() - lastUpdate) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceUpdate > 30) {
      notifications.push({
        id: `health_update_${child.student_info_id}`,
        type: "update",
        icon: "🟢",
        title: "Cập nhật hồ sơ sức khỏe",
        description: `Vui lòng cập nhật thông tin sức khỏe mới nhất cho ${child.full_name}`,
        deadline: `Lần cập nhật cuối: ${new Date(
          child.health_record.updated_at
        ).toLocaleDateString("vi-VN")}`,
        priority: "low",
      });
    }

    return notifications;
  };

  const notifications = generateNotifications(currentChild);

  // Handler functions for health actions
  const handleHealthDeclaration = () => {
    setShowHealthDeclarationModal(true);
  };
  const handleViewHealthHistory = () => {
    // Navigate to health history page or show modal
    alert(`Xem lịch sử khám sức khỏe của ${currentChild.full_name}`);
  };
  const handleBookAppointment = (childIndex = null) => {
    const targetChildIndex =
      childIndex !== null ? childIndex : selectedChildIndex;
    navigate(`/parent/appointment?child=${targetChildIndex}`);
    setShowAppointmentDropdown(false);
  };

  // Get total upcoming appointments count
  const getUpcomingAppointmentsCount = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return children.reduce((total, child) => {
      const upcomingCount = (child.consultation_appointments || []).filter(
        (app) =>
          new Date(app.appointment_date) >= today && app.status !== "CANCELLED"
      ).length;
      return total + upcomingCount;
    }, 0);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showAppointmentDropdown &&
        !event.target.closest(".appointment-dropdown")
      ) {
        setShowAppointmentDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showAppointmentDropdown]);

  const handleCloseModal = () => {
    setShowHealthDeclarationModal(false);
  };
  const handleSubmitHealthDeclaration = (formData) => {
    // Validate required fields
    if (!formData.height || !formData.weight || !formData.blood_type) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }

    // Create health declaration object matching database schema
    const healthDeclaration = {
      student_info_id: currentChild.student_info_id,
      height: parseFloat(formData.height),
      weight: parseFloat(formData.weight),
      blood_type: formData.blood_type,
      allergy: formData.allergy || null,
      chronic_disease: formData.chronic_disease || null,
      vision_left: formData.vision_left
        ? parseFloat(formData.vision_left)
        : null,
      vision_right: formData.vision_right
        ? parseFloat(formData.vision_right)
        : null,
      hearing_left: formData.hearing_left || "Bình thường",
      hearing_right: formData.hearing_right || "Bình thường",
      health_status: formData.health_status || "Tốt",
      notes: formData.notes || null,
      submitted_at: new Date().toISOString(),
      submitted_by: parent.user_id,
    };

    // Here you would typically send to API
    console.log("Health declaration submitted:", healthDeclaration);

    // Show success message
    alert(
      `Khai báo hồ sơ sức khỏe cho ${currentChild.full_name} đã được gửi thành công!\n\nThông tin sẽ được y tế trường xem xét và cập nhật vào hồ sơ.`
    );

    setShowHealthDeclarationModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold">🏥</span>
                </div>
                <nav className="flex space-x-8">
                  <a
                    href="#"
                    className="text-blue-600 font-medium border-b-2 border-blue-600 pb-1"
                  >
                    Sức khỏe học đường
                  </a>
                  <a href="#" className="text-gray-600 hover:text-gray-900">
                    Trang chủ
                  </a>
                  <a href="#" className="text-gray-600 hover:text-gray-900">
                    Giới thiệu trường học
                  </a>{" "}
                  <a href="#" className="text-gray-600 hover:text-gray-900">
                    Tài liệu sức khỏe
                  </a>
                  <a href="#" className="text-gray-600 hover:text-gray-900">
                    Blog của sở
                  </a>
                </nav>
              </div>{" "}
              <div className="flex items-center space-x-4">
                <div className="relative appointment-dropdown">
                  <button
                    onClick={() =>
                      setShowAppointmentDropdown(!showAppointmentDropdown)
                    }
                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 flex items-center space-x-2 relative"
                  >
                    <FaCalendarAlt className="text-sm" />
                    <span>Đặt lịch hẹn</span>
                    {getUpcomingAppointmentsCount() > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {getUpcomingAppointmentsCount()}
                      </span>
                    )}
                    <svg
                      className={`w-4 h-4 transform transition-transform ${
                        showAppointmentDropdown ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {showAppointmentDropdown && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                      <div className="py-2">
                        <div className="px-4 py-2 text-xs text-gray-500 font-medium border-b">
                          Chọn con để đặt lịch hẹn:
                        </div>
                        {children.map((child, index) => {
                          const upcomingCount = (
                            child.consultation_appointments || []
                          ).filter(
                            (app) =>
                              new Date(app.appointment_date) >= new Date() &&
                              app.status !== "CANCELLED"
                          ).length;

                          return (
                            <button
                              key={child.student_info_id}
                              onClick={() => handleBookAppointment(index)}
                              className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center justify-between transition-colors"
                            >
                              <div className="flex items-center space-x-3">
                                <span className="text-lg">{child.avatar}</span>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {child.full_name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {child.class_name} • {child.age}
                                  </p>
                                </div>
                              </div>
                              {upcomingCount > 0 && (
                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                  {upcomingCount} lịch hẹn
                                </span>
                              )}
                            </button>
                          );
                        })}
                        <div className="border-t pt-2">
                          <button
                            onClick={() => handleBookAppointment()}
                            className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            📅 Xem tất cả lịch hẹn
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => (window.location.href = "/parent/profile")}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <FaUser className="text-sm" />
                  <span className="text-sm font-medium">Hồ sơ</span>
                </button>
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <FaUser className="text-gray-600 text-sm" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {" "}
            {/* Welcome Section */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Xin chào, {parent.full_name}!
              </h1>
              <p className="text-gray-600 mb-6">{welcomeMessage}</p>

              {/* Children Selection */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Chọn con của bạn
                </h3>
                <div className="flex space-x-4">
                  {children.map((child, index) => (
                    <button
                      key={child.student_info_id}
                      onClick={() => setSelectedChildIndex(index)}
                      className={`flex items-center space-x-3 p-4 rounded-lg border transition-colors ${
                        selectedChildIndex === index
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <span className="text-2xl">{child.avatar}</span>
                      <div className="text-left">
                        <div className="font-medium text-gray-900">
                          {child.full_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {child.age} - {child.class_name}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {/* Health Status Section */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Sức khỏe của con bạn
                </h2>
                {/* Health Action Buttons */}{" "}
                <div className="flex space-x-3">
                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 transition-colors"
                    onClick={() => handleHealthDeclaration()}
                  >
                    <FaEdit className="text-sm" />
                    <span>Khai báo hồ sơ sức khỏe</span>
                  </button>
                  <button
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 transition-colors"
                    onClick={() => handleViewHealthHistory()}
                  >
                    <FaCalendarAlt className="text-sm" />
                    <span>Lịch sử khám</span>
                  </button>
                  <button
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 transition-colors"
                    onClick={() => navigate("/parent/appointment")}
                  >
                    <FaCalendarAlt className="text-sm" />
                    <span>Đặt lịch hẹn</span>
                  </button>
                </div>
              </div>
              {/* Selected Child Info */}
              <div className="mb-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <FaUser className="text-blue-600" />
                  </div>{" "}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {currentChild.full_name}
                    </h3>
                    <p className="text-gray-600">
                      {currentChild.age} - {currentChild.class_name}
                    </p>
                  </div>
                </div>
              </div>{" "}
              {/* Health Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Chiều cao</div>
                  <div className="text-xl font-semibold text-gray-900">
                    {currentChild.health_record.height} cm
                  </div>
                  <div className="text-sm text-blue-600">
                    {currentChild.checkup_results?.length > 0 &&
                      `+${(
                        currentChild.health_record.height -
                        currentChild.checkup_results[0].height
                      ).toFixed(1)}cm`}
                  </div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Cân nặng</div>
                  <div className="text-xl font-semibold text-gray-900">
                    {currentChild.health_record.weight} kg
                  </div>
                  <div className="text-sm text-green-600">
                    {currentChild.checkup_results?.length > 0 &&
                      `+${(
                        currentChild.health_record.weight -
                        currentChild.checkup_results[0].weight
                      ).toFixed(1)}kg`}
                  </div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">
                    Tình trạng sức khỏe
                  </div>
                  <div className="text-xl font-semibold text-gray-900">
                    {currentChild.health_record.health_status}
                  </div>
                  <div className="text-xs text-gray-500">
                    Nhóm máu: {currentChild.health_record.blood_type}
                  </div>
                </div>
              </div>
              {/* Health Conditions */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">
                  Tình trạng sức khỏe
                </h4>

                {/* Health status from database */}
                <div className="flex items-center space-x-3">
                  <span className="text-lg">✅</span>
                  <span className="text-sm text-gray-700">
                    Thị lực: {currentChild.health_record.vision_left}/
                    {currentChild.health_record.vision_right}
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-lg">✅</span>
                  <span className="text-sm text-gray-700">
                    Thính lực: {currentChild.health_record.hearing_left} /{" "}
                    {currentChild.health_record.hearing_right}
                  </span>
                </div>

                {currentChild.health_record.allergy && (
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">⚠️</span>
                    <span className="text-sm text-gray-700">
                      Dị ứng: {currentChild.health_record.allergy}
                    </span>
                  </div>
                )}
                {currentChild.checkup_results?.[0]?.abnormal_signs && (
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">⚠️</span>
                    <span className="text-sm text-gray-700">
                      {currentChild.checkup_results[0].abnormal_signs}
                    </span>
                  </div>
                )}

                {/* Next scheduled checkups */}
                {currentChild.checkup_schedules?.map((checkup) => (
                  <div
                    key={checkup.checkup_id}
                    className="flex items-center space-x-3"
                  >
                    <span className="text-lg">📅</span>
                    <span className="text-sm text-gray-700">
                      {checkup.checkup_title} -{" "}
                      {new Date(checkup.scheduled_date).toLocaleDateString(
                        "vi-VN"
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            {/* Medications Section */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Thuốc đã gửi cho trường
              </h2>
              <div className="space-y-4">
                {medication_requests.map((request) => (
                  <div
                    key={request.request_id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-6 h-6 rounded-full ${
                          request.status === "APPROVED"
                            ? "bg-green-500"
                            : "bg-orange-500"
                        }`}
                      ></div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {request.medicine_name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {request.dosage}
                        </div>
                        <div className="text-xs text-gray-500">
                          Số lượng: {request.quantity}
                        </div>
                      </div>
                    </div>{" "}
                    <span
                      className={`px-3 py-1 text-xs rounded-full ${getRequestStatusColor(
                        request.status
                      )}`}
                    >
                      {getRequestStatusText(request.status)}
                    </span>
                  </div>
                ))}
              </div>{" "}
              <button
                onClick={() =>
                  (window.location.href = "/parent/medication-request")
                }
                className="mt-4 text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors"
              >
                + Gửi thêm thuốc
              </button>
            </div>
            {/* Consultation Appointments */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  🩺 Lịch hẹn tư vấn
                </h2>
                <button
                  onClick={() => navigate("/parent/appointment")}
                  className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors"
                >
                  Xem tất cả →
                </button>
              </div>
              <div className="space-y-3">
                {currentChild.consultation_appointments &&
                currentChild.consultation_appointments.length > 0 ? (
                  currentChild.consultation_appointments
                    .filter(
                      (app) => new Date(app.appointment_date) >= new Date()
                    )
                    .slice(0, 2)
                    .map((appointment) => (
                      <div
                        key={appointment.appointment_id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">👨‍⚕️</span>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {appointment.appointment_type}
                            </p>
                            <p className="text-xs text-gray-600">
                              {new Date(
                                appointment.appointment_date
                              ).toLocaleDateString("vi-VN")}{" "}
                              - {appointment.appointment_time}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                          {appointment.status === "CONFIRMED"
                            ? "Đã xác nhận"
                            : "Chờ xác nhận"}
                        </span>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-4">
                    <div className="text-4xl mb-2">📅</div>
                    <p className="text-sm text-gray-600 mb-3">
                      Chưa có lịch hẹn tư vấn
                    </p>
                    <button
                      onClick={() => navigate("/parent/appointment")}
                      className="text-blue-600 text-sm font-medium hover:text-blue-700"
                    >
                      + Đặt lịch hẹn đầu tiên
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Notifications & Schedule */}
          <div className="space-y-6">
            {/* Notifications */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Thông báo & Yêu cầu cần xác nhận
                </h2>
                <div className="relative">
                  <FaBell className="text-red-500" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    1
                  </span>
                </div>
              </div>{" "}
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border ${getNotificationPriorityClass(
                      notification.priority
                    )}`}
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-sm">{notification.icon}</span>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">
                          {notification.title}
                        </h4>
                        <p className="text-sm text-gray-700 mb-2">
                          {notification.description}
                        </p>
                        <p className="text-xs text-gray-500">
                          {notification.deadline}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Vaccinations */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Lịch tiêm chủng sắp tới
              </h2>
              <div className="space-y-3">
                {vaccination_campaigns.map((campaign) => (
                  <div
                    key={campaign.campaign_id}
                    className="p-4 bg-blue-50 rounded-lg border border-blue-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <span className="text-blue-500 text-lg">💉</span>
                        <div>
                          {" "}
                          <h4 className="font-medium text-gray-900">
                            {campaign.campaign_name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {new Date(campaign.start_date).toLocaleDateString(
                              "vi-VN"
                            )}{" "}
                            -{" "}
                            {new Date(campaign.end_date).toLocaleDateString(
                              "vi-VN"
                            )}
                          </p>
                          <p className="text-xs text-gray-500">
                            Phí: {campaign.fee.toLocaleString()}đ
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex space-x-2">
                      {vaccination_consent_forms.map((form) => {
                        if (form.campaign_id === campaign.campaign_id) {
                          return (
                            <div key={form.form_id} className="flex space-x-2">
                              <button
                                className={`px-3 py-1 text-xs rounded-full ${
                                  form.status === "PENDING"
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-200 text-gray-700"
                                }`}
                              >
                                {getConsentStatusText(form.status)}
                              </button>
                              <button
                                className={`px-3 py-1 text-xs rounded-full ${
                                  form.status_fee === "paid"
                                    ? "bg-green-600 text-white"
                                    : "bg-orange-600 text-white"
                                }`}
                              >
                                {getFeeStatusText(form.status_fee)}
                              </button>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Checkup Schedule */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Lịch khám sức khỏe
              </h2>
              <div className="space-y-3">
                {checkup_schedules.map((checkup) => (
                  <div
                    key={checkup.checkup_id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-gray-500">📄</span>
                      <div>
                        <div className="font-medium text-gray-900">
                          {checkup.checkup_title}
                        </div>
                        <div className="text-sm text-gray-600">
                          {new Date(checkup.scheduled_date).toLocaleDateString(
                            "vi-VN"
                          )}{" "}
                          - {checkup.location}
                        </div>
                        <div className="text-xs text-gray-500">
                          Phí: {checkup.fee.toLocaleString()}đ
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {checkup_consent_forms.map((form) => {
                        if (form.checkup_id === checkup.checkup_id) {
                          return (
                            <div key={form.form_id} className="flex space-x-2">
                              <span
                                className={`px-2 py-1 text-xs rounded-full ${getRequestStatusColor(
                                  form.status
                                )}`}
                              >
                                {getConsentStatusText(form.status)}
                              </span>
                              <span
                                className={`px-2 py-1 text-xs rounded-full ${
                                  form.fee === "paid"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-orange-100 text-orange-800"
                                }`}
                              >
                                {getFeeStatusText(form.fee)}
                              </span>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>{" "}
      {/* Health Declaration Modal */}
      {showHealthDeclarationModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="bg-black opacity-50 absolute inset-0"
            onClick={handleCloseModal}
          ></div>
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto z-10 m-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Khai báo hồ sơ sức khỏe - {currentChild.full_name}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const data = Object.fromEntries(formData);
                handleSubmitHealthDeclaration(data);
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Basic Health Info */}
                <div className="md:col-span-2">
                  <h3 className="text-lg font-medium text-gray-900 mb-3 border-b pb-2">
                    Thông tin cơ bản
                  </h3>
                </div>

                <div>
                  <label
                    htmlFor="height"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Chiều cao (cm) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="height"
                    id="height"
                    step="0.1"
                    min="50"
                    max="250"
                    required
                    placeholder={currentChild.health_record.height}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
                  />
                </div>

                <div>
                  <label
                    htmlFor="weight"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Cân nặng (kg) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="weight"
                    id="weight"
                    step="0.1"
                    min="10"
                    max="200"
                    required
                    placeholder={currentChild.health_record.weight}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
                  />
                </div>

                <div>
                  <label
                    htmlFor="blood_type"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Nhóm máu <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="blood_type"
                    id="blood_type"
                    required
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
                  >
                    <option value="">Chọn nhóm máu</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="health_status"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Tình trạng sức khỏe tổng quát
                  </label>
                  <select
                    name="health_status"
                    id="health_status"
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
                  >
                    <option value="Tốt">Tốt</option>
                    <option value="Khá">Khá</option>
                    <option value="Trung bình">Trung bình</option>
                    <option value="Yếu">Yếu</option>
                  </select>
                </div>

                {/* Vision and Hearing */}
                <div className="md:col-span-2">
                  <h3 className="text-lg font-medium text-gray-900 mb-3 border-b pb-2 mt-4">
                    Thị lực và thính lực
                  </h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Thị lực (mắt trái/phải)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      name="vision_left"
                      step="0.1"
                      min="0"
                      max="2"
                      placeholder="Trái (VD: 1.0)"
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
                    />
                    <input
                      type="number"
                      name="vision_right"
                      step="0.1"
                      min="0"
                      max="2"
                      placeholder="Phải (VD: 1.0)"
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Thính lực (tai trái/phải)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      name="hearing_left"
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
                    >
                      <option value="Bình thường">Bình thường</option>
                      <option value="Giảm nhẹ">Giảm nhẹ</option>
                      <option value="Giảm vừa">Giảm vừa</option>
                      <option value="Giảm nặng">Giảm nặng</option>
                    </select>
                    <select
                      name="hearing_right"
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
                    >
                      <option value="Bình thường">Bình thường</option>
                      <option value="Giảm nhẹ">Giảm nhẹ</option>
                      <option value="Giảm vừa">Giảm vừa</option>
                      <option value="Giảm nặng">Giảm nặng</option>
                    </select>
                  </div>
                </div>

                {/* Medical History */}
                <div className="md:col-span-2">
                  <h3 className="text-lg font-medium text-gray-900 mb-3 border-b pb-2 mt-4">
                    Tiền sử bệnh và dị ứng
                  </h3>
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="allergy"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Dị ứng thực phẩm/thuốc (nếu có)
                  </label>
                  <textarea
                    name="allergy"
                    id="allergy"
                    rows="2"
                    placeholder="Ví dụ: Đậu phộng, tôm cua, penicillin..."
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
                  />
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="chronic_disease"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Bệnh mãn tính (nếu có)
                  </label>
                  <textarea
                    name="chronic_disease"
                    id="chronic_disease"
                    rows="2"
                    placeholder="Ví dụ: Hen suyễn, tiểu đường, tim mạch..."
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
                  />
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="notes"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Ghi chú thêm
                  </label>
                  <textarea
                    name="notes"
                    id="notes"
                    rows="3"
                    placeholder="Thông tin khác về sức khỏe của con..."
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3 border-t pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-sm font-medium rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  Gửi khai báo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentPage;
