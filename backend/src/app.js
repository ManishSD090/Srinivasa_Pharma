import express from "express";
import session from "express-session";
import passport from "./config/passport.js";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import orderRoutes from "./routes/order.routes.js";
import inventoryRoutes from "./routes/inventory.routes.js";
import staffRoutes from "./routes/staff.routes.js";
import taskRoutes from "./routes/task.routes.js";
import payrollRoutes from "./routes/payroll.routes.js";

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

app.use(
    session({
        secret: process.env.JWT_SECRET,
        resave: false,
        saveUninitialized: false,
    })
);

app.use(passport.initialize());
app.use(passport.session());

// Base routes
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api", payrollRoutes); // Payroll and Attendance routes share the base /api path for their specific sub-paths

export default app;
