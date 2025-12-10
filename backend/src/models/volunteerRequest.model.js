import mongoose from "mongoose";

const volunteerRequestSchema = new mongoose.Schema(
    {
        staffId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // or 'Staff'
            required: true,
        },
        taskId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Task',
            required: true,
        },
        status: {
            type: String,
            enum: ['Pending', 'Approved', 'Rejected'],
            default: 'Pending',
        },
        requestedDate: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

export const VolunteerRequest = mongoose.model("VolunteerRequest", volunteerRequestSchema);
