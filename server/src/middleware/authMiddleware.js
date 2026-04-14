import { userRepository } from "../repositories/userRepository.js";
import { ApiError } from "../utils/ApiError.js";
import { verifyToken } from "../utils/jwt.js";

const extractBearerToken = (authorizationHeader) => {
  if (!authorizationHeader?.startsWith("Bearer ")) {
    throw new ApiError(401, "Authentication token is required");
  }
  return authorizationHeader.replace("Bearer ", "");
};

export const authenticate = async (req, _res, next) => {
  try {
    const token = extractBearerToken(req.headers.authorization);
    const payload = verifyToken(token);
    const user = await userRepository.findActiveAuthUserById(payload.id);

    if (!user) {
      throw new ApiError(401, "Authenticated user no longer exists");
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };
    next();
  } catch (error) {
    next(error.statusCode ? error : new ApiError(401, "Invalid or expired token"));
  }
};

export const optionalAuthenticate = async (req, _res, next) => {
  if (!req.headers.authorization) {
    return next();
  }
  return authenticate(req, _res, next);
};

export const authorize = (...roles) => (req, _res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new ApiError(403, "You do not have permission to access this resource"));
  }

  next();
};

export const authorizeResourceOwner = (resolveOwnerId) => async (req, _res, next) => {
  try {
    if (req.user?.role === "admin") {
      return next();
    }

    const ownerId = await resolveOwnerId(req);
    if (!ownerId || Number(ownerId) !== Number(req.user?.id)) {
      throw new ApiError(403, "You do not have permission to access this resource");
    }

    next();
  } catch (error) {
    next(error);
  }
};
