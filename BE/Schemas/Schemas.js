const Information = {
  Constructors: {
    role_name: "string",
    role_id: "int",
    user_id: "int",
    fullname: "string",
    dayofbirth: "string",
    major: "string",
    gender: "string",
    address: "string",
    email: "string",
    phone: "string",
    password: "string",
  },
};

const Checkup_Result = {
  Constructors: {
    check_at: "string",
    height_cm: "int",
    weight_kg: "int",
    vision_left: "float",
    vision_right: "float",
    hearing_left: "string",
    hearing_right: "string",
    blood_pressure: "string",
    notes: "string",
    abnormal_signs: "string",
    needs_counseling: "int",
  },
};

// const HealthDeclaration = {
//   Constructors: {
//     student_id: "int",
//     height_cm: "int",
//     weight_kg: "int",
//     blood_type: "string",
//     allergy: "string",
//     chronic_disease: "string",
//     vision_left: "string",
//     vision_right: "string",
//     hearing_left: "string",
//     hearing_right: "string",
//     health_status: "string"
//   },
// };

module.exports = {
  Information,
  User,
  Checkup_Result,
};
