import mongoose from "mongoose";

const payrollItemSchema = new mongoose.Schema({
    label: {
        type: String,
        required: true,
        trim: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    type: {
        type: String,
        enum: ['addition', 'deduction'],
        required: true,
    },
});

const payrollSchema = new mongoose.Schema(
    {
        staffId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // or 'Staff'
            required: true,
        },
        month: {
            type: String,
            required: true,
            trim: true,
        },
        generatedDate: {
            type: Date,
            default: Date.now,
        },
        baseSalary: {
            type: Number,
            required: true,
            min: 0,
        },
        additions: [payrollItemSchema],
        deductions: [payrollItemSchema],
        manualBonus: {
            type: Number,
            default: 0,
            min: 0,
        },
        manualDeduction: {
            type: Number,
            default: 0,
            min: 0,
        },
        netAmount: {
            type: Number,
            required: true,
            min: 0,
        },
        status: {
            type: String,
            enum: ['Paid', 'Unpaid'],
            default: 'Unpaid',
        },
        notes: {
            type: String,
            trim: true,
            required: false,
        },
    },
    { timestamps: true }
);

export const Payroll = mongoose.model("Payroll", payrollSchema);
export const PayrollItem = mongoose.model("PayrollItem", payrollItemSchema);
