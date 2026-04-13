import { model3dService } from "../services/model3dService.js";

export const modelController = {
  getProjectModel: async (req, res) => {
    const model = await model3dService.getProjectModel(req.params.projectId);
    res.json(model);
  }
};
