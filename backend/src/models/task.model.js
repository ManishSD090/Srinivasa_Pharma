import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // Could be 'Staff' if preferred
            required: false, // Can be null if 'Open for volunteer'
        },
        priority: {
            type: String,
            enum: ['Low', 'Medium', 'High'],
            default: 'Medium',
        },
        dueDate: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: ['Not Started', 'In Progress', 'Completed', 'Overdue'],
            default: 'Not Started',
        },
        assignedById: { // Admin who created it
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    { timestamps: true }
);

export const Task = mongoose.model("Task", taskSchema);
