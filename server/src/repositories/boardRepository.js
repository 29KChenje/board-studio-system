import { findDocumentById, listDocuments } from "./firestoreRepositoryUtils.js";

export const boardRepository = {
  findAll: async () => {
    const boards = await listDocuments("boards");
    return boards.sort((left, right) => String(left.material || "").localeCompare(String(right.material || "")));
  },

  findById: async (id) => findDocumentById("boards", id)
};
