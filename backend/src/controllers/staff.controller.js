import { Staff } from "../models/staff.model.js";
import { User } from "../models/user.model.js";
import { Leave } from "../models/leave.model.js";

export const getAllStaff = async (req, res) => {
    try {
        const staffMembers = await Staff.find().populate('userId', 'name email role'); // Populate user details
        res.status(200).json(staffMembers);
    } catch (error) {
        console.error("Error fetching staff members:", error);
        res.status(500).json({ message: "Server error fetching staff members", error: error.message });
    }
};

export const getStaffById = async (req, res) => {
    try {
        const { id } = req.params;
        const staffMember = await Staff.findById(id).populate('userId', 'name email role');

        if (!staffMember) {
            return res.status(404).json({ message: "Staff member not found" });
        }
        res.status(200).json(staffMember);
    } catch (error) {
        console.error("Error fetching staff member by ID:", error);
        res.status(500).json({ message: "Server error fetching staff member", error: error.message });
    }
};

export const createStaff = async (req, res) => {
    try {
        const { userId, name, phone, salary, joiningDate, role } = req.body;

        if (!userId || !name || !phone || !salary || !joiningDate || !role) {
            return res.status(400).json({ message: "Please provide all required fields for staff creation" });
        }

        const existingStaff = await Staff.findOne({ userId });
        if (existingStaff) {
            return res.status(409).json({ message: "A staff entry already exists for this user" });
        }

        const newUser = await User.findById(userId); // Ensure the user actually exists
        if (!newUser) {
            return res.status(404).json({ message: "User not found. Staff must be linked to an existing user." });
        }
        
        const newStaff = await Staff.create({ userId, name, phone, salary, joiningDate, role });
        res.status(201).json({ message: "Staff member created successfully", staff: newStaff });
    } catch (error) {
        console.error("Error creating staff member:", error);
        res.status(500).json({ message: "Server error creating staff member", error: error.message });
    }
};

export const updateStaff = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedData = req.body;

        const staffMember = await Staff.findById(id);
        if (!staffMember) {
            return res.status(404).json({ message: "Staff member not found" });
        }

        const result = await Staff.findByIdAndUpdate(id, updatedData, { new: true, runValidators: true });
        res.status(200).json({ message: "Staff member updated successfully", staff: result });
    } catch (error) {
        console.error("Error updating staff member:", error);
        res.status(500).json({ message: "Server error updating staff member", error: error.message });
    }
};

export const deleteStaff = async (req, res) => {
    try {
        const { id } = req.params;
        const staffMember = await Staff.findById(id);

        if (!staffMember) {
            return res.status(404).json({ message: "Staff member not found" });
        }

        await Staff.findByIdAndDelete(id);
        // Optionally, also delete associated User or set their role to inactive/non-staff
        res.status(200).json({ message: "Staff member deleted successfully" });
    } catch (error) {
        console.error("Error deleting staff member:", error);
        res.status(500).json({ message: "Server error deleting staff member", error: error.message });
    }
};

export const requestLeave = async (req, res) => {
    try {
        const { staffId, type, startDate, endDate, reason } = req.body; // staffId here might come from req.user.userId
        
        if (!staffId || !type || !startDate || !endDate) {
            return res.status(400).json({ message: "Please provide staffId, leave type, start and end dates" });
        }

        const newLeaveRequest = await Leave.create({ staffId, type, startDate, endDate, reason, requestedDate: Date.now() });
        res.status(201).json({ message: "Leave request submitted successfully", leave: newLeaveRequest });
    } catch (error) {
        console.error("Error requesting leave:", error);
        res.status(500).json({ message: "Server error requesting leave", error: error.message });
    }
};

export const approveLeave = async (req, res) => {
    try {
        const { id } = req.params; // leaveId
        const leaveRequest = await Leave.findById(id);

        if (!leaveRequest) {
            return res.status(404).json({ message: "Leave request not found" });
        }

        leaveRequest.status = 'Approved';
        await leaveRequest.save();
        res.status(200).json({ message: "Leave request approved successfully", leave: leaveRequest });
    } catch (error) {
        console.error("Error approving leave request:", error);
        res.status(500).json({ message: "Server error approving leave request", error: error.message });
    }
};

export const rejectLeave = async (req, res) => {
    try {
        const { id } = req.params; // leaveId
        const leaveRequest = await Leave.findById(id);

        if (!leaveRequest) {
            return res.status(404).json({ message: "Leave request not found" });
        }

        leaveRequest.status = 'Rejected';
        await leaveRequest.save();
        res.status(200).json({ message: "Leave request rejected successfully", leave: leaveRequest });
    } catch (error) {
        console.error("Error rejecting leave request:", error);
        res.status(500).json({ message: "Server error rejecting leave request", error: error.message });
    }
};

export const getPendingLeaveRequests = async (req, res) => {
    try {
        const pendingLeaves = await Leave.find({ status: 'Pending' }).populate('staffId', 'name');
        res.status(200).json(pendingLeaves);
    } catch (error) {
        console.error("Error fetching pending leave requests:", error);
        res.status(500).json({ message: "Server error fetching pending leave requests", error: error.message });
    }
};

export const getStaffLeaves = async (req, res) => {
    try {
        const { staffId } = req.params;
        const staffLeaves = await Leave.find({ staffId });
        res.status(200).json(staffLeaves);
    } catch (error) {
        console.error("Error fetching staff's leave history:", error);
        res.status(500).json({ message: "Server error fetching staff's leave history", error: error.message });
    }
};
