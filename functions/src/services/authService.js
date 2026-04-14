import bcrypt from "bcryptjs";
import { userRepository } from "../repositories/userRepository.js";
import { ApiError } from "../utils/ApiError.js";
import { signToken } from "../utils/jwt.js";

export const authService = {
  register: async ({ name, email, password }) => {
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new ApiError(409, "A user with that email already exists");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await userRepository.create({ name, email, passwordHash, role: "customer" });
    const token = signToken({ id: user.id, email: user.email, role: user.role });

    return { user, token };
  },

  login: async ({ email, password }) => {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new ApiError(401, "Invalid email or password");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new ApiError(401, "Invalid email or password");
    }

    const token = signToken({ id: user.id, email: user.email, role: user.role });
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    };
  }
};
