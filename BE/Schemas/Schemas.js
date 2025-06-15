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
};

const Checkup_Result = {
  check_at: { type: "date", required: true },
  height_cm: { type: "int", required: true },
  weight_kg: { type: "int", required: true },
  vision_left: { type: "float", required: true },
  vision_right: { type: "float", required: true },
  hearing_left: { type: "string", required: true },
  hearing_right: { type: "string", required: true },
  blood_pressure: { type: "string", required: true },
  notes: { type: "string", required: false },
  abnormal_signs: { type: "string", required: false },
  needs_counseling: { type: "int", required: true },
};

const HealthDeclaration = {
  student_id: { type: "int", required: true },
  height_cm: { type: "int", required: true },
  weight_kg: { type: "int", required: true },
  blood_type: { type: "string", required: true },
  allergy: { type: "string", required: false },
  chronic_disease: { type: "string", required: false },
  vision_left: { type: "string", required: true },
  vision_right: { type: "string", required: true },
  hearing_left: { type: "string", required: true },
  hearing_right: { type: "string", required: true },
  health_status: { type: "string", required: true },
};

const StudentInformation = {
  student_info_id: { type: "int", required: false },
  student_code: { type: "string", required: true },
  full_name: { type: "string", required: true },
  gender: { type: "string", required: true },
  day_of_birth: { type: "date", required: true },
  class_name: { type: "string", required: true },
  parent_id: { type: "int", required: true },
  address: { type: "string", required: true },
};

module.exports = {
  Information,
  Checkup_Result,
  HealthDeclaration,
  StudentInformation,
};
