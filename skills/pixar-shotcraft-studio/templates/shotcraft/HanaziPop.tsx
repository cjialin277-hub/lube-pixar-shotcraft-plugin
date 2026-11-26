import React from 'react';
import { Easing, interpolate, useCurrentFrame } from 'remotion';
import { FONT_SANS } from '../scenes/ScienceInserts';

export type HanaziSpec = {
  text: string;
  startFrame: number; // local frame inside beat
  durationFrames: number;
  top: number;
  left?: number;
  right?: number;
  rotateDeg?: number;
  fillGradient?: string;
  accentStroke?: string;
  fontSize?: number;
  burst?: boolean;
};

/**
 * 9:16 Variety / Anime Kinetic Pop Caption (adapted from mg-styles-15 18-hanazi):
 * - 3-layer typography: vibrant gradient fill + crisp white stroke + rich outer shadow
 * - Elastic overshoot pop: 0 -> 1.16 -> 1.0 in 8 frames + per-char 2f stagger + gentle wiggle while holding!
 */
export const HanaziPop: React.FC<{ spec: HanaziSpec }> = ({ spec }) => {
  const frame = useCurrentFrame();
  const lf = frame - spec.startFrame;
  if (lf < 0 || lf > spec.durationFrames) return null;

  const fontSize = spec.fontSize ?? 52;
  const accentStroke = spec.accentStroke ?? '#0369a1';
  const fillGradient = spec.fillGradient ?? 'linear-gradient(180deg, #fffbeb 0%, #fde047 58%, #f59e0b 100%)';

  // Smooth elastic pop-in (8f: 0 -> 1.16 -> 1.0) & clean 6f fade-out
  const popScale =
    lf < 8
      ? interpolate(lf, [0, 5, 8], [0.2, 1.16, 1.0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: Easing.out(Easing.cubic),
        })
      : 1.0;

  const exitOpacity = interpolate(
    lf,
    [0, 3, spec.durationFrames - 6, spec.durationFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  const exitY = interpolate(
    lf,
    [spec.durationFrames - 6, spec.durationFrames],
    [0, -14],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  // Subtle living wiggle while holding (18-hanazi rule)
  const wiggle = lf >= 8 ? Math.sin((lf - 8) * 0.24) * 1.4 : 0;
  const baseRot = (spec.rotateDeg ?? -4) + wiggle;

  return (
    <div
      style={{
        position: 'absolute',
        top: spec.top,
        left: spec.left,
        right: spec.right,
        opacity: exitOpacity,
        transform: `translateY(${exitY}px) scale(${popScale}) rotate(${baseRot}deg)`,
        transformOrigin: 'center center',
        pointerEvents: 'none',
        zIndex: 25,
      }}
    >
      {/* Optional comic burst sparkle rays */}
      {spec.burst && lf < 22 && (
        <svg
          width="180"
          height="90"
          viewBox="0 0 180 90"
          style={{
            position: 'absolute',
            left: -26,
            top: -32,
            opacity: interpolate(lf, [0, 4, 18], [0, 0.95, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
          }}
        >
          <line x1="20" y1="30" x2="4" y2="14" stroke="#fde047" strokeWidth="5" strokeLinecap="round" />
          <line x1="36" y1="18" x2="28" y2="2" stroke="#38bdf8" strokeWidth="4.5" strokeLinecap="round" />
          <line x1="58" y1="16" x2="62" y2="3" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
        </svg>
      )}

      <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: 1 }}>
        {spec.text.split('').map((ch, idx) => {
          const cf = lf - idx * 1.5;
          const charBounce = interpolate(cf, [0, 4, 8], [16, -6, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          return (
            <span
              key={idx}
              style={{
                position: 'relative',
                display: 'inline-block',
                transform: `translateY(${charBounce}px)`,
                fontFamily: FONT_SANS,
                fontSize,
                fontWeight: 900,
                letterSpacing: 1,
                lineHeight: 1.08,
              }}
            >
              {/* Layer 1: Thick dark outer drop shadow + accent halo */}
              <span
                aria-hidden
                style={{
                  position: 'absolute',
                  inset: 0,
                  color: 'transparent',
                  WebkitTextStroke: `13px ${accentStroke}`,
                  filter: 'drop-shadow(0 8px 14px rgba(0,0,0,0.68))',
                }}
              >
                {ch}
              </span>
              {/* Layer 2: Crisp thick white outline */}
              <span
                aria-hidden
                style={{
                  position: 'absolute',
                  inset: 0,
                  color: 'transparent',
                  WebkitTextStroke: '7px #ffffff',
                }}
              >
                {ch}
              </span>
              {/* Layer 3: Vibrant gradient top fill */}
              <span
                style={{
                  position: 'relative',
                  backgroundImage: fillGradient,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {ch}
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
};
