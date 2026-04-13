import { pieceRepository } from "../repositories/pieceRepository.js";
import { projectRepository } from "../repositories/projectRepository.js";
import { ApiError } from "../utils/ApiError.js";

export const model3dService = {
  getProjectModel: async (projectId) => {
    const project = await projectRepository.findById(projectId);
    if (!project) {
      throw new ApiError(404, "Project not found");
    }

    const pieces = await pieceRepository.findByProjectId(projectId);

    return {
      projectId: project.id,
      name: project.name,
      dimensions: {
        width: Number(project.width),
        height: Number(project.height),
        depth: Number(project.depth)
      },
      panels: [
        {
          id: "top",
          type: "top",
          width: Number(project.width),
          height: 18,
          depth: Number(project.depth),
          position: { x: 0, y: Number(project.height) / 2, z: 0 }
        },
        {
          id: "bottom",
          type: "bottom",
          width: Number(project.width),
          height: 18,
          depth: Number(project.depth),
          position: { x: 0, y: -Number(project.height) / 2, z: 0 }
        },
        {
          id: "left",
          type: "side",
          width: 18,
          height: Number(project.height),
          depth: Number(project.depth),
          position: { x: -Number(project.width) / 2, y: 0, z: 0 }
        },
        {
          id: "right",
          type: "side",
          width: 18,
          height: Number(project.height),
          depth: Number(project.depth),
          position: { x: Number(project.width) / 2, y: 0, z: 0 }
        },
        {
          id: "back",
          type: "back",
          width: Number(project.width),
          height: Number(project.height),
          depth: 6,
          position: { x: 0, y: 0, z: -Number(project.depth) / 2 }
        }
      ],
      pieces
    };
  }
};
