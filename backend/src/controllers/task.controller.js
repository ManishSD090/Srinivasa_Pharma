import { Task } from "../models/task.model.js";
import { VolunteerRequest } from "../models/volunteerRequest.model.js";

export const getAllTasks = async (req, res) => {
    try {
        const { role, userId } = req.user;
        let query = {};

        if (role === 'staff') {
            // Staff can see tasks assigned to them or tasks open for volunteer that they volunteered for
            query = {
                $or: [
                    { assignedTo: userId },
                    { 'volunteerRequests.staffId': userId, 'volunteerRequests.status': 'Approved' }, // If embedding requests
                    { assignedTo: null } // Open for volunteer
                ]
            };
            // For now, let's simplify and allow staff to see all tasks, then filter on frontend or add more specific linkage
            query = {}; 
        }

        const tasks = await Task.find(query)
            .populate('assignedTo', 'name email')
            .populate('assignedById', 'name email');
        res.status(200).json(tasks);
    } catch (error) {
        console.error("Error fetching tasks:", error);
        res.status(500).json({ message: "Server error fetching tasks", error: error.message });
    }
};

export const getTaskById = async (req, res) => {
    try {
        const { id } = req.params;
        const { role, userId } = req.user;

        const task = await Task.findById(id)
            .populate('assignedTo', 'name email')
            .populate('assignedById', 'name email');

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        // Staff authorization: can view if assigned to them or if it's open for volunteer
        // if (role === 'staff' && task.assignedTo && task.assignedTo._id.toString() !== userId.toString() && task.assignedTo !== null) {
        //     return res.status(403).json({ message: "Forbidden: You do not have access to this task" });
        // }

        res.status(200).json(task);
    } catch (error) {
        console.error("Error fetching task by ID:", error);
        res.status(500).json({ message: "Server error fetching task", error: error.message });
    }
};

export const createTask = async (req, res) => {
    try {
        const { title, description, assignedTo, priority, dueDate, status } = req.body;

        if (!title || !description || !dueDate) {
            return res.status(400).json({ message: "Please provide title, description, and due date for the task" });
        }

        const newTask = await Task.create({
            title,
            description,
            assignedTo,
            priority,
            dueDate,
            status,
            assignedById: req.user.userId, // Admin who created the task
        });
        res.status(201).json({ message: "Task created successfully", task: newTask });
    } catch (error) {
        console.error("Error creating task:", error);
        res.status(500).json({ message: "Server error creating task", error: error.message });
    }
};

export const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { role, userId } = req.user;
        const updatedData = req.body;

        const task = await Task.findById(id);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        // Authorization: Admin can update any task, assigned staff can update their own tasks (e.g., status)
        if (role === 'staff' && task.assignedTo && task.assignedTo.toString() !== userId.toString()) {
             return res.status(403).json({ message: "Forbidden: You do not have permission to update this task" });
        }

        const result = await Task.findByIdAndUpdate(id, updatedData, { new: true, runValidators: true });
        res.status(200).json({ message: "Task updated successfully", task: result });
    } catch (error) {
        console.error("Error updating task:", error);
        res.status(500).json({ message: "Server error updating task", error: error.message });
    }
};

export const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        const task = await Task.findById(id);

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        await Task.findByIdAndDelete(id);
        res.status(200).json({ message: "Task deleted successfully" });
    } catch (error) {
        console.error("Error deleting task:", error);
        res.status(500).json({ message: "Server error deleting task", error: error.message });
    }
};

export const volunteerForTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { userId } = req.user; // Staff ID from authenticated user

        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }
        
        if (task.assignedTo) {
            return res.status(400).json({ message: "This task is already assigned." });
        }

        const existingVolunteerRequest = await VolunteerRequest.findOne({ taskId, staffId: userId, status: 'Pending' });
        if (existingVolunteerRequest) {
            return res.status(409).json({ message: "You have already submitted a pending volunteer request for this task." });
        }

        const newVolunteerRequest = await VolunteerRequest.create({ taskId, staffId: userId, status: 'Pending' });
        res.status(201).json({ message: "Volunteer request submitted", request: newVolunteerRequest });

    } catch (error) {
        console.error("Error volunteering for task:", error);
        res.status(500).json({ message: "Server error volunteering for task", error: error.message });
    }
};

export const approveVolunteer = async (req, res) => {
    try {
        const { volunteerId } = req.params;
        
        const volunteerRequest = await VolunteerRequest.findById(volunteerId);
        if (!volunteerRequest) {
            return res.status(404).json({ message: "Volunteer request not found" });
        }
        if (volunteerRequest.status !== 'Pending') {
            return res.status(400).json({ message: "Volunteer request is not pending." });
        }

        const task = await Task.findById(volunteerRequest.taskId);
        if (!task) {
            return res.status(404).json({ message: "Associated task not found." });
        }
        if (task.assignedTo) {
            return res.status(400).json({ message: "Task is already assigned to another staff member." });
        }

        task.assignedTo = volunteerRequest.staffId;
        task.status = 'In Progress'; // Or 'Not Started' depending on policy
        await task.save();

        volunteerRequest.status = 'Approved';
        await volunteerRequest.save();

        // Optionally, reject other pending volunteer requests for this task
        await VolunteerRequest.updateMany(
            { taskId: task._id, _id: { $ne: volunteerId }, status: 'Pending' },
            { $set: { status: 'Rejected' } }
        );

        res.status(200).json({ message: "Volunteer approved and task assigned", task, volunteerRequest });
    } catch (error) {
        console.error("Error approving volunteer:", error);
        res.status(500).json({ message: "Server error approving volunteer", error: error.message });
    }
};

export const rejectVolunteer = async (req, res) => {
    try {
        const { volunteerId } = req.params;
        
        const volunteerRequest = await VolunteerRequest.findById(volunteerId);
        if (!volunteerRequest) {
            return res.status(404).json({ message: "Volunteer request not found" });
        }
        if (volunteerRequest.status !== 'Pending') {
            return res.status(400).json({ message: "Volunteer request is not pending." });
        }

        volunteerRequest.status = 'Rejected';
        await volunteerRequest.save();

        res.status(200).json({ message: "Volunteer request rejected", volunteerRequest });
    } catch (error) {
        console.error("Error rejecting volunteer:", error);
        res.status(500).json({ message: "Server error rejecting volunteer", error: error.message });
    }
};

export const getOverdueTasks = async (req, res) => {
    try {
        const overdueTasks = await Task.find({
            dueDate: { $lt: new Date() },
            status: { $nin: ['Completed'] } // Not completed tasks that are past due
        })
        .populate('assignedTo', 'name email')
        .populate('assignedById', 'name email');
        
        res.status(200).json(overdueTasks);
    } catch (error) {
        console.error("Error fetching overdue tasks:", error);
        res.status(500).json({ message: "Server error fetching overdue tasks", error: error.message });
    }
};

export const getPendingVolunteerRequests = async (req, res) => {
    try {
        const pendingRequests = await VolunteerRequest.find({ status: 'Pending' })
            .populate('staffId', 'name email')
            .populate('taskId', 'title description');
        res.status(200).json(pendingRequests);
    } catch (error) {
        console.error("Error fetching pending volunteer requests:", error);
        res.status(500).json({ message: "Server error fetching pending volunteer requests", error: error.message });
    }
};
