import { Router } from "express";
import { registerUser, loginUser, getCurrentUser, logoutUser, authSuccess } from "../controllers/auth.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import passport from "passport"; // Import passport
import rateLimit from "express-rate-limit"; // Fix Issue 5: Import express-rate-limit

const router = Router();

// Fix Issue 5: Rate limiting for login attempts
const loginRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login requests per windowMs
    message: "Too many login attempts from this IP, please try again after 15 minutes",
    handler: (req, res, next) => {
        res.status(429).json({ message: "Too many login attempts from this IP, please try again after 15 minutes" });
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

router.post("/register", authenticate, authorize(['admin']), registerUser); // Only admin can register new users
router.post("/login", loginRateLimiter, loginUser); // Apply rate limiter to login route

// Google OAuth routes
router.get("/google", passport.authenticate("google", { scope: ["email"], session: false })); // Minor Issue: Reduce scope
router.get(
    "/google/callback",
    passport.authenticate("google", {
        failureRedirect: "/login-failed",
        session: false, // Fix Issue 6: Disable session
    }),
    authSuccess // Will handle JWT generation after successful Google auth
);

router.get("/logout", logoutUser); // Client-side token discard
router.get("/me", authenticate, getCurrentUser);

export default router;
