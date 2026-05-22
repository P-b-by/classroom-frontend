import { Link } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo.jsx';
import './About.css';
import '../components/BrandLogo.css';

export default function About() {
  return (
    <div className="about-page">
      <section className="about-hero">
        <div className="container">
          <BrandLogo theme="onDark" size="about" />
          <div className="gold-rule" style={{ justifyContent: 'center', marginBottom: '1rem' }}>
            Est. Kenya
          </div>
          <h1>Domas Ventures</h1>
          <p className="about-motto">Step in Style, Walk with Confidence</p>
        </div>
      </section>

      <div className="container about-body">
        <div className="about-intro">
          <span className="section-label">Our Story</span>
          <h2 className="section-title">Footwear with purpose</h2>
          <p>
            We supply high-quality, fashionable footwear at competitive prices — delivering
            excellent service and lasting relationships with every customer we serve.
          </p>
        </div>

        <div className="about-grid">
          <div className="about-card">
            <span className="about-card-num">Mission</span>
            <h3>Quality &amp; Relationships</h3>
            <p>
              To supply high-quality and fashionable footwear at competitive prices, while
              delivering excellent customer service and building lasting relationships.
            </p>
          </div>
          <div className="about-card">
            <span className="about-card-num">Vision</span>
            <h3>Confidence in Every Step</h3>
            <p>
              To inspire confidence through trendy and stylish footwear — for school, work,
              and every moment in between.
            </p>
          </div>
        </div>

        <section className="about-section">
          <span className="section-label">Principles</span>
          <h2 className="section-title">Core Values</h2>
          <div className="values-row">
            {['Quality', 'Integrity', 'Customer Satisfaction', 'Reliability', 'Affordability', 'Professionalism'].map((v) => (
              <span key={v} className="value-tag">{v}</span>
            ))}
          </div>
        </section>

        <section className="about-section two-col">
          <div>
            <h2 className="section-title">Products</h2>
            <ul className="about-list">
              {["Men's Shoes", "Children's Shoes", 'School Shoes', 'Casual Shoes', 'Official Shoes', 'Sneakers', 'Sandals'].map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="section-title">We Serve</h2>
            <p className="about-text">
              Individuals, schools, corporate organizations, retailers, wholesalers, and
              institutions — across all 47 counties in Kenya.
            </p>
            <h2 className="section-title" style={{ marginTop: '2rem' }}>Objectives</h2>
            <ul className="about-list">
              <li>Affordable quality footwear</li>
              <li>Strong, lasting customer base</li>
              <li>Online and physical market reach</li>
              <li>Trust through excellent service</li>
            </ul>
          </div>
        </section>

        <div className="about-cta">
          <h2>Find your pair</h2>
          <Link to="/products" className="btn btn-gold">View Collection</Link>
        </div>
      </div>
    </div>
  );
}
