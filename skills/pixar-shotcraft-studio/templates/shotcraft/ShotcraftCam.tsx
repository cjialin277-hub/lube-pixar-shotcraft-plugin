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
  persp?: number; // default 1350
};

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const DEFAULT_EASE = Easing.bezier(0.33, 0, 0.15, 1);

/**
 * Catmull-Rom Cubic Hermite Spline evaluator (from mg-styles-15 `12-aurora-glass/main.js`):
 * Eliminates piecewise-linear velocity corners at intermediate keyframes so 3D camera motion is 100% silky!
 */
export function sampleHermiteCam(
  keys: PortraitCamKey[],
  frame: number,
  ease: (t: number) => number = DEFAULT_EASE,
): Required<PortraitCamKey> {
  const norm = keys.map((k) => ({
    frame: k.frame,
    cx: k.cx,
    cy: k.cy,
    zoom: k.zoom,
    rotX: k.rotX ?? 0,
    rotY: k.rotY ?? 0,
    rotZ: k.rotZ ?? 0,
    persp: k.persp ?? 1350,
  }));
  const n = norm.length;
  if (n === 1 || frame <= norm[0].frame) return norm[0];
  if (frame >= norm[n - 1].frame) return norm[n - 1];

  let idx = 0;
  while (idx < n - 2 && frame > norm[idx + 1].frame) idx++;

  const k0 = norm[Math.max(0, idx - 1)];
  const k1 = norm[idx];
  const k2 = norm[idx + 1];
  const k3 = norm[Math.min(n - 1, idx + 2)];

  const h = Math.max(1e-5, k2.frame - k1.frame);
  const rawU = clamp01((frame - k1.frame) / h);
  // For 2-key segments or sharp impact segments (h <= 10 frames), use direct eased interpolation to preserve crisp punches
  if (n <= 2 || h <= 10) {
    const s = ease(rawU);
    const mix = (a: number, b: number) => a + (b - a) * s;
    return {
      frame,
      cx: mix(k1.cx, k2.cx),
      cy: mix(k1.cy, k2.cy),
      zoom: mix(k1.zoom, k2.zoom),
      rotX: mix(k1.rotX, k2.rotX),
      rotY: mix(k1.rotY, k2.rotY),
      rotZ: mix(k1.rotZ, k2.rotZ),
      persp: mix(k1.persp, k2.persp),
    };
  }

  const s = rawU;
  const s2 = s * s;
  const s3 = s2 * s;
  const h00 = 2 * s3 - 3 * s2 + 1;
  const h10 = s3 - 2 * s2 + s;
  const h01 = -2 * s3 + 3 * s2;
  const h11 = s3 - s2;

  const evalField = (field: keyof Omit<Required<PortraitCamKey>, 'frame'>) => {
    const v0 = k0[field];
    const v1 = k1[field];
    const v2 = k2[field];
    const v3 = k3[field];
    const m1 = idx === 0 ? 0 : ((v2 - v0) / Math.max(1, k2.frame - k0.frame)) * h * 0.65;
    const m2 = idx + 1 === n - 1 ? 0 : ((v3 - v1) / Math.max(1, k3.frame - k1.frame)) * h * 0.65;
    return h00 * v1 + h10 * m1 + h01 * v2 + h11 * m2;
  };

  return {
    frame,
    cx: evalField('cx'),
    cy: evalField('cy'),
    zoom: evalField('zoom'),
    rotX: evalField('rotX'),
    rotY: evalField('rotY'),
    rotZ: evalField('rotZ'),
    persp: evalField('persp'),
  };
}

/**
 * Portrait 9:16 True 3D Multi-Plane Cinema Camera Engine (upgraded with Catmull-Rom Hermite splines + Z-Depth layers!).
 * Rule C3 from video-shotcraft: annotations, SVG telemetry, and hero cards live INSIDE the same 3D space at distinct translateZ planes!
 */
export const ShotcraftCam: React.FC<{
  src: string;
  keys: PortraitCamKey[];
  ease?: (t: number) => number;
  impactFrame?: number;
  impactAmp?: number;
  brightness?: number;
  saturate?: number;
  bgPlaneZ?: number;
  children?: React.ReactNode;
}> = ({
  src,
  keys,
  ease = DEFAULT_EASE,
  impactFrame,
  impactAmp = 14,
  brightness = 1,
  saturate = 1.08,
  bgPlaneZ = -70,
  children,
}) => {
  const frame = useCurrentFrame();
  const cam = sampleHermiteCam(keys, frame, ease);

  // Overscan scale on background plate so negative translateZ + 3D tilt NEVER reveals black border edges
  const bgOverscan = 1.12 + Math.abs(bgPlaneZ) / 950;

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
          perspective: `${cam.persp}px`,
          perspectiveOrigin: '540px 960px',
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: 1080,
            height: 1920,
            transform: `translate3d(${540 - cam.cx + shakeX}px, ${960 - cam.cy + shakeY}px, 0px) scale(${cam.zoom}) rotateY(${cam.rotY}deg) rotateX(${cam.rotX}deg) rotateZ(${cam.rotZ}deg)`,
            transformOrigin: `${cam.cx}px ${cam.cy}px`,
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Plane 0: Deep Background 3D Plate at Z = bgPlaneZ */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              transform: `translateZ(${bgPlaneZ}px) scale(${bgOverscan})`,
              transformOrigin: '540px 960px',
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
          </div>

          {/* Multi-plane 3D children (Z = +20px..+95px) live inside the exact same 3D camera rig! */}
          {children}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/**
 * 3D Depth Plane Wrapper (`video-shotcraft` Rule C3: True 3D Z-parallax layer anchored in world space)
 */
export const Plane3D: React.FC<{
  z: number;
  compensateScale?: boolean;
  persp?: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ z, compensateScale = true, persp = 1350, style, children }) => {
  const comp = compensateScale ? Math.max(0.84, Math.min(1.12, (persp - z * 0.72) / persp)) : 1;
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        transform: `translateZ(${z}px) scale(${comp})`,
        transformOrigin: '540px 960px',
        transformStyle: 'preserve-3d',
        pointerEvents: 'none',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/**
 * Camera-Synchronized 3D Viewport HUD Rig:
 * Gives Hero Odometers & Glass Data Cards genuine 3D perspective tilt (`rotateX / rotateY / rotateZ`) and counter-parallax glide
 * synchronized with `ShotcraftCam`, while strictly locking their bounds inside the 9:16 mobile safe zone (x: 48..900, y: 138..1225)!
 */
export const Viewport3DHUD: React.FC<{
  keys: PortraitCamKey[];
  parallaxFactor?: number;
  tiltFactor?: number;
  children: React.ReactNode;
}> = ({ keys, parallaxFactor = 0.12, tiltFactor = 0.72, children }) => {
  const frame = useCurrentFrame();
  const cam = sampleHermiteCam(keys, frame);
  const px = Math.max(-22, Math.min(22, (540 - cam.cx) * parallaxFactor));
  const py = Math.max(-24, Math.min(24, (960 - cam.cy) * parallaxFactor));
  const rx = cam.rotX * tiltFactor;
  const ry = cam.rotY * tiltFactor;
  const rz = cam.rotZ * (tiltFactor * 0.75);

  return (
    <AbsoluteFill
      style={{
        perspective: `${cam.persp}px`,
        perspectiveOrigin: '474px 680px',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: `translate3d(${px}px, ${py}px, 0px) rotateY(${ry}deg) rotateX(${rx}deg) rotateZ(${rz}deg)`,
          transformOrigin: '474px 680px',
          transformStyle: 'preserve-3d',
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
};

/**
 * Single-pass diagonal specular light sweep across hero cards/badges (from video-shotcraft `Look.tsx` <Sheen>)
 */
export const SheenSweep: React.FC<{
  startFrame?: number;
  durationFrames?: number;
  color?: string;
}> = ({ startFrame = 18, durationFrames = 28, color = 'rgba(255,255,255,0.26)' }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [startFrame, startFrame + durationFrames], [-0.4, 1.4], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.4, 0, 0.2, 1),
  });
  if (p <= -0.38 || p >= 1.38) return null;
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        borderRadius: 'inherit',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '-30%',
          bottom: '-30%',
          left: `${p * 100}%`,
          width: '34%',
          transform: 'rotate(24deg)',
          background: `linear-gradient(90deg, transparent 0%, ${color} 50%, transparent 100%)`,
        }}
      />
    </div>
  );
};

/**
 * Zero-flicker luxury translucent glass HUD card (NO backdropFilter -> 100% immune to Chromium WebGL black-box flicker!)
 * Upgraded with 2-layer soft elevation shadow (Polish.tsx `softShadow`) + single-pass `<SheenSweep>`!
 */
export const CleanGlassCard: React.FC<{
  delay?: number;
  accentColor?: string;
  sheenFrame?: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ delay = 0, accentColor = '#38bdf8', sheenFrame, style, children }) => {
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
        position: 'relative',
        opacity: p,
        transform: `translateY(${y}px) scale(${scale})`,
        borderRadius: 22,
        padding: '18px 22px',
        background: 'linear-gradient(145deg, rgba(6,18,32,0.92) 0%, rgba(4,12,22,0.82) 100%)',
        border: `1.5px solid ${accentColor}77`,
        boxShadow: `0 6px 14px rgba(0,0,0,0.45), 0 24px 52px -8px rgba(0,0,0,0.72), 0 0 24px ${accentColor}26, inset 0 1.5px 0 rgba(255,255,255,0.28)`,
        overflow: 'hidden',
        ...style,
      }}
    >
      <SheenSweep startFrame={sheenFrame ?? delay + 14} durationFrames={26} />
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
