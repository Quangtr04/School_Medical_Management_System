// validateInput.js
function validateInput(schema) {
  return (req, res, next) => {
    const errors = [];
    const data = req.body.Information;

    for (const key in schema) {
      const expectedType = schema[key];
      const value = data[key];

      if (value === undefined || value === null) {
        errors.push(`Missing field: ${key}`);
        continue;
      }

      if (
        (expectedType === "string" && typeof value !== "string") ||
        (expectedType === "int" && !Number.isInteger(value)) ||
        (expectedType === "float" && typeof value !== "number")
      ) {
        errors.push(`Invalid type for ${key}: expected ${expectedType}`);
      }
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!emailRegex.test(data.email)) {
      errors.push("Invalid email format. Only '@gmail.com' is accepted.");
    }

    if (errors.length > 0) {
      return res.status(400).json({ status: "fail", errors });
    }

    next();
  };
}

module.exports = validateInput;
