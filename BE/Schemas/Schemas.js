const { type } = require("os");

const Information = {
  role_name: { type: "string", required: true },
  role_id: { type: "int", required: false },
  user_id: { type: "int", required: false },
  fullname: { type: "string", required: true },
  dayofbirth: { type: "date", required: true },
  major: { type: "string", required: false },
  gender: { type: "string", required: true },
  address: { type: "string", required: true },
  email: { type: "email", required: true },
  phone: { type: "string", required: true },
  password: { type: "string", required: true },
  is_active: { type: "boolean", required: true },
};

const Checkup_Result = {
  check_at: { type: "date", required: true },
  height_cm: { type: "int", required: true },
  weight_kg: { type: "float", required: true },
  vision_left: { type: "float", required: true },
  vision_right: { type: "float", required: true },
  hearing_left: { type: "string", required: true },
  hearing_right: { type: "string", required: true },
  blood_pressure: { type: "string", required: true },
  notes: { type: "string", required: false },
  abnormal_signs: { type: "string", required: false },
  needs_counseling: { type: "boolean", required: true },
};

const HealthDeclaration = {
  student_id: { type: "int", required: false },
  height_cm: { type: "int", required: true },
  weight_kg: { type: "int", required: true },
  blood_type: { type: "string", required: true },
  allergy: { type: "string", required: false },
  chronic_disease: { type: "string", required: false },
  vision_left: { type: "string", required: true },
  vision_right: { type: "string", required: true },
  hearing_left: { type: "string", required: true },
  hearing_right: { type: "string", required: true },
  health_status: {
    type: "string",
    enum: ["Khỏe mạnh", "Nghiêm trọng", "Cần theo dõi"],
    required: true,
  },
};

const StudentInformation = {
  student_id: { type: "int", required: false },
  student_code: { type: "string", required: true },
  full_name: { type: "string", required: true },
  gender: { type: "string", required: true },
  day_of_birth: { type: "date", required: true },
  class_name: { type: "string", required: true },
  address: { type: "string", required: true },
  parent_name: { type: "string", required: true },
};

const MedicalSubmissionRequest = {
  student_id: { type: "int", required: true },
  status: { type: "string", required: true, enum: ["DECLINED", "ACCEPTED"], default: "PENDING" },
  nurse_id: { type: "int", required: false },
  note: { type: "string", required: false },
  image_url: { type: "string", required: true },
  start_date: { type: "date", required: true },
  end_date: { type: "date", required: true },
};

const MedicalSupply = {
  supply_id: { type: "int", required: false },
  name: { type: "string", required: true },
  type: { type: "string", required: true },
  unit: { type: "string", required: true },
  quantity: { type: "int", required: true },
  description: { type: "string", required: false },
  expired_date: { type: "date", required: false },
  is_active: { type: "boolean", required: true, default: true },
  usage_note: { type: "string", required: false },
};

const MedicalIncidentSchema = {
  student_id: { type: "int", required: true },
  description: { type: "string", required: false },
  occurred_at: { type: "string", required: true }, // ISO 8601 string
  status: {
    type: "string",
    required: true,
    enum: ["NEW", "IN_PROGRESS", "RESOLVED", "MONITORING"],
  },
  description_detail: { type: "string", required: true },
  resolution_notes: { type: "string", required: false },
  resolved_at: { type: "string", required: false }, // hoặc null
  medication_used: {
    type: "array",
    required: true,
    items: {
      type: "object",
      properties: {
        supply_name: { type: "string", required: true },
        quantity_used: { type: "int", required: true },
      },
    },
  },
  severity_level: {
    type: "string",
    required: true,
    enum: ["Nặng", "Nguy kịch", "Nhẹ", "Vừa"],
  },
};

module.exports = {
  Information,
  Checkup_Result,
  HealthDeclaration,
  StudentInformation,
  MedicalSubmissionRequest,
  MedicalSupply,
  MedicalIncidentSchema,
};
