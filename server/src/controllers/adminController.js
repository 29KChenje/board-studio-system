import { adminService } from "../services/adminService.js";

export const adminController = {
  dashboard: async (_req, res) => {
    const data = await adminService.getDashboard();
    res.json(data);
  },

  systemHealth: async (_req, res) => {
    const data = await adminService.getSystemHealth();
    res.json(data);
  }
};
