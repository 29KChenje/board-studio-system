import { ApiError } from "../utils/ApiError.js";

const validateRule = (value, rule, field) => {
  if (rule.required && (value === undefined || value === null || value === "")) {
    return `${field} is required`;
  }

  if (value === undefined || value === null || value === "") {
    return null;
  }

  if (rule.type === "number" && (!Number.isFinite(Number(value)) || (rule.positive && Number(value) <= 0))) {
    return `${field} must be${rule.positive ? " a positive" : ""} number`;
  }

  if (rule.type === "integer" && (!Number.isInteger(Number(value)) || (rule.min !== undefined && Number(value) < rule.min))) {
    return `${field} must be an integer${rule.min !== undefined ? ` greater than or equal to ${rule.min}` : ""}`;
  }

  if (rule.type === "string" && typeof value !== "string") {
    return `${field} must be a string`;
  }

  if (rule.enum && !rule.enum.includes(value)) {
    return `${field} must be one of: ${rule.enum.join(", ")}`;
  }

  return null;
};

export const validate = (schema) => (req, _res, next) => {
  const errors = [];
  const source = {
    body: req.body || {},
    params: req.params || {},
    query: req.query || {}
  };

  Object.entries(schema).forEach(([location, rules]) => {
    Object.entries(rules).forEach(([field, rule]) => {
      const error = validateRule(source[location][field], rule, field);
      if (error) errors.push(error);
    });
  });

  if (errors.length) {
    return next(new ApiError(400, "Validation failed", errors));
  }

  next();
};
