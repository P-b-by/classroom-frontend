import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext.jsx';
import { formatDate } from '../utils/formatBlogContent.jsx';
import './Blog.css';

export default function Blog() {
  const { blogPosts } = useStore();
  const sorted = [...blogPosts].sort(
    (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt),
  );

  return (
    <div className="blog-page">
      <div className="page-hero-bar">
        <div className="container">
          <span className="section-label">Journal</span>
          <h1 className="page-title">The Domas Blog</h1>
          <div className="gold-line" />
          <p className="page-subtitle">
            Style guides, footwear tips, and stories from the world of fashion and confidence.
          </p>
        </div>
      </div>

      <div className="container blog-list-wrap">
        {sorted.length === 0 ? (
          <div className="empty-state blog-empty">
            <h3>No articles yet</h3>
            <p>Check back soon for style tips and footwear insights.</p>
          </div>
        ) : (
          <div className="blog-grid">
            {sorted.map((post, index) => (
              <article
                key={post.id}
                className={`blog-card ${index === 0 ? 'blog-card--featured' : ''}`}
              >
                <Link to={`/blog/${post.slug}`} className="blog-card-link">
                  <div className="blog-card-image">
                    <img src={post.image} alt="" loading="lazy" />
                  </div>
                  <div className="blog-card-body">
                    <span className="blog-card-meta">
                      <span className="badge badge-gold">{post.category}</span>
                      <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
                    </span>
                    <h2>{post.title}</h2>
                    <p>{post.excerpt}</p>
                    <span className="blog-read-more">Read Article →</span>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
