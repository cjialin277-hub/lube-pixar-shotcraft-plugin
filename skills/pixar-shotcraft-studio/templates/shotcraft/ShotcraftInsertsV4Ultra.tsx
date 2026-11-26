import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { DigitRoll } from '../shotcraft/DigitRoll';
import {
  CleanGlassCard,
  Plane3D,
  PortraitCamKey,
  ScanBracketOverlay,
  SheenSweep,
  ShotcraftCam,
  Viewport3DHUD,
} from '../shotcraft/ShotcraftCam';
import { dampedSettle } from '../shotcraft/helpers/motion';
import { FONT_MONO, FONT_SANS, Locale } from './ScienceInserts';

// Deterministic hash for particle & telemetry jitter (from video-shotcraft Motion.tsx)
const rand = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const TopScrim: React.FC<{ color?: string }> = ({ color = 'rgba(2,10,20,0.82)' }) => (
  <>
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 440,
        background: `linear-gradient(180deg, ${color} 0%, rgba(2,10,20,0.34) 60%, transparent 100%)`,
        pointerEvents: 'none',
      }}
    />
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 760,
        background: 'linear-gradient(0deg, rgba(2,10,20,0.92) 0%, rgba(2,10,20,0.48) 55%, transparent 100%)',
        pointerEvents: 'none',
      }}
    />
  </>
);

/**
 * B03 — Fuxian Lake V4 Ultra-Max:
 * - Entry: `video-shotcraft` `circle-match-iris` expanding from the lake splash
 * - True 3D Multi-Plane Stage (`Z = -85px` plate, `Z = +36px` SVG Sonar Bathymetry & Rising Hydro-Particles & Live Depth Plumb)
 * - Camera-Synchronized 3D Viewport HUD (`Viewport3DHUD`: Hero Odometer + Live Volume Comparison Bars + Dual Glass Cards)
 */
export const FuxianLakeShotcraftV4Ultra: React.FC<{ locale: Locale }> = ({ locale }) => {
  const frame = useCurrentFrame();
  const isTC = locale === 'zh-TW';

  const irisT = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.55, 0, 0.28, 1),
  });
  const irisR = irisT < 0.99 ? 45 + irisT * 1980 : 2500;
  const ringAlpha = interpolate(frame, [0, 3, 9, 13], [0, 0.95, 0.7, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Sonar bathymetric dive progress (0m -> 158.9m)
  const divePct = interpolate(frame, [8, 128], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });
  const liveDepth = (divePct * 158.9).toFixed(1);

  const camKeys: PortraitCamKey[] = [
    { frame: 0, cx: 540, cy: 760, zoom: 1.08, rotX: 7.5, rotY: -6.5, rotZ: -0.8 },
    { frame: 115, cx: 520, cy: 990, zoom: 1.18, rotX: -2.5, rotY: 5.5, rotZ: 0.5 },
    { frame: 225, cx: 548, cy: 1090, zoom: 1.24, rotX: -4.5, rotY: -3.5, rotZ: -0.3 },
    { frame: 310, cx: 540, cy: 1140, zoom: 1.29, rotX: -3, rotY: 3, rotZ: 0 },
  ];

  const volBars = [
    { label: isTC ? '撫仙湖 206億m³' : '抚仙湖 206亿m³', pct: 1.0, color: '#38bdf8' },
    { label: isTC ? '13× 滇池總水量' : '13× 滇池总水量', pct: 0.78, color: '#34d399' },
    { label: isTC ? '7× 洱海 · 4× 太湖' : '7× 洱海 · 4× 太湖', pct: 0.58, color: '#fde047' },
  ];

  return (
    <AbsoluteFill
      style={{
        clipPath: irisT < 0.99 ? `circle(${irisR}px at 540px 1440px)` : undefined,
        backgroundColor: '#031324',
      }}
    >
      <ShotcraftCam src="plates_v3/PLATE_LAKE.jpg" bgPlaneZ={-85} keys={camKeys} saturate={1.14}>
        {/* PLANE 1 (Z = +36px): World-Anchored 3D Bathymetric Sonar Rings + Rising Hydro-Bubbles + Laser Depth Plumb-Line */}
        <Plane3D z={36}>
          <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
            <defs>
              <radialGradient id="sonarGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.28" />
                <stop offset="70%" stopColor="#0284c7" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Perspective elliptical bathymetric sonar rings anchored at lake trench (510, 790) */}
            <g transform="translate(510, 790) scale(1, 0.44)">
              <circle r="340" fill="url(#sonarGlow)" />
              {[130, 225, 325].map((r, idx) => {
                const pulse = ((frame * 1.8 + idx * 45) % 140) / 140;
                const dynR = r * (0.75 + pulse * 0.35);
                const alpha = Math.sin(pulse * Math.PI) * 0.65;
                return (
                  <g key={idx}>
                    <circle
                      r={r}
                      fill="none"
                      stroke="rgba(56,189,248,0.28)"
                      strokeWidth="2"
                      strokeDasharray="10 8"
                    />
                    <circle r={dynR} fill="none" stroke="#38bdf8" strokeWidth="3.5" strokeOpacity={alpha} />
                  </g>
                );
              })}
              {/* Rotating sonar sweep line */}
              <g transform={`rotate(${(frame * 2.6) % 360})`}>
                <line x1="0" y1="0" x2="325" y2="0" stroke="#7dd3fc" strokeWidth="3.5" />
                <path d="M 0 0 L 325 0 A 325 325 0 0 0 280 -162 Z" fill="rgba(56,189,248,0.16)" />
              </g>
            </g>

            {/* Vertical laser depth plumb-line from surface (y=500) to abyssal trench floor (y=980) */}
            <line
              x1="150"
              y1="500"
              x2="150"
              y2="980"
              stroke="rgba(125,211,252,0.28)"
              strokeWidth="4"
              strokeDasharray="6 6"
            />
            <line x1="150" y1="500" x2="150" y2={500 + divePct * 480} stroke="#38bdf8" strokeWidth="6" />
            {[0, 0.33, 0.66, 1].map((tick, i) => {
              const ty = 500 + tick * 480;
              const labels = ['0m', '-50m', '-105m', '-158.9m'];
              return (
                <g key={i} transform={`translate(150, ${ty})`}>
                  <line x1="-12" y1="0" x2="14" y2="0" stroke="#7dd3fc" strokeWidth="3" />
                  <text x="22" y="7" fill="#bae6fd" fontFamily={FONT_MONO} fontSize="20" fontWeight="800">
                    {labels[i]}
                  </text>
                </g>
              );
            })}

            {/* Live tracking depth beacon */}
            <g transform={`translate(150, ${500 + divePct * 480})`}>
              <circle r="11" fill="#fde047" />
              <circle r="22" fill="none" stroke="#fde047" strokeWidth="2.5" strokeOpacity="0.7" />
              <line
                x1="16"
                y1="0"
                x2="360"
                y2="0"
                stroke="rgba(253,224,71,0.45)"
                strokeWidth="2"
                strokeDasharray="8 6"
              />
              <rect
                x="130"
                y="-22"
                width="168"
                height="38"
                rx="8"
                fill="rgba(3,19,36,0.9)"
                stroke="#fde047"
                strokeWidth="1.8"
              />
              <text x="214" y="4" textAnchor="middle" fill="#fde047" fontFamily={FONT_MONO} fontSize="21" fontWeight="900">
                -{liveDepth}m
              </text>
            </g>

            {/* 16 Deterministic rising hydro-luminescent bubbles */}
            {Array.from({ length: 16 }, (_, i) => {
              const bx = 220 + rand(i * 7 + 1) * 580;
              const speed = 1.4 + rand(i * 11 + 3) * 1.8;
              const by = 1040 - ((frame * speed + rand(i * 19) * 560) % 580);
              const br = 3 + rand(i * 23) * 5.5;
              const sway = Math.sin(frame * 0.08 + i) * 12;
              return (
                <circle
                  key={i}
                  cx={bx + sway}
                  cy={by}
                  r={br}
                  fill="#7dd3fc"
                  fillOpacity={0.35 + rand(i * 5) * 0.45}
                />
              );
            })}
          </svg>
        </Plane3D>
      </ShotcraftCam>

      <TopScrim />

      {/* Camera-Synchronized 3D Viewport HUD (100% locked inside mobile safe zone with real 3D tilt & parallax!) */}
      <Viewport3DHUD keys={camKeys}>
        <div
          style={{
            position: 'absolute',
            top: 138,
            left: 48,
            width: 852,
            padding: '18px 24px',
            borderRadius: 24,
            background: 'linear-gradient(135deg, rgba(4,22,42,0.9) 0%, rgba(2,12,24,0.78) 100%)',
            border: '1.5px solid rgba(56,189,248,0.55)',
            boxShadow: '0 24px 52px rgba(0,0,0,0.75), inset 0 1.5px 0 rgba(255,255,255,0.28)',
            overflow: 'hidden',
          }}
        >
          <SheenSweep startFrame={16} durationFrames={28} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: 25,
                  fontWeight: 800,
                  color: '#7dd3fc',
                  letterSpacing: 1.2,
                }}
              >
                {isTC ? '撫仙湖 · 中國第二深淡水湖' : '抚仙湖 · 中国第二深淡水湖'}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 4 }}>
                <DigitRoll value="158.9" delay={6} fontSize={94} color="#ffffff" />
                <span
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 40,
                    fontWeight: 900,
                    color: '#38bdf8',
                    textShadow: '0 0 24px rgba(56,189,248,0.85)',
                  }}
                >
                  m
                </span>
              </div>
            </div>

            {/* Right 3D Live Volume Comparison Mini-Chart */}
            <div style={{ width: 310, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {volBars.map((b, idx) => {
                const barP = interpolate(frame - (18 + idx * 7), [0, 22], [0, b.pct], {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                  easing: Easing.out(Easing.back(1.4)),
                });
                return (
                  <div key={idx}>
                    <div
                      style={{
                        fontFamily: FONT_SANS,
                        fontSize: 18,
                        fontWeight: 800,
                        color: '#e0f2fe',
                        marginBottom: 3,
                      }}
                    >
                      {b.label}
                    </div>
                    <div
                      style={{
                        width: '100%',
                        height: 10,
                        borderRadius: 99,
                        backgroundColor: 'rgba(255,255,255,0.14)',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${barP * 100}%`,
                          height: '100%',
                          borderRadius: 99,
                          backgroundColor: b.color,
                          boxShadow: `0 0 12px ${b.color}`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div style={{ position: 'absolute', top: 1068, left: 48, width: 852, display: 'flex', gap: 18 }}>
          <CleanGlassCard delay={16} accentColor="#38bdf8" style={{ flex: 1 }}>
            <div style={{ fontFamily: FONT_MONO, fontSize: 38, fontWeight: 900, color: '#38bdf8' }}>
              {isTC ? '206.2 億方' : '206.2 亿方'}
            </div>
            <div style={{ fontFamily: FONT_SANS, fontSize: 22, fontWeight: 700, color: '#e0f2fe', marginTop: 4 }}>
              {isTC ? '≈ 13滇池 · 7洱海 · 4太湖' : '≈ 13滇池 · 7洱海 · 4太湖'}
            </div>
          </CleanGlassCard>
          <CleanGlassCard delay={28} accentColor="#fde047" style={{ flex: 1 }}>
            <div style={{ fontFamily: FONT_MONO, fontSize: 38, fontWeight: 900, color: '#fde047' }}>
              {isTC ? 'I 類水 90%+' : 'I 类水 90%+'}
            </div>
            <div style={{ fontFamily: FONT_SANS, fontSize: 22, fontWeight: 700, color: '#fef9c3', marginTop: 4 }}>
              {isTC ? '全國重點湖泊總量' : '全国重点湖泊总量'}
            </div>
          </CleanGlassCard>
        </div>
      </Viewport3DHUD>

      {/* Expanding iris cyan rim halo during entry */}
      {ringAlpha > 0.01 && (
        <div
          style={{
            position: 'absolute',
            left: 540 - irisR,
            top: 1440 - irisR,
            width: irisR * 2,
            height: irisR * 2,
            borderRadius: '50%',
            border: `${Math.max(4, 28 * (1 - irisT))}px solid #38bdf8`,
            boxShadow: '0 0 40px #38bdf8, inset 0 0 30px #7dd3fc',
            opacity: ringAlpha,
            pointerEvents: 'none',
          }}
        />
      )}
    </AbsoluteFill>
  );
};

/**
 * B05 — Chengjiang Fossil Site V4 Ultra-Max:
 * - True 3D Multi-Plane Camera Orbit (`Z = -80px` plate, `Z = +40px` Golden Cambrian Blueprint Wireframe & Stratum Laser Scanner)
 * - Camera-Synchronized 3D Viewport HUD (`Viewport3DHUD`: Hero Odometer + 3D `timeline-travel` Rail + Spring Milestone Cards!)
 */
export const ChengjiangShotcraftV4Ultra: React.FC<{ locale: Locale }> = ({ locale }) => {
  const frame = useCurrentFrame();
  const isTC = locale === 'zh-TW';

  const rawU = Math.max(0, Math.min(1, (frame - 8) / 86));
  const travel =
    rawU < 0.15
      ? (rawU / 0.15) * 0.06
      : rawU < 0.86
        ? 0.06 + ((rawU - 0.15) / 0.71) * 0.86
        : 0.92 + Easing.out(Easing.cubic)((rawU - 0.86) / 0.14) * 0.08;

  const brakePush = interpolate(frame, [90, 104], [1.0, 1.05], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  const wireP = interpolate(frame, [14, 96], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });

  const camKeys: PortraitCamKey[] = [
    { frame: 0, cx: 475, cy: 960, zoom: 1.08, rotY: -7.5, rotX: 4.5, rotZ: -0.6 },
    { frame: 88, cx: 565, cy: 940, zoom: 1.16, rotY: 4.5, rotX: -1.5, rotZ: 0.4 },
    { frame: 106, cx: 540, cy: 915, zoom: 1.28, rotY: -1.5, rotX: -3, rotZ: 0 },
    { frame: 275, cx: 540, cy: 885, zoom: 1.33, rotY: 5, rotX: -2.5, rotZ: 0.3 },
  ];

  const stops = [
    { at: 0.05, era: isTC ? '現代' : '现代', tag: '0 Ma', color: '#38bdf8' },
    { at: 0.48, era: isTC ? '恐龍時代' : '恐龙时代', tag: '2.3 亿年', color: '#34d399' },
    { at: 0.94, era: isTC ? '★ 玉溪澄江' : '★ 玉溪澄江', tag: '5.18 亿年', color: '#fde047' },
  ];

  const trackW = 1650;
  const camX = travel * (trackW - 760);

  return (
    <AbsoluteFill style={{ backgroundColor: '#05141a' }}>
      <ShotcraftCam src="plates_v3/PLATE_FOSSIL.jpg" bgPlaneZ={-80} keys={camKeys} saturate={1.16}>
        {/* PLANE 1 (Z = +40px): Golden Cambrian Blueprint Telemetry Ring & Stratum Scanner */}
        <Plane3D z={40}>
          <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
            <g transform="translate(505, 748)">
              <circle
                r="210"
                fill="none"
                stroke="rgba(253,224,71,0.32)"
                strokeWidth="2.5"
                strokeDasharray="14 10"
                transform={`rotate(${frame * 0.8})`}
              />
              <circle
                r="162"
                fill="none"
                stroke="#fde047"
                strokeWidth="3.5"
                strokeDasharray="1020"
                strokeDashoffset={1020 * (1 - wireP)}
              />
              {/* Precision fossil caliper dimension bars */}
              <line x1="-230" y1="165" x2="230" y2="165" stroke="#34d399" strokeWidth="3" strokeOpacity={wireP} />
              <line x1="-230" y1="151" x2="-230" y2="179" stroke="#34d399" strokeWidth="3" strokeOpacity={wireP} />
              <line x1="230" y1="151" x2="230" y2="179" stroke="#34d399" strokeWidth="3" strokeOpacity={wireP} />
              <rect
                x="-198"
                y="143"
                width="396"
                height="44"
                rx="11"
                fill="rgba(5,20,26,0.94)"
                stroke="#34d399"
                strokeWidth="2.2"
                opacity={wireP}
              />
              <text
                x="0"
                y="172"
                textAnchor="middle"
                fill="#6ee7b7"
                fontFamily={FONT_MONO}
                fontSize="20"
                fontWeight="900"
                opacity={wireP}
              >
                {isTC ? '奇蝦 2.0m · 昆明魚微米級軟軀體' : '奇虾 2.0m · 昆明鱼微米级软躯体'}
              </text>
            </g>
          </svg>
        </Plane3D>
      </ShotcraftCam>

      <TopScrim color="rgba(5,18,24,0.88)" />

      {/* Camera-Synchronized 3D Viewport HUD */}
      <Viewport3DHUD keys={camKeys}>
        <div
          style={{
            position: 'absolute',
            top: 138,
            left: 48,
            width: 852,
            transform: `scale(${brakePush})`,
            transformOrigin: 'left top',
            padding: '16px 26px',
            borderRadius: 24,
            background: 'linear-gradient(135deg, rgba(12,24,28,0.9) 0%, rgba(5,14,18,0.78) 100%)',
            border: '1.5px solid rgba(250,204,21,0.55)',
            boxShadow: '0 24px 52px rgba(0,0,0,0.75), inset 0 1.5px 0 rgba(255,255,255,0.26)',
            overflow: 'hidden',
          }}
        >
          <SheenSweep startFrame={92} durationFrames={24} color="rgba(253,224,71,0.34)" />
          <div style={{ fontFamily: FONT_SANS, fontSize: 26, fontWeight: 800, color: '#fbbf24', letterSpacing: 1.4 }}>
            {isTC ? '玉溪 · 澄江化石地世界自然遺產' : '玉溪 · 澄江化石地世界自然遗产'}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 2 }}>
            <DigitRoll value="5.18" delay={12} fontSize={94} color="#ffffff" />
            <span
              style={{
                fontFamily: FONT_SANS,
                fontSize: 42,
                fontWeight: 900,
                color: '#fde047',
                textShadow: '0 0 24px rgba(250,204,21,0.8)',
              }}
            >
              {isTC ? '億年前' : '亿年前'}
            </span>
          </div>
        </div>

        {/* 3D Perspective Timeline-Travel Rail */}
        <div
          style={{
            position: 'absolute',
            top: 374,
            left: 48,
            width: 852,
            height: 148,
            overflow: 'hidden',
            borderRadius: 20,
            background:
              'linear-gradient(90deg, rgba(4,16,24,0.92) 0%, rgba(4,16,24,0.72) 85%, rgba(4,16,24,0.94) 100%)',
            border: '1.5px solid rgba(250,204,21,0.44)',
            boxShadow: '0 20px 44px rgba(0,0,0,0.68)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: 44 - camX,
              top: 0,
              width: trackW,
              height: '100%',
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: 98,
                height: 4,
                background: 'linear-gradient(90deg, #38bdf8, #34d399, #fde047)',
                borderRadius: 4,
                boxShadow: '0 0 14px rgba(253,224,71,0.5)',
              }}
            />
            {Array.from({ length: 42 }, (_, k) => (
              <div
                key={k}
                style={{
                  position: 'absolute',
                  left: k * 39,
                  top: 89,
                  width: 2,
                  height: k % 5 === 0 ? 18 : 10,
                  backgroundColor: 'rgba(255,255,255,0.42)',
                }}
              />
            ))}
            {stops.map((st, idx) => {
              const px = st.at * (trackW - 140) + 40;
              const arriveF = 8 + st.at * 84;
              const pf = frame - (arriveF - 6);
              const popP = interpolate(pf, [0, 12], [0, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
                easing: Easing.out(Easing.back(1.9)),
              });
              return (
                <div
                  key={idx}
                  style={{
                    position: 'absolute',
                    left: px,
                    top: 16,
                    transform: `translateX(-50%) scaleY(${popP})`,
                    transformOrigin: 'bottom center',
                    opacity: Math.min(1, popP * 1.5),
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      padding: '6px 16px',
                      borderRadius: 12,
                      backgroundColor: 'rgba(5,18,26,0.95)',
                      border: `2px solid ${st.color}`,
                      boxShadow: `0 0 18px ${st.color}66`,
                      fontFamily: FONT_SANS,
                      fontSize: 22,
                      fontWeight: 900,
                      color: st.color,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {st.era} · {st.tag}
                  </div>
                  <div
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: '50%',
                      backgroundColor: st.color,
                      margin: '16px auto 0',
                      boxShadow: `0 0 16px ${st.color}`,
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ position: 'absolute', top: 1068, left: 48, width: 852, display: 'flex', gap: 18 }}>
          <CleanGlassCard delay={22} accentColor="#fde047" style={{ flex: 1 }}>
            <div style={{ fontFamily: FONT_SANS, fontSize: 32, fontWeight: 900, color: '#fde047' }}>
              {isTC ? '亞洲唯一化石類' : '亚洲唯一化石类'}
            </div>
            <div style={{ fontFamily: FONT_SANS, fontSize: 22, fontWeight: 700, color: '#fef9c3', marginTop: 4 }}>
              {isTC ? '20+ 門類 · 300+ 寒武紀物種' : '20+ 门类 · 300+ 寒武纪物种'}
            </div>
          </CleanGlassCard>
          <CleanGlassCard delay={34} accentColor="#34d399" style={{ flex: 1 }}>
            <div style={{ fontFamily: FONT_SANS, fontSize: 32, fontWeight: 900, color: '#34d399' }}>
              {isTC ? '天下第一魚' : '天下第一鱼'}
            </div>
            <div style={{ fontFamily: FONT_SANS, fontSize: 22, fontWeight: 700, color: '#d1fae5', marginTop: 4 }}>
              {isTC ? '昆明魚 · 微米級軟軀體封存' : '昆明鱼 · 微米级软躯体封存'}
            </div>
          </CleanGlassCard>
        </div>
      </Viewport3DHUD>
    </AbsoluteFill>
  );
};

/**
 * B07 — Ailao Mountain V4 Ultra-Max:
 * - Entry: `video-shotcraft` `bottom-push-stack-wipe`
 * - True 3D Multi-Plane Stage (`Z = -80px` plate, `Z = +42px` Animated 3D Elevation & Microclimate Vector Curve `3100m -> 500m`)
 * - Camera-Synchronized 3D Viewport HUD (`Viewport3DHUD`: Hero Card & Dual Climate Cards!)
 */
export const AilaoShotcraftV4Ultra: React.FC<{ locale: Locale }> = ({ locale }) => {
  const frame = useCurrentFrame();
  const isTC = locale === 'zh-TW';

  const pushY = interpolate(frame, [0, 14], [1920, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });

  const curveP = interpolate(frame, [14, 110], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });

  const camKeys: PortraitCamKey[] = [
    { frame: 0, cx: 515, cy: 735, zoom: 1.16, rotX: 7, rotY: -6, rotZ: -0.7 },
    { frame: 115, cx: 552, cy: 1005, zoom: 1.23, rotX: -1, rotY: 4.5, rotZ: 0.4 },
    { frame: 255, cx: 540, cy: 1175, zoom: 1.3, rotX: -4.5, rotY: -3, rotZ: 0 },
  ];

  return (
    <AbsoluteFill
      style={{
        transform: pushY > 0.5 ? `translateY(${pushY}px)` : undefined,
        boxShadow: pushY > 0.5 ? '0 -30px 90px rgba(251,191,36,0.45)' : undefined,
        backgroundColor: '#061a12',
      }}
    >
      <ShotcraftCam src="plates_v3/PLATE_AILAO.jpg" bgPlaneZ={-80} keys={camKeys} saturate={1.16}>
        {/* PLANE 1 (Z = +42px): Animated 3D Topographic Elevation Curve (3100m Misty Forest -> 500m Dry-Hot Orange Valley) */}
        <Plane3D z={42}>
          <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
            <defs>
              <linearGradient id="ailaoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="50%" stopColor="#fde047" />
                <stop offset="100%" stopColor="#f97316" />
              </linearGradient>
            </defs>

            {/* Glowing elevation profile curve across the 3D mountain relief */}
            <path
              d="M 180 560 C 330 575, 430 730, 560 820 C 665 895, 735 955, 815 975"
              fill="none"
              stroke="url(#ailaoGrad)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray="980"
              strokeDashoffset={980 * (1 - curveP)}
            />

            {/* Upper Node: 3165m Cloud Forest */}
            <g transform="translate(185, 560)" opacity={Math.min(1, curveP * 2.5)}>
              <circle r="12" fill="#34d399" />
              <circle r="24" fill="none" stroke="#34d399" strokeWidth="2.5" />
              <rect
                x="22"
                y="-26"
                width="284"
                height="46"
                rx="11"
                fill="rgba(4,22,16,0.92)"
                stroke="#34d399"
                strokeWidth="2.2"
              />
              <text x="164" y="4" textAnchor="middle" fill="#6ee7b7" fontFamily={FONT_MONO} fontSize="20" fontWeight="900">
                {isTC ? '▲ 3165m 雲霧水源林' : '▲ 3165m 云雾水源林'}
              </text>
            </g>

            {/* Middle Node: Vertical Foehn ΔT Gradient */}
            <g transform="translate(530, 800)" opacity={Math.max(0, Math.min(1, (curveP - 0.35) * 2.5))}>
              <circle r="11" fill="#fde047" />
              <rect
                x="-162"
                y="20"
                width="324"
                height="44"
                rx="11"
                fill="rgba(20,16,4,0.92)"
                stroke="#fde047"
                strokeWidth="2.2"
              />
              <text x="0" y="49" textAnchor="middle" fill="#fde047" fontFamily={FONT_MONO} fontSize="20" fontWeight="900">
                {isTC ? '垂直落差 2600m · 焚風效應' : '垂直落差 2600m · 焚风效应'}
              </text>
            </g>

            {/* Lower Node: 500m Dry-Hot Valley Chu Orange Belt */}
            <g transform="translate(805, 972)" opacity={Math.max(0, Math.min(1, (curveP - 0.72) * 3.5))}>
              <circle r="13" fill="#f97316" />
              <circle r="26" fill="none" stroke="#fbbf24" strokeWidth="2.5" />
              <rect
                x="-304"
                y="-26"
                width="282"
                height="46"
                rx="11"
                fill="rgba(28,12,4,0.94)"
                stroke="#fbbf24"
                strokeWidth="2.2"
              />
              <text x="-163" y="4" textAnchor="middle" fill="#fbbf24" fontFamily={FONT_MONO} fontSize="20" fontWeight="900">
                {isTC ? '▼ 500m 乾熱河谷鎖甜帶' : '▼ 500m 干热河谷锁甜带'}
              </text>
            </g>
          </svg>
        </Plane3D>
      </ShotcraftCam>

      <TopScrim color="rgba(5,20,14,0.82)" />

      {/* Camera-Synchronized 3D Viewport HUD */}
      <Viewport3DHUD keys={camKeys}>
        <div
          style={{
            position: 'absolute',
            top: 138,
            left: 48,
            width: 852,
            padding: '16px 26px',
            borderRadius: 24,
            background: 'linear-gradient(135deg, rgba(6,26,18,0.9) 0%, rgba(4,16,12,0.78) 100%)',
            border: '1.5px solid rgba(52,211,153,0.55)',
            boxShadow: '0 24px 52px rgba(0,0,0,0.75), inset 0 1.5px 0 rgba(255,255,255,0.26)',
            overflow: 'hidden',
          }}
        >
          <SheenSweep startFrame={20} durationFrames={26} />
          <div style={{ fontFamily: FONT_SANS, fontSize: 26, fontWeight: 800, color: '#6ee7b7', letterSpacing: 1.5 }}>
            {isTC ? '哀牢山 · 立體生態地理密碼' : '哀牢山 · 立体生态地理密码'}
          </div>
          <div
            style={{
              fontFamily: FONT_SANS,
              fontSize: 56,
              fontWeight: 900,
              color: '#ffffff',
              marginTop: 6,
              textShadow: '0 6px 24px rgba(0,0,0,0.75)',
            }}
          >
            {isTC ? '原始森林 × 乾熱河谷' : '原始森林 × 干热河谷'}
          </div>
        </div>

        <div style={{ position: 'absolute', top: 1068, left: 48, width: 852, display: 'flex', gap: 18 }}>
          <CleanGlassCard delay={18} accentColor="#34d399" style={{ flex: 1 }}>
            <div style={{ fontFamily: FONT_SANS, fontSize: 32, fontWeight: 900, color: '#6ee7b7' }}>
              {isTC ? '高山原始密林' : '高山原始密林'}
            </div>
            <div style={{ fontFamily: FONT_SANS, fontSize: 22, fontWeight: 700, color: '#d1fae5', marginTop: 4 }}>
              {isTC ? '濕潤冷涼 · 雲霧涵養水源' : '湿润冷凉 · 云雾涵养水源'}
            </div>
          </CleanGlassCard>
          <CleanGlassCard delay={30} accentColor="#fbbf24" style={{ flex: 1 }}>
            <div style={{ fontFamily: FONT_SANS, fontSize: 32, fontWeight: 900, color: '#fbbf24' }}>
              {isTC ? '新平冰糖橙帶' : '新平冰糖橙带'}
            </div>
            <div style={{ fontFamily: FONT_SANS, fontSize: 22, fontWeight: 700, color: '#fef3c7', marginTop: 4 }}>
              {isTC ? '強日照大溫差 · 鎖甜密碼' : '强日照大温差 · 锁甜密码'}
            </div>
          </CleanGlassCard>
        </div>
      </Viewport3DHUD>
    </AbsoluteFill>
  );
};

/**
 * B09 — 5 μm EV Battery Firewall V4 Ultra-Max:
 * - Entry: `video-shotcraft` `crash-zoom-punch` (6f slam + damped impact shake)
 * - Authentic `mg-styles-15` `22-hud` Cyberpunk FUI Layer inside 3D Z-Space (`Z = +44px`)
 * - Camera-Synchronized 3D Viewport HUD (`Viewport3DHUD`: `5 μm` -> `135°C` Thermal Lock + Dual Industrial Cards!)
 */
export const BatteryShotcraftV4Ultra: React.FC<{ locale: Locale }> = ({ locale }) => {
  const frame = useCurrentFrame();
  const isTC = locale === 'zh-TW';

  const alertStart = 110;
  const inAlert = frame >= alertStart;
  const accent = inAlert ? '#fb7185' : '#34d399';

  const slamRingT = interpolate(frame, [12, 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const alertRingT = interpolate(frame, [alertStart, alertStart + 22], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const slamFlash = interpolate(frame, [11, 13, 22], [0, 0.45, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const alertRecoil = dampedSettle(Math.max(0, frame - alertStart), 0.14, 0.22) * 0.06;

  const camKeys: PortraitCamKey[] = [
    { frame: 0, cx: 540, cy: 960, zoom: 1.06, rotY: -7.5, rotX: 3.5, rotZ: -0.6 },
    { frame: 6, cx: 540, cy: 960, zoom: 1.02, rotY: -8.5, rotX: 4, rotZ: -0.8 },
    { frame: 12, cx: 540, cy: 940, zoom: 1.33, rotY: 0, rotX: 0, rotZ: 0 },
    { frame: 110, cx: 540, cy: 925, zoom: 1.25, rotY: 6.5, rotX: -2.5, rotZ: 0.4 },
    { frame: 230, cx: 532, cy: 945, zoom: 1.2, rotY: -5.5, rotX: 2.5, rotZ: -0.3 },
    { frame: 355, cx: 540, cy: 960, zoom: 1.28, rotY: 3.5, rotX: -2, rotZ: 0 },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: '#031110' }}>
      <ShotcraftCam
        src="plates_v3/PLATE_BATTERY.jpg"
        bgPlaneZ={-85}
        keys={camKeys}
        impactFrame={12}
        impactAmp={15}
        saturate={inAlert ? 1.28 : 1.15}
      >
        {/* PLANE 1 (Z = +44px): `mg-styles-15` 22-HUD Rotating Reticles + Scan Brackets + Live Li+ Ion / Thermal Firewall Simulation */}
        <Plane3D z={44}>
          <ScanBracketOverlay left={185} top={480} width={590} height={510} color={accent} startFrame={14} passes={3} />

          <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
            <g transform="translate(480, 735)">
              <circle
                r="230"
                fill="none"
                stroke={accent}
                strokeWidth="2"
                strokeOpacity="0.4"
                strokeDasharray="24 14 6 14"
                transform={`rotate(${frame * 1.1})`}
              />
              <circle
                r="182"
                fill="none"
                stroke={inAlert ? '#fda4af' : '#6ee7b7'}
                strokeWidth="2.5"
                strokeOpacity="0.52"
                strokeDasharray="48 22"
                transform={`rotate(${-frame * 1.6})`}
              />

              {/* Central 5μm separator vertical laser shield line */}
              <line
                x1="0"
                y1="-220"
                x2="0"
                y2="210"
                stroke={accent}
                strokeWidth={inAlert ? 8 : 4}
                strokeDasharray={inAlert ? undefined : '12 10'}
              />

              {/* 28 Deterministic Ions / Thermal Sparks */}
              {Array.from({ length: 28 }, (_, i) => {
                const yOff = -190 + ((i * 14.8 + rand(i * 3) * 18) % 380);
                const speed = 4.2 + rand(i * 11) * 3.2;
                if (!inAlert) {
                  const xPos = -210 + ((frame * speed + rand(i * 17) * 420) % 420);
                  return (
                    <g key={i} transform={`translate(${xPos}, ${yOff})`}>
                      <circle r="5" fill="#38bdf8" />
                      <line x1="-18" y1="0" x2="-4" y2="0" stroke="#38bdf8" strokeWidth="2.5" strokeOpacity="0.6" />
                    </g>
                  );
                } else {
                  const cycle = ((frame - alertStart) * speed * 1.35 + rand(i * 19) * 210) % 210;
                  const fromRight = i % 2 === 0;
                  const dist = cycle < 105 ? 210 - cycle * 2 : (cycle - 105) * 2;
                  const xPos = fromRight ? Math.max(8, dist) : -Math.max(8, dist);
                  const hitGlow = dist < 24;
                  return (
                    <g key={i} transform={`translate(${xPos}, ${yOff})`}>
                      <circle r={hitGlow ? 7.5 : 5} fill={hitGlow ? '#fde047' : '#fb7185'} />
                    </g>
                  );
                }
              })}

              {/* FUI Status Telemetry Pill inside the 3D reticle */}
              <rect
                x="-210"
                y="196"
                width="420"
                height="44"
                rx="11"
                fill="rgba(3,17,16,0.94)"
                stroke={accent}
                strokeWidth="2.2"
              />
              <text
                x="0"
                y="225"
                textAnchor="middle"
                fill={accent}
                fontFamily={FONT_MONO}
                fontSize="19"
                fontWeight="900"
              >
                {inAlert
                  ? isTC
                    ? 'ALERT: 135°C 微孔閉合 · 熱失控阻斷'
                    : 'ALERT: 135°C 微孔闭合 · 热失控阻断'
                  : isTC
                    ? 'SCAN: 5.0μm 微孔離子高速導通中'
                    : 'SCAN: 5.0μm 微孔离子高速导通中'}
              </text>
            </g>
          </svg>
        </Plane3D>
      </ShotcraftCam>

      <TopScrim color="rgba(3,14,14,0.86)" />

      {/* Camera-Synchronized 3D Viewport HUD */}
      <Viewport3DHUD keys={camKeys}>
        <div
          style={{
            position: 'absolute',
            top: 138,
            left: 48,
            width: 852,
            transform: `scale(${1 + alertRecoil})`,
            transformOrigin: 'left top',
            padding: '16px 26px',
            borderRadius: 24,
            background: inAlert
              ? 'linear-gradient(135deg, rgba(42,8,18,0.92) 0%, rgba(22,4,10,0.82) 100%)'
              : 'linear-gradient(135deg, rgba(4,28,24,0.9) 0%, rgba(2,16,14,0.78) 100%)',
            border: `1.5px solid ${accent}88`,
            boxShadow: `0 24px 52px rgba(0,0,0,0.78), 0 0 30px ${accent}33, inset 0 1.5px 0 rgba(255,255,255,0.28)`,
            overflow: 'hidden',
          }}
        >
          <SheenSweep startFrame={inAlert ? alertStart + 2 : 14} durationFrames={22} />
          <div style={{ fontFamily: FONT_SANS, fontSize: 26, fontWeight: 800, color: accent, letterSpacing: 1.4 }}>
            {inAlert
              ? isTC
                ? '高溫瞬間自動閉孔 · 鎖死電池熱失控'
                : '高温瞬间自动闭孔 · 锁死电池热失控'
              : isTC
                ? '5 微米濕法鋰電隔膜 · 僅髮絲 1/14'
                : '5 微米湿法锂电隔膜 · 仅发丝 1/14'}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginTop: 2 }}>
            {inAlert ? (
              <span
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 94,
                  fontWeight: 900,
                  color: '#fb7185',
                  textShadow: '0 0 34px rgba(251,113,133,0.9)',
                }}
              >
                135°C
              </span>
            ) : (
              <>
                <DigitRoll value="5" delay={12} fontSize={94} color="#34d399" />
                <span
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 52,
                    fontWeight: 900,
                    color: '#ffffff',
                    textShadow: '0 0 24px rgba(52,211,153,0.8)',
                  }}
                >
                  μm
                </span>
              </>
            )}
          </div>
        </div>

        <div style={{ position: 'absolute', top: 1068, left: 48, width: 852, display: 'flex', gap: 18 }}>
          <CleanGlassCard delay={20} accentColor="#34d399" style={{ flex: 1 }}>
            <div style={{ fontFamily: FONT_MONO, fontSize: 36, fontWeight: 900, color: '#34d399' }}>
              {isTC ? '45億 · 16產線' : '45亿 · 16产线'}
            </div>
            <div style={{ fontFamily: FONT_SANS, fontSize: 22, fontWeight: 700, color: '#d1fae5', marginTop: 4 }}>
              {isTC ? '玉溪恩捷 · 年產 16億㎡' : '玉溪恩捷 · 年产 16亿㎡'}
            </div>
          </CleanGlassCard>
          <CleanGlassCard delay={32} accentColor="#38bdf8" style={{ flex: 1 }}>
            <div style={{ fontFamily: FONT_MONO, fontSize: 36, fontWeight: 900, color: '#38bdf8' }}>
              {isTC ? '764.9 億元' : '764.9 亿元'}
            </div>
            <div style={{ fontFamily: FONT_SANS, fontSize: 22, fontWeight: 700, color: '#e0f2fe', marginTop: 4 }}>
              {isTC ? '新能源集群 × 沃森生物' : '新能源集群 × 沃森生物'}
            </div>
          </CleanGlassCard>
        </div>
      </Viewport3DHUD>

      {/* Impact emerald flash */}
      {slamFlash > 0.01 && (
        <AbsoluteFill
          style={{
            background: 'radial-gradient(circle at 50% 48%, rgba(52,211,153,0.9), transparent 72%)',
            opacity: slamFlash,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Expanding shockwave rings on slam & thermal shutdown */}
      {slamRingT > 0 && slamRingT < 1 && (
        <div
          style={{
            position: 'absolute',
            left: 540 - (80 + slamRingT * 620),
            top: 860 - (80 + slamRingT * 620),
            width: (80 + slamRingT * 620) * 2,
            height: (80 + slamRingT * 620) * 2,
            borderRadius: '50%',
            border: '4px solid #34d399',
            opacity: 1 - slamRingT,
            pointerEvents: 'none',
          }}
        />
      )}
      {alertRingT > 0 && alertRingT < 1 && (
        <div
          style={{
            position: 'absolute',
            left: 540 - (70 + alertRingT * 680),
            top: 860 - (70 + alertRingT * 680),
            width: (70 + alertRingT * 680) * 2,
            height: (70 + alertRingT * 680) * 2,
            borderRadius: '50%',
            border: '6px solid #fb7185',
            boxShadow: '0 0 36px #fb7185',
            opacity: 1 - alertRingT,
            pointerEvents: 'none',
          }}
        />
      )}
    </AbsoluteFill>
  );
};
