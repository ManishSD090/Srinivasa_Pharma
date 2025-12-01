import { Order } from "../models/order.model.js";

export const getAllOrders = async (req, res) => {
    try {
        const { role, userId } = req.user;
        let query = {};

        // Staff can only see their related orders (if order model is linked to staff)
        // For now, assuming staff can see all orders unless a specific linkage is implemented
        if (role === 'staff') {
            // If orders were linked to staff, the query would be like:
            // query = { createdBy: userId };
            // For now, staff also sees all orders or we need to refine this based on frontend interaction
        }

        const orders = await Order.find(query);
        res.status(200).json(orders);
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ message: "Server error fetching orders", error: error.message });
    }
};

export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const { role, userId } = req.user;

        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Add authorization check if staff can only view their own orders
        // if (role === 'staff' && order.createdBy.toString() !== userId) {
        //     return res.status(403).json({ message: "Forbidden: You do not have access to this order" });
        // }

        res.status(200).json(order);
    } catch (error) {
        console.error("Error fetching order by ID:", error);
        res.status(500).json({ message: "Server error fetching order", error: error.message });
    }
};

export const createOrder = async (req, res) => {
    try {
        const { date, phone, items, customerName } = req.body;
        
        if (!date || !phone || !items || items.length === 0) {
            return res.status(400).json({ message: "Please provide date, phone, and at least one item for the order" });
        }

        // Add createdBy: req.user.userId if tracking who created the order
        const newOrder = await Order.create({ date, phone, items, customerName });
        res.status(201).json({ message: "Order created successfully", order: newOrder });
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ message: "Server error creating order", error: error.message });
    }
};

export const updateOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { role, userId } = req.user;
        const updatedData = req.body;

        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Add authorization check if staff can only update their own orders
        // if (role === 'staff' && order.createdBy.toString() !== userId) {
        //     return res.status(403).json({ message: "Forbidden: You do not have access to update this order" });
        // }

        const result = await Order.findByIdAndUpdate(id, updatedData, { new: true, runValidators: true });
        res.status(200).json({ message: "Order updated successfully", order: result });
    } catch (error) {
        console.error("Error updating order:", error);
        res.status(500).json({ message: "Server error updating order", error: error.message });
    }
};

export const deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { role, userId } = req.user;

        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Add authorization check if staff can only delete their own orders
        // if (role === 'staff' && order.createdBy.toString() !== userId) {
        //     return res.status(403).json({ message: "Forbidden: You do not have access to delete this order" });
        // }

        await Order.findByIdAndDelete(id);
        res.status(200).json({ message: "Order deleted successfully" });
    } catch (error) {
        console.error("Error deleting order:", error);
        res.status(500).json({ message: "Server error deleting order", error: error.message });
    }
};

export const getOrdersByStaff = async (req, res) => {
    try {
        const { staffId } = req.params; // Or req.user.userId if current staff's orders
        const orders = await Order.find({ /* Assuming a 'staffId' field in Order model */ });
        res.status(200).json(orders);
    } catch (error) {
        console.error("Error fetching staff orders:", error);
        res.status(500).json({ message: "Server error fetching staff orders", error: error.message });
    }
};
