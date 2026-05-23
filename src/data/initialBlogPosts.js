function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export const INITIAL_BLOG_POSTS = [
  {
    id: 'blog-1',
    slug: slugify('The Art of Minimalist Footwear'),
    title: 'The Art of Minimalist Footwear: Less is More in 2026',
    excerpt:
      'Discover how clean lines and refined silhouettes are redefining luxury footwear for the modern connoisseur.',
    content: `In the world of high fashion, minimalism has emerged as the ultimate expression of sophistication. At Domas Ventures, we've embraced this philosophy, curating footwear that speaks through restraint rather than excess.

**The Power of Simplicity**

Our latest collection embodies the "quiet luxury" trend — footwear that commands attention through impeccable craftsmanship and timeless design. Think sleek silhouettes, premium materials, and subtle details that elevate rather than overwhelm.

**Material Mastery**

We source the finest leather from ethical tanneries, ensuring each pair ages beautifully with wear. Our artisans employ traditional techniques alongside modern innovations to create footwear that's both luxurious and durable.

**Versatile Elegance**

A single pair of our minimalist designs can transition seamlessly from boardroom meetings to evening engagements. This versatility represents the new paradigm in luxury fashion — quality over quantity, pieces that serve multiple purposes without compromising on style.

**Styling Tips**

- Pair black leather oxfords with tailored trousers for a refined office look
- Style brown brogues with dark denim for elevated casual elegance
- Choose neutral tones that integrate effortlessly into your existing wardrobe

Experience the intersection of art and functionality at Domas Ventures.`,
    image: 'https://images.unsplash.com/photo-1614252235356-8f857d38b3f0?w=800&h=500&fit=crop',
    author: 'Domas Ventures Team',
    category: 'Luxury',
    publishedAt: '2026-05-20T10:00:00.000Z',
  },
  {
    id: 'blog-2',
    slug: slugify('Sustainable Fashion Revolution'),
    title: 'The Sustainable Fashion Revolution in Footwear',
    excerpt:
      'How conscious consumerism is reshaping the industry and why Domas Ventures leads the charge in ethical luxury.',
    content: `The fashion landscape is undergoing a profound transformation, with sustainability moving from niche to mainstream. At Domas Ventures, we've been ahead of this curve, believing that true luxury encompasses environmental and social responsibility.

**Ethical Sourcing**

Every material in our footwear can be traced back to its source. We partner with tanneries that prioritize environmental stewardship, employing water-saving technologies and vegetable-based tanning methods that minimize ecological impact.

**Artisan Craftsmanship**

Our commitment to sustainability extends to preserving traditional craftsmanship. Each pair is handcrafted by skilled artisans who have honed their techniques across generations, ensuring that mass production never compromises quality or artistry.

**Circular Design**

We design with longevity in mind. Our footwear is built to last, repairable when needed, and crafted from materials that age gracefully rather than degrade. This approach contrasts sharply with fast fashion's disposable culture.

**Consumer Impact**

Your choice to invest in quality, sustainable footwear sends a powerful message. It supports ethical practices, reduces environmental impact, and proves that style need not come at the expense of our planet.

Join us in redefining what it means to be fashion-forward in the modern era.`,
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&h=500&fit=crop',
    author: 'Domas Ventures Team',
    category: 'Sustainability',
    publishedAt: '2026-05-18T14:00:00.000Z',
  },
  {
    id: 'blog-3',
    slug: slugify('Rise of GenderFluid Fashion'),
    title: 'The Rise of Gender-Fluid Fashion in Footwear',
    excerpt:
      'Breaking boundaries and challenging norms — how contemporary fashion is embracing inclusivity and self-expression.',
    content: `The boundaries between traditional gender categories in fashion are dissolving, giving rise to a more inclusive and expressive landscape. At Domas Ventures, we celebrate this evolution, designing footwear that transcends conventional limitations.

**Beyond Labels**

Our design philosophy centers on the individual rather than categories. Whether you identify with traditional gender norms or reject them entirely, our collection offers footwear that aligns with your personal aesthetic rather than societal expectations.

**Universal Design Principles**

We focus on elements that enhance comfort and style for everyone: adjustable fittings, breathable materials, ergonomic soles, and versatile color palettes. These features ensure that our footwear serves diverse bodies and style preferences.

**Cultural Shift**

The fashion industry's embrace of gender-fluid designs reflects broader societal changes. More people are expressing themselves authentically, and fashion is adapting to support this self-expression rather than constrain it.

**Styling Freedom**

Our gender-neutral designs can be styled countless ways. Pair the same oxford with tailored trousers or a flowing skirt. Wear our minimalist sneakers with anything from suits to dresses. The possibilities are limited only by your imagination.

At Domas Ventures, we believe everyone deserves footwear that makes them feel confident, comfortable, and authentically themselves.`,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=500&fit=crop',
    author: 'Domas Ventures Team',
    category: 'Culture',
    publishedAt: '2026-05-15T09:00:00.000Z',
  },
  {
    id: 'blog-4',
    slug: slugify('Footwear Investment Guide'),
    title: 'Investment Footwear: Building a Timeless Collection',
    excerpt:
      'Why building a curated footwear wardrobe is smarter than following every passing trend.',
    content: `In an era of fast fashion and fleeting trends, the concept of investment footwear represents a return to thoughtful consumption. At Domas Ventures, we advocate for building a curated collection of timeless pieces rather than chasing seasonal fads.

**The Investment Mindset**

Quality footwear is an investment in yourself. A well-made pair of leather oxfords or elegant brogues can last years, even decades, with proper care. This longevity represents both economic and environmental wisdom.

**Core Pieces Every Wardrobe Needs**

1. **Black Leather Oxfords** — The ultimate formal shoe, versatile enough for everything from weddings to board meetings
2. **Brown Brogues** — Perfect for adding character to business casual or smart casual ensembles
3. **Minimalist Sneakers** — Clean, comfortable, and increasingly acceptable in various settings
4. **Loafers** — Slip-on elegance that bridges formal and casual with effortless sophistication

**Cost Per Wear Analysis**

Consider the cost per wear rather than initial price. A KES 15,000 pair of quality shoes worn 200 times costs KES 75 per wear, while a KES 3,000 pair worn 10 times costs KES 300 per wear. Quality often proves more economical in the long run.

**Care and Maintenance**

Proper care extends footwear life dramatically: regular cleaning, conditioning, rotation between wears, and professional resoling when needed. These habits transform shoes from purchases into lifelong companions.

Invest in fewer, better pieces. Your wardrobe — and the planet — will thank you.`,
    image: 'https://images.unsplash.com/photo-1560769629-975ec094f050?w=800&h=500&fit=crop',
    author: 'Domas Ventures Team',
    category: 'Style Guide',
    publishedAt: '2026-05-22T11:00:00.000Z',
  },
];

export { slugify };
