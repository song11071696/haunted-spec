export function ghostSVG(silhouette, color, size = 50) {
  const svgs = {
    wisp: `
      <svg width="${size}" height="${size}" viewBox="0 0 50 60" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="glow-${silhouette}">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <path d="M 25 5 Q 10 5 10 20 Q 10 35 10 45 L 15 45 Q 15 50 18 45 L 22 45 Q 22 50 25 45 L 28 45 Q 28 50 32 45 L 35 45 Q 35 50 40 45 Q 40 35 40 20 Q 40 5 25 5 Z" 
              fill="${color}" filter="url(#glow-${silhouette})"/>
        <circle cx="20" cy="22" r="3" fill="#000"/>
        <circle cx="30" cy="22" r="3" fill="#000"/>
        <ellipse cx="25" cy="30" rx="4" ry="6" fill="#000" opacity="0.5"/>
      </svg>
    `,
    poltergeist: `
      <svg width="${size}" height="${size}" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="glow-${silhouette}">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <path d="M 30 8 Q 18 8 15 18 L 8 15 Q 10 25 15 28 Q 15 40 15 50 L 20 48 L 25 52 L 30 48 L 35 52 L 40 48 L 45 50 Q 45 40 45 28 Q 50 25 52 15 L 45 18 Q 42 8 30 8 Z" 
              fill="${color}" filter="url(#glow-${silhouette})"/>
        <circle cx="23" cy="22" r="3" fill="#000"/>
        <circle cx="37" cy="22" r="3" fill="#000"/>
        <path d="M 25 30 Q 30 33 35 30" stroke="#000" stroke-width="2" fill="none"/>
      </svg>
    `,
    wraith: `
      <svg width="${size}" height="${size * 1.2}" viewBox="0 0 50 70" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="glow-${silhouette}">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <path d="M 25 5 Q 15 5 12 15 L 10 25 L 8 65 L 18 60 L 25 65 L 32 60 L 42 65 L 40 25 L 38 15 Q 35 5 25 5 Z" 
              fill="${color}" filter="url(#glow-${silhouette})" opacity="0.9"/>
        <ellipse cx="20" cy="20" rx="2" ry="4" fill="#000" opacity="0.6"/>
        <ellipse cx="30" cy="20" rx="2" ry="4" fill="#000" opacity="0.6"/>
      </svg>
    `,
    ghoul: `
      <svg width="${size}" height="${size}" viewBox="0 0 50 55" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="glow-${silhouette}">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <ellipse cx="25" cy="18" rx="12" ry="15" fill="${color}" filter="url(#glow-${silhouette})"/>
        <path d="M 13 25 Q 10 35 10 45 L 15 48 L 20 45 L 25 50 L 30 45 L 35 48 L 40 45 Q 40 35 37 25 Z" 
              fill="${color}" filter="url(#glow-${silhouette})"/>
        <ellipse cx="25" cy="18" rx="8" ry="10" fill="#666" opacity="0.3"/>
      </svg>
    `,
    banshee: `
      <svg width="${size * 1.3}" height="${size}" viewBox="0 0 70 60" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="glow-${silhouette}">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <path d="M 5 20 Q 8 15 12 20 Q 15 10 18 15 Q 20 8 22 12 L 25 5 Q 28 10 30 5 L 33 12 Q 35 8 37 15 Q 40 10 43 20 Q 45 15 48 20 L 50 25 Q 48 35 45 45 L 40 48 L 35 45 L 30 50 L 25 45 L 20 48 L 15 45 Q 12 35 10 25 Z" 
              fill="${color}" filter="url(#glow-${silhouette})"/>
        <circle cx="23" cy="25" r="3" fill="#000"/>
        <circle cx="37" cy="25" r="3" fill="#000"/>
        <ellipse cx="30" cy="35" rx="6" ry="8" fill="#000"/>
      </svg>
    `,
    soul: `
      <svg width="${size * 0.8}" height="${size * 0.8}" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="soul-grad-${silhouette}">
            <stop offset="0%" stop-color="${color}" stop-opacity="1"/>
            <stop offset="70%" stop-color="${color}" stop-opacity="0.6"/>
            <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
          </radialGradient>
          <filter id="glow-${silhouette}">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <circle cx="20" cy="18" r="12" fill="url(#soul-grad-${silhouette})" filter="url(#glow-${silhouette})"/>
        <path d="M 20 28 Q 18 32 16 36 Q 15 38 14 40" stroke="${color}" stroke-width="2" fill="none" opacity="0.5"/>
        <circle cx="17" cy="16" r="2" fill="#000"/>
        <circle cx="23" cy="16" r="2" fill="#000"/>
      </svg>
    `,
    beast: `
      <svg width="${size * 1.2}" height="${size}" viewBox="0 0 65 55" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="glow-${silhouette}">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <ellipse cx="20" cy="15" rx="10" ry="12" fill="${color}" filter="url(#glow-${silhouette})"/>
        <ellipse cx="45" cy="15" rx="10" ry="12" fill="${color}" filter="url(#glow-${silhouette})"/>
        <path d="M 15 23 Q 15 30 15 40 L 20 43 L 25 40 L 32.5 45 L 40 40 L 45 43 L 50 40 Q 50 30 50 23 Z" 
              fill="${color}" filter="url(#glow-${silhouette})"/>
        <circle cx="17" cy="13" r="2" fill="#000"/>
        <circle cx="23" cy="13" r="2" fill="#000"/>
        <circle cx="42" cy="13" r="2" fill="#000"/>
        <circle cx="48" cy="13" r="2" fill="#000"/>
      </svg>
    `
  };
  
  return svgs[silhouette] || svgs.wisp;
}
