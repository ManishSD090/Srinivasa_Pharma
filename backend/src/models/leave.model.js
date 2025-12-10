import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema(
    {
        staffId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Staff', // or 'User' if Staff is not a separate collection
            required: true,
        },
        type: {
            type: String,
            enum: ['Sick Leave', 'Personal Leave', 'Vacation', 'Other'],
            required: true,
        },
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: ['Pending', 'Approved', 'Rejected'],
            default: 'Pending',
        },
        reason: {
            type: String,
            trim: true,
            required: false,
        },
        requestedDate: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

export const Leave = mongoose.model("Leave", leaveSchema);
