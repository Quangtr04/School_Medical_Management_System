import React, { useState } from "react";
import {
  FaArrowLeft,
  FaUser,
  FaEdit,
  FaEye,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaBirthdayCake,
} from "react-icons/fa";
import { parentData } from "../data/parentData";

const ProfilePage = () => {
  const [selectedChildIndex, setSelectedChildIndex] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [editedData, setEditedData] = useState({});

  const { parent, children } = parentData;
  const currentChild = children[selectedChildIndex];

  const handleEdit = () => {
    setEditMode(true);
    setEditedData({
      parent_phone: parent.phone,
      parent_email: parent.email,
      parent_address: parent.address,
      child_address: currentChild.address,
    });
  };

  const handleSave = () => {
    // Here you would typically send to API
    console.log("Profile updated:", editedData);
    alert("Cập nhật thông tin thành công!");
    setEditMode(false);
  };

  const handleCancel = () => {
    setEditMode(false);
    setEditedData({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedData((prev) => ({ ...prev, [name]: value }));
  };

  const goBack = () => {
    window.history.back();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age;
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
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <FaArrowLeft />
                  <span>Quay lại</span>
                </button>
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <FaUser className="text-blue-600" />
                </div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Hồ sơ gia đình
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                {!editMode ? (
                  <button
                    onClick={handleEdit}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    <FaEdit />
                    <span>Chỉnh sửa</span>
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSave}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                    >
                      Lưu
                    </button>
                    <button
                      onClick={handleCancel}
                      className="bg-gray-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors"
                    >
                      Hủy
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Parent Profile */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaUser className="text-blue-600 text-3xl" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {parent.full_name}
                </h2>
                <p className="text-gray-600">Phụ huynh</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <FaBirthdayCake className="text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Ngày sinh</p>
                    <p className="font-medium">{formatDate(parent.dob)}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <FaUser className="text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Giới tính</p>
                    <p className="font-medium">{parent.gender}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <FaPhone className="text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Số điện thoại</p>
                    {editMode ? (
                      <input
                        type="tel"
                        name="parent_phone"
                        value={editedData.parent_phone || parent.phone}
                        onChange={handleInputChange}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
                      />
                    ) : (
                      <p className="font-medium">{parent.phone}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <FaEnvelope className="text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Email</p>
                    {editMode ? (
                      <input
                        type="email"
                        name="parent_email"
                        value={editedData.parent_email || parent.email}
                        onChange={handleInputChange}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
                      />
                    ) : (
                      <p className="font-medium">{parent.email}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <FaMapMarkerAlt className="text-gray-400 mt-1" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Địa chỉ</p>
                    {editMode ? (
                      <textarea
                        name="parent_address"
                        value={editedData.parent_address || parent.address}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
                      />
                    ) : (
                      <p className="font-medium">{parent.address}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Children Profiles */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Thông tin con em
              </h3>

              {/* Child Selection */}
              <div className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {children.map((child, index) => (
                    <button
                      key={child.student_info_id}
                      onClick={() => setSelectedChildIndex(index)}
                      className={`flex items-center space-x-4 p-4 rounded-lg border transition-colors text-left ${
                        selectedChildIndex === index
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <span className="text-3xl">{child.avatar}</span>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {child.full_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {child.class_name}
                        </div>
                        <div className="text-xs text-gray-400">
                          Mã HS: {child.student_code}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Child Details */}
              <div className="border-t pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 border-b pb-2">
                      Thông tin cơ bản
                    </h4>

                    <div>
                      <p className="text-sm text-gray-600">Họ và tên</p>
                      <p className="font-medium">{currentChild.full_name}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">Mã học sinh</p>
                      <p className="font-medium">{currentChild.student_code}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">Ngày sinh</p>
                      <p className="font-medium">
                        {formatDate(currentChild.dob)} (
                        {calculateAge(currentChild.dob)} tuổi)
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">Giới tính</p>
                      <p className="font-medium">{currentChild.gender}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">Lớp</p>
                      <p className="font-medium">{currentChild.class_name}</p>
                    </div>
                  </div>

                  {/* Health Info */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 border-b pb-2">
                      Thông tin sức khỏe
                    </h4>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Chiều cao</p>
                        <p className="font-medium">
                          {currentChild.health_record.height} cm
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Cân nặng</p>
                        <p className="font-medium">
                          {currentChild.health_record.weight} kg
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">Nhóm máu</p>
                      <p className="font-medium">
                        {currentChild.health_record.blood_type}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">
                        Tình trạng sức khỏe
                      </p>
                      <p className="font-medium">
                        {currentChild.health_record.health_status}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Thị lực</p>
                        <p className="font-medium">
                          {currentChild.health_record.vision_left}/
                          {currentChild.health_record.vision_right}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Thính lực</p>
                        <p className="font-medium">
                          {currentChild.health_record.hearing_left}
                        </p>
                      </div>
                    </div>

                    {currentChild.health_record.allergy && (
                      <div>
                        <p className="text-sm text-gray-600">Dị ứng</p>
                        <p className="font-medium text-red-600">
                          {currentChild.health_record.allergy}
                        </p>
                      </div>
                    )}

                    {currentChild.health_record.chronic_disease && (
                      <div>
                        <p className="text-sm text-gray-600">Bệnh mãn tính</p>
                        <p className="font-medium text-orange-600">
                          {currentChild.health_record.chronic_disease}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Address */}
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-medium text-gray-900 mb-3">Địa chỉ</h4>
                  {editMode ? (
                    <textarea
                      name="child_address"
                      value={editedData.child_address || currentChild.address}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-3"
                    />
                  ) : (
                    <p className="text-gray-700">{currentChild.address}</p>
                  )}
                </div>

                {/* Account Info */}
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-medium text-gray-900 mb-3">
                    Thông tin tài khoản
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">
                        Ngày tạo tài khoản
                      </p>
                      <p className="font-medium">
                        {formatDate(parent.created_at)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Cập nhật lần cuối</p>
                      <p className="font-medium">
                        {formatDate(parent.updated_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Hoạt động gần đây
          </h3>
          <div className="space-y-4">
            {currentChild.medication_requests?.slice(0, 3).map((request) => (
              <div
                key={request.request_id}
                className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <FaCalendarAlt className="text-blue-600 text-sm" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    Yêu cầu gửi thuốc: {request.medicine_name}
                  </p>
                  <p className="text-sm text-gray-600">
                    Trạng thái: {request.status} -{" "}
                    {formatDate(request.request_date)}
                  </p>
                </div>
              </div>
            ))}

            {currentChild.checkup_results?.slice(0, 2).map((result) => (
              <div
                key={result.result_id}
                className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
              >
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <FaEye className="text-green-600 text-sm" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Khám sức khỏe</p>
                  <p className="text-sm text-gray-600">
                    Kết quả: {result.notes} - {formatDate(result.checked_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
