import { ApiError } from "./ApiError.js";

const isEmpty = (value) =>
  value === undefined ||
  value === null ||
  (typeof value === "string" && value.trim() === "");

export const requireFields = (payload, fields) => {
  const missing = fields.filter((field) => isEmpty(payload[field]));
  if (missing.length) {
    throw new ApiError(400, `Missing required fields: ${missing.join(", ")}`);
  }
};

export const ensurePositiveNumber = (value, field) => {
  if (!Number.isFinite(Number(value)) || Number(value) <= 0) {
    throw new ApiError(400, `${field} must be a positive number`);
  }
};

export const ensureNonNegativeInteger = (value, field) => {
  const normalized = Number(value);
  if (!Number.isInteger(normalized) || normalized < 0) {
    throw new ApiError(400, `${field} must be a non-negative integer`);
  }
};
