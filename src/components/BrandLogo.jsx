import './BrandLogo.css';

/**
 * Original Domas Ventures logo image with color variants:
 * - onDark: ivory + gold on transparent (for black backgrounds)
 * - onLight: black + gold on transparent (for ivory/white backgrounds)
 */
export default function BrandLogo({ theme = 'onDark', size = 'default', className = '' }) {
  // Use SVG white/gold asset for crisp scaling; fall back to PNG if needed.
  const svg = '/logo-white.svg';
  const png = theme === 'onDark' ? '/logo-on-dark.png' : '/logo-on-light.png';
  const src = svg || png;

  return (
    <img
      src={src}
      alt="Domas Ventures"
      width={1000}
      height={1000}
      decoding="async"
      className={`brand-logo brand-logo--${size} ${className}`.trim()}
    />
  );
}
