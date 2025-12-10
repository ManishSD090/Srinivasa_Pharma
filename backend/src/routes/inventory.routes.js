import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    recordReceivedItems,
    generateStockAlerts,
} from "../controllers/inventory.controller.js";

const router = Router();

router.route("/products")
    .get(authenticate, authorize(['admin', 'staff']), getAllProducts)
    .post(authenticate, authorize(['admin']), createProduct);

router.route("/products/:id")
    .get(authenticate, authorize(['admin', 'staff']), getProductById)
    .put(authenticate, authorize(['admin']), updateProduct)
    .delete(authenticate, authorize(['admin']), deleteProduct);

router.post("/receive/:orderId", authenticate, authorize(['admin', 'staff']), recordReceivedItems);
router.get("/alerts", authenticate, authorize(['admin']), generateStockAlerts);

export default router;
