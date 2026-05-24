// server/services/blogService.js
// Blog service for business logic
import Blog from '../models/Blog.js';
import logger from '../utils/logger.js';
import { formatBlogPost } from '../utils/index.js';

class BlogService {
  /**
   * Get all blog posts with pagination
   * @param {Object} filters - Filter criteria
   * @param {Object} options - Query options
   * @returns {Promise<Object>} - Blog posts with pagination
   */
  async getBlogPosts(filters = {}, options = {}) {
    try {
      const { page = 1, limit = 20, sort = { publishedAt: -1 } } = options;
      const { category, author } = filters;

      const query = {};
      if (category) query.category = category;
      if (author) query.author = author;

      logger.logDb('find', 'Blog', { query, options });

      const [posts, total] = await Promise.all([
        Blog.find(query)
          .sort(sort)
          .limit(limit)
          .skip((page - 1) * limit)
          .lean(),
        Blog.countDocuments(query),
      ]);

      logger.info('Blog posts retrieved successfully', { count: posts.length });
      return {
        data: posts.map(formatBlogPost),
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Failed to retrieve blog posts', { error: error.message });
      throw error;
    }
  }

  /**
   * Get blog post by ID
   * @param {string} id - Blog post ID
   * @returns {Promise<Object>} - Blog post
   */
  async getBlogPostById(id) {
    try {
      logger.logDb('findOne', 'Blog', { id });

      const post = await Blog.findById(id).lean();
      if (!post) {
        throw new Error('Blog post not found');
      }

      return formatBlogPost(post);
    } catch (error) {
      logger.error('Failed to retrieve blog post', { error: error.message, id });
      throw error;
    }
  }

  /**
   * Create new blog post
   * @param {Object} postData - Blog post data
   * @returns {Promise<Object>} - Created blog post
   */
  async createBlogPost(postData) {
    try {
      logger.logDb('create', 'Blog', { title: postData.title });

      const post = new Blog({
        title: postData.title,
        content: postData.content,
        author: postData.author,
        category: postData.category,
        image: postData.image,
      });

      // Generate slug from title if not provided
      if (!post.slug) {
        post.slug = post.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
      }

      const savedPost = await post.save();

      logger.info('Blog post created successfully', { postId: savedPost.id });
      return formatBlogPost(savedPost);
    } catch (error) {
      logger.error('Failed to create blog post', { error: error.message });
      throw error;
    }
  }

  /**
   * Update blog post
   * @param {string} id - Blog post ID
   * @param {Object} updates - Blog post updates
   * @returns {Promise<Object>} - Updated blog post
   */
  async updateBlogPost(id, updates) {
    try {
      logger.logDb('update', 'Blog', { id, updates });

      // Update slug if title is updated and no explicit slug provided
      if (updates.title && !updates.slug) {
        updates.slug = updates.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
      }

      const post = await Blog.findByIdAndUpdate(
        id,
        updates,
        { new: true, runValidators: true }
      );

      if (!post) {
        throw new Error('Blog post not found');
      }

      logger.info('Blog post updated successfully', { postId: post.id });
      return formatBlogPost(post);
    } catch (error) {
      logger.error('Failed to update blog post', { error: error.message, id });
      throw error;
    }
  }

  /**
   * Delete blog post
   * @param {string} id - Blog post ID
   * @returns {Promise<boolean>} - Success status
   */
  async deleteBlogPost(id) {
    try {
      logger.logDb('delete', 'Blog', { id });

      const result = await Blog.findByIdAndDelete(id);
      if (!result) {
        throw new Error('Blog post not found');
      }

      logger.info('Blog post deleted successfully', { id });
      return true;
    } catch (error) {
      logger.error('Failed to delete blog post', { error: error.message, id });
      throw error;
    }
  }

  /**
   * Get blog statistics
   * @returns {Promise<Object>} - Blog statistics
   */
  async getBlogStatistics() {
    try {
      const [totalPosts, totalAuthors, totalCategories] = await Promise.all([
        Blog.countDocuments(),
        Blog.distinct('author'),
        Blog.distinct('category'),
      ]);

      return {
        totalPosts,
        totalAuthors: totalAuthors.length,
        totalCategories: totalCategories.length,
      };
    } catch (error) {
      logger.error('Failed to get blog statistics', { error: error.message });
      throw error;
    }
  }
}

export default new BlogService();