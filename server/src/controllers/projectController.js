import { projectService } from "../services/projectService.js";

export const projectController = {
  create: async (req, res) => {
    const result = await projectService.createProject({
      ...req.body,
      userId: req.user.id
    });
    res.status(201).json(result);
  },

  getById: async (req, res) => {
    const result = await projectService.getProject(req.params.id);
    res.json(result);
  },

  listMine: async (req, res) => {
    const projects = await projectService.listProjectsByUser(req.user.id);
    res.json(projects);
  },

  listAll: async (_req, res) => {
    const projects = await projectService.listAllProjects();
    res.json(projects);
  }
};
