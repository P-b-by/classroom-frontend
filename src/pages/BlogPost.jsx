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
        <div className="container" style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
          <h1 className="page-title">Article not found</h1>
          <Link to="/blog" className="btn btn-gold" style={{ marginTop: '1.5rem' }}>
            Back to Blog
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
          <Link to="/blog" className="blog-back">← Journal</Link>
          <span className="badge badge-gold">{post.category}</span>
          <h1>{post.title}</h1>
          <p className="blog-post-meta">
            {formatDate(post.publishedAt)} · {post.author}
          </p>
        </div>
      </header>

      <div className="container blog-post-body">
        <div className="blog-post-content">{formatBlogContent(post.content)}</div>

        {related.length > 0 && (
          <aside className="blog-related">
            <h3>Related Articles</h3>
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
