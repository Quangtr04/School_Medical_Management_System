import React, { useState } from "react";
import {
  FaArrowLeft,
  FaPills,
  FaUpload,
  FaCalendarAlt,
  FaUser,
} from "react-icons/fa";
import { parentData } from "../data/parentData";

const MedicationRequestPage = () => {
  const [selectedChildIndex, setSelectedChildIndex] = useState(0);
  const [formData, setFormData] = useState({
    medicine_name: "",
    dosage: "",
    quantity: "",
    usage_note: "",
    appointment_date: "",
    note: "",
    prescription_file: null,
  });

  const { parent, children } = parentData;
  const currentChild = children[selectedChildIndex];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      prescription_file: e.target.files[0],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.medicine_name || !formData.dosage || !formData.quantity) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }

    // Create medication request object
    const medicationRequest = {
      student_info_id: currentChild.student_info_id,
      parent_id: parent.user_id,
      medicine_name: formData.medicine_name,
      dosage: formData.dosage,
      quantity: parseInt(formData.quantity),
      usage_note: formData.usage_note,
      appointment_date: formData.appointment_date
        ? new Date(formData.appointment_date).toISOString()
        : null,
      note: formData.note,
      prescription_file: formData.prescription_file,
      status: "PENDING",
      request_date: new Date().toISOString(),
      submitted_by: parent.user_id,
    };

    // Here you would typically send to API
    console.log("Medication request submitted:", medicationRequest);

    // Show success message
    alert(
      `Yêu cầu gửi thuốc "${formData.medicine_name}" cho ${currentChild.full_name} đã được gửi thành công!\n\nYêu cầu sẽ được y tế trường xem xét và phê duyệt.`
    );

    // Reset form
    setFormData({
      medicine_name: "",
      dosage: "",
      quantity: "",
      usage_note: "",
      appointment_date: "",
      note: "",
      prescription_file: null,
    });
  };

  const goBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={goBack}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                >
                  <FaArrowLeft />
                  <span>Quay lại</span>
                </button>
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <FaPills className="text-blue-600" />
                </div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Gửi thuốc cho trường
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  Xin chào, {parent.full_name}
                </div>
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <FaUser className="text-gray-600 text-sm" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          {/* Child Selection */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Chọn con cần gửi thuốc
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {children.map((child, index) => (
                <button
                  key={child.student_info_id}
                  onClick={() => setSelectedChildIndex(index)}
                  className={`flex items-center space-x-4 p-4 rounded-lg border transition-colors ${
                    selectedChildIndex === index
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <span className="text-3xl">{child.avatar}</span>
                  <div className="text-left flex-1">
                    <div className="font-medium text-gray-900">
                      {child.full_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {child.age} - {child.class_name}
                    </div>
                    <div className="text-xs text-gray-400">
                      Mã HS: {child.student_code}
                    </div>
                  </div>
                  {selectedChildIndex === index && (
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Medication Request Form */}
          <div className="border-t pt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Thông tin thuốc gửi cho {currentChild.full_name}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Medicine Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="medicine_name"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Tên thuốc <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="medicine_name"
                    id="medicine_name"
                    required
                    value={formData.medicine_name}
                    onChange={handleInputChange}
                    placeholder="Ví dụ: Vitamin C, Paracetamol..."
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-3"
                  />
                </div>

                <div>
                  <label
                    htmlFor="quantity"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Số lượng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    id="quantity"
                    required
                    min="1"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    placeholder="Số viên/gói/chai..."
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-3"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="dosage"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Liều dùng <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="dosage"
                  id="dosage"
                  required
                  value={formData.dosage}
                  onChange={handleInputChange}
                  placeholder="Ví dụ: 1 viên/ngày sau bữa trưa, 5ml x 2 lần/ngày..."
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-3"
                />
              </div>

              <div>
                <label
                  htmlFor="usage_note"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Mục đích sử dụng
                </label>
                <textarea
                  name="usage_note"
                  id="usage_note"
                  rows="3"
                  value={formData.usage_note}
                  onChange={handleInputChange}
                  placeholder="Ví dụ: Bổ sung vitamin, điều trị cảm lạnh, dị ứng khẩn cấp..."
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-3"
                />
              </div>

              {/* Schedule */}
              <div>
                <label
                  htmlFor="appointment_date"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Ngày bắt đầu cho thuốc (tùy chọn)
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="appointment_date"
                    id="appointment_date"
                    value={formData.appointment_date}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split("T")[0]}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-3"
                  />
                  <FaCalendarAlt className="absolute right-3 top-3 text-gray-400" />
                </div>
              </div>

              {/* Prescription Upload */}
              <div>
                <label
                  htmlFor="prescription_file"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Đơn thuốc/Hướng dẫn của bác sĩ (tùy chọn)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <FaUpload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <div className="text-sm text-gray-600 mb-2">
                    Tải lên hình ảnh đơn thuốc hoặc hướng dẫn của bác sĩ
                  </div>
                  <input
                    type="file"
                    name="prescription_file"
                    id="prescription_file"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {formData.prescription_file && (
                    <div className="mt-2 text-sm text-green-600">
                      Đã chọn: {formData.prescription_file.name}
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Notes */}
              <div>
                <label
                  htmlFor="note"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Ghi chú thêm
                </label>
                <textarea
                  name="note"
                  id="note"
                  rows="4"
                  value={formData.note}
                  onChange={handleInputChange}
                  placeholder="Thông tin thêm về thuốc, tình trạng sức khỏe của con, yêu cầu đặc biệt..."
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-3"
                />
              </div>

              {/* Important Notice */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <span className="text-amber-400 text-lg">⚠️</span>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-amber-800">
                      Lưu ý quan trọng
                    </h3>
                    <div className="mt-2 text-sm text-amber-700">
                      <ul className="list-disc list-inside space-y-1">
                        <li>
                          Chỉ gửi những loại thuốc an toàn, được bác sĩ chỉ định
                        </li>
                        <li>
                          Ghi rõ tên con, lớp, liều dùng trên bao bì thuốc
                        </li>
                        <li>
                          Thuốc cần trong hạn sử dụng và bảo quản đúng cách
                        </li>
                        <li>
                          Y tế trường sẽ xem xét và có thể từ chối nếu thuốc
                          không phù hợp
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={goBack}
                  className="px-6 py-3 text-sm font-medium rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <FaPills />
                  <span>Gửi yêu cầu</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicationRequestPage;
