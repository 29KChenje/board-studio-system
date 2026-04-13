import {
  createDocument,
  findDocumentById,
  getDocumentsByField,
  listDocuments,
  sortByCreatedDesc
} from "./firestoreRepositoryUtils.js";

const toPublicUser = (user) =>
  user
    ? {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        created_at: user.created_at
      }
    : null;

export const userRepository = {
  create: async ({ name, email, passwordHash, role }) => {
    const user = await createDocument("users", "users", {
      name,
      email,
      password: passwordHash,
      role
    });

    return toPublicUser(user);
  },

  findByEmail: async (email) => {
    const users = await getDocumentsByField("users", "email", email);
    return sortByCreatedDesc(users)[0] || null;
  },

  findById: async (id) => toPublicUser(await findDocumentById("users", id)),

  findActiveAuthUserById: async (id) => toPublicUser(await findDocumentById("users", id)),

  findCustomers: async () => {
    const users = await listDocuments("users");
    return sortByCreatedDesc(users.filter((user) => user.role === "customer")).map(toPublicUser);
  }
};
