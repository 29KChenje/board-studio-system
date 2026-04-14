import { productService } from "../services/productService.js";

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
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const product = await productService.createProduct({ ...req.body, imageUrl });
    res.status(201).json(product);
  },

  update: async (req, res) => {
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
    const product = await productService.updateProduct(Number(req.params.id), { ...req.body, imageUrl });
    res.json(product);
  },

  delete: async (req, res) => {
    await productService.deleteProduct(Number(req.params.id));
    res.status(204).send();
  }
};
