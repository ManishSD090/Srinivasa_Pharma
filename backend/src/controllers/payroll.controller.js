import { Attendance } from "../models/attendance.model.js";
import { Payroll } from "../models/payroll.model.js";
import { Staff } from "../models/staff.model.js"; // To get staff salary details

export const getMonthlyAttendance = async (req, res) => {
    try {
        const { staffId, month } = req.params; // month format e.g., '2025-11' for November 2025

        if (!staffId || !month) {
            return res.status(400).json({ message: "Please provide staff ID and month for attendance" });
        }

        const startDate = new Date(month + '-01');
        const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0); // Last day of the month

        const attendanceRecords = await Attendance.find({
            staffId,
            date: { $gte: startDate, $lte: endDate }
        }).sort({ date: 1 });

        res.status(200).json(attendanceRecords);
    } catch (error) {
        console.error("Error fetching monthly attendance:", error);
        res.status(500).json({ message: "Server error fetching monthly attendance", error: error.message });
    }
};

export const punchIn = async (req, res) => {
    try {
        const { userId: staffId } = req.user; // Assuming staffId comes from authenticated user
        const { date, punchInTime } = req.body; // date might be redundant if using server time

        if (!staffId) {
            return res.status(400).json({ message: "Staff ID is required for punch-in" });
        }

        // Check if already punched in today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const existingPunchIn = await Attendance.findOne({
            staffId,
            date: today, // Assuming date is for current day
            punchOutTime: { $eq: null }
        });

        if (existingPunchIn) {
            return res.status(400).json({ message: "Already punched in for today" });
        }

        const newAttendance = await Attendance.create({
            staffId,
            date: date || today,
            punchInTime: punchInTime || Date.now(),
            status: 'present',
        });
        res.status(201).json({ message: "Punched in successfully", attendance: newAttendance });
    } catch (error) {
        console.error("Error during punch-in:", error);
        res.status(500).json({ message: "Server error during punch-in", error: error.message });
    }
};

export const punchOut = async (req, res) => {
    try {
        const { userId: staffId } = req.user;
        const { punchOutTime } = req.body;

        if (!staffId) {
            return res.status(400).json({ message: "Staff ID is required for punch-out" });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const attendanceRecord = await Attendance.findOne({
            staffId,
            date: today,
            punchOutTime: { $eq: null }
        });

        if (!attendanceRecord) {
            return res.status(400).json({ message: "No active punch-in found for today" });
        }

        attendanceRecord.punchOutTime = punchOutTime || Date.now();
        // Calculate total hours
        const diffMs = new Date(attendanceRecord.punchOutTime).getTime() - new Date(attendanceRecord.punchInTime).getTime();
        attendanceRecord.totalHours = diffMs / (1000 * 60 * 60); // Convert milliseconds to hours

        await attendanceRecord.save();
        res.status(200).json({ message: "Punched out successfully", attendance: attendanceRecord });
    } catch (error) {
        console.error("Error during punch-out:", error);
        res.status(500).json({ message: "Server error during punch-out", error: error.message });
    }
};

export const addAttendanceComment = async (req, res) => {
    try {
        const { id } = req.params; // attendanceId
        const { comment } = req.body;

        if (!comment) {
            return res.status(400).json({ message: "Comment cannot be empty" });
        }

        const attendanceRecord = await Attendance.findById(id);
        if (!attendanceRecord) {
            return res.status(404).json({ message: "Attendance record not found" });
        }

        attendanceRecord.adminComment = comment;
        await attendanceRecord.save();
        res.status(200).json({ message: "Comment added to attendance record", attendance: attendanceRecord });
    } catch (error) {
        console.error("Error adding attendance comment:", error);
        res.status(500).json({ message: "Server error adding attendance comment", error: error.message });
    }
};

export const getPayrollDetails = async (req, res) => {
    try {
        const { staffId, month } = req.params; // month format e.g., 'December 2024'

        if (!staffId || !month) {
            return res.status(400).json({ message: "Please provide staff ID and month for payroll" });
        }

        const staffDetails = await Staff.findOne({ userId: staffId }); // Assuming Staff model links to User
        if (!staffDetails) {
            return res.status(404).json({ message: "Staff member not found for payroll calculation" });
        }

        // Find existing payroll for the month if any
        let payroll = await Payroll.findOne({ staffId, month });

        // If no payroll exists, create a new one based on attendance and staff salary
        if (!payroll) {
            const startDate = new Date(month); // e.g., new Date('December 1, 2024')
            const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
            
            const attendanceRecords = await Attendance.find({
                staffId,
                date: { $gte: startDate, $lte: endDate },
                status: 'present'
            });

            const totalWorkingHours = attendanceRecords.reduce((acc, rec) => acc + (rec.totalHours || 0), 0);
            
            // Simple calculation: base salary for a standard month (e.g. 160 hours for 20 working days * 8 hours/day)
            // This needs to be much more sophisticated in a real app, considering hourly rates, overtime etc.
            const hourlyRate = staffDetails.salary / 160; // Assuming a standard 160 hours in a month
            const calculatedSalary = totalWorkingHours * hourlyRate;

            payroll = await Payroll.create({
                staffId,
                month,
                baseSalary: staffDetails.salary,
                netAmount: calculatedSalary, // Initial net amount, can be adjusted with additions/deductions
                generatedDate: Date.now(),
            });
        }

        res.status(200).json(payroll);
    } catch (error) {
        console.error("Error fetching payroll details:", error);
        res.status(500).json({ message: "Server error fetching payroll details", error: error.message });
    }
};

export const generateSalarySlip = async (req, res) => {
    try {
        const { payrollId } = req.params;
        const payroll = await Payroll.findById(payrollId).populate('staffId', 'name email');

        if (!payroll) {
            return res.status(404).json({ message: "Payroll record not found" });
        }

        // This would ideally generate a PDF or a well-formatted HTML for a payslip
        // For now, returning the payroll data as the "slip"
        res.status(200).json({ message: "Salary slip generated (data below)", payslip: payroll });
    } catch (error) {
        console.error("Error generating salary slip:", error);
        res.status(500).json({ message: "Server error generating salary slip", error: error.message });
    }
};

export const getPayrollHistory = async (req, res) => {
    try {
        const { staffId } = req.params;
        const payrollHistory = await Payroll.find({ staffId }).sort({ generatedDate: -1 });
        res.status(200).json(payrollHistory);
    } catch (error) {
        console.error("Error fetching payroll history:", error);
        res.status(500).json({ message: "Server error fetching payroll history", error: error.message });
    }
};

export const updatePayrollItem = async (req, res) => {
    try {
        const { payrollId, itemId } = req.params;
        const updatedItemData = req.body; // { label, amount, type }

        const payroll = await Payroll.findById(payrollId);
        if (!payroll) {
            return res.status(404).json({ message: "Payroll record not found" });
        }

        let itemFound = false;
        // Check additions
        let itemIndex = payroll.additions.findIndex(item => item._id.toString() === itemId);
        if (itemIndex !== -1) {
            payroll.additions[itemIndex] = { ...payroll.additions[itemIndex].toObject(), ...updatedItemData };
            itemFound = true;
        } else {
            // Check deductions
            itemIndex = payroll.deductions.findIndex(item => item._id.toString() === itemId);
            if (itemIndex !== -1) {
                payroll.deductions[itemIndex] = { ...payroll.deductions[itemIndex].toObject(), ...updatedItemData };
                itemFound = true;
            }
        }

        if (!itemFound) {
            return res.status(404).json({ message: "Payroll item not found" });
        }

        // Recalculate net amount
        payroll.netAmount = calculateNetAmount(payroll);
        await payroll.save();
        res.status(200).json({ message: "Payroll item updated successfully", payroll });
    } catch (error) {
        console.error("Error updating payroll item:", error);
        res.status(500).json({ message: "Server error updating payroll item", error: error.message });
    }
};

export const addPayrollItem = async (req, res) => {
    try {
        const { payrollId } = req.params;
        const newItemData = req.body; // { label, amount, type }

        const payroll = await Payroll.findById(payrollId);
        if (!payroll) {
            return res.status(404).json({ message: "Payroll record not found" });
        }

        if (newItemData.type === 'addition') {
            payroll.additions.push(newItemData);
        } else if (newItemData.type === 'deduction') {
            payroll.deductions.push(newItemData);
        } else {
            return res.status(400).json({ message: "Invalid payroll item type. Must be 'addition' or 'deduction'." });
        }

        // Recalculate net amount
        payroll.netAmount = calculateNetAmount(payroll);
        await payroll.save();
        res.status(201).json({ message: "Payroll item added successfully", payroll });
    } catch (error) {
        console.error("Error adding payroll item:", error);
        res.status(500).json({ message: "Server error adding payroll item", error: error.message });
    }
};

export const deletePayrollItem = async (req, res) => {
    try {
        const { payrollId, itemId } = req.params;

        const payroll = await Payroll.findById(payrollId);
        if (!payroll) {
            return res.status(404).json({ message: "Payroll record not found" });
        }

        const initialAdditionsLength = payroll.additions.length;
        payroll.additions = payroll.additions.filter(item => item._id.toString() !== itemId);

        const initialDeductionsLength = payroll.deductions.length;
        payroll.deductions = payroll.deductions.filter(item => item._id.toString() !== itemId);

        if (payroll.additions.length === initialAdditionsLength && payroll.deductions.length === initialDeductionsLength) {
            return res.status(404).json({ message: "Payroll item not found" });
        }

        // Recalculate net amount
        payroll.netAmount = calculateNetAmount(payroll);
        await payroll.save();
        res.status(200).json({ message: "Payroll item deleted successfully", payroll });
    } catch (error) {
        console.error("Error deleting payroll item:", error);
        res.status(500).json({ message: "Server error deleting payroll item", error: error.message });
    }
};

// Helper function to calculate net amount
const calculateNetAmount = (payroll) => {
    let totalAdditions = payroll.baseSalary + payroll.manualBonus;
    payroll.additions.forEach(item => {
        totalAdditions += item.amount;
    });

    let totalDeductions = payroll.manualDeduction;
    payroll.deductions.forEach(item => {
        totalDeductions += item.amount;
    });

    return totalAdditions - totalDeductions;
};
