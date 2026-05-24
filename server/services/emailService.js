// server/services/emailService.js
// Email service for sending notifications
import config from '../config/index.js';
import logger from '../utils/logger.js';

class EmailService {
  constructor() {
    this.transporter = null;
    this.enabled = false;
    this.initialize();
  }

  /**
   * Initialize email transporter
   */
  initialize() {
    if (!config.email.user || !config.email.pass) {
      logger.warn('Email credentials not configured, email notifications disabled');
      return;
    }

    this.transporter = {
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure,
      auth: {
        user: config.email.user,
        pass: config.email.pass,
      },
    };

    this.enabled = true;
    logger.info('Email service initialized');
  }

  /**
   * Send order confirmation email
   * @param {Object} order - Order object
   */
  async sendOrderConfirmation(order) {
    if (!this.enabled) {
      logger.info('Email notifications disabled, skipping order email');
      return;
    }

    if (!order.customerEmail) {
      logger.warn('No customer email provided, skipping email');
      return;
    }

    const isConfirmed = order.status === 'confirmed';
    const emailTitle = isConfirmed ? 'Order Confirmed' : 'Order Received';
    const emailMessage = isConfirmed 
      ? 'We\'re pleased to confirm that your order has been confirmed and is being processed.'
      : 'We\'ve received your order and we\'ll process it shortly.';

    try {
      const mailOptions = {
        from: config.email.from,
        to: order.customerEmail,
        subject: `${emailTitle} - Domas Ventures`,
        html: this.generateOrderEmailTemplate(order, isConfirmed),
      };

      // In a real implementation, you would use nodemailer here
      // await this.transporter.sendMail(mailOptions);
      
      logger.info('Order email sent successfully', { orderId: order.id });
      return true;
    } catch (error) {
      logger.error('Failed to send order email', { error: error.message });
      return false;
    }
  }

  /**
   * Generate HTML email template
   * @param {Object} order - Order object
   * @param {boolean} isConfirmed - Whether order is confirmed
   * @returns {string} - HTML email template
   */
  generateOrderEmailTemplate(order, isConfirmed) {
    const orderId = order.id || order._id?.slice(-6).toUpperCase() || 'N/A';
    
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: #c59d3b; margin: 0; font-size: 28px;">Domas Ventures</h1>
          <p style="color: rgba(255,255,255,0.7); margin: 5px 0 0;">Luxury Footwear</p>
        </div>
        <div style="background: #f8f6f3; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #0a0a0a; margin-top: 0;">${emailTitle}!</h2>
          <p style="color: #666;">Dear ${order.customerName},</p>
          <p style="color: #666;">${emailMessage} Thank you for shopping with Domas Ventures.</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e0e0e0;">
            <h3 style="color: #0a0a0a; margin-top: 0;">Order Details:</h3>
            <p style="color: #666;"><strong>Order ID:</strong> ${orderId}</p>
            <p style="color: #666;"><strong>Total:</strong> KES ${(order.total || 0).toLocaleString()}</p>
            <p style="color: #666;"><strong>Status:</strong> ${order.status || 'Pending'}</p>
          </div>

          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e0e0e0;">
            <h3 style="color: #0a0a0a; margin-top: 0;">Delivery Information:</h3>
            <p style="color: #666;"><strong>Address:</strong> ${order.shippingAddress?.street || 'N/A'}, ${order.shippingAddress?.city || 'N/A'}</p>
            <p style="color: #666;"><strong>Expected Delivery:</strong> Within 3 business days</p>
          </div>

          ${isConfirmed ? `
          <div style="background: linear-gradient(135deg, #c59d3b 0%, #e6d39a 100%); padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <p style="color: #0a0a0a; margin: 0; font-weight: bold;">🎉 Your order has been confirmed! We'll ship it to you within 3 business days.</p>
          </div>
          ` : ''}

          <p style="color: #666;">If you have any questions about your order, please don't hesitate to contact us.</p>
          
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #999; font-size: 12px;">© 2026 Domas Ventures. All rights reserved.</p>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Check if email service is enabled
   */
  isEnabled() {
    return this.enabled;
  }
}

export default new EmailService();