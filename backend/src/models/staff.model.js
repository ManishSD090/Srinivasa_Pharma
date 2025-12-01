import mongoose from "mongoose";

const staffSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        name: { // Redundant if linking to User, but kept for clarity as per README
            type: String,
            required: true,
            trim: true,
        },
        phone: {
            type: String,
            trim: true,
            required: true,
        },
        salary: {
            type: Number,
            required: true,
            min: 0,
        },
        joiningDate: {
            type: Date,
            required: true,
        },
        leavingDate: {
            type: Date,
            required: false,
        },
        status: {
            type: String,
            enum: ['Active', 'On Leave', 'Resigned'],
            default: 'Active',
        },
        role: { // Specific role within staff, distinct from general 'admin'/'staff' in User model
            type: String,
            enum: ['Pharmacist', 'Assistant', 'Manager', 'Other'],
            default: 'Assistant',
        },
    },
    { timestamps: true }
);

export const Staff = mongoose.model("Staff", staffSchema);
