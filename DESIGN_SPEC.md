# Domas Ventures Design Spec

## Brand
- Logo: white/gold on transparent background.
- Primary color: `#c59d3b` (gold), with `#e6d39a` for highlights and gradients.
- Accent green: `#16a34a` for positive states and secondary accents.
- Primary dark surface: `#0f1724` (deep navy/black).
- Text on dark surfaces: `#ffffff`; text on light surfaces: `#0f1724`.

## Typography
- Heading family: `Cormorant Garamond`, serif.
- Body family: `Outfit`, sans-serif.
- Headline size scale: `clamp(2.75rem, 6vw, 4.5rem)` for hero; `clamp(1.75rem, 3vw, 2.5rem)` for section titles.
- Button text: uppercase, `letter-spacing: 0.14em`.

## Layout & Spacing
- Page container max width: `1240px`.
- Standard gutters: `clamp(1.25rem, 4vw, 2.5rem)`.
- Content spacing: `4rem`–`6rem` between major sections.
- Card gap: `1.5rem`–`2rem`.

## Motion
- Smooth timing: `520ms` with cubic-bezier easing.
- Fast timing: `160ms` for micro-interactions.
- Hero reveal and content entrance: staggered fade-up with `translateY` easing.
- Parallax effect: hero image translates at 16% scroll speed and scales to `1.08`.
- Button hover: slight lift and shadow with `translateY(-4px)`.
- Product card hover: image zoom plus content lift.
- Reduced-motion support: all animations and transforms disabled when `prefers-reduced-motion: reduce`.

## Component Behavior
### Hero
- Hero image fades in on load.
- Hero copy reveals sequentially.
- Floating logo emblem animates gently and shifts with scroll.
- Buttons have subtle hover scaling and shadow.

### Product Cards
- Cards lift on hover with deeper shadow.
- Product image zooms slightly.
- Price, size selector, and CTA appear with a softer translate/opacity shift.

### Collections
- Images stay crisp and slightly brighten on hover.
- Labels maintain white/gold callout styling.

## Implementation Notes
- `BrandLogo.jsx` now uses `public/logo-white.svg` for high-fidelity white/gold branding.
- `Home.jsx` uses `IntersectionObserver` for reveal animations and `useState` for hero image load animation.
- `src/index.css` contains global motion settings and reduced-motion support.
- `ProductCard.css` contains hover transitions for image and card details.
