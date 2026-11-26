import React from 'react';
import { useCurrentFrame } from 'remotion';

/**
 * Directional Motion Blur (`SpeedBlur` from `video-shotcraft/demos/_fixtures/Polish.tsx`):
 * Rotates into the velocity vector (vx, vy), applies a 1D SVG Gaussian blur along the motion axis,
 * and counter-rotates back. Zero filter overhead when speed < 0.8 px/frame!
 */
export const SpeedBlur: React.FC<{
  vx: number;
  vy?: number;
  amount?: number;
  max?: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ vx, vy = 0, amount = 0.45, max = 32, style, children }) => {
  const rid = React.useId().replace(/[^a-zA-Z0-9]/g, '');
  const speed = Math.hypot(vx, vy);
  const sd = Math.min(max, speed * amount);
  const fill: React.CSSProperties = { position: 'absolute', inset: 0 };
  if (sd < 0.4) return <div style={{ ...fill, ...style }}>{children}</div>;
  const deg = (Math.atan2(vy, vx) * 180) / Math.PI;
  const id = `sb-${rid}`;
  return (
    <div style={{ ...fill, ...style }}>
      <svg width={0} height={0} style={{ position: 'absolute' }} aria-hidden>
        <filter id={id} x="-35%" y="-35%" width="170%" height="170%" colorInterpolationFilters="sRGB">
          <feGaussianBlur stdDeviation={`${sd.toFixed(2)} 0`} edgeMode="duplicate" />
        </filter>
      </svg>
      <div style={{ ...fill, transform: `rotate(${deg}deg)`, filter: `url(#${id})` }}>
        <div style={{ ...fill, transform: `rotate(${-deg}deg)` }}>{children}</div>
      </div>
    </div>
  );
};

const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const grainCache = new Map<string, string>();
const grainTile = (variant: number, tile: number, freq: number) => {
  const key = `${variant}|${tile}|${freq}`;
  const hit = grainCache.get(key);
  if (hit) return hit;
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='${tile}' height='${tile}'>` +
    `<filter id='g' x='0' y='0' width='100%' height='100%' color-interpolation-filters='sRGB'>` +
    `<feTurbulence type='fractalNoise' baseFrequency='${freq}' numOctaves='2' seed='${variant * 17 + 3}' stitchTiles='stitch'/>` +
    `<feColorMatrix type='matrix' values='0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0 0 0 0 1'/>` +
    `<feComponentTransfer><feFuncR type='linear' slope='2.2' intercept='-0.6'/><feFuncG type='linear' slope='2.2' intercept='-0.6'/>` +
    `<feFuncB type='linear' slope='2.2' intercept='-0.6'/></feComponentTransfer></filter>` +
    `<rect width='100%' height='100%' filter='url(#g)'/></svg>`;
  const url = `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
  grainCache.set(key, url);
  return url;
};

/**
 * Theatrical Film Grain + Optical Vignette (`Grain` + `Vignette` from `video-shotcraft/demos/_fixtures/Polish.tsx`)
 */
export const CinemaFilmFinish: React.FC<{
  grainOpacity?: number;
  vignetteStrength?: number;
}> = ({ grainOpacity = 0.048, vignetteStrength = 0.38 }) => {
  const frame = useCurrentFrame();
  const k = Math.floor(frame / 2);
  const tile = 256;
  const ox = Math.floor(hash(k * 3 + 1) * tile);
  const oy = Math.floor(hash(k * 7 + 2) * tile);

  return (
    <>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: `radial-gradient(ellipse 78% 76% at 50% 46%, rgba(2,8,16,0) 52%, rgba(2,8,16,${(vignetteStrength * 0.45).toFixed(3)}) 78%, rgba(2,8,16,${vignetteStrength.toFixed(3)}) 100%)`,
          zIndex: 28,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          opacity: grainOpacity,
          mixBlendMode: 'overlay',
          backgroundImage: grainTile(k % 6, tile, 0.82),
          backgroundSize: `${tile}px ${tile}px`,
          backgroundPosition: `${ox}px ${oy}px`,
          zIndex: 29,
        }}
      />
    </>
  );
};
