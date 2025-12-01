import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import {
    getAllOrders,
    getOrderById,
    createOrder,
    updateOrder,
    deleteOrder,
    getOrdersByStaff
} from "../controllers/order.controller.js";

const router = Router();

router.route("/")
    .get(authenticate, authorize(['admin', 'staff']), getAllOrders)
    .post(authenticate, authorize(['admin']), createOrder);

router.route("/:id")
    .get(authenticate, authorize(['admin', 'staff']), getOrderById)
    .put(authenticate, authorize(['admin']), updateOrder)
    .delete(authenticate, authorize(['admin']), deleteOrder);

// Specific route for staff orders (if needed, otherwise getAllOrders can handle it with query params)
router.get("/staff/:staffId", authenticate, authorize(['admin', 'staff']), getOrdersByStaff);

export default router;
