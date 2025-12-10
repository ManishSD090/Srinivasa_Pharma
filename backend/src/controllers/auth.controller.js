import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { generateAuthToken } from "../utils/jwt.js";
import passport from "passport"; // Import passport
import { safeUser } from "../utils/user.utils.js"; // Minor Issue: Import safeUser helper

export const registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Please enter all required fields: name, email, password" });
        }

        // Fix Issue 8: Simple password validation (min length)
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }

        // Fix Issue 4: Role validation - only admin can assign 'admin' role
        if (role === 'admin' && (!req.user || req.user.role !== 'admin')) {
            return res.status(403).json({ message: "Forbidden: Only admins can assign the 'admin' role" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "User with this email already exists" });
        }

        const user = await User.create({ name, email, password, role });
        
        res.status(201).json({
            message: "User registered successfully",
            user: safeUser(user), // Minor Issue: Use safeUser helper
        });
    } catch (error) {
        console.error("Error during user registration:", error);
        res.status(500).json({ message: "Server error during registration", error: error.message });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Please enter email and password" });
        }

        const user = await User.findOne({ email }).select('+password'); // Select password explicitly
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        
        const token = generateAuthToken(user._id, user.role);

        res.json({
            message: "Login successful",
            user: safeUser(user), // Minor Issue: Use safeUser helper
            token,
        });
    } catch (error) {
        console.error("Error during user login:", error);
        res.status(500).json({ message: "Server error during login", error: error.message });
    }
};

export const getCurrentUser = async (req, res) => {
    try {
        const { userId } = req.user;
        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({ user: safeUser(user) }); // Minor Issue: Use safeUser helper, removed console.log
    } catch (error) {
        console.error("Error fetching current user:", error);
        res.status(500).json({ message: "Server error fetching user", error: error.message });
    }
};

// This function might not be directly used if Passport.js is removed or simplified.
// Keeping it for now, but will likely be adjusted when passport.js is fully integrated or removed.
export const authSuccess = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: "Authentication failed" });
    }

    const token = generateAuthToken(req.user._id, req.user.role);

    res.json({
        message: "Login successful",
        user: safeUser(req.user), // Minor Issue: Use safeUser helper
        token,
    });
};

export const logoutUser = (req, res) => {
    // Fix Issue 7: For JWT based authentication, logout is primarily client-side.
    // Returning 204 No Content as per recommendation to reduce payload.
    res.status(204).send();
};
