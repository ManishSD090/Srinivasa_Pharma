import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
    {
        staffId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // or 'Staff'
            required: true,
        },
        date: {
            type: Date,
            required: true,
        },
        punchInTime: {
            type: Date,
            required: true,
        },
        punchOutTime: {
            type: Date,
            required: false, // Can be null if still punched in
        },
        status: {
            type: String,
            enum: ['present', 'absent', 'leave'],
            default: 'present',
        },
        totalHours: {
            type: Number,
            required: false, // Calculated after punch out
            min: 0,
        },
        adminComment: {
            type: String,
            trim: true,
            required: false,
        },
    },
    { timestamps: true }
);

export const Attendance = mongoose.model("Attendance", attendanceSchema);
