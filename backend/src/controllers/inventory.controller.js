import { Product } from "../models/product.model.js";
import { Order } from "../models/order.model.js"; // Assuming orders link to products for receiving

export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find({});
        res.status(200).json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ message: "Server error fetching products", error: error.message });
    }
};

export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json(product);
    } catch (error) {
        console.error("Error fetching product by ID:", error);
        res.status(500).json({ message: "Server error fetching product", error: error.message });
    }
};

export const createProduct = async (req, res) => {
    try {
        const { name, currentStock, reorderLevel, expiryDate, distributor, costPrice, sellingPrice, batchNumber, shelfLocation } = req.body;

        if (!name || currentStock === undefined || reorderLevel === undefined) {
            return res.status(400).json({ message: "Please provide product name, current stock, and reorder level" });
        }

        const existingProduct = await Product.findOne({ name });
        if (existingProduct) {
            return res.status(409).json({ message: "Product with this name already exists" });
        }

        const newProduct = await Product.create({
            name,
            currentStock,
            reorderLevel,
            expiryDate,
            distributor,
            costPrice,
            sellingPrice,
            batchNumber,
            shelfLocation,
        });
        res.status(201).json({ message: "Product created successfully", product: newProduct });
    } catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({ message: "Server error creating product", error: error.message });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedData = req.body;

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        const result = await Product.findByIdAndUpdate(id, updatedData, { new: true, runValidators: true });
        res.status(200).json({ message: "Product updated successfully", product: result });
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ message: "Server error updating product", error: error.message });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        await Product.findByIdAndDelete(id);
        res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ message: "Server error deleting product", error: error.message });
    }
};

export const recordReceivedItems = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { receivedItemsData } = req.body; // Array of { itemName, quantity }

        if (!orderId || !receivedItemsData || receivedItemsData.length === 0) {
            return res.status(400).json({ message: "Please provide order ID and received items data" });
        }

        // Optional: Verify order exists and is relevant
        // const order = await Order.findById(orderId);
        // if (!order) {
        //     return res.status(404).json({ message: "Order not found" });
        // }

        for (const item of receivedItemsData) {
            const product = await Product.findOne({ name: item.itemName });
            if (product) {
                product.currentStock += item.quantity;
                await product.save();
            } else {
                console.warn(`Product '${item.itemName}' not found during inventory update for order ${orderId}. Consider creating it.`);
                // Optionally, create the product or log an error
            }
        }

        res.status(200).json({ message: `Inventory updated for order ${orderId} successfully` });
    } catch (error) {
        console.error("Error recording received items:", error);
        res.status(500).json({ message: "Server error recording received items", error: error.message });
    }
};

export const generateStockAlerts = async (req, res) => {
    try {
        const lowStockProducts = await Product.find({
            $expr: { $lt: ["$currentStock", "$reorderLevel"] }
        });

        const expiringSoonProducts = await Product.find({
            expiryDate: { $gte: new Date(), $lte: new Date(new Date().setMonth(new Date().getMonth() + 3)) } // e.g., expiring within next 3 months
        });

        res.status(200).json({
            message: "Stock alerts generated",
            lowStock: lowStockProducts,
            expiringSoon: expiringSoonProducts,
        });
    } catch (error) {
        console.error("Error generating stock alerts:", error);
        res.status(500).json({ message: "Server error generating stock alerts", error: error.message });
    }
};
