import { Link, useParams } from 'react-router-dom';
import { useStore } from '../context/StoreContext.jsx';
import { formatBlogContent, formatDate } from '../utils/formatBlogContent.jsx';
import './Blog.css';

export default function BlogPost() {
  const { slug } = useParams();
  const { getBlogPostBySlug, blogPosts } = useStore();
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return (
      <div className="blog-page">
        <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
          <div style={{ marginBottom: '2rem' }}>
            <span style={{ fontSize: '4rem', opacity: 0.3 }}>✦</span>
          </div>
          <h1 className="page-title">Article not found</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
            The article you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/blog" className="btn btn-gold">
            Back to Journal
          </Link>
        </div>
      </div>
    );
  }

  const related = blogPosts
    .filter((p) => p.id !== post.id && p.category === post.category)
    .slice(0, 2);

  return (
    <article className="blog-post-page">
      <header className="blog-post-hero">
        <img src={post.image} alt="" className="blog-post-hero-img" />
        <div className="blog-post-hero-overlay" />
        <div className="container blog-post-hero-content">
          <Link to="/blog" className="blog-back">Back to Journal</Link>
          <div style={{ margin: '1rem 0' }}>
            <span className="badge badge-gold" style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}>
              {post.category}
            </span>
          </div>
          <h1>{post.title}</h1>
          <div className="blog-post-meta">
            <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
            <span>·</span>
            <span>{post.author}</span>
          </div>
        </div>
      </header>

      <div className="container blog-post-body">
        <div className="blog-post-content">{formatBlogContent(post.content)}</div>

        {related.length > 0 && (
          <aside className="blog-related">
            <h3>More in {post.category}</h3>
            <div className="blog-related-grid">
              {related.map((r) => (
                <Link key={r.id} to={`/blog/${r.slug}`} className="blog-related-card">
                  <img src={r.image} alt="" />
                  <span>{r.title}</span>
                </Link>
              ))}
            </div>
          </aside>
        )}
      </div>
    </article>
  );
}
