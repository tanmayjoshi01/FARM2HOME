const express = require("express");
const productController = require("../controllers/productController");
const { authMiddleware, roleFarmer } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.post("/", authMiddleware, roleFarmer, upload.single("image"), productController.createProduct);
router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProductById);
router.put("/:id", authMiddleware, roleFarmer, upload.single("image"), productController.updateProduct);
router.delete("/:id", authMiddleware, roleFarmer, productController.deleteProduct);

module.exports = router;
