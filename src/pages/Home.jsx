import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useStore } from '../context/StoreContext.jsx';
import ProductCard from '../components/ProductCard.jsx';
import BrandLogo from '../components/BrandLogo.jsx';
import { formatDate } from '../utils/formatBlogContent.jsx';
import './Home.css';
import '../components/BrandLogo.css';

export default function Home() {
  const { products, blogPosts } = useStore();
  const featured = products.slice(0, 4);
  const latestPosts = [...blogPosts]
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
    .slice(0, 3);

  const [heroLoaded, setHeroLoaded] = useState(false);
  const heroImgRef = useRef(null);
  const emblemRef = useRef(null);

  useEffect(() => {
    // Parallax on scroll (kept lightweight)
    function onScroll() {
      const scrolled = window.scrollY || window.pageYOffset;
      if (heroImgRef.current) {
        heroImgRef.current.style.transform = `translateY(${scrolled * 0.16}px) scale(1.08)`;
      }
      if (emblemRef.current) {
        emblemRef.current.style.transform = `translateY(${Math.max(-50, -scrolled * 0.08)}px)`;
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });

    // IntersectionObserver: reveal hero copy and product tiles when in view
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            // if it's the grid, also reveal children with stagger
            if (entry.target.classList.contains('grid-products')) {
              Array.from(entry.target.children).forEach((child, i) => {
                child.classList.add('in-view');
                child.style.animationDelay = `${160 + i * 80}ms`;
              });
            }
            // once revealed, unobserve for performance
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );

    const heroCopy = document.querySelector('.hero-copy');
    const grid = document.querySelector('.grid-products');
    if (heroCopy) heroCopy.classList.add('reveal');
    if (heroCopy) observer.observe(heroCopy);
    if (grid) {
      grid.classList.add('reveal');
      observer.observe(grid);
    }

    return () => {
      window.removeEventListener('scroll', onScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-media">
          <div className={`hero-skeleton ${heroLoaded ? 'hero-skeleton--loaded' : ''}`} />
          <img
            src="https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1400&h=900&fit=crop"
            alt="Black leather shoes on display"
            ref={heroImgRef}
            className={`hero-img ${heroLoaded ? 'hero-img--loaded' : ''}`}
            onLoad={() => setHeroLoaded(true)}
          />
          <div className="hero-veil" />
        </div>

        <div className="container hero-inner">
          <div className="hero-copy">
            <div className="gold-rule">Domas Ventures</div>
            <h1>
              Step in Style.<br />
              <span>Walk with Confidence.</span>
            </h1>
            <p>
              Curated footwear for every stride — refined quality, timeless design,
              and accessible elegance across Kenya.
            </p>
            <div className="hero-cta">
              <Link to="/products" className="btn btn-gold">View Collection</Link>
              <Link to="/about" className="btn btn-outline-light">Discover Us</Link>
            </div>
          </div>

          <div className="hero-emblem">
            <div ref={emblemRef} className="hero-emblem-inner">
              <BrandLogo theme="onDark" size="hero" />
            </div>
          </div>
        </div>

        <div className="hero-scroll-hint" aria-hidden>
          <span>Scroll</span>
          <div className="scroll-line" />
        </div>
      </section>

      <section className="pillars">
        <div className="container pillars-grid">
          {[
            { n: '01', t: 'Quality', d: 'Every pair held to an exacting standard.' },
            { n: '02', t: 'Affordability', d: 'Premium feel without the premium barrier.' },
            { n: '03', t: 'Variety', d: 'From boardroom to playground.' },
            { n: '04', t: 'Service', d: 'Reliable care from order to delivery.' },
          ].map((item) => (
            <div key={item.n} className="pillar">
              <span className="pillar-num">{item.n}</span>
              <h3>{item.t}</h3>
              <p>{item.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="featured">
        <div className="container">
          <header className="section-header">
            <div>
              <span className="section-label">Curated Selection</span>
              <h2 className="section-title">Featured Pieces</h2>
            </div>
            <Link to="/products" className="link-gold">View All →</Link>
          </header>
          <div className="grid-products">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      <section className="collections">
        <div className="container">
          <header className="section-header section-header--center">
            <span className="section-label">Shop By Style</span>
            <h2 className="section-title">Collections</h2>
          </header>
          <div className="collections-grid">
            {[
              { name: "Men's Shoes", img: 'https://images.unsplash.com/photo-1614251180502-f9b245c3bf48?w=500&h=650&fit=crop' },
              { name: 'Sneakers', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=650&fit=crop' },
              { name: 'Official Shoes', img: 'https://images.unsplash.com/photo-1614252235356-8f857d38b3f0?w=500&h=650&fit=crop' },
              { name: 'School Shoes', img: 'https://images.unsplash.com/photo-1560769629-975ec094f050?w=500&h=650&fit=crop' },
            ].map((cat) => (
              <Link
                key={cat.name}
                to={`/products?category=${encodeURIComponent(cat.name)}`}
                className="collection-tile"
              >
                <img src={cat.img} alt={cat.name} loading="lazy" />
                <div className="collection-tile-label">
                  <span className="gold-rule">{cat.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {latestPosts.length > 0 && (
        <section className="blog-teaser">
          <div className="container">
            <header className="section-header section-header--row">
              <div>
                <span className="section-label">Journal</span>
                <h2 className="section-title">From the Blog</h2>
              </div>
              <Link to="/blog" className="link-gold">All Articles →</Link>
            </header>
            <div className="blog-teaser-grid">
              {latestPosts.map((post) => (
                <Link key={post.id} to={`/blog/${post.slug}`} className="blog-teaser-card">
                  <img src={post.image} alt="" loading="lazy" />
                  <div>
                    <h3>{post.title}</h3>
                    <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="statement">
        <div className="container statement-inner">
          <blockquote>
            Inspiring confidence through trendy and stylish footwear — for individuals,
            institutions, and enterprises across Kenya.
          </blockquote>
          <Link to="/products" className="btn btn-gold">Begin Your Order</Link>
        </div>
      </section>
    </div>
  );
}
