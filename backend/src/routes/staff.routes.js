import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import {
    getAllStaff,
    getStaffById,
    createStaff,
    updateStaff,
    deleteStaff,
    requestLeave,
    approveLeave,
    rejectLeave,
    getPendingLeaveRequests,
    getStaffLeaves,
} from "../controllers/staff.controller.js";

const router = Router();

router.route("/")
    .get(authenticate, authorize(['admin']), getAllStaff)
    .post(authenticate, authorize(['admin']), createStaff);

router.route("/:id")
    .get(authenticate, authorize(['admin', 'staff']), getStaffById)
    .put(authenticate, authorize(['admin']), updateStaff)
    .delete(authenticate, authorize(['admin']), deleteStaff);

router.post("/leave/request", authenticate, authorize(['staff']), requestLeave);
router.put("/leave/approve/:id", authenticate, authorize(['admin']), approveLeave);
router.put("/leave/reject/:id", authenticate, authorize(['admin']), rejectLeave);
router.get("/leave/pending", authenticate, authorize(['admin']), getPendingLeaveRequests);
router.get("/:staffId/leaves", authenticate, authorize(['admin', 'staff']), getStaffLeaves); // Staff can view their own leaves, admin can view any staff's leaves

export default router;
