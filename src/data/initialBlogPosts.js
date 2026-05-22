function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export const INITIAL_BLOG_POSTS = [
  {
    id: 'blog-1',
    slug: slugify('How to Choose the Right School Shoes'),
    title: 'How to Choose the Right School Shoes for Your Child',
    excerpt:
      'Durability, fit, and comfort matter most when selecting school footwear that lasts the full term.',
    content: `Finding the right school shoes is one of the most important purchases for parents each term. At Domas Ventures, we recommend focusing on three essentials: proper fit, durable construction, and all-day comfort.

**Fit first** — Leave about a thumb's width between the longest toe and the shoe front. Children's feet grow quickly; check fit every few months.

**Quality materials** — Look for reinforced toe caps and sturdy soles that handle daily wear on varied surfaces.

**Style that lasts** — Classic black school shoes remain the standard across Kenyan institutions, and our range balances regulation compliance with modern comfort technology.

Visit our collection or speak with our team for bulk school orders — we serve institutions nationwide.`,
    image: 'https://images.unsplash.com/photo-1560769629-975ec094f050?w=800&h=500&fit=crop',
    author: 'Domas Ventures Team',
    category: 'Guides',
    publishedAt: '2026-04-15T10:00:00.000Z',
  },
  {
    id: 'blog-2',
    slug: slugify('Sneaker Trends 2026'),
    title: 'Sneaker Trends Worth Watching in 2026',
    excerpt:
      'From clean minimal silhouettes to bold accent soles — what is defining footwear fashion this year.',
    content: `The sneaker landscape in 2026 favours versatility: pairs that transition from casual Friday to weekend outings without a wardrobe change.

**Neutral palettes** — Black, white, and earth tones dominate, making sneakers easier to pair with any outfit.

**Comfort-driven design** — Cushioned midsoles and breathable uppers are no longer premium extras; they are expected at every price point.

**Statement accents** — Gold detailing, contrast stitching, and sculpted soles add personality without overwhelming the look.

Explore our sneaker collection for styles that match these trends at prices that respect your budget.`,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=500&fit=crop',
    author: 'Domas Ventures Team',
    category: 'Style',
    publishedAt: '2026-05-01T14:00:00.000Z',
  },
  {
    id: 'blog-3',
    slug: slugify('Corporate Footwear Kenya'),
    title: 'Corporate Footwear: Dressing for Success in Kenya',
    excerpt:
      'Official shoes that project professionalism while keeping you comfortable through long workdays.',
    content: `Your footwear completes your professional image. For corporate environments across Nairobi, Mombasa, and beyond, oxford and brogue styles remain the gold standard.

**Leather care** — Regular polishing extends shoe life and maintains a sharp appearance for client meetings.

**Rotation** — Owning two pairs of official shoes and alternating them allows materials to rest and reduces wear.

**Fit for commuting** — Consider cushioned insoles if your day includes significant walking or public transport.

Domas Ventures supplies corporates and institutions with bulk orders and consistent sizing — contact us for enterprise pricing.`,
    image: 'https://images.unsplash.com/photo-1614252235356-8f857d38b3f0?w=800&h=500&fit=crop',
    author: 'Domas Ventures Team',
    category: 'Business',
    publishedAt: '2026-05-10T09:00:00.000Z',
  },
];

export { slugify };
