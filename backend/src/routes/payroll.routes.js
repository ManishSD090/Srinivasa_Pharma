import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import {
    getMonthlyAttendance,
    punchIn,
    punchOut,
    addAttendanceComment,
    getPayrollDetails,
    generateSalarySlip,
    getPayrollHistory,
    updatePayrollItem,
    addPayrollItem,
    deletePayrollItem,
} from "../controllers/payroll.controller.js";

const router = Router();

// Attendance Routes
router.get("/attendance/:staffId/:month", authenticate, authorize(['admin', 'staff']), getMonthlyAttendance);
router.post("/attendance/punch-in", authenticate, authorize(['staff']), punchIn);
router.post("/attendance/punch-out", authenticate, authorize(['staff']), punchOut);
router.put("/attendance/:id/comment", authenticate, authorize(['admin']), addAttendanceComment);

// Payroll Routes
router.get("/payroll/:staffId/:month", authenticate, authorize(['admin', 'staff']), getPayrollDetails);
router.post("/payroll/generate-slip/:payrollId", authenticate, authorize(['admin']), generateSalarySlip);
router.get("/payroll/history/:staffId", authenticate, authorize(['admin', 'staff']), getPayrollHistory);
router.put("/payroll/:payrollId/item/:itemId", authenticate, authorize(['admin']), updatePayrollItem); // Update specific item in payroll
router.post("/payroll/:payrollId/item", authenticate, authorize(['admin']), addPayrollItem); // Add new item to payroll
router.delete("/payroll/:payrollId/item/:itemId", authenticate, authorize(['admin']), deletePayrollItem); // Delete specific item from payroll

export default router;
