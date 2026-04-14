import {
  createDocument,
  findDocumentById,
  getDocumentsByField,
  listDocuments,
  sortByCreatedDesc
} from "./firestoreRepositoryUtils.js";
import { userRepository } from "./userRepository.js";

const attachCustomer = async (project) => {
  if (!project) return null;
  const user = await userRepository.findById(project.user_id);

  return {
    ...project,
    customer_name: user?.name || null,
    customer_email: user?.email || null
  };
};

export const projectRepository = {
  create: async ({ userId, name, width, height, depth, boardWidth, boardHeight, material }) => {
    const project = await createDocument("projects", "projects", {
      user_id: Number(userId),
      name,
      width: Number(width),
      height: Number(height),
      depth: Number(depth),
      board_width: Number(boardWidth),
      board_height: Number(boardHeight),
      material
    });

    return {
      id: project.id,
      userId: project.user_id,
      name: project.name,
      width: project.width,
      height: project.height,
      depth: project.depth,
      boardWidth: project.board_width,
      boardHeight: project.board_height,
      material: project.material
    };
  },

  findById: async (id) => attachCustomer(await findDocumentById("projects", id)),

  findOwnerIdByProjectId: async (id) => {
    const project = await findDocumentById("projects", id);
    return project?.user_id || null;
  },

  findAllByUserId: async (userId) => {
    const projects = await getDocumentsByField("projects", "user_id", Number(userId));
    return sortByCreatedDesc(projects);
  },

  findAll: async () => {
    const projects = sortByCreatedDesc(await listDocuments("projects"));
    return Promise.all(projects.map(attachCustomer));
  }
};
