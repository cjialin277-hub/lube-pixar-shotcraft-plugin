import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Easing,
  OffthreadVideo,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
} from 'remotion';
import {
  AilaoShotcraftV4Ultra,
  BatteryShotcraftV4Ultra,
  ChengjiangShotcraftV4Ultra,
  FuxianLakeShotcraftV4Ultra,
} from './scenes/ShotcraftInsertsV4Ultra';
import { FONT_MONO, FONT_SANS, Locale } from './scenes/ScienceInserts';
import { FlashCut } from './shotcraft/FlashCut';
import { HanaziPop, HanaziSpec } from './shotcraft/HanaziPop';
import { SheenSweep } from './shotcraft/ShotcraftCam';
import { BeatScene, SubtitleItem, YuxiVideoProps } from './YuxiHybridVideo';

const OVERLAP_FRAMES = 12;

/**
 * Curated `18-hanazi` kinetic pop moments (positioned strictly in open sky/top negative space, NEVER blocking faces!)
 */
const HANAZI_MAP: Record<string, { sc: HanaziSpec; tc: HanaziSpec }> = {
  B01: {
    sc: { text: '逛半天就走?!', startFrame: 52, durationFrames: 50, top: 205, right: 190, rotateDeg: -5, fontSize: 50, accentStroke: '#0369a1', burst: true },
    tc: { text: '逛半天就走?!', startFrame: 52, durationFrames: 50, top: 205, right: 190, rotateDeg: -5, fontSize: 50, accentStroke: '#0369a1', burst: true },
  },
  B02: {
    sc: { text: '蓝到像大海!', startFrame: 36, durationFrames: 48, top: 200, left: 68, rotateDeg: -4, fontSize: 52, accentStroke: '#0284c7', fillGradient: 'linear-gradient(180deg, #e0f2fe 0%, #38bdf8 60%, #0284c7 100%)', burst: true },
    tc: { text: '藍到像大海!', startFrame: 36, durationFrames: 48, top: 200, left: 68, rotateDeg: -4, fontSize: 52, accentStroke: '#0284c7', fillGradient: 'linear-gradient(180deg, #e0f2fe 0%, #38bdf8 60%, #0284c7 100%)', burst: true },
  },
  B04: {
    sc: { text: '2米寒武纪巨兽!', startFrame: 96, durationFrames: 56, top: 208, left: 62, rotateDeg: 3, fontSize: 50, accentStroke: '#7c2d12', burst: true },
    tc: { text: '2米寒武紀巨獸!', startFrame: 96, durationFrames: 56, top: 208, left: 62, rotateDeg: 3, fontSize: 50, accentStroke: '#7c2d12', burst: true },
  },
  B06: {
    sc: { text: '爆汁冰糖橙!', startFrame: 122, durationFrames: 54, top: 210, right: 190, rotateDeg: -4, fontSize: 52, accentStroke: '#c2410c', fillGradient: 'linear-gradient(180deg, #fef9c3 0%, #fbbf24 55%, #f97316 100%)', burst: true },
    tc: { text: '爆汁冰糖橙!', startFrame: 122, durationFrames: 54, top: 210, right: 190, rotateDeg: -4, fontSize: 52, accentStroke: '#c2410c', fillGradient: 'linear-gradient(180deg, #fef9c3 0%, #fbbf24 55%, #f97316 100%)', burst: true },
  },
  B08: {
    sc: { text: '比保鲜膜还薄?!', startFrame: 42, durationFrames: 48, top: 176, left: 54, rotateDeg: -3, fontSize: 48, accentStroke: '#065f46', fillGradient: 'linear-gradient(180deg, #ecfdf5 0%, #34d399 58%, #059669 100%)', burst: true },
    tc: { text: '比保鮮膜還薄?!', startFrame: 42, durationFrames: 48, top: 176, left: 54, rotateDeg: -3, fontSize: 48, accentStroke: '#065f46', fillGradient: 'linear-gradient(180deg, #ecfdf5 0%, #34d399 58%, #059669 100%)', burst: true },
  },
  B10: {
    sc: { text: '764.9亿硬核家底!', startFrame: 34, durationFrames: 52, top: 204, left: 64, rotateDeg: -3, fontSize: 48, accentStroke: '#0369a1', fillGradient: 'linear-gradient(180deg, #e0f2fe 0%, #38bdf8 55%, #0284c7 100%)', burst: true },
    tc: { text: '764.9億硬核家底!', startFrame: 34, durationFrames: 52, top: 204, left: 64, rotateDeg: -3, fontSize: 48, accentStroke: '#0369a1', fillGradient: 'linear-gradient(180deg, #e0f2fe 0%, #38bdf8 55%, #0284c7 100%)', burst: true },
  },
  B11: {
    sc: { text: '真香警告!', startFrame: 62, durationFrames: 52, top: 205, left: 68, rotateDeg: -5, fontSize: 54, accentStroke: '#9a3412', burst: true },
    tc: { text: '真香警告!', startFrame: 62, durationFrames: 52, top: 205, left: 68, rotateDeg: -5, fontSize: 54, accentStroke: '#9a3412', burst: true },
  },
  B12: {
    sc: { text: '宝藏玉溪!', startFrame: 48, durationFrames: 52, top: 202, right: 190, rotateDeg: -4, fontSize: 52, accentStroke: '#b45309', fillGradient: 'linear-gradient(180deg, #fffbeb 0%, #fde047 55%, #f59e0b 100%)', burst: true },
    tc: { text: '寶藏玉溪!', startFrame: 48, durationFrames: 52, top: 202, right: 190, rotateDeg: -4, fontSize: 52, accentStroke: '#b45309', fillGradient: 'linear-gradient(180deg, #fffbeb 0%, #fde047 55%, #f59e0b 100%)', burst: true },
  },
};

/**
 * Pixar 3D Anime Beat Layer V4 Ultra-Max:
 * - Upgraded with `video-shotcraft` `DutchRollToLevel` 3D gimbal settle on entry (`rotY: ±3.2° -> 0°, rotZ: ±1.1° -> 0°`)
 *   + silky cinema breath push/pull so every anime shot feels physically mounted on a cinema crane!
 * - Chapter pill upgraded with `<SheenSweep>` + live 4-bar equalizer pulse!
 */
const AnimeShotcraftLayerV4Ultra: React.FC<{ beat: BeatScene; locale: Locale; index: number }> = ({
  beat,
  locale,
  index,
}) => {
  const frame = useCurrentFrame();
  const isTC = locale === 'zh-TW';
  const videoSrc = beat.video
    ? beat.video.includes('/')
      ? beat.video
      : `videos_v2/${beat.video}`
    : null;

  const dur = Math.max(30, beat.durationInFrames);
  const progress = interpolate(frame, [0, dur], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.33, 0, 0.2, 1),
  });

  // `video-shotcraft` DutchRollToLevel entry envelope (first 24 frames settle from 3D gimbal whip into level horizon)
  const entrySettle = interpolate(frame, [0, 24], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const sign = index % 2 === 0 ? 1 : -1;
  const rotY = sign * entrySettle * 3.2;
  const rotZ = -sign * entrySettle * 1.05;

  const pushIn = index % 2 === 0;
  const microScale =
    (pushIn ? 1.015 + progress * 0.05 : 1.065 - progress * 0.045) + entrySettle * 0.035;
  const microX = (pushIn ? -progress * 12 : (progress - 0.5) * 16) + sign * entrySettle * 18;

  const hanazi = HANAZI_MAP[beat.id] ? (isTC ? HANAZI_MAP[beat.id].tc : HANAZI_MAP[beat.id].sc) : null;

  return (
    <AbsoluteFill style={{ backgroundColor: '#040c14', overflow: 'hidden', perspective: '1400px' }}>
      {videoSrc && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transform: `scale(${microScale}) translateX(${microX}px) rotateY(${rotY}deg) rotateZ(${rotZ}deg)`,
            transformOrigin: 'center 42%',
          }}
        >
          <OffthreadVideo
            src={staticFile(videoSrc)}
            muted
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      )}

      {/* Subtle feather gradients ONLY at very top & bottom for cinema readability */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 240,
          background: 'linear-gradient(180deg, rgba(2,8,16,0.48) 0%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 620,
          background: 'linear-gradient(0deg, rgba(2,8,16,0.84) 0%, rgba(2,8,16,0.34) 55%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Luxury Chapter Pill with SheenSweep + Live Audio Wave Equalizer */}
      <div
        style={{
          position: 'absolute',
          top: 120,
          left: 48,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 12,
          padding: '8px 20px',
          borderRadius: 999,
          background: 'linear-gradient(135deg, rgba(6, 18, 32, 0.78) 0%, rgba(4, 12, 22, 0.64) 100%)',
          border: '1.5px solid rgba(255, 255, 255, 0.28)',
          boxShadow: '0 10px 28px rgba(0,0,0,0.48), inset 0 1px 0 rgba(255,255,255,0.28)',
          overflow: 'hidden',
        }}
      >
        <SheenSweep startFrame={8} durationFrames={26} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: 16 }}>
          {[0, 1, 2, 3].map((b) => {
            const h = 5 + Math.abs(Math.sin(frame * 0.28 + b * 1.1)) * 11;
            return (
              <div
                key={b}
                style={{
                  width: 3,
                  height: h,
                  borderRadius: 2,
                  backgroundColor: b % 2 === 0 ? '#fde047' : '#38bdf8',
                }}
              />
            );
          })}
        </div>
        <span style={{ fontFamily: FONT_SANS, fontSize: 22, fontWeight: 800, color: '#ffffff' }}>
          {beat.chapter}
        </span>
      </div>

      {/* mg-styles-15 18-hanazi Elastic Pop Caption */}
      {hanazi && <HanaziPop spec={hanazi} />}
    </AbsoluteFill>
  );
};

/**
 * Choreographed Transition Wrapper V4 Ultra-Max
 */
const ChoreographedTransitionWrapperV4Ultra: React.FC<{
  beat: BeatScene;
  isFirst: boolean;
  isLast: boolean;
  nextBeat: BeatScene | null;
  children: React.ReactNode;
}> = ({ beat, isFirst, isLast, nextBeat, children }) => {
  const localFrame = useCurrentFrame();
  const seqDuration = beat.durationInFrames;

  const selfReveals = beat.kind === 'three_lake' || beat.kind === 'three_ailao';
  const fadeInFrames = beat.kind === 'three_battery' ? 6 : OVERLAP_FRAMES;
  const fadeIn =
    isFirst || selfReveals
      ? 1
      : interpolate(localFrame, [0, fadeInFrames], [0, 1], {
          easing: Easing.inOut(Easing.cubic),
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });

  const isDivingOut = !isLast && beat.kind === 'anime' && nextBeat !== null && nextBeat.kind !== 'anime';
  const scaleOut = isDivingOut
    ? interpolate(localFrame, [seqDuration - OVERLAP_FRAMES - 4, seqDuration], [1.0, 1.12], {
        easing: Easing.in(Easing.cubic),
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 1.0;

  return (
    <AbsoluteFill
      style={{
        opacity: fadeIn,
        transform: scaleOut !== 1 ? `scale(${scaleOut})` : undefined,
        transformOrigin: 'center center',
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/**
 * Borderless Cinema Kinetic Subtitles V4 Ultra-Max:
 * - Added `video-shotcraft` `springAt` word-level kinetic pop on the highlighted keyword
 *   + glowing animated underline bar sweeping beneath the keyword!
 */
const CinemaSubtitlesV4Ultra: React.FC<{ subtitles: SubtitleItem[] }> = ({ subtitles }) => {
  const frame = useCurrentFrame();
  const active = subtitles.find((s) => frame >= s.startFrame && frame <= s.endFrame);
  if (!active) return null;

  const lf = frame - active.startFrame;
  const enterP = interpolate(lf, [0, 6], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const enterY = (1 - enterP) * 14;

  // Spring pop for keyword highlight (`Look.tsx` springAt)
  const hiSpring = spring({
    frame: Math.max(0, lf - 2),
    fps: 30,
    config: { damping: 13, stiffness: 210, mass: 0.9 },
  });
  const hiScale = 0.88 + 0.12 * hiSpring;

  const isLin = active.speaker === 'linxiao';
  const badgeBg = isLin ? '#0284c7' : '#059669';
  const hiColor = isLin ? '#38bdf8' : '#fde047';

  const parts =
    active.highlight && active.text.includes(active.highlight)
      ? active.text.split(active.highlight)
      : [active.text];

  return (
    <div
      style={{
        position: 'absolute',
        top: 1290,
        left: 48,
        width: 852,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 10,
        opacity: enterP,
        transform: `translateY(${enterY}px)`,
        pointerEvents: 'none',
        zIndex: 30,
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '4px 16px',
          borderRadius: 999,
          backgroundColor: badgeBg,
          border: '1px solid rgba(255,255,255,0.35)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.55)',
        }}
      >
        <div
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            backgroundColor: '#ffffff',
            boxShadow: '0 0 8px #ffffff',
          }}
        />
        <span style={{ fontFamily: FONT_SANS, fontSize: 21, fontWeight: 900, color: '#ffffff' }}>
          {active.speakerName}
        </span>
      </div>

      {/* Borderless theatrical subtitles with word-level spring highlight + glowing underline */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          fontFamily: FONT_SANS,
          fontSize: 36,
          fontWeight: 900,
          lineHeight: 1.32,
          letterSpacing: 0.4,
          color: '#ffffff',
          textShadow:
            '0 3px 0 rgba(2,8,16,0.96), 0 -2px 0 rgba(2,8,16,0.92), 2px 0 0 rgba(2,8,16,0.92), -2px 0 0 rgba(2,8,16,0.92), 0 8px 26px rgba(0,0,0,0.92)',
        }}
      >
        {parts.length === 2 ? (
          <>
            {parts[0]}
            <span
              style={{
                position: 'relative',
                display: 'inline-block',
                margin: '0 3px',
                transform: `scale(${hiScale})`,
                transformOrigin: 'center bottom',
                color: hiColor,
                fontSize: 39,
                textShadow: `0 3px 0 rgba(2,8,16,0.98), 0 0 22px ${hiColor}88, 0 8px 24px rgba(0,0,0,0.92)`,
              }}
            >
              {active.highlight}
              <span
                style={{
                  position: 'absolute',
                  left: 0,
                  bottom: -2,
                  width: `${Math.min(100, hiSpring * 100)}%`,
                  height: 4,
                  borderRadius: 4,
                  backgroundColor: hiColor,
                  boxShadow: `0 0 12px ${hiColor}`,
                }}
              />
            </span>
            {parts[1]}
          </>
        ) : (
          active.text
        )}
      </div>
    </div>
  );
};

export const YuxiShotcraftV4Ultra: React.FC<YuxiVideoProps> = ({
  locale,
  timelineData,
  audioFile,
  showSafeZoneOverlay = false,
}) => {
  const frame = useCurrentFrame();
  const pct = Math.min(100, (frame / Math.max(1, timelineData.totalFrames - 1)) * 100);

  // Trigger warm cinema FlashCut right on key anime->anime scene jumps
  const flashFrames: number[] = [];
  for (let i = 1; i < timelineData.scenes.length; i++) {
    const prev = timelineData.scenes[i - 1];
    const curr = timelineData.scenes[i];
    if (prev.kind === 'anime' && curr.kind === 'anime' && (curr.id === 'B02' || curr.id === 'B11' || curr.id === 'B12')) {
      flashFrames.push(Math.max(0, curr.startFrame - 2));
    }
  }

  return (
    <AbsoluteFill style={{ backgroundColor: '#030b14' }}>
      <Audio src={staticFile(audioFile)} />

      {timelineData.scenes.map((beat, idx) => {
        const isFirst = idx === 0;
        const isLast = idx === timelineData.scenes.length - 1;
        const nextBeat = idx < timelineData.scenes.length - 1 ? timelineData.scenes[idx + 1] : null;

        return (
          <Sequence key={beat.id} from={beat.startFrame} durationInFrames={beat.durationInFrames}>
            <ChoreographedTransitionWrapperV4Ultra
              beat={beat}
              isFirst={isFirst}
              isLast={isLast}
              nextBeat={nextBeat}
            >
              {beat.kind === 'anime' && <AnimeShotcraftLayerV4Ultra beat={beat} locale={locale} index={idx} />}
              {beat.kind === 'three_lake' && <FuxianLakeShotcraftV4Ultra locale={locale} />}
              {beat.kind === 'code_fossil' && <ChengjiangShotcraftV4Ultra locale={locale} />}
              {beat.kind === 'three_ailao' && <AilaoShotcraftV4Ultra locale={locale} />}
              {beat.kind === 'three_battery' && <BatteryShotcraftV4Ultra locale={locale} />}
            </ChoreographedTransitionWrapperV4Ultra>
          </Sequence>
        );
      })}

      {/* video-shotcraft warm-white FlashCut blooms on climax transitions */}
      {flashFrames.map((ff, i) => (
        <Sequence key={`flash-${i}`} from={ff} durationInFrames={12}>
          <FlashCut duration={12} />
        </Sequence>
      ))}

      {/* Ultra-slim top progress thread */}
      <div
        style={{
          position: 'absolute',
          top: 98,
          left: 48,
          width: 852,
          height: 4,
          borderRadius: 99,
          backgroundColor: 'rgba(255,255,255,0.18)',
          overflow: 'hidden',
          zIndex: 35,
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #38bdf8, #34d399, #fde047)',
          }}
        />
      </div>

      <CinemaSubtitlesV4Ultra subtitles={timelineData.subtitles} />

      {showSafeZoneOverlay && (
        <AbsoluteFill style={{ pointerEvents: 'none', zIndex: 50 }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 110, backgroundColor: 'rgba(239,68,68,0.22)', borderBottom: '2px dashed #ef4444' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 430, backgroundColor: 'rgba(239,68,68,0.22)', borderTop: '2px dashed #ef4444' }} />
          <div style={{ position: 'absolute', top: 110, bottom: 430, right: 0, width: 170, backgroundColor: 'rgba(239,68,68,0.22)', borderLeft: '2px dashed #ef4444' }} />
          <div
            style={{
              position: 'absolute',
              top: 16,
              left: 24,
              fontFamily: FONT_MONO,
              fontSize: 22,
              fontWeight: 900,
              color: '#fecaca',
              backgroundColor: 'rgba(0,0,0,0.75)',
              padding: '4px 12px',
              borderRadius: 8,
            }}
          >
            V4 ULTRA SHOTCRAFT SAFE ZONE QA
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
