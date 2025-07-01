import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import moment from "moment";

// Create a new instance of axios
const api = axios.create({
  baseURL: "",
  timeout: 10000,
});

// Create a mock instance
const mock = new MockAdapter(api, { delayResponse: 1000 });

console.log("Mock API initialized for development");

// Mock data
const children = [
  {
    id: 1,
    name: "Nguyễn Văn An",
    age: 8,
    class: "3A",
    school: "Trường Tiểu học ABC",
    dateOfBirth: "2015-05-10",
    height: 130,
    weight: 28,
    bloodType: "A",
    healthStatus: "Khỏe mạnh",
    allergies: ["Đậu phộng", "Tôm"],
    lastCheckup: "2023-11-15",
    avatar: null,
  },
  {
    id: 2,
    name: "Nguyễn Thị Bình",
    age: 6,
    class: "1B",
    school: "Trường Tiểu học ABC",
    dateOfBirth: "2017-08-22",
    height: 115,
    weight: 20,
    bloodType: "O",
    healthStatus: "Cần theo dõi",
    allergies: ["Sữa"],
    lastCheckup: "2023-12-01",
    avatar: null,
  },
];

const parentProfile = {
  id: 1,
  name: "Nguyễn Văn Minh",
  email: "nguyenvanminh@example.com",
  phone: "0987654321",
  address: "123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh",
  avatar: null,
};

const healthDeclarations = {
  1: {
    studentId: 1,
    temperature: 36.5,
    symptoms: [],
    recentContact: false,
    travelHistory: false,
    lastUpdated: "2023-12-15",
  },
  2: {
    studentId: 2,
    temperature: 36.8,
    symptoms: ["Ho nhẹ"],
    recentContact: false,
    travelHistory: false,
    lastUpdated: "2023-12-14",
  },
};

const checkups = {
  approved: [
    {
      id: 1,
      studentId: 1,
      date: "2023-11-15",
      type: "Khám định kỳ",
      doctor: "Bác sĩ Nguyễn Văn A",
      result: "Sức khỏe tốt",
      details: "Học sinh phát triển bình thường",
      status: "approved",
    },
    {
      id: 2,
      studentId: 2,
      date: "2023-12-01",
      type: "Khám bệnh",
      doctor: "Bác sĩ Trần Thị B",
      result: "Cần theo dõi",
      details: "Học sinh có dấu hiệu viêm họng nhẹ",
      status: "approved",
    },
  ],
  pending: [
    {
      id: 3,
      studentId: 1,
      date: "2023-12-20",
      type: "Khám răng",
      doctor: "Bác sĩ Lê Văn C",
      status: "pending",
    },
  ],
};

const incidents = [
  {
    id: 1,
    studentId: 1,
    date: "2023-11-10",
    time: "10:30",
    type: "Tai nạn nhẹ",
    description: "Té ngã trong giờ ra chơi",
    treatment: "Sơ cứu, băng bó vết thương nhỏ",
    severity: "Nhẹ",
    status: "resolved",
    location: "Sân trường",
    reportedBy: "Giáo viên Nguyễn Thị Lan",
    nurseNotes: "Vết thương nhẹ ở đầu gối, đã làm sạch và băng bó",
    followUpRequired: false,
    images: [],
  },
  {
    id: 2,
    studentId: 2,
    date: "2023-12-05",
    time: "13:45",
    type: "Sốt",
    description: "Sốt nhẹ 37.8°C trong giờ học",
    treatment: "Cho uống thuốc hạ sốt, nghỉ ngơi tại phòng y tế",
    severity: "Trung bình",
    status: "resolved",
    location: "Lớp học",
    reportedBy: "Giáo viên Trần Văn Minh",
    nurseNotes: "Đã cho uống paracetamol, thông báo cho phụ huynh",
    followUpRequired: true,
    followUpDate: "2023-12-06",
    images: [],
  },
  {
    id: 3,
    studentId: 1,
    date: "2023-12-12",
    time: "09:15",
    type: "Dị ứng",
    description: "Phát ban nhẹ sau khi ăn bữa trưa",
    treatment: "Cho uống thuốc kháng histamine, theo dõi",
    severity: "Trung bình",
    status: "resolved",
    location: "Căn tin",
    reportedBy: "Y tá Lê Thị Hoa",
    nurseNotes: "Nghi ngờ dị ứng thực phẩm, đã liên hệ phụ huynh",
    followUpRequired: false,
    images: [],
  },
  {
    id: 4,
    studentId: 1,
    date: "2024-01-05",
    time: "11:20",
    type: "Đau đầu",
    description: "Đau đầu và chóng mặt trong giờ thể dục",
    treatment: "Nghỉ ngơi, uống nước, theo dõi",
    severity: "Nhẹ",
    status: "ongoing",
    location: "Sân thể dục",
    reportedBy: "Giáo viên Phạm Văn Tuấn",
    nurseNotes: "Có thể do mệt mỏi hoặc thiếu nước, đã cho nghỉ ngơi",
    followUpRequired: true,
    followUpDate: "2024-01-06",
    images: [],
  },
];

// Enhanced vaccination data
const vaccineCampaigns = {
  all: [
    {
      id: 1,
      name: "Chiến dịch tiêm vắc xin phòng cúm",
      description: "Tiêm vắc xin phòng cúm mùa cho học sinh",
      startDate: "2023-12-25",
      endDate: "2023-12-30",
      status: "upcoming",
      location: "Trạm y tế trường học",
      vaccineType: "Vắc xin phòng cúm mùa",
      manufacturer: "GlaxoSmithKline",
      batchNumber: "FLU-2023-001",
      dosage: "0.5ml",
      targetGroups: "Học sinh từ 6-12 tuổi",
      sideEffects: "Có thể gây sốt nhẹ, đau tại chỗ tiêm trong 1-2 ngày",
      contraindications:
        "Học sinh đang bị sốt hoặc có tiền sử dị ứng nặng với vắc xin",
      notes: "Phụ huynh cần ký giấy đồng ý trước khi tiêm",
      responseDeadline: "2023-12-20",
      studentResponses: {},
    },
    {
      id: 2,
      name: "Chiến dịch tiêm vắc xin MMR",
      description: "Tiêm vắc xin phòng sởi, quai bị, rubella",
      startDate: "2023-11-15",
      endDate: "2023-11-20",
      status: "completed",
      location: "Trạm y tế trường học",
      vaccineType: "Vắc xin MMR",
      manufacturer: "Merck",
      batchNumber: "MMR-2023-002",
      dosage: "0.5ml",
      targetGroups: "Học sinh từ 6-12 tuổi",
      sideEffects: "Có thể gây sốt, phát ban nhẹ sau 7-10 ngày",
      contraindications:
        "Học sinh có hệ miễn dịch suy giảm hoặc đang điều trị corticosteroid",
      notes: "Mũi tiêm thứ 2 trong lịch tiêm chủng",
      responseDeadline: "2023-11-10",
      studentResponses: {
        1: {
          studentId: 1,
          status: "approved",
          responseDate: "2023-11-08",
          actualVaccinationDate: "2023-11-16",
          notes: "Tiêm thành công, không có phản ứng phụ",
          parentNotes: "Con tôi đã từng tiêm mũi 1 và không có vấn đề gì",
        },
      },
    },
    {
      id: 3,
      name: "Chiến dịch tiêm vắc xin HPV",
      description: "Tiêm vắc xin phòng HPV cho học sinh nữ",
      startDate: "2024-01-15",
      endDate: "2024-01-20",
      status: "upcoming",
      location: "Trung tâm y tế quận",
      vaccineType: "Vắc xin HPV",
      manufacturer: "Merck",
      batchNumber: "HPV-2024-001",
      dosage: "0.5ml",
      targetGroups: "Học sinh nữ từ 9-14 tuổi",
      sideEffects: "Có thể gây đau, sưng tại chỗ tiêm",
      contraindications:
        "Học sinh đang mang thai hoặc có tiền sử dị ứng với thành phần vắc xin",
      notes: "Mũi tiêm đầu tiên trong lịch 3 mũi",
      responseDeadline: "2024-01-10",
      studentResponses: {},
    },
    {
      id: 4,
      name: "Chiến dịch tiêm vắc xin viêm gan B",
      description: "Tiêm vắc xin phòng viêm gan B cho học sinh",
      startDate: "2023-10-05",
      endDate: "2023-10-10",
      status: "completed",
      location: "Trạm y tế trường học",
      vaccineType: "Vắc xin viêm gan B",
      manufacturer: "Sanofi Pasteur",
      batchNumber: "HBV-2023-003",
      dosage: "0.5ml",
      targetGroups: "Tất cả học sinh",
      sideEffects: "Có thể gây đau nhẹ tại chỗ tiêm",
      contraindications: "Học sinh có tiền sử dị ứng với thành phần vắc xin",
      notes: "Mũi tiêm nhắc lại",
      responseDeadline: "2023-10-01",
      studentResponses: {
        2: {
          studentId: 2,
          status: "declined",
          responseDate: "2023-09-28",
          parentNotes: "Con tôi đã tiêm đủ liều viêm gan B",
        },
      },
    },
  ],
  approved: [
    {
      id: 2,
      name: "Chiến dịch tiêm vắc xin MMR",
      description: "Tiêm vắc xin phòng sởi, quai bị, rubella",
      startDate: "2023-11-15",
      endDate: "2023-11-20",
      status: "completed",
      responseStatus: "approved",
      location: "Trạm y tế trường học",
      vaccineType: "Vắc xin MMR",
      manufacturer: "Merck",
      batchNumber: "MMR-2023-002",
      studentId: 1,
      actualVaccinationDate: "2023-11-16",
      notes: "Tiêm thành công, không có phản ứng phụ",
      parentNotes: "Con tôi đã từng tiêm mũi 1 và không có vấn đề gì",
    },
  ],
  declined: [
    {
      id: 4,
      name: "Chiến dịch tiêm vắc xin viêm gan B",
      description: "Tiêm vắc xin phòng viêm gan B cho học sinh",
      startDate: "2023-10-05",
      endDate: "2023-10-10",
      status: "completed",
      responseStatus: "declined",
      location: "Trạm y tế trường học",
      vaccineType: "Vắc xin viêm gan B",
      manufacturer: "Sanofi Pasteur",
      batchNumber: "HBV-2023-003",
      studentId: 2,
      parentNotes: "Con tôi đã tiêm đủ liều viêm gan B",
    },
  ],
  studentVaccinations: [
    {
      id: 1,
      studentId: 1,
      vaccineName: "Vắc xin MMR",
      vaccineType: "Phòng sởi, quai bị, rubella",
      campaignId: 2,
      scheduledDate: "2023-11-15",
      actualDate: "2023-11-16",
      location: "Trạm y tế trường học",
      status: "completed",
      notes: "Tiêm thành công, không có phản ứng phụ",
      nextDoseDate: "2024-11-15",
    },
    {
      id: 2,
      studentId: 1,
      vaccineName: "Vắc xin phòng cúm",
      vaccineType: "Phòng cúm mùa",
      campaignId: 1,
      scheduledDate: "2023-12-25",
      actualDate: null,
      location: "Trạm y tế trường học",
      status: "upcoming",
      notes: "Cần có sự đồng ý của phụ huynh",
      nextDoseDate: null,
    },
    {
      id: 3,
      studentId: 2,
      vaccineName: "Vắc xin viêm gan B",
      vaccineType: "Phòng viêm gan B",
      campaignId: null,
      scheduledDate: "2023-08-10",
      actualDate: "2023-08-10",
      location: "Bệnh viện Nhi",
      status: "completed",
      notes: "Tiêm thành công, không có phản ứng phụ",
      nextDoseDate: null,
    },
    {
      id: 4,
      studentId: 2,
      vaccineName: "Vắc xin HPV",
      vaccineType: "Phòng HPV",
      campaignId: 3,
      scheduledDate: "2024-01-15",
      actualDate: null,
      location: "Trung tâm y tế quận",
      status: "upcoming",
      notes: "Mũi tiêm đầu tiên trong lịch 3 mũi",
      nextDoseDate: "2024-07-15",
    },
  ],
};

const notifications = [
  {
    id: 1,
    userId: 1,
    title: "Lịch khám sức khỏe định kỳ",
    content:
      "Nhà trường sẽ tổ chức khám sức khỏe định kỳ cho học sinh vào ngày 20/12/2023",
    date: "2023-12-10",
    type: "info",
    isRead: false,
  },
  {
    id: 2,
    userId: 1,
    title: "Thông báo về chiến dịch tiêm vắc xin",
    content: "Vui lòng xác nhận đồng ý cho con tham gia tiêm vắc xin phòng cúm",
    date: "2023-12-12",
    type: "warning",
    isRead: false,
  },
];

// Mock users for login
const users = [
  {
    id: 1,
    username: "admin@example.com",
    password: "admin123",
    name: "Admin User",
    role_id: 1, // Admin
    email: "admin@example.com",
  },
  {
    id: 2,
    username: "manager@example.com",
    password: "manager123",
    name: "Manager User",
    role_id: 2, // Manager
    email: "manager@example.com",
  },
  {
    id: 3,
    username: "nurse@example.com",
    password: "nurse123",
    name: "Nurse User",
    role_id: 3, // Nurse
    email: "nurse@example.com",
  },
  {
    id: 4,
    username: "parent@example.com",
    password: "parent123",
    name: "Nguyễn Văn Minh",
    role_id: 4, // Parent
    email: "parent@example.com",
  },
];

// Mock login API
mock.onPost("/login").reply((config) => {
  const { username, password } = JSON.parse(config.data);
  console.log(`Login attempt with username: ${username}`);

  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (user) {
    // Create a copy without the password
    const { password, ...userWithoutPassword } = user;

    // Log để debug
    console.log("Mock login successful for:", userWithoutPassword);

    // Nếu là phụ huynh, thêm thông tin profile
    if (user.role_id === 4) {
      return [
        200,
        {
          token: "mock-jwt-token-" + user.id,
          user: {
            ...userWithoutPassword,
            profile: parentProfile,
          },
        },
      ];
    }

    return [
      200,
      {
        token: "mock-jwt-token-" + user.id,
        user: userWithoutPassword,
      },
    ];
  }

  console.log("Login failed: Invalid credentials");
  return [401, { message: "Tên đăng nhập hoặc mật khẩu không chính xác" }];
});

// Mock API endpoints

// Student Information
mock.onGet("/parent/students").reply(200, children);
mock.onGet(/\/parent\/students\/\d+/).reply((config) => {
  const id = parseInt(config.url.split("/").pop());
  const child = children.find((c) => c.id === id);
  return child
    ? [200, child]
    : [404, { message: "Không tìm thấy thông tin học sinh" }];
});

mock.onGet(/\/parent\/profile\/\d+/).reply((config) => {
  const id = parseInt(config.url.split("/").pop());
  return id === parentProfile.id
    ? [200, parentProfile]
    : [404, { message: "Không tìm thấy thông tin phụ huynh" }];
});

mock.onPatch(/\/parent\/profile\/\d+/).reply((config) => {
  const id = parseInt(config.url.split("/").pop());
  if (id !== parentProfile.id) {
    return [404, { message: "Không tìm thấy thông tin phụ huynh" }];
  }
  const updatedData = JSON.parse(config.data);
  const updatedProfile = { ...parentProfile, ...updatedData };
  return [200, updatedProfile];
});

// Health Checkups
mock.onGet("/parent/checkups/approved").reply(200, checkups.approved);
mock.onGet("/parent/consents-checkups/approved").reply(200, checkups.approved);
mock.onGet("/parent/consents-checkups/pending").reply(200, checkups.pending);

mock.onGet(/\/parent\/consents-checkups\/\d+/).reply((config) => {
  const id = parseInt(config.url.split("/").pop());
  const checkup = [...checkups.approved, ...checkups.pending].find(
    (c) => c.id === id
  );
  return checkup
    ? [200, checkup]
    : [404, { message: "Không tìm thấy thông tin khám sức khỏe" }];
});

mock.onPost(/\/parent\/consents-checkups\/\d+\/respond/).reply((config) => {
  const id = parseInt(config.url.split("/").pop());
  const response = JSON.parse(config.data);
  return [200, { message: "Đã phản hồi thành công" }];
});

mock.onPatch(/\/parent\/checkups\/\d+\/consent/).reply((config) => {
  const id = parseInt(config.url.split("/").pop());
  const { status } = JSON.parse(config.data);
  return [200, { message: "Đã cập nhật trạng thái đồng ý thành công" }];
});

// Health Declarations
mock.onGet(/\/parent\/students\/\d+\/health-declaration/).reply((config) => {
  const id = parseInt(config.url.split("/").pop());
  const declaration = healthDeclarations[id];
  return declaration
    ? [200, declaration]
    : [404, { message: "Không tìm thấy thông tin khai báo y tế" }];
});

mock.onPatch(/\/parent\/students\/\d+\/health-declaration/).reply((config) => {
  const id = parseInt(config.url.split("/").pop());
  if (!healthDeclarations[id]) {
    return [404, { message: "Không tìm thấy thông tin khai báo y tế" }];
  }
  const updatedData = JSON.parse(config.data);
  const updatedDeclaration = {
    ...healthDeclarations[id],
    ...updatedData,
    lastUpdated: moment().format("YYYY-MM-DD"),
  };
  healthDeclarations[id] = updatedDeclaration;
  return [200, updatedDeclaration];
});

// Medical Incidents
mock.onGet(/\/parent\/incidents\/\d+/).reply((config) => {
  const id = parseInt(config.url.split("/").pop());

  // Kiểm tra xem id có phải là incident_id không
  const specificIncident = incidents.find((inc) => inc.id === id);
  if (specificIncident) {
    return [200, specificIncident];
  }

  // Nếu không phải incident_id, coi như là user_id/student_id
  const userIncidents = incidents.filter((inc) => inc.studentId === id);
  return [200, userIncidents];
});

// Medical Submissions
mock.onPost("/parent/medical-submissions").reply((config) => {
  const requestData = JSON.parse(config.data);
  return [
    200,
    {
      id: Date.now(),
      ...requestData,
      status: "pending",
      requestDate: moment().format("YYYY-MM-DD"),
    },
  ];
});

// Vaccinations
mock.onGet("/parent/vaccine-campaigns").reply(200, vaccineCampaigns.all);
mock
  .onGet("/parent/vaccine-campaigns/approved")
  .reply(200, vaccineCampaigns.approved);
mock
  .onGet("/parent/vaccine-campaigns/declined")
  .reply(200, vaccineCampaigns.declined);

mock.onGet(/\/parent\/vaccine-campaigns\/\d+/).reply((config) => {
  const id = parseInt(config.url.split("/").pop());
  const campaign = vaccineCampaigns.all.find((c) => c.id === id);
  return campaign
    ? [200, campaign]
    : [404, { message: "Không tìm thấy thông tin chiến dịch tiêm chủng" }];
});

// Get student vaccinations
mock.onGet(/\/parent\/students\/\d+\/vaccinations/).reply((config) => {
  const studentId = parseInt(config.url.split("/").pop());
  const studentVaccinations = vaccineCampaigns.studentVaccinations.filter(
    (v) => v.studentId === studentId
  );
  return [200, studentVaccinations];
});

// Respond to vaccination campaign
mock.onPost(/\/parent\/vaccine-campaigns\/\d+\/respond/).reply((config) => {
  const campaignId = parseInt(config.url.split("/").pop());
  const { status, studentId, notes } = JSON.parse(config.data);

  // Find the campaign
  const campaignIndex = vaccineCampaigns.all.findIndex(
    (c) => c.id === campaignId
  );

  if (campaignIndex === -1) {
    return [404, { message: "Không tìm thấy chiến dịch tiêm chủng" }];
  }

  // Update the campaign's student responses
  const campaign = vaccineCampaigns.all[campaignIndex];

  // Add response to campaign
  campaign.studentResponses[studentId] = {
    studentId: parseInt(studentId),
    status,
    responseDate: moment().format("YYYY-MM-DD"),
    parentNotes: notes || "",
  };

  // Update the approved or declined lists
  if (status === "approved") {
    const approvedCampaign = {
      ...campaign,
      responseStatus: "approved",
      studentId: parseInt(studentId),
    };

    // Check if already in approved list
    const existingIndex = vaccineCampaigns.approved.findIndex(
      (c) => c.id === campaignId && c.studentId === parseInt(studentId)
    );
    if (existingIndex === -1) {
      vaccineCampaigns.approved.push(approvedCampaign);
    } else {
      vaccineCampaigns.approved[existingIndex] = approvedCampaign;
    }

    // Remove from declined if exists
    const declinedIndex = vaccineCampaigns.declined.findIndex(
      (c) => c.id === campaignId && c.studentId === parseInt(studentId)
    );
    if (declinedIndex !== -1) {
      vaccineCampaigns.declined.splice(declinedIndex, 1);
    }
  } else if (status === "declined") {
    const declinedCampaign = {
      ...campaign,
      responseStatus: "declined",
      studentId: parseInt(studentId),
      parentNotes: notes || "",
    };

    // Check if already in declined list
    const existingIndex = vaccineCampaigns.declined.findIndex(
      (c) => c.id === campaignId && c.studentId === parseInt(studentId)
    );
    if (existingIndex === -1) {
      vaccineCampaigns.declined.push(declinedCampaign);
    } else {
      vaccineCampaigns.declined[existingIndex] = declinedCampaign;
    }

    // Remove from approved if exists
    const approvedIndex = vaccineCampaigns.approved.findIndex(
      (c) => c.id === campaignId && c.studentId === parseInt(studentId)
    );
    if (approvedIndex !== -1) {
      vaccineCampaigns.approved.splice(approvedIndex, 1);
    }
  }

  return [
    200,
    {
      message: "Đã phản hồi thành công",
      campaign: campaign,
      studentResponse: campaign.studentResponses[studentId],
    },
  ];
});

// Update vaccination status
mock.onPatch(/\/parent\/vaccine-campaigns\/\d+\/status/).reply((config) => {
  const id = parseInt(config.url.split("/").pop());
  const { status, studentId } = JSON.parse(config.data);

  // Find the campaign
  const campaignIndex = vaccineCampaigns.all.findIndex((c) => c.id === id);

  if (campaignIndex === -1) {
    return [404, { message: "Không tìm thấy chiến dịch tiêm chủng" }];
  }

  // Update student vaccination record if needed
  const studentVaccinationIndex =
    vaccineCampaigns.studentVaccinations.findIndex(
      (v) => v.campaignId === id && v.studentId === parseInt(studentId)
    );

  if (studentVaccinationIndex !== -1) {
    vaccineCampaigns.studentVaccinations[studentVaccinationIndex].status =
      status === "approved" ? "upcoming" : "cancelled";
  }

  return [
    200,
    {
      message: "Đã cập nhật trạng thái thành công",
      updatedVaccination:
        studentVaccinationIndex !== -1
          ? vaccineCampaigns.studentVaccinations[studentVaccinationIndex]
          : null,
    },
  ];
});

// Notifications
mock.onGet("/parent/notifications").reply(200, notifications);

// Thêm dữ liệu mẫu cho lịch khám sức khỏe
const healthCheckups = {
  approved: [
    {
      id: 1,
      studentId: 1,
      date: "2023-11-15",
      time: "08:30",
      type: "Khám định kỳ",
      doctor: "Bác sĩ Nguyễn Văn A",
      result: "Sức khỏe tốt",
      details: "Học sinh phát triển bình thường",
      status: "approved",
      location: "Phòng y tế trường học",
      height: 130,
      weight: 28,
      bmi: 16.6,
      bloodPressure: "110/70",
      vision: "10/10",
      hearing: "Bình thường",
      dental: "Cần điều trị sâu răng nhẹ",
      recommendations: "Tiếp tục tập thể dục đều đặn",
    },
    {
      id: 2,
      studentId: 2,
      date: "2023-12-01",
      time: "09:45",
      type: "Khám bệnh",
      doctor: "Bác sĩ Trần Thị B",
      result: "Cần theo dõi",
      details: "Học sinh có dấu hiệu viêm họng nhẹ",
      status: "approved",
      location: "Phòng y tế trường học",
      prescription: "Kháng sinh amoxicillin 250mg, 2 lần/ngày x 5 ngày",
      followUpRequired: true,
      followUpDate: "2023-12-08",
    },
  ],
  pending: [
    {
      id: 3,
      studentId: 1,
      date: "2023-12-20",
      time: "10:00",
      type: "Khám răng",
      doctor: "Bác sĩ Lê Văn C",
      status: "pending",
      location: "Phòng nha khoa trường học",
      description: "Khám răng định kỳ và vệ sinh răng miệng",
      consentRequired: true,
      consentDeadline: "2023-12-18",
    },
    {
      id: 4,
      studentId: 2,
      date: "2024-01-10",
      time: "14:30",
      type: "Khám mắt",
      doctor: "Bác sĩ Phạm Thị D",
      status: "pending",
      location: "Phòng y tế trường học",
      description: "Kiểm tra thị lực và sức khỏe mắt",
      consentRequired: true,
      consentDeadline: "2024-01-05",
    },
  ],
  appointments: [
    {
      id: 5,
      studentId: 1,
      date: "2024-01-15",
      time: "09:30",
      type: "Tư vấn dinh dưỡng",
      doctor: "Chuyên gia Nguyễn Thị E",
      status: "scheduled",
      location: "Phòng tư vấn trường học",
      description: "Tư vấn về chế độ dinh dưỡng cho học sinh",
      requestedBy: "Phụ huynh",
      requestDate: "2024-01-05",
    },
    {
      id: 6,
      studentId: 2,
      date: "2024-01-20",
      time: "13:30",
      type: "Khám tổng quát",
      doctor: "Bác sĩ Trần Văn F",
      status: "scheduled",
      location: "Phòng y tế trường học",
      description: "Khám sức khỏe tổng quát định kỳ",
      requestedBy: "Phụ huynh",
      requestDate: "2024-01-07",
    },
  ],
  history: [
    {
      id: 7,
      studentId: 1,
      date: "2023-09-10",
      time: "08:00",
      type: "Khám đầu năm học",
      doctor: "Bác sĩ Nguyễn Văn A",
      result: "Sức khỏe tốt",
      details: "Học sinh phát triển bình thường",
      status: "completed",
      location: "Phòng y tế trường học",
      height: 128,
      weight: 26,
      bmi: 15.9,
      bloodPressure: "105/65",
      vision: "10/10",
      hearing: "Bình thường",
      dental: "Bình thường",
      recommendations: "Tiếp tục tập thể dục đều đặn",
    },
    {
      id: 8,
      studentId: 2,
      date: "2023-09-10",
      time: "10:30",
      type: "Khám đầu năm học",
      doctor: "Bác sĩ Nguyễn Văn A",
      result: "Sức khỏe tốt",
      details: "Học sinh phát triển bình thường",
      status: "completed",
      location: "Phòng y tế trường học",
      height: 113,
      weight: 19,
      bmi: 14.9,
      bloodPressure: "100/60",
      vision: "9/10",
      hearing: "Bình thường",
      dental: "Cần chăm sóc răng tốt hơn",
      recommendations: "Tăng cường vận động",
    },
  ],
};

// API endpoints cho lịch khám sức khỏe
mock.onGet("/parent/checkups/approved").reply(200, healthCheckups.approved);

mock
  .onGet("/parent/consents-checkups/approved")
  .reply(200, healthCheckups.approved);

mock
  .onGet("/parent/consents-checkups/pending")
  .reply(200, healthCheckups.pending);

mock.onGet(/\/parent\/consents-checkups\/\d+/).reply((config) => {
  const id = parseInt(config.url.split("/").pop());
  const checkup = [
    ...healthCheckups.approved,
    ...healthCheckups.pending,
    ...healthCheckups.appointments,
    ...healthCheckups.history,
  ].find((c) => c.id === id);
  return checkup
    ? [200, checkup]
    : [404, { message: "Không tìm thấy thông tin khám sức khỏe" }];
});

// API endpoint để phản hồi form đồng ý khám
mock.onPost(/\/parent\/consents-checkups\/\d+\/respond/).reply((config) => {
  const id = parseInt(config.url.split("/").pop());
  const { response, notes } = JSON.parse(config.data);

  // Tìm lịch khám cần phản hồi
  const pendingIndex = healthCheckups.pending.findIndex((c) => c.id === id);

  if (pendingIndex === -1) {
    return [404, { message: "Không tìm thấy lịch khám cần phản hồi" }];
  }

  const checkup = healthCheckups.pending[pendingIndex];

  // Cập nhật trạng thái dựa trên phản hồi
  if (response === "approve") {
    // Chuyển từ pending sang approved
    checkup.status = "approved";
    checkup.parentNotes = notes || "";
    healthCheckups.approved.push(checkup);
    healthCheckups.pending.splice(pendingIndex, 1);
  } else if (response === "reject") {
    // Đánh dấu là bị từ chối
    checkup.status = "rejected";
    checkup.parentNotes = notes || "";
    healthCheckups.pending.splice(pendingIndex, 1);
  }

  return [
    200,
    {
      message: "Đã phản hồi thành công",
      checkup: checkup,
    },
  ];
});

// API endpoint để cập nhật trạng thái đồng ý
mock.onPatch(/\/parent\/checkups\/\d+\/consent/).reply((config) => {
  const id = parseInt(config.url.split("/").pop());
  const { status, notes } = JSON.parse(config.data);

  // Tìm lịch khám cần cập nhật
  let checkup = null;
  let sourceArray = null;
  let index = -1;

  // Tìm trong các mảng
  const arrays = [
    healthCheckups.approved,
    healthCheckups.pending,
    healthCheckups.appointments,
    healthCheckups.history,
  ];

  for (const arr of arrays) {
    index = arr.findIndex((c) => c.id === id);
    if (index !== -1) {
      checkup = arr[index];
      sourceArray = arr;
      break;
    }
  }

  if (!checkup) {
    return [404, { message: "Không tìm thấy lịch khám" }];
  }

  // Cập nhật trạng thái
  checkup.consentStatus = status;
  checkup.parentNotes = notes || checkup.parentNotes;

  return [
    200,
    {
      message: "Đã cập nhật trạng thái đồng ý thành công",
      checkup: checkup,
    },
  ];
});

// API endpoint để đặt lịch khám mới
mock.onPost("/parent/checkups/request").reply((config) => {
  const requestData = JSON.parse(config.data);

  // Tạo lịch khám mới
  const newAppointment = {
    id: Date.now(),
    ...requestData,
    status: "requested",
    requestedBy: "Phụ huynh",
    requestDate: moment().format("YYYY-MM-DD"),
  };

  // Thêm vào danh sách lịch hẹn
  healthCheckups.appointments.push(newAppointment);

  return [
    200,
    {
      message: "Đã đặt lịch khám thành công",
      appointment: newAppointment,
    },
  ];
});

// API endpoint để lấy lịch sử khám
mock.onGet(/\/parent\/students\/\d+\/checkup-history/).reply((config) => {
  const studentId = parseInt(config.url.split("/").pop());

  // Lọc lịch sử khám theo student_id
  const history = healthCheckups.history.filter(
    (h) => h.studentId === studentId
  );

  return [200, history];
});

// API endpoint để lấy lịch hẹn khám
mock.onGet(/\/parent\/students\/\d+\/appointments/).reply((config) => {
  const studentId = parseInt(config.url.split("/").pop());

  // Lọc lịch hẹn khám theo student_id
  const appointments = healthCheckups.appointments.filter(
    (a) => a.studentId === studentId
  );

  return [200, appointments];
});

export default api;
