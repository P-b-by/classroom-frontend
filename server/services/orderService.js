// server/services/orderService.js
// Order service for business logic
import Order from '../models/Order.js';
import emailService from './emailService.js';
import logger from '../utils/logger.js';
import { formatOrder } from '../utils/index.js';

class OrderService {
  /**
   * Create a new order
   * @param {Object} orderData - Order data
   * @returns {Promise<Object>} - Created order
   */
  async createOrder(orderData) {
    try {
      logger.logDb('create', 'Order', { customerEmail: orderData.customerEmail });

      const order = new Order({
        customerName: orderData.customerName,
        customerEmail: orderData.customerEmail,
        customerPhone: orderData.customerPhone,
        shippingAddress: orderData.shippingAddress,
        items: orderData.items,
        total: orderData.total,
        status: 'pending',
      });

      const savedOrder = await order.save();

      // Send order confirmation email
      await emailService.sendOrderConfirmation(savedOrder);

      logger.info('Order created successfully', { orderId: savedOrder.id });
      return formatOrder(savedOrder);
    } catch (error) {
      logger.error('Failed to create order', { error: error.message });
      throw error;
    }
  }

  /**
   * Get all orders with pagination
   * @param {Object} filters - Filter criteria
   * @param {Object} options - Query options
   * @returns {Promise<Array>} - Orders
   */
  async getOrders(filters = {}, options = {}) {
    try {
      const { page = 1, limit = 20, sort = { createdAt: -1 } } = options;
      const { status, customerEmail } = filters;

      const query = {};
      if (status) query.status = status;
      if (customerEmail) query.customerEmail = customerEmail;

      logger.logDb('find', 'Order', { query, options });

      const orders = await Order.find(query)
        .sort(sort)
        .limit(limit)
        .skip((page - 1) * limit)
        .lean();

      const total = await Order.countDocuments(query);

      logger.info('Orders retrieved successfully', { count: orders.length });
      return {
        data: orders.map(formatOrder),
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Failed to retrieve orders', { error: error.message });
      throw error;
    }
  }

  /**
   * Get order by ID
   * @param {string} id - Order ID
   * @returns {Promise<Object>} - Order
   */
  async getOrderById(id) {
    try {
      logger.logDb('findOne', 'Order', { id });

      const order = await Order.findById(id);
      if (!order) {
        throw new Error('Order not found');
      }

      return formatOrder(order);
    } catch (error) {
      logger.error('Failed to retrieve order', { error: error.message, id });
      throw error;
    }
  }

  /**
   * Update order status
   * @param {string} id - Order ID
   * @param {string} status - New status
   * @returns {Promise<Object>} - Updated order
   */
  async updateOrderStatus(id, status) {
    try {
      logger.logDb('update', 'Order', { id, status });

      const order = await Order.findById(id);
      if (!order) {
        throw new Error('Order not found');
      }

      const validStatuses = ['pending', 'confirmed', 'delivered', 'cancelled'];
      if (!validStatuses.includes(status.toLowerCase())) {
        throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
      }

      await order.updateStatus(status.toLowerCase());

      // Send confirmation email if order is confirmed
      if (status.toLowerCase() === 'confirmed') {
        await emailService.sendOrderConfirmation(order);
      }

      logger.info('Order status updated successfully', { id, status });
      return formatOrder(order);
    } catch (error) {
      logger.error('Failed to update order status', { error: error.message, id, status });
      throw error;
    }
  }

  /**
   * Delete order
   * @param {string} id - Order ID
   * @returns {Promise<boolean>} - Success status
   */
  async deleteOrder(id) {
    try {
      logger.logDb('delete', 'Order', { id });

      const result = await Order.findByIdAndDelete(id);
      if (!result) {
        throw new Error('Order not found');
      }

      logger.info('Order deleted successfully', { id });
      return true;
    } catch (error) {
      logger.error('Failed to delete order', { error: error.message, id });
      throw error;
    }
  }

  /**
   * Get order statistics
   * @returns {Promise<Object>} - Order statistics
   */
  async getOrderStatistics() {
    try {
      const [
        totalOrders,
        pendingOrders,
        confirmedOrders,
        deliveredOrders,
        cancelledOrders,
        totalRevenue,
      ] = await Promise.all([
        Order.countDocuments(),
        Order.countDocuments({ status: 'pending' }),
        Order.countDocuments({ status: 'confirmed' }),
        Order.countDocuments({ status: 'delivered' }),
        Order.countDocuments({ status: 'cancelled' }),
        Order.aggregate([
          { $group: { _id: null, total: { $sum: '$total' } } },
        ]),
      ]);

      return {
        totalOrders,
        pendingOrders,
        confirmedOrders,
        deliveredOrders,
        cancelledOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
      };
    } catch (error) {
      logger.error('Failed to get order statistics', { error: error.message });
      throw error;
    }
  }
}

export default new OrderService();