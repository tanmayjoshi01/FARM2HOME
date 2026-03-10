const express = require("express");
const productController = require("../controllers/productController");
const { authMiddleware, roleFarmer } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, roleFarmer, productController.createProduct);
router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProductById);
router.put("/:id", authMiddleware, roleFarmer, productController.updateProduct);
router.delete("/:id", authMiddleware, roleFarmer, productController.deleteProduct);

module.exports = router;
