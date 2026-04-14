import { productService } from "../services/productService.js";

const buildImageUrl = (file) => {
  if (!file) {
    return null;
  }

  const mimeType = file.mimetype || "application/octet-stream";
  const encoded = file.buffer.toString("base64");
  return `data:${mimeType};base64,${encoded}`;
};

export const productController = {
  list: async (req, res) => {
    const result = await productService.getProductCatalog({
      search: req.query.search || "",
      category: req.query.category || "",
      isAdmin: req.user?.role === "admin"
    });
    res.json(result);
  },

  create: async (req, res) => {
    const imageUrl = buildImageUrl(req.file);
    const product = await productService.createProduct({ ...req.body, imageUrl });
    res.status(201).json(product);
  },

  update: async (req, res) => {
    const imageUrl = req.file ? buildImageUrl(req.file) : undefined;
    const product = await productService.updateProduct(Number(req.params.id), { ...req.body, imageUrl });
    res.json(product);
  },

  delete: async (req, res) => {
    await productService.deleteProduct(Number(req.params.id));
    res.status(204).send();
  }
};
