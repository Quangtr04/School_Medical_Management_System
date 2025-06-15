function validateInput(schemaDefinitions, schemaName) {
  return (req, res, next) => {
    const errors = [];
    const data = req.body;
    const schema = schemaDefinitions[schemaName];

    if (!schema) {
      return res.status(400).json({ status: "fail", message: "Schema not found." });
    }

    for (const key in schema) {
      const { type, required } = schema[key];
      const value = data[key];

      // Nếu là required nhưng không có giá trị
      if (required && (value === undefined || value === null || value === "")) {
        errors.push(`Missing field: ${key}`);
        continue;
      }

      // Nếu không required và không có giá trị → bỏ qua
      if (!required && (value === undefined || value === null || value === "")) {
        continue;
      }

      // Kiểm tra kiểu dữ liệu
      if (!isValidType(value, type)) {
        errors.push(`Invalid type for field: ${key}. Expected ${type}.`);
      }
    }

    // Validate email nếu có
    if (data.email && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(data.email)) {
      errors.push("Invalid email format. Only '@gmail.com' is accepted.");
    }

    // Validate số điện thoại nếu có
    if (data.phone && !/^0(3|5|7|8|9)\d{8}$/.test(data.phone)) {
      errors.push("Invalid phone number format.");
    }

    if (errors.length > 0) {
      return res.status(400).json({ status: "fail", errors });
    }

    next();
  };
}

function isValidType(value, type) {
  switch (type) {
    case "string":
      return typeof value === "string";
    case "int":
      return Number.isInteger(value);
    case "float":
      return typeof value === "number";
    case "email":
      return typeof value === "string";
    case "date":
      return !isNaN(Date.parse(value));
    default:
      return false;
  }
}

module.exports = validateInput;
