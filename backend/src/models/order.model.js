import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
    itemName: {
        type: String,
        required: true,
        trim: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
    },
    advance: {
        type: Number,
        required: true,
        min: 0,
    },
    distributor: {
        type: String,
        required: true,
        trim: true,
    },
});

const orderSchema = new mongoose.Schema(
    {
        date: {
            type: Date,
            required: true,
            default: Date.now,
        },
        phone: {
            type: String,
            required: true,
            trim: true,
        },
        items: [orderItemSchema], // Array of OrderItem
        customerName: {
            type: String,
            trim: true,
            required: false,
        },
        // Potentially link to a staff member who created the order
        // createdBy: {
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: 'User',
        //     required: true
        // }
    },
    { timestamps: true }
);

export const Order = mongoose.model("Order", orderSchema);
export const OrderItem = mongoose.model("OrderItem", orderItemSchema);
