import { env } from "../config/env.js";
import { pieceRepository } from "../repositories/pieceRepository.js";
import { projectRepository } from "../repositories/projectRepository.js";
import { ApiError } from "../utils/ApiError.js";
import { optimizationService } from "./optimizationService.js";
import { pieceGenerationService } from "./pieceGenerationService.js";
import { pricingService } from "./pricingService.js";

export const projectService = {
  createProject: async ({
    userId,
    name,
    width,
    height,
    depth,
    boardWidth,
    boardHeight,
    material,
    autoGeneratePieces
  }) => {
    const project = await projectRepository.create({
      userId,
      name,
      width,
      height,
      depth,
      boardWidth: boardWidth || env.defaults.boardWidth,
      boardHeight: boardHeight || env.defaults.boardHeight,
      material: material || "Melamine White"
    });

    let pieces = [];
    if (autoGeneratePieces) {
      const generated = pieceGenerationService.generateCabinetPieces({ width, height, depth });
      pieces = await pieceRepository.createMany(
        generated.map((piece) => ({
          projectId: project.id,
          ...piece
        }))
      );
    }

    return { ...project, pieces };
  },

  getProject: async (projectId) => {
    const project = await projectRepository.findById(projectId);
    if (!project) {
      throw new ApiError(404, "Project not found");
    }

    const pieces = await pieceRepository.findByProjectId(projectId);
    const optimization = pieces.length
      ? optimizationService.optimize({
          pieces,
          boardWidth: project.board_width,
          boardHeight: project.board_height
        })
      : null;
    const quote = optimization ? pricingService.buildQuote({ pieces, optimization }) : null;

    return {
      ...project,
      pieces,
      optimization,
      quote
    };
  },

  listProjectsByUser: (userId) => projectRepository.findAllByUserId(userId),
  listAllProjects: () => projectRepository.findAll()
};
