function validateInput(schemaDefinitions, schemaName) {
  return (req, res, next) => {
    const errors = [];
    const data = req.body;
    const schema = schemaDefinitions[schemaName];

    if (!schema) {
      return res.status(400).json({ status: "fail", message: "Schema not found." });
    }

    for (const key in schema) {
      const { type, required, items } = schema[key];
      let value = data[key];

      if (required && (value === undefined || value === null || value === "")) {
        errors.push(`Missing field: ${key}`);
        continue;
      }

      if (!required && (value === undefined || value === null || value === "")) {
        continue;
      }

      if (type === "boolean") {
        if (value === "true" || value === 1) value = true;
        else if (value === "false" || value === 0) value = false;
        data[key] = value;
      }

      // ✅ Kiểm tra array các object
      if (type === "array") {
        if (!Array.isArray(value)) {
          errors.push(`Invalid type for field: ${key}. Expected array.`);
          continue;
        }

        if (items && items.type === "object" && items.properties) {
          value.forEach((item, index) => {
            for (const prop in items.properties) {
              const propDef = items.properties[prop];
              const propValue = item[prop];
              if (propDef.required && (propValue === undefined || propValue === null || propValue === "")) {
                errors.push(`Missing field: ${key}[${index}].${prop}`);
              } else if (!isValidType(propValue, propDef.type)) {
                errors.push(`Invalid type in ${key}[${index}].${prop}. Expected ${propDef.type}.`);
              }
            }
          });
        }
        continue; // ✅ Đã kiểm tra xong array, bỏ qua kiểm tra thường
      }

      if (!isValidType(value, type)) {
        errors.push(`Invalid type for field: ${key}. Expected ${type}.`);
      }
    }

    if (data.email && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(data.email)) {
      errors.push("Invalid email format.");
    }

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
    case "text":
      return typeof value === "string";
    case "int":
      return !isNaN(value) && Number.isInteger(Number(value)); // chấp nhận cả "1"
    case "float":
    case "number":
      return !isNaN(value);
    case "email":
      return typeof value === "string";
    case "date":
    case "datetime":
      return !isNaN(Date.parse(value));
    case "boolean":
      return typeof value === "boolean";
    case "array":
      return Array.isArray(value);
    case "object":
      return typeof value === "object" && !Array.isArray(value) && value !== null;
    default:
      return false;
  }
}

module.exports = validateInput;
