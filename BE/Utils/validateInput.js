function validateInput(schemaDefinitions, schemaName) {
  return (req, res, next) => {
    const errors = [];
    const data = req.body;
    const schema = schemaDefinitions[schemaName];

    console.log(`Validating schema: ${schemaName}`);
    console.log("Request body:", data);

    if (!schema) {
      return res
        .status(400)
        .json({ status: "fail", message: "Schema not found." });
    }

    for (const key in schema) {
      const { type, required, items } = schema[key];
      let value = data[key];

      console.log(
        `Validating field: ${key}, value: ${value}, type: ${type}, required: ${required}`
      );

      // Skip validation for non-required fields that are empty
      if (
        !required &&
        (value === undefined || value === null || value === "")
      ) {
        continue;
      }

      // Check for required fields
      if (required && (value === undefined || value === null || value === "")) {
        errors.push(`Field '${key}' is required`);
        continue;
      }

      // Convert boolean values
      if (type === "boolean") {
        if (value === "true" || value === 1) value = true;
        else if (value === "false" || value === 0) value = false;
        data[key] = value;
      }

      // Handle date type specifically
      if (type === "date" && value) {
        try {
          const dateValue = new Date(value);
          console.log(`Date parsing: ${value} -> ${dateValue}`);
          if (isNaN(dateValue.getTime())) {
            errors.push(`Invalid date format for field: ${key}`);
            console.log(`Invalid date: ${value}`);
          }
        } catch (err) {
          console.error(`Error parsing date ${value}:`, err);
          errors.push(`Error parsing date for field: ${key}`);
        }
      }

      // Validate array type
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
              if (
                propDef.required &&
                (propValue === undefined ||
                  propValue === null ||
                  propValue === "")
              ) {
                errors.push(`Missing field: ${key}[${index}].${prop}`);
              } else if (!isValidType(propValue, propDef.type)) {
                errors.push(
                  `Invalid type in ${key}[${index}].${prop}. Expected ${propDef.type}.`
                );
              }
            }
          });
        } else if (items && items.type !== "object") {
          value.forEach((item, index) => {
            if (!isValidType(item, items.type)) {
              errors.push(
                `Invalid type in ${key}[${index}]. Expected ${items.type}.`
              );
            }
          });
        }

        continue; // Skip further validation for arrays
      }

      // Validate other types
      if (!isValidType(value, type)) {
        errors.push(`Invalid type for field: ${key}. Expected ${type}.`);
        console.log(
          `Invalid type: ${key}, value: ${value}, expected type: ${type}`
        );
      }
    }

    // Additional validations
    if (
      data.email &&
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(data.email)
    ) {
      errors.push("Invalid email format.");
    }

    if (data.phone && !/^0(3|5|7|8|9)\d{8}$/.test(data.phone)) {
      errors.push("Invalid phone number format.");
    }

    if (errors.length > 0) {
      console.log("Validation errors:", errors);
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
      return (
        typeof value === "object" && !Array.isArray(value) && value !== null
      );
    default:
      return false;
  }
}

module.exports = validateInput;
