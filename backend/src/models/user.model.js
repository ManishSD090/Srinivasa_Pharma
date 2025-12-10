import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
    {
        googleId: { // Add Google ID for Passport.js
            type: String,
            required: false, // Not required for local registration
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            index: true, // Fix Issue 3: Add index to email field
        },
        password: {
            type: String,
            required: false, // Not required for Google-registered users
            minlength: 6,
            select: false,
        },
        role: {
            type: String,
            enum: ['admin', 'staff'],
            default: 'staff',
        },
        phone: {
            type: String,
            trim: true,
            required: false,
        },
        joiningDate: {
            type: Date,
            required: false,
        },
        salary: {
            type: Number,
            required: false,
        },
        status: {
            type: String,
            enum: ['Active', 'On Leave', 'Resigned'],
            default: 'Active',
        },
        avatar: { // Add avatar for Google users
            type: String,
            required: false,
        },
    },
    { timestamps: true }
);

// Hash the password before saving the user, only if password field is present and modified
userSchema.pre("save", async function (next) {
    if (this.password && this.isModified("password")) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
    if (!this.password) return false; // No password to compare if Google registered
    return await bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model("User", userSchema);
