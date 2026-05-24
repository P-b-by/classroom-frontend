// server/database/index.js
// Database connection and configuration
import mongoose from 'mongoose';
import config from '../config/index.js';
import logger from '../utils/logger.js';

class Database {
  constructor() {
    this.connection = null;
    this.isConnected = false;
  }

  /**
   * Connect to MongoDB
   */
  async connect() {
    try {
      logger.info('Connecting to MongoDB...');
      
      await mongoose.connect(config.database.uri, config.database.options);
      
      this.isConnected = true;
      logger.info('Connected to MongoDB successfully');
      
      // Connection event listeners
      mongoose.connection.on('error', (err) => {
        logger.error('MongoDB connection error', { error: err.message });
        this.isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected');
        this.isConnected = false;
      });

      mongoose.connection.on('reconnected', () => {
        logger.info('MongoDB reconnected');
        this.isConnected = true;
      });

      return true;
    } catch (error) {
      logger.error('Failed to connect to MongoDB', { error: error.message });
      throw error;
    }
  }

  /**
   * Disconnect from MongoDB
   */
  async disconnect() {
    try {
      await mongoose.connection.close();
      logger.info('Disconnected from MongoDB');
      this.isConnected = false;
      return true;
    } catch (error) {
      logger.error('Failed to disconnect from MongoDB', { error: error.message });
      throw error;
    }
  }

  /**
   * Check if connected
   */
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      state: mongoose.connection.readyState,
      host: mongoose.connection.host,
      name: mongoose.connection.name,
    };
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      if (!this.isConnected) {
        throw new Error('Database not connected');
      }

      // Ping the database
      await mongoose.connection.db.admin().ping();
      
      return {
        status: 'healthy',
        responseTime: 0, // Can be measured if needed
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
      };
    }
  }
}

const database = new Database();

export default database;