const productModel = require("../models/productModel");

async function createProduct(req, res) {
  try {
    const { name, description, price_cents, stock } = req.body;
    const farmer_id = req.user.id;
    
    let image_url = null;
    if (req.file) {
      image_url = `/uploads/products/${req.file.filename}`;
    }

    if (!name || price_cents === undefined || stock === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const product = await productModel.createProduct(farmer_id, name, description || "", price_cents, stock, image_url);

    res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({ error: "Failed to create product" });
  }
}

async function getAllProducts(req, res) {
  try {
    const products = await productModel.getAllProducts();
    res.json(products);
  } catch (error) {
    console.error("Get all products error:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
}

async function getProductById(req, res) {
  try {
    const { id } = req.params;
    const product = await productModel.getProductById(id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    console.error("Get product error:", error);
    res.status(500).json({ error: "Failed to fetch product" });
  }
}

async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const { name, description, price_cents, stock } = req.body;
    const user_id = req.user.id;

    let image_url = undefined;
    if (req.file) {
      image_url = `/uploads/products/${req.file.filename}`;
    }

    const product = await productModel.getProductById(id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (product.farmer_id !== user_id) {
      return res.status(403).json({ error: "You can only update your own products" });
    }

    const updated = await productModel.updateProduct(
      id, 
      name || product.name, 
      description !== undefined ? description : product.description, 
      price_cents !== undefined ? price_cents : product.price_cents, 
      stock !== undefined ? stock : product.stock,
      image_url
    );

    res.json({
      message: "Product updated successfully",
      product: updated,
    });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({ error: "Failed to update product" });
  }
}

async function deleteProduct(req, res) {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const product = await productModel.getProductById(id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (product.farmer_id !== user_id) {
      return res.status(403).json({ error: "You can only delete your own products" });
    }

    await productModel.deleteProduct(id);

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ error: "Failed to delete product" });
  }
}

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
