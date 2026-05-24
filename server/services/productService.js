// server/services/productService.js
// Product service for business logic
import Product from '../models/Product.js';
import logger from '../utils/logger.js';
import { formatProduct } from '../utils/index.js';

class ProductService {
  /**
   * Get all products with pagination and filtering
   * @param {Object} filters - Filter criteria
   * @param {Object} options - Query options
   * @returns {Promise<Object>} - Products with pagination
   */
  async getProducts(filters = {}, options = {}) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        sort = { createdAt: -1 },
        category,
        search,
      } = options;

      const query = {};
      if (category) query.category = category;
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ];
      }

      logger.logDb('find', 'Product', { query, options });

      const [products, total] = await Promise.all([
        Product.find(query)
          .sort(sort)
          .limit(limit)
          .skip((page - 1) * limit)
          .lean(),
        Product.countDocuments(query),
      ]);

      logger.info('Products retrieved successfully', { count: products.length });
      return {
        data: products.map(formatProduct),
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Failed to retrieve products', { error: error.message });
      throw error;
    }
  }

  /**
   * Get product by ID
   * @param {string} id - Product ID
   * @returns {Promise<Object>} - Product
   */
  async getProductById(id) {
    try {
      logger.logDb('findOne', 'Product', { id });

      const product = await Product.findById(id).lean();
      if (!product) {
        throw new Error('Product not found');
      }

      return formatProduct(product);
    } catch (error) {
      logger.error('Failed to retrieve product', { error: error.message, id });
      throw error;
    }
  }

  /**
   * Create new product
   * @param {Object} productData - Product data
   * @returns {Promise<Object>} - Created product
   */
  async createProduct(productData) {
    try {
      logger.logDb('create', 'Product', { title: productData.title });

      const product = new Product({
        title: productData.title,
        name: productData.name,
        price: productData.price,
        description: productData.description,
        image: productData.image,
        category: productData.category,
        sizes: productData.sizes || [],
      });

      const savedProduct = await product.save();

      logger.info('Product created successfully', { productId: savedProduct.id });
      return formatProduct(savedProduct);
    } catch (error) {
      logger.error('Failed to create product', { error: error.message });
      throw error;
    }
  }

  /**
   * Update product
   * @param {string} id - Product ID
   * @param {Object} updates - Product updates
   * @returns {Promise<Object>} - Updated product
   */
  async updateProduct(id, updates) {
    try {
      logger.logDb('update', 'Product', { id, updates });

      const product = await Product.findByIdAndUpdate(
        id,
        updates,
        { new: true, runValidators: true }
      );

      if (!product) {
        throw new Error('Product not found');
      }

      logger.info('Product updated successfully', { productId: product.id });
      return formatProduct(product);
    } catch (error) {
      logger.error('Failed to update product', { error: error.message, id });
      throw error;
    }
  }

  /**
   * Delete product
   * @param {string} id - Product ID
   * @returns {Promise<boolean>} - Success status
   */
  async deleteProduct(id) {
    try {
      logger.logDb('delete', 'Product', { id });

      const result = await Product.findByIdAndDelete(id);
      if (!result) {
        throw new Error('Product not found');
      }

      logger.info('Product deleted successfully', { id });
      return true;
    } catch (error) {
      logger.error('Failed to delete product', { error: error.message, id });
      throw error;
    }
  }

  /**
   * Get product statistics
   * @returns {Promise<Object>} - Product statistics
   */
  async getProductStatistics() {
    try {
      const [
        totalProducts,
        totalCategories,
        averagePrice,
        priceRange,
      ] = await Promise.all([
        Product.countDocuments(),
        Product.distinct('category'),
        Product.aggregate([
          { $group: { _id: null, avgPrice: { $avg: '$price' } } },
        ]),
        Product.aggregate([
          { $group: { _id: null, minPrice: { $min: '$price' }, maxPrice: { $max: '$price' } } },
        ]),
      ]);

      return {
        totalProducts,
        totalCategories: totalCategories.length,
        averagePrice: averagePrice[0]?.avgPrice || 0,
        minPrice: priceRange[0]?.minPrice || 0,
        maxPrice: priceRange[0]?.maxPrice || 0,
      };
    } catch (error) {
      logger.error('Failed to get product statistics', { error: error.message });
      throw error;
    }
  }
}

export default new ProductService();