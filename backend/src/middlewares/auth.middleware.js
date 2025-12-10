import { verifyAuthToken } from "../utils/jwt.js";
import { User } from "../models/user.model.js";

export const authenticate = async (req, res, next) => { // Make function async
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        return res.status(401).json({ message: "No token, authorization denied" });
    }

    try {
        const decoded = await verifyAuthToken(token); // Fix Issue 2: Make JWT verification async
        if (!decoded) {
            return res.status(401).json({ message: "Token is not valid" });
        }
        req.user = decoded; // Attach user info (userId, role) to the request
        next();
    } catch (error) {
        // Removing logs as per suggestion for production readiness, can re-add conditionally if needed.
        res.status(401).json({ message: "Token is not valid", error: error.message });
    }
};

export const authorize = (roles = []) => {
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(403).json({ message: "User role not found, authorization denied" });
        }

        if (roles.length && !roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Forbidden: You do not have the necessary permissions" });
        }
        next();
    };
};
