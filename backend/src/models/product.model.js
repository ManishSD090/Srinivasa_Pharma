import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        currentStock: {
            type: Number,
            required: true,
            min: 0,
        },
        reorderLevel: {
            type: Number,
            required: true,
            min: 0,
        },
        expiryDate: {
            type: Date,
            required: false,
        },
        distributor: {
            type: String,
            trim: true,
            required: false,
        },
        costPrice: {
            type: Number,
            min: 0,
            required: false,
        },
        sellingPrice: {
            type: Number,
            min: 0,
            required: false,
        },
        batchNumber: {
            type: String,
            trim: true,
            required: false,
        },
        shelfLocation: {
            type: String,
            trim: true,
            required: false,
        },
    },
    { timestamps: true }
);

export const Product = mongoose.model("Product", productSchema);
