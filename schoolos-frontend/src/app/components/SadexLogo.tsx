interface SadexLogoProps {
  size?: number;
  variant?: 'light' | 'dark' | 'currentColor';
  className?: string;
  showText?: boolean;
}

export function SadexLogo({
  size = 24,
  variant = 'currentColor',
  className = '',
  showText = true,
}: SadexLogoProps) {
  const color = 
    variant === 'light' ? '#000000' :
    variant === 'dark' ? '#ffffff' :
    'currentColor';

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        viewBox="0 0 200 200"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
        role="img"
        aria-label="SADEX Innovations Logo"
      >
        <g fill="none" stroke={color} strokeWidth="18" strokeLinecap="round" strokeLinejoin="round">
          {/* Top Hook */}
          <path d="M 85 45 C 130 45, 175 75, 155 110 C 142 128, 120 135, 110 135" />
          {/* Central Bolt 1 */}
          <path d="M 85 45 L 140 100 L 115 100 L 130 115" />
          {/* Bottom Hook */}
          <path d="M 115 155 C 70 155, 25 125, 45 90 C 58 72, 80 65, 90 65" />
          {/* Central Bolt 2 */}
          <path d="M 115 155 L 60 100 L 85 100 L 70 85" />
        </g>
      </svg>
      {showText && (
        <div className="flex flex-col" style={{ lineHeight: 1 }}>
          <span
            style={{
              fontSize: `${size * 0.38}px`,
              fontWeight: 800,
              letterSpacing: '0.05em',
              color: color,
              fontFamily: 'sans-serif',
            }}
          >
            SADEX
          </span>
          <span
            style={{
              fontSize: `${size * 0.22}px`,
              fontWeight: 400,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: variant === 'light' ? '#4b5563' : variant === 'dark' ? '#9ca3af' : 'inherit',
              fontFamily: 'sans-serif',
            }}
          >
            Innovations
          </span>
        </div>
      )}
    </div>
  );
}
