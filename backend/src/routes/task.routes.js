import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import {
    getAllTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
    volunteerForTask,
    approveVolunteer,
    rejectVolunteer,
    getOverdueTasks,
    getPendingVolunteerRequests,
} from "../controllers/task.controller.js";

const router = Router();

router.route("/")
    .get(authenticate, authorize(['admin', 'staff']), getAllTasks)
    .post(authenticate, authorize(['admin']), createTask);

router.route("/:id")
    .get(authenticate, authorize(['admin', 'staff']), getTaskById)
    .put(authenticate, authorize(['admin', 'staff']), updateTask) // Staff can update their assigned tasks
    .delete(authenticate, authorize(['admin']), deleteTask);

router.post("/:taskId/volunteer", authenticate, authorize(['staff']), volunteerForTask);
router.put("/volunteer/approve/:volunteerId", authenticate, authorize(['admin']), approveVolunteer);
router.put("/volunteer/reject/:volunteerId", authenticate, authorize(['admin']), rejectVolunteer);
router.get("/overdue", authenticate, authorize(['admin']), getOverdueTasks);
router.get("/pending-volunteers", authenticate, authorize(['admin']), getPendingVolunteerRequests);

export default router;
