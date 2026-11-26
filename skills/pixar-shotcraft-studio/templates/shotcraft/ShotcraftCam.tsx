import React from 'react';
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { dampedSettle } from './helpers/motion';

export type PortraitCamKey = {
  frame: number;
  cx: number;     // focal point in 1080x1920 image space (center = 540, 960)
  cy: number;
  zoom: number;   // >= 1.0 when tilting to avoid edge exposure
  rotX?: number;  // deg
  rotY?: number;  // deg
  rotZ?: number;  // deg
  persp?: number; // default 1400
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const DEFAULT_EASE = Easing.bezier(0.33, 0, 0.15, 1);

/**
 * Portrait 9:16 2.5D Cinema Camera Engine (adapted from video-shotcraft PageCam.tsx).
 * Supports silky oblique perspective glides, crash-zoom punch-in, and damped impact recoil!
 */
export const ShotcraftCam: React.FC<{
  src: string;
  keys: PortraitCamKey[];
  ease?: (t: number) => number;
  impactFrame?: number;
  impactAmp?: number;
  brightness?: number;
  saturate?: number;
  children?: React.ReactNode;
}> = ({
  src,
  keys,
  ease = DEFAULT_EASE,
  impactFrame,
  impactAmp = 14,
  brightness = 1,
  saturate = 1.06,
  children,
}) => {
  const frame = useCurrentFrame();

  let a = keys[0];
  let b = keys[keys.length - 1];
  for (let i = 0; i < keys.length - 1; i++) {
    if (frame >= keys[i].frame && frame <= keys[i + 1].frame) {
      a = keys[i];
      b = keys[i + 1];
      break;
    }
  }
  const t =
    a.frame === b.frame
      ? 1
      : interpolate(frame, [a.frame, b.frame], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: ease,
        });

  const cx = lerp(a.cx, b.cx, t);
  const cy = lerp(a.cy, b.cy, t);
  const zoom = lerp(a.zoom, b.zoom, t);
  const rotX = lerp(a.rotX ?? 0, b.rotX ?? 0, t);
  const rotY = lerp(a.rotY ?? 0, b.rotY ?? 0, t);
  const rotZ = lerp(a.rotZ ?? 0, b.rotZ ?? 0, t);
  const persp = lerp(a.persp ?? 1400, b.persp ?? 1400, t);

  // video-shotcraft crash-zoom-punch damped impact shake (14px * e^(-t/1.8))
  let shakeX = 0;
  let shakeY = 0;
  if (impactFrame !== undefined && frame >= impactFrame && frame <= impactFrame + 14) {
    const dt = frame - impactFrame;
    const env = impactAmp * Math.exp(-dt / 1.9);
    shakeX = env * Math.cos(dt * 2.7);
    shakeY = env * Math.sin(dt * 3.5);
  }

  return (
    <AbsoluteFill style={{ overflow: 'hidden', backgroundColor: '#040b14' }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          perspective: `${persp}px`,
          perspectiveOrigin: '540px 960px',
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: 1080,
            height: 1920,
            transform: `translate(${540 - cx + shakeX}px, ${960 - cy + shakeY}px) scale(${zoom}) rotateY(${rotY}deg) rotateX(${rotX}deg) rotateZ(${rotZ}deg)`,
            transformOrigin: `${cx}px ${cy}px`,
            transformStyle: 'preserve-3d',
            filter: `brightness(${brightness}) saturate(${saturate})`,
          }}
        >
          <Img
            src={staticFile(src)}
            style={{
              position: 'absolute',
              width: 1080,
              height: 1920,
              objectFit: 'cover',
              display: 'block',
            }}
          />
          {children}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/**
 * Zero-flicker luxury translucent glass HUD card (NO backdropFilter -> 100% immune to Chromium WebGL black-box flicker!)
 */
export const CleanGlassCard: React.FC<{
  delay?: number;
  accentColor?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ delay = 0, accentColor = '#38bdf8', style, children }) => {
  const frame = useCurrentFrame();
  const f = frame - delay;
  const p = interpolate(f, [0, 14], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });
  const recoil = dampedSettle(Math.max(0, f - 10), 0.12, 0.22) * 0.035;
  const y = (1 - p) * 28;
  const scale = 0.92 + 0.08 * p + recoil;

  return (
    <div
      style={{
        opacity: p,
        transform: `translateY(${y}px) scale(${scale})`,
        borderRadius: 22,
        padding: '18px 22px',
        background: 'linear-gradient(145deg, rgba(6,18,32,0.88) 0%, rgba(4,12,22,0.78) 100%)',
        border: `1.5px solid ${accentColor}66`,
        boxShadow: `0 16px 40px rgba(0,0,0,0.52), inset 0 1px 0 rgba(255,255,255,0.22)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/**
 * video-shotcraft scan-bracket-sweep: 4 staggered corner L-brackets + velocity-trailed bidirectional laser scan!
 */
export const ScanBracketOverlay: React.FC<{
  left: number;
  top: number;
  width: number;
  height: number;
  color: string;
  startFrame?: number;
  passes?: number;
}> = ({ left, top, width, height, color, startFrame = 12, passes = 3 }) => {
  const frame = useCurrentFrame();
  const lf = frame - startFrame;
  if (lf < 0) return null;

  const arm = 36;
  const corners = [
    { x: 0, y: 0, dx: -10, dy: -10, bT: true, bL: true },
    { x: width, y: 0, dx: 10, dy: -10, bT: true, bR: true },
    { x: 0, y: height, dx: -10, dy: 10, bB: true, bL: true },
    { x: width, y: height, dx: 10, dy: 10, bB: true, bR: true },
  ];

  // Bidirectional laser scan with 12% end-of-pass breath pause
  const scanDur = 110;
  const rawT = Math.max(0, Math.min(1, (lf - 10) / scanDur));
  const passFloat = rawT * passes;
  const passIdx = Math.min(passes - 1, Math.floor(passFloat));
  const passFrac = Math.min(1, (passFloat - passIdx) / 0.88);
  const eased = Easing.inOut(Easing.sin)(passFrac);
  const goingDown = passIdx % 2 === 0;
  const scanY = (goingDown ? eased : 1 - eased) * height;
  const vel = Math.sin(passFrac * Math.PI);
  const tailH = 12 + vel * 76;
  const scanAlpha = interpolate(lf, [10, 18, 115, 128], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        left,
        top,
        width,
        height,
        pointerEvents: 'none',
      }}
    >
      {/* 4 staggered corner L-brackets */}
      {corners.map((c, i) => {
        const cp = interpolate(lf - i * 3, [0, 10], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: Easing.out(Easing.back(1.8)),
        });
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: c.x - (c.bR ? arm : 0) + (1 - cp) * c.dx,
              top: c.y - (c.bB ? arm : 0) + (1 - cp) * c.dy,
              width: arm,
              height: arm,
              opacity: Math.min(1, cp * 1.4),
              borderTop: c.bT ? `3px solid ${color}` : undefined,
              borderBottom: c.bB ? `3px solid ${color}` : undefined,
              borderLeft: c.bL ? `3px solid ${color}` : undefined,
              borderRight: c.bR ? `3px solid ${color}` : undefined,
              filter: `drop-shadow(0 0 8px ${color})`,
            }}
          />
        );
      })}

      {/* Clipped laser scan beam + velocity-scaled tail */}
      {scanAlpha > 0.01 && (
        <div
          style={{
            position: 'absolute',
            inset: 4,
            borderRadius: 16,
            overflow: 'hidden',
            opacity: scanAlpha,
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: goingDown ? scanY - tailH : scanY,
              height: tailH,
              background: goingDown
                ? `linear-gradient(180deg, transparent 0%, ${color}44 100%)`
                : `linear-gradient(0deg, transparent 0%, ${color}44 100%)`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: scanY - 1,
              height: 2.5,
              backgroundColor: color,
              boxShadow: `0 0 14px ${color}, 0 0 28px ${color}`,
            }}
          />
        </div>
      )}
    </div>
  );
};
