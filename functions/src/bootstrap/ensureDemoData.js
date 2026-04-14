import bcrypt from "bcryptjs";
import { cartRepository } from "../repositories/cartRepository.js";
import {
  createDocument,
  deleteDocument,
  getDocumentsByField,
  listDocuments,
  updateDocument
} from "../repositories/firestoreRepositoryUtils.js";

export const ADMIN_USERS = [
  {
    name: "Kosmas Chenjerai",
    email: "chenjeraikosmas29@gmail.com",
    password: "#2@Kosmas",
    role: "admin"
  }
];

const DEMO_CUSTOMER = {
  name: "Thando Dube",
  email: "thando@boardstudio.test",
  password: "password123",
  role: "customer"
};

const sampleBoards = [
  {
    material: "Melamine White Full Board",
    width: 2750,
    height: 1830,
    stock_quantity: 42
  },
  {
    material: "Melamine White Half Board",
    width: 1375,
    height: 1830,
    stock_quantity: 18
  },
  {
    material: "Oak Veneer Custom Board",
    width: 2440,
    height: 1220,
    stock_quantity: 10
  }
];

const sampleProducts = [
  {
    name: "Oak Floating Shelf",
    description: "Compact floating shelf finished in oak laminate for kitchen and office installs.",
    category: "Shelves",
    price: 549,
    image_url: "",
    stock_quantity: 12,
    is_active: 1
  },
  {
    name: "Kitchen Drawer Front",
    description: "Smooth white drawer front panel with edge-finished detail for modern cabinets.",
    category: "Panels",
    price: 329,
    image_url: "",
    stock_quantity: 25,
    is_active: 1
  },
  {
    name: "White Melamine Offcut Pack",
    description: "Budget-friendly offcut bundle for prototypes, repairs, and small fittings.",
    category: "Accessories",
    price: 199,
    image_url: "",
    stock_quantity: 30,
    is_active: 1
  }
];

const samplePieces = [
  ["Left Side Panel", 560, 720, 1, "fixed", 1, 1, 0, 1],
  ["Right Side Panel", 560, 720, 1, "fixed", 1, 1, 1, 0],
  ["Top Panel", 900, 560, 1, "flexible", 1, 0, 1, 1],
  ["Bottom Panel", 900, 560, 1, "flexible", 0, 1, 1, 1],
  ["Back Panel", 900, 720, 1, "fixed", 0, 0, 0, 0]
];

const ensureUser = async ({ name, email, password, role }) => {
  const passwordHash = await bcrypt.hash(password, 10);
  const existing = (await getDocumentsByField("users", "email", email))[0];
  if (existing) {
    return updateDocument("users", existing.id, {
      name,
      email,
      password: passwordHash,
      role
    });
  }

  return createDocument("users", "users", {
    name,
    email,
    password: passwordHash,
    role
  });
};

const removeUserAndWorkspace = async (email) => {
  const existing = (await getDocumentsByField("users", "email", email))[0];
  if (!existing) {
    return;
  }

  const [projects, carts] = await Promise.all([
    getDocumentsByField("projects", "user_id", Number(existing.id)),
    getDocumentsByField("carts", "user_id", Number(existing.id))
  ]);

  for (const project of projects) {
    const pieces = await getDocumentsByField("pieces", "project_id", Number(project.id));
    await Promise.all(pieces.map((piece) => deleteDocument("pieces", piece.id)));
    await deleteDocument("projects", project.id);
  }

  for (const cart of carts) {
    const cartItems = await getDocumentsByField("cartItems", "cart_id", Number(cart.id));
    await Promise.all(cartItems.map((item) => deleteDocument("cartItems", item.id)));
    await deleteDocument("carts", cart.id);
  }

  await deleteDocument("users", existing.id);
};

const ensureBoards = async () => {
  const boards = await listDocuments("boards");
  if (boards.length) {
    return boards;
  }

  const createdBoards = [];
  for (const board of sampleBoards) {
    createdBoards.push(await createDocument("boards", "boards", board));
  }

  return createdBoards;
};

const ensureProducts = async () => {
  const products = await listDocuments("products");

  for (const sampleProduct of sampleProducts) {
    const existing = products.find((product) => product.name === sampleProduct.name);
    if (!existing) {
      const created = await createDocument("products", "products", sampleProduct);
      products.push(created);
      continue;
    }

    const needsRefresh =
      !existing.image_url ||
      existing.description !== sampleProduct.description ||
      Number(existing.price) !== Number(sampleProduct.price);

    if (needsRefresh) {
      const updated = await updateDocument("products", existing.id, sampleProduct);
      const index = products.findIndex((product) => Number(product.id) === Number(existing.id));
      products[index] = updated;
    }
  }

  return products;
};

const ensureDemoProject = async (userId) => {
  const projects = await getDocumentsByField("projects", "user_id", Number(userId));
  if (projects.length) {
    return projects[0];
  }

  const project = await createDocument("projects", "projects", {
    user_id: Number(userId),
    name: "Kitchen Base Unit",
    width: 900,
    height: 720,
    depth: 560,
    board_width: 2750,
    board_height: 1830,
    material: "Melamine White"
  });

  for (const [name, width, height, quantity, grain, top, bottom, left, right] of samplePieces) {
    await createDocument("pieces", "pieces", {
      project_id: project.id,
      name,
      width,
      height,
      quantity,
      grain_direction: grain,
      edging_top: top,
      edging_bottom: bottom,
      edging_left: left,
      edging_right: right
    });
  }

  return project;
};

export const ensureDemoData = async () => {
  const admins = [];
  for (const adminUser of ADMIN_USERS) {
    admins.push(await ensureUser(adminUser));
  }

  const primaryAdmin = admins[0];
  await removeUserAndWorkspace(DEMO_CUSTOMER.email);
  await removeUserAndWorkspace("admin@boardstudio.test");

  await Promise.all([
    ensureBoards(),
    ensureProducts(),
    cartRepository.findOrCreateByUserId(primaryAdmin.id),
    ensureDemoProject(primaryAdmin.id)
  ]);

  return {
    adminEmails: ADMIN_USERS.map((admin) => admin.email)
  };
};
