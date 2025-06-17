// Data structure matching the new database schema exactly
export const parentData = {
  // Parent information from Users table (role_id: 4 = Parent)
  parent: {
    user_id: 1,
    username: "parent_hoa",
    full_name: "Nguyễn Thị Hoa",
    email: "nguyenthihoa@gmail.com",
    phone: "0987654321",
    dob: "1985-05-15",
    address: "123 Đường ABC, Quận 1, TP.HCM",
    gender: "Nữ",
    role_id: 4, // Parent role
    created_at: "2023-01-01T00:00:00.000Z",
    updated_at: "2023-06-01T00:00:00.000Z",
    is_active: true,
  },

  welcomeMessage: "Chào mừng đến với trang quản lý sức khỏe cho con bạn",

  // Children from Student_Information table
  children: [
    {
      student_info_id: 1,
      student_code: "HS001",
      full_name: "Nguyễn Văn An",
      gender: "Nam",
      dob: "2016-03-15",
      age: "7 tuổi",
      class_name: "Lớp 2A",
      address: "123 Đường ABC, Quận 1, TP.HCM",
      parent_phone: "0987654321",
      created_at: "2023-01-15T00:00:00.000Z",
      updated_at: "2023-06-10T00:00:00.000Z",
      avatar: "👦",

      // Student_Health data
      health_record: {
        health_id: 1,
        student_info_id: 1,
        height: 125.0,
        weight: 28.0,
        blood_type: "O+",
        allergy: "Đậu phộng, tôm cua",
        chronic_disease: null,
        vision_left: 1.0,
        vision_right: 1.0,
        hearing_left: "Bình thường",
        hearing_right: "Bình thường",
        health_status: "Tốt",
        created_at: "2023-01-15T00:00:00.000Z",
        updated_at: "2023-06-10T00:00:00.000Z",
      },

      // Medication_Submission_Request data
      medication_requests: [
        {
          request_id: 1,
          student_info_id: 1,
          medicine_name: "Vitamin tổng hợp",
          dosage: "1 viên/ngày sau bữa trưa",
          quantity: 30,
          usage_note: "Bổ sung vitamin cho trẻ",
          note: "Vitamin tổng hợp cho học sinh",
          status: "APPROVED",
          request_date: "2023-06-01T00:00:00.000Z",
          approval_date: "2023-06-02T00:00:00.000Z",
          delivery_date: "2023-06-15T00:00:00.000Z",
        },
        {
          request_id: 2,
          student_info_id: 1,
          medicine_name: "Thuốc dị ứng",
          dosage: "Khi có dấu hiệu dị ứng",
          quantity: 5,
          usage_note: "Dùng khi có phản ứng dị ứng",
          note: "Thuốc dị ứng khẩn cấp",
          status: "PENDING",
          request_date: "2023-06-05T00:00:00.000Z",
          approval_date: null,
          delivery_date: null,
        },
      ],

      // Vaccination_Campaign data
      vaccination_campaigns: [
        {
          campaign_id: 1,
          campaign_name: "Chiến dịch tiêm vắc-xin MMR",
          description: "Tiêm vắc-xin phòng Sởi, Quai bị, Rubella",
          start_date: "2023-06-01T00:00:00.000Z",
          end_date: "2023-06-30T00:00:00.000Z",
          target_age_group: "6-12 tuổi",
          vaccine_type: "MMR",
          fee: 150000.0,
          status: "ACTIVE",
          created_at: "2023-05-01T00:00:00.000Z",
          updated_at: "2023-05-15T00:00:00.000Z",
        },
      ],

      // Vaccination_Consent_Form data
      vaccination_consent_forms: [
        {
          form_id: 1,
          student_info_id: 1,
          campaign_id: 1,
          status: "PENDING",
          status_fee: "notpaid",
          parent_signature: null,
          consent_date: null,
          notes: "Cần xác nhận từ phụ huynh",
          created_at: "2023-06-01T00:00:00.000Z",
          updated_at: "2023-06-01T00:00:00.000Z",
        },
      ],

      // MedicalCheckup_Schedule data
      checkup_schedules: [
        {
          checkup_id: 1,
          checkup_title: "Khám sức khỏe định kỳ",
          description: "Khám sức khỏe định kỳ học kỳ 2",
          scheduled_date: "2023-06-15T00:00:00.000Z",
          fee: 100000.0,
          location: "Phòng y tế trường",
          checkup_type: "PERIODIC",
          status: "SCHEDULED",
          created_at: "2023-05-01T00:00:00.000Z",
          updated_at: "2023-05-15T00:00:00.000Z",
        },
      ],

      // Checkup_Consent_Form data
      checkup_consent_forms: [
        {
          form_id: 1,
          student_info_id: 1,
          checkup_id: 1,
          status: "APPROVED",
          fee: "paid",
          parent_signature: "Nguyễn Thị Hoa",
          consent_date: "2023-06-01T00:00:00.000Z",
          notes: "Đã xác nhận tham gia",
          created_at: "2023-06-01T00:00:00.000Z",
          updated_at: "2023-06-01T00:00:00.000Z",
        },
      ],

      // Checkup_Result data
      checkup_results: [
        {
          result_id: 1,
          student_info_id: 1,
          checkup_id: 1,
          height: 123.0,
          weight: 27.0,
          vision_left: 1.0,
          vision_right: 1.0,
          hearing_left: "Bình thường",
          hearing_right: "Bình thường",
          blood_pressure: "90/60",
          heart_rate: 85,
          dental_status: "Tốt",
          notes: "Sức khỏe tốt, phát triển bình thường",
          abnormal_signs: null,
          recommendations: "Tiếp tục duy trì chế độ ăn uống và tập luyện",
          checked_by: "BS. Nguyễn Văn A",
          checked_at: "2023-05-15T00:00:00.000Z",
          created_at: "2023-05-15T00:00:00.000Z",
          updated_at: "2023-05-15T00:00:00.000Z",
        },
      ], // Medical_incident data (if any)
      medical_incidents: [],

      // Consultation_Appointment data (for appointment booking)
      consultation_appointments: [
        {
          appointment_id: 1,
          student_info_id: 1,
          parent_id: 1,
          doctor_id: 3, // assuming doctor user_id
          appointment_date: "2023-06-20",
          appointment_time: "09:00",
          appointment_type: "Tư vấn sức khỏe tổng quát",
          reason: "Kiểm tra sức khỏe định kỳ và tư vấn dinh dưỡng",
          status: "CONFIRMED",
          notes: "Cần mang theo sổ tiêm chủng",
          created_at: "2023-06-15T00:00:00.000Z",
          updated_at: "2023-06-16T00:00:00.000Z",
        },
        {
          appointment_id: 2,
          student_info_id: 1,
          parent_id: 1,
          doctor_id: 3,
          appointment_date: "2023-07-05",
          appointment_time: "14:30",
          appointment_type: "Tư vấn dinh dưỡng",
          reason: "Tư vấn về chế độ ăn uống phù hợp cho trẻ",
          status: "PENDING",
          notes: "",
          created_at: "2023-06-18T00:00:00.000Z",
          updated_at: "2023-06-18T00:00:00.000Z",
        },
      ],
    },
    {
      student_info_id: 2,
      student_code: "HS002",
      full_name: "Nguyễn Thị Bình",
      gender: "Nữ",
      dob: "2018-08-22",
      age: "5 tuổi",
      class_name: "Lớp Mầm",
      address: "123 Đường ABC, Quận 1, TP.HCM",
      parent_phone: "0987654321",
      created_at: "2023-01-15T00:00:00.000Z",
      updated_at: "2023-06-10T00:00:00.000Z",
      avatar: "👧",

      // Student_Health data
      health_record: {
        health_id: 2,
        student_info_id: 2,
        height: 110.0,
        weight: 20.0,
        blood_type: "A+",
        allergy: null,
        chronic_disease: null,
        vision_left: 0.9,
        vision_right: 0.9,
        hearing_left: "Bình thường",
        hearing_right: "Bình thường",
        health_status: "Tốt",
        created_at: "2023-01-15T00:00:00.000Z",
        updated_at: "2023-06-10T00:00:00.000Z",
      },

      // Medication_Submission_Request data
      medication_requests: [
        {
          request_id: 3,
          student_info_id: 2,
          medicine_name: "Vitamin D",
          dosage: "1 viên/ngày",
          quantity: 30,
          usage_note: "Bổ sung vitamin D",
          note: "Vitamin D cho trẻ",
          status: "APPROVED",
          request_date: "2023-06-03T00:00:00.000Z",
          approval_date: "2023-06-04T00:00:00.000Z",
          delivery_date: "2023-06-18T00:00:00.000Z",
        },
        {
          request_id: 4,
          student_info_id: 2,
          medicine_name: "Canxi",
          dosage: "1 viên/ngày sau bữa tối",
          quantity: 30,
          usage_note: "Bổ sung canxi cho xương",
          note: "Canxi bổ sung",
          status: "IN_REVIEW",
          request_date: "2023-06-08T00:00:00.000Z",
          approval_date: null,
          delivery_date: null,
        },
      ],

      // Vaccination_Campaign data
      vaccination_campaigns: [
        {
          campaign_id: 2,
          campaign_name: "Chiến dịch tiêm vắc-xin HPV",
          description: "Tiêm vắc-xin phòng ung thư cổ tử cung",
          start_date: "2023-08-01T00:00:00.000Z",
          end_date: "2023-08-31T00:00:00.000Z",
          target_age_group: "9-14 tuổi",
          vaccine_type: "HPV",
          fee: 200000.0,
          status: "ACTIVE",
          created_at: "2023-07-01T00:00:00.000Z",
          updated_at: "2023-07-15T00:00:00.000Z",
        },
      ],

      // Vaccination_Consent_Form data
      vaccination_consent_forms: [
        {
          form_id: 2,
          student_info_id: 2,
          campaign_id: 2,
          status: "PENDING",
          status_fee: "notpaid",
          parent_signature: null,
          consent_date: null,
          notes: "Cần đăng ký tham gia",
          created_at: "2023-08-01T00:00:00.000Z",
          updated_at: "2023-08-01T00:00:00.000Z",
        },
      ],

      // MedicalCheckup_Schedule data
      checkup_schedules: [
        {
          checkup_id: 2,
          checkup_title: "Khám mắt định kỳ",
          description: "Khám và đánh giá thị lực",
          scheduled_date: "2023-06-20T00:00:00.000Z",
          fee: 80000.0,
          location: "Phòng khám mắt",
          checkup_type: "SPECIALIZED",
          status: "SCHEDULED",
          created_at: "2023-05-10T00:00:00.000Z",
          updated_at: "2023-05-20T00:00:00.000Z",
        },
      ],

      // Checkup_Consent_Form data
      checkup_consent_forms: [
        {
          form_id: 2,
          student_info_id: 2,
          checkup_id: 2,
          status: "PENDING",
          fee: "notpaid",
          parent_signature: null,
          consent_date: null,
          notes: "Chưa xác nhận tham gia",
          created_at: "2023-05-10T00:00:00.000Z",
          updated_at: "2023-05-10T00:00:00.000Z",
        },
      ],

      // Checkup_Result data
      checkup_results: [
        {
          result_id: 2,
          student_info_id: 2,
          checkup_id: 2,
          height: 109.0,
          weight: 19.5,
          vision_left: 0.9,
          vision_right: 0.9,
          hearing_left: "Bình thường",
          hearing_right: "Bình thường",
          blood_pressure: "85/55",
          heart_rate: 90,
          dental_status: "Tốt",
          notes: "Cần theo dõi thị lực",
          abnormal_signs: "Thị lực hơi giảm",
          recommendations: "Cần khám mắt chuyên khoa, hạn chế màn hình",
          checked_by: "BS. Trần Thị B",
          checked_at: "2023-05-10T00:00:00.000Z",
          created_at: "2023-05-10T00:00:00.000Z",
          updated_at: "2023-05-10T00:00:00.000Z",
        },
      ], // Medical_incident data (if any)
      medical_incidents: [],

      // Consultation_Appointment data (for appointment booking)
      consultation_appointments: [
        {
          appointment_id: 1,
          student_info_id: 1,
          parent_id: 1,
          doctor_id: 3, // assuming doctor user_id
          appointment_date: "2023-06-20",
          appointment_time: "09:00",
          appointment_type: "Tư vấn sức khỏe tổng quát",
          reason: "Kiểm tra sức khỏe định kỳ và tư vấn dinh dưỡng",
          status: "CONFIRMED",
          notes: "Cần mang theo sổ tiêm chủng",
          created_at: "2023-06-15T00:00:00.000Z",
          updated_at: "2023-06-16T00:00:00.000Z",
        },
        {
          appointment_id: 2,
          student_info_id: 1,
          parent_id: 1,
          doctor_id: 3,
          appointment_date: "2023-07-05",
          appointment_time: "14:30",
          appointment_type: "Tư vấn dinh dưỡng",
          reason: "Tư vấn về chế độ ăn uống phù hợp cho trẻ",
          status: "PENDING",
          notes: "",
          created_at: "2023-06-18T00:00:00.000Z",
          updated_at: "2023-06-18T00:00:00.000Z",
        },
      ],
    },
  ],
};

// Available doctors for consultation (from Users table with role_id: 2 = Doctor)
export const availableDoctors = [
  {
    user_id: 3,
    full_name: "BS. Nguyễn Văn An",
    specialization: "Bác sĩ Nhi khoa",
    experience: "8 năm kinh nghiệm",
    phone: "0901234567",
    email: "bs.nguyenvanan@hospital.com",
    avatar: "👨‍⚕️",
    available_days: ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6"],
    consultation_types: [
      "Tư vấn sức khỏe tổng quát",
      "Tư vấn dinh dưỡng",
      "Tư vấn phát triển",
    ],
  },
  {
    user_id: 4,
    full_name: "BS. Trần Thị Bình",
    specialization: "Bác sĩ Dinh dưỡng",
    experience: "6 năm kinh nghiệm",
    phone: "0901234568",
    email: "bs.tranthibinh@hospital.com",
    avatar: "👩‍⚕️",
    available_days: ["Thứ 2", "Thứ 4", "Thứ 6"],
    consultation_types: ["Tư vấn dinh dưỡng", "Tư vấn phát triển"],
  },
  {
    user_id: 5,
    full_name: "BS. Lê Hoàng Minh",
    specialization: "Bác sĩ Nhi khoa",
    experience: "10 năm kinh nghiệm",
    phone: "0901234569",
    email: "bs.lehoangminh@hospital.com",
    avatar: "👨‍⚕️",
    available_days: ["Thứ 3", "Thứ 5", "Thứ 7"],
    consultation_types: [
      "Tư vấn sức khỏe tổng quát",
      "Tư vấn phát triển",
      "Tư vấn đặc biệt",
    ],
  },
];

// Available time slots for appointments
export const availableTimeSlots = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
];

// Consultation types
export const consultationTypes = [
  {
    type: "Tư vấn sức khỏe tổng quát",
    description: "Tư vấn về tình trạng sức khỏe tổng thể của trẻ",
    duration: "30 phút",
    fee: 100000,
  },
  {
    type: "Tư vấn dinh dưỡng",
    description: "Tư vấn về chế độ ăn uống và dinh dưỡng phù hợp",
    duration: "30 phút",
    fee: 120000,
  },
  {
    type: "Tư vấn phát triển",
    description: "Tư vấn về sự phát triển thể chất và tinh thần của trẻ",
    duration: "45 phút",
    fee: 150000,
  },
  {
    type: "Tư vấn đặc biệt",
    description: "Tư vấn về các vấn đề sức khỏe đặc biệt",
    duration: "60 phút",
    fee: 200000,
  },
];

// Helper functions based on database status values
export const getRequestStatusText = (status) => {
  switch (status) {
    case "PENDING":
      return "Chờ duyệt";
    case "APPROVED":
      return "Đã duyệt";
    case "REJECTED":
      return "Từ chối";
    case "IN_REVIEW":
      return "Đang xem xét";
    case "DELIVERED":
      return "Đã giao";
    default:
      return "Không xác định";
  }
};

export const getRequestStatusColor = (status) => {
  switch (status) {
    case "PENDING":
      return "bg-yellow-100 text-yellow-800";
    case "APPROVED":
      return "bg-green-100 text-green-800";
    case "REJECTED":
      return "bg-red-100 text-red-800";
    case "IN_REVIEW":
      return "bg-blue-100 text-blue-800";
    case "DELIVERED":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const getConsentStatusText = (status) => {
  switch (status) {
    case "PENDING":
      return "Chờ xác nhận";
    case "APPROVED":
      return "Đã chấp nhận";
    case "REJECTED":
      return "Đã từ chối";
    default:
      return "Không xác định";
  }
};

export const getFeeStatusText = (status) => {
  switch (status) {
    case "paid":
      return "Đã thanh toán";
    case "notpaid":
      return "Chưa thanh toán";
    default:
      return "Không xác định";
  }
};

export const getNotificationPriorityClass = (priority) => {
  switch (priority) {
    case "high":
      return "bg-red-50 border-red-200";
    case "medium":
      return "bg-blue-50 border-blue-200";
    case "low":
      return "bg-green-50 border-green-200";
    default:
      return "bg-gray-50 border-gray-200";
  }
};

export const getHealthConditionIcon = (status) => {
  switch (status) {
    case "completed":
      return "✅";
    case "warning":
      return "⚠️";
    case "scheduled":
      return "📅";
    default:
      return "📋";
  }
};

// Get appointment status color
export const getAppointmentStatusColor = (status) => {
  switch (status) {
    case "CONFIRMED":
      return "bg-green-100 text-green-800 border-green-300";
    case "PENDING":
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
    case "CANCELLED":
      return "bg-red-100 text-red-800 border-red-300";
    case "COMPLETED":
      return "bg-blue-100 text-blue-800 border-blue-300";
    default:
      return "bg-gray-100 text-gray-800 border-gray-300";
  }
};

// Get appointment status text
export const getAppointmentStatusText = (status) => {
  switch (status) {
    case "CONFIRMED":
      return "Đã xác nhận";
    case "PENDING":
      return "Chờ xác nhận";
    case "CANCELLED":
      return "Đã hủy";
    case "COMPLETED":
      return "Đã hoàn thành";
    default:
      return "Không xác định";
  }
};
