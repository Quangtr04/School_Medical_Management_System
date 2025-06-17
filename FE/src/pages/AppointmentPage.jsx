import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  parentData,
  availableDoctors,
  availableTimeSlots,
  consultationTypes,
  getAppointmentStatusColor,
  getAppointmentStatusText,
} from "../data/parentData";

const AppointmentPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedChild, setSelectedChild] = useState(parentData.children[0]);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedTab, setSelectedTab] = useState("appointments"); // 'appointments' or 'book'
  // Booking form state
  const [bookingForm, setBookingForm] = useState({
    appointment_date: "",
    appointment_time: "",
    appointment_type: "",
    doctor_id: "",
    reason: "",
    notes: "",
  });

  // Handle URL parameters to pre-select child
  useEffect(() => {
    const childParam = searchParams.get("child");
    if (childParam !== null) {
      const childIndex = parseInt(childParam);
      if (childIndex >= 0 && childIndex < parentData.children.length) {
        setSelectedChild(parentData.children[childIndex]);
        setSelectedTab("book"); // Auto switch to booking tab when coming from parent page
      }
    }
  }, [searchParams]);

  // Get existing appointments for selected child
  const getChildAppointments = () => {
    return selectedChild?.consultation_appointments || [];
  };

  // Handle child selection change
  const handleChildChange = (childId) => {
    const child = parentData.children.find(
      (c) => c.student_info_id === parseInt(childId)
    );
    setSelectedChild(child);
  };

  // Handle booking form input change
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setBookingForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmitBooking = (e) => {
    e.preventDefault();

    // Validate form
    if (
      !bookingForm.appointment_date ||
      !bookingForm.appointment_time ||
      !bookingForm.appointment_type ||
      !bookingForm.doctor_id ||
      !bookingForm.reason
    ) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    // Create new appointment
    const newAppointment = {
      appointment_id: Date.now(), // Simple ID generation
      student_info_id: selectedChild.student_info_id,
      parent_id: parentData.parent.user_id,
      doctor_id: parseInt(bookingForm.doctor_id),
      appointment_date: bookingForm.appointment_date,
      appointment_time: bookingForm.appointment_time,
      appointment_type: bookingForm.appointment_type,
      reason: bookingForm.reason,
      status: "PENDING",
      notes: bookingForm.notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Add to child's appointments (in real app, this would be an API call)
    selectedChild.consultation_appointments.push(newAppointment);

    // Reset form and close modal
    setBookingForm({
      appointment_date: "",
      appointment_time: "",
      appointment_type: "",
      doctor_id: "",
      reason: "",
      notes: "",
    });
    setShowBookingForm(false);
    setSelectedTab("appointments");

    alert(
      "Đặt lịch hẹn thành công! Chúng tôi sẽ liên hệ xác nhận trong thời gian sớm nhất."
    );
  };

  // Get doctor info by ID
  const getDoctorById = (doctorId) => {
    return availableDoctors.find((doc) => doc.user_id === doctorId);
  };

  // Get consultation type info
  const getConsultationTypeInfo = (type) => {
    return consultationTypes.find((ct) => ct.type === type);
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Check if date is in the past
  const isPastDate = (dateString) => {
    const appointmentDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return appointmentDate < today;
  };

  // Get minimum date for booking (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  // Filter available doctors by consultation type
  const getAvailableDoctorsForType = (consultationType) => {
    if (!consultationType) return availableDoctors;
    return availableDoctors.filter((doctor) =>
      doctor.consultation_types.includes(consultationType)
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/parent")}
                className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Quay lại
              </button>
              <h1 className="text-xl font-bold text-gray-900">
                Đặt lịch hẹn tư vấn
              </h1>
            </div>

            {/* Child Selector */}
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">Chọn con:</span>
              <select
                value={selectedChild?.student_info_id || ""}
                onChange={(e) => handleChildChange(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {parentData.children.map((child) => (
                  <option
                    key={child.student_info_id}
                    value={child.student_info_id}
                  >
                    {child.full_name} - {child.class_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setSelectedTab("appointments")}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                  selectedTab === "appointments"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                📅 Lịch hẹn của {selectedChild?.full_name}
              </button>
              <button
                onClick={() => setSelectedTab("book")}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                  selectedTab === "book"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                ➕ Đặt lịch hẹn mới
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {selectedTab === "appointments" && (
          <div className="space-y-6">
            {/* Current Appointments */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Lịch hẹn tư vấn của {selectedChild?.full_name}
                </h2>
                <button
                  onClick={() => setSelectedTab("book")}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <span>➕</span>
                  <span>Đặt lịch mới</span>
                </button>
              </div>

              {getChildAppointments().length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📅</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Chưa có lịch hẹn nào
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {selectedChild?.full_name} chưa có lịch hẹn tư vấn nào được
                    đặt.
                  </p>
                  <button
                    onClick={() => setSelectedTab("book")}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Đặt lịch hẹn đầu tiên
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {getChildAppointments()
                    .sort(
                      (a, b) =>
                        new Date(a.appointment_date) -
                        new Date(b.appointment_date)
                    )
                    .map((appointment) => {
                      const doctor = getDoctorById(appointment.doctor_id);
                      const consultationType = getConsultationTypeInfo(
                        appointment.appointment_type
                      );
                      const isPast = isPastDate(appointment.appointment_date);

                      return (
                        <div
                          key={appointment.appointment_id}
                          className={`border rounded-lg p-6 transition-all hover:shadow-md ${
                            isPast
                              ? "bg-gray-50 border-gray-200"
                              : "bg-white border-gray-200"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-3">
                                <span className="text-2xl">
                                  {doctor?.avatar || "👨‍⚕️"}
                                </span>
                                <div>
                                  <h3 className="font-semibold text-gray-900">
                                    {appointment.appointment_type}
                                  </h3>
                                  <p className="text-sm text-gray-600">
                                    Bác sĩ:{" "}
                                    {doctor?.full_name || "Đang cập nhật"}
                                  </p>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                  <p className="text-sm text-gray-600">
                                    📅 Ngày hẹn:
                                  </p>
                                  <p className="font-medium">
                                    {formatDate(appointment.appointment_date)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">
                                    🕐 Thời gian:
                                  </p>
                                  <p className="font-medium">
                                    {appointment.appointment_time}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">
                                    💰 Chi phí:
                                  </p>
                                  <p className="font-medium text-green-600">
                                    {consultationType?.fee?.toLocaleString(
                                      "vi-VN"
                                    )}
                                    đ
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">
                                    ⏱️ Thời lượng:
                                  </p>
                                  <p className="font-medium">
                                    {consultationType?.duration || "30 phút"}
                                  </p>
                                </div>
                              </div>

                              <div className="mb-4">
                                <p className="text-sm text-gray-600 mb-1">
                                  📝 Lý do khám:
                                </p>
                                <p className="text-gray-900">
                                  {appointment.reason}
                                </p>
                              </div>

                              {appointment.notes && (
                                <div className="mb-4">
                                  <p className="text-sm text-gray-600 mb-1">
                                    📌 Ghi chú:
                                  </p>
                                  <p className="text-gray-900">
                                    {appointment.notes}
                                  </p>
                                </div>
                              )}
                            </div>

                            <div className="ml-4">
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getAppointmentStatusColor(
                                  appointment.status
                                )}`}
                              >
                                {getAppointmentStatusText(appointment.status)}
                              </span>
                              {isPast && appointment.status !== "COMPLETED" && (
                                <div className="mt-2">
                                  <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-600">
                                    Đã qua
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Action buttons for pending appointments */}
                          {appointment.status === "PENDING" && !isPast && (
                            <div className="mt-4 pt-4 border-t border-gray-200 flex space-x-3">
                              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                ✏️ Chỉnh sửa
                              </button>
                              <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                                ❌ Hủy lịch
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        )}

        {selectedTab === "book" && (
          <div className="space-y-6">
            {/* Booking Form */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Đặt lịch hẹn tư vấn cho {selectedChild?.full_name}
              </h2>

              <form onSubmit={handleSubmitBooking} className="space-y-6">
                {/* Consultation Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loại tư vấn <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="appointment_type"
                    value={bookingForm.appointment_type}
                    onChange={handleFormChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Chọn loại tư vấn</option>
                    {consultationTypes.map((type) => (
                      <option key={type.type} value={type.type}>
                        {type.type} - {type.fee.toLocaleString("vi-VN")}đ (
                        {type.duration})
                      </option>
                    ))}
                  </select>
                  {bookingForm.appointment_type && (
                    <p className="mt-1 text-sm text-gray-600">
                      {
                        getConsultationTypeInfo(bookingForm.appointment_type)
                          ?.description
                      }
                    </p>
                  )}
                </div>

                {/* Doctor Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chọn bác sĩ <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="doctor_id"
                    value={bookingForm.doctor_id}
                    onChange={handleFormChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Chọn bác sĩ</option>
                    {getAvailableDoctorsForType(
                      bookingForm.appointment_type
                    ).map((doctor) => (
                      <option key={doctor.user_id} value={doctor.user_id}>
                        {doctor.full_name} - {doctor.specialization} (
                        {doctor.experience})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ngày hẹn <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="appointment_date"
                      value={bookingForm.appointment_date}
                      onChange={handleFormChange}
                      min={getMinDate()}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Giờ hẹn <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="appointment_time"
                      value={bookingForm.appointment_time}
                      onChange={handleFormChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Chọn giờ</option>
                      {availableTimeSlots.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Reason */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lý do khám <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="reason"
                    value={bookingForm.reason}
                    onChange={handleFormChange}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Mô tả chi tiết lý do cần tư vấn..."
                    required
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ghi chú thêm
                  </label>
                  <textarea
                    name="notes"
                    value={bookingForm.notes}
                    onChange={handleFormChange}
                    rows={2}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ghi chú thêm (nếu có)..."
                  />
                </div>

                {/* Submit Buttons */}
                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    📅 Đặt lịch hẹn
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedTab("appointments")}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>

            {/* Available Doctors Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Bác sĩ tư vấn
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableDoctors.map((doctor) => (
                  <div
                    key={doctor.user_id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="text-2xl">{doctor.avatar}</span>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {doctor.full_name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {doctor.specialization}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {doctor.experience}
                    </p>
                    <div className="text-sm text-gray-600">
                      <p className="mb-1">📞 {doctor.phone}</p>
                      <p className="mb-2">✉️ {doctor.email}</p>
                      <p className="text-xs">
                        <strong>Ngày làm việc:</strong>{" "}
                        {doctor.available_days.join(", ")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentPage;
