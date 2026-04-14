import { authService } from "../services/authService.js";

export const authController = {
  register: async (req, res) => {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  },

  login: async (req, res) => {
    const result = await authService.login(req.body);
    res.json(result);
  }
};
