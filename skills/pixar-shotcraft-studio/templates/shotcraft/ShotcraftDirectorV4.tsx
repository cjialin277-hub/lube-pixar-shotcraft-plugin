import React from 'react';
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame } from 'remotion';
import { DigitRoll } from '../shotcraft/DigitRoll';
import { SpeedBlur } from '../shotcraft/PolishFX';
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

const rand = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const TopBottomScrim: React.FC<{ topH?: number; botH?: number }> = ({ topH = 380, botH = 720 }) => (
  <>
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: topH,
        background: 'linear-gradient(180deg, rgba(2,10,20,0.84) 0%, rgba(2,10,20,0.28) 62%, transparent 100%)',
        pointerEvents: 'none',
      }}
    />
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: botH,
        background: 'linear-gradient(0deg, rgba(2,10,20,0.92) 0%, rgba(2,10,20,0.46) 55%, transparent 100%)',
        pointerEvents: 'none',
      }}
    />
  </>
);

/**
 * ============================================================================
 * 1. B03 — Fuxian Lake Director's Cut (305 frames = 10.16s)
 * Completely De-Templated 2-Act Spatial Journey:
 * - Act I (f0..142): Vertical Bathymetry Plunge (0m -> -5.3m Dianchi -> -21.5m Erhai -> slams at -158.9m Mega Monument!)
 * - Act II (f138..305): 14f Whip-Turn (`SpeedBlur`) into `03-isometric` `deck-deal-flyin` 13× Dianchi Water-Cube Tower!
 * ============================================================================
 */
export const FuxianLakeDirectorV4: React.FC<{ locale: Locale }> = ({ locale }) => {
  const frame = useCurrentFrame();
  const isTC = locale === 'zh-TW';

  // Entry: circle-match-iris expanding from Xiaokun's dive
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

  // Act I -> Act II transition at local frame 138..152 (right between sub #5 and sub #6!)
  const act2T = interpolate(frame, [138, 152], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const whipVx = frame >= 138 && frame <= 152 ? Math.sin(((frame - 138) / 14) * Math.PI) * 52 : 0;
  const plungeVy = frame >= 6 && frame <= 54 ? Math.sin(((frame - 6) / 48) * Math.PI) * 26 : 0;

  const camKeys: PortraitCamKey[] = [
    { frame: 0, cx: 540, cy: 660, zoom: 1.1, rotX: 9, rotY: -6, rotZ: -0.8 },
    { frame: 56, cx: 520, cy: 1120, zoom: 1.26, rotX: -4, rotY: -2, rotZ: 0 },
    { frame: 138, cx: 525, cy: 1150, zoom: 1.28, rotX: -4, rotY: 0, rotZ: 0 },
    { frame: 152, cx: 565, cy: 960, zoom: 1.2, rotX: 6, rotY: 11, rotZ: 0.7 },
    { frame: 305, cx: 540, cy: 990, zoom: 1.26, rotX: 3, rotY: 6, rotZ: 0 },
  ];

  // Act I dive depth progress (0 -> 158.9m in 52 frames, then holds)
  const diveP = interpolate(frame, [6, 54], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const monumentRecoil = dampedSettle(Math.max(0, frame - 52), 0.14, 0.22) * 0.08;

  return (
    <AbsoluteFill
      style={{
        clipPath: irisT < 0.99 ? `circle(${irisR}px at 540px 1440px)` : undefined,
        backgroundColor: '#031324',
      }}
    >
      <SpeedBlur vx={whipVx} vy={plungeVy}>
        <ShotcraftCam src="plates_v3/PLATE_LAKE.jpg" bgPlaneZ={-85} keys={camKeys} saturate={1.15}>
          {/* World 3D Plane: Bathymetric Sonar Rings + Rising Bubbles */}
          <Plane3D z={36}>
            <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
              <g transform="translate(510, 820) scale(1, 0.42)">
                {[140, 240, 340].map((r, idx) => {
                  const pulse = ((frame * 2.0 + idx * 45) % 130) / 130;
                  return (
                    <circle
                      key={idx}
                      r={r * (0.7 + pulse * 0.4)}
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="3.5"
                      strokeOpacity={Math.sin(pulse * Math.PI) * 0.65}
                    />
                  );
                })}
              </g>
              {Array.from({ length: 18 }, (_, i) => {
                const bx = 180 + rand(i * 7 + 1) * 640;
                const speed = 1.6 + rand(i * 11 + 3) * 2.0;
                const by = 1120 - ((frame * speed + rand(i * 19) * 620) % 620);
                const br = 3 + rand(i * 23) * 5.5;
                return (
                  <circle
                    key={i}
                    cx={bx + Math.sin(frame * 0.08 + i) * 12}
                    cy={by}
                    r={br}
                    fill="#7dd3fc"
                    fillOpacity={0.4 + rand(i * 5) * 0.45}
                  />
                );
              })}
            </svg>
          </Plane3D>
        </ShotcraftCam>
      </SpeedBlur>

      <TopBottomScrim />

      <Viewport3DHUD keys={camKeys}>
        {/* ================= ACT I (f0..146): VERTICAL ABYSSAL DEPTH SHAFT & -158.9m MEGA MONUMENT ================= */}
        {act2T < 0.99 && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              opacity: 1 - act2T,
              transform: `translateX(${-act2T * 260}px) scale(${1 - act2T * 0.08})`,
            }}
          >
            {/* Left Vertical Bathymetry Shaft withPassing Lake Strata */}
            <div
              style={{
                position: 'absolute',
                left: 62,
                top: 170,
                width: 820,
                height: 1020,
              }}
            >
              {/* Glowing vertical laser line */}
              <div
                style={{
                  position: 'absolute',
                  left: 24,
                  top: 20,
                  width: 6,
                  height: 760,
                  borderRadius: 6,
                  backgroundColor: 'rgba(56,189,248,0.22)',
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: `${diveP * 100}%`,
                    borderRadius: 6,
                    background: 'linear-gradient(180deg, #38bdf8 0%, #06b6d4 55%, #fde047 100%)',
                    boxShadow: '0 0 20px #38bdf8',
                  }}
                />
              </div>

              {/* 3 Comparative Lake Depth Strata Markers */}
              {[
                { y: 38, depth: '0.0 m', label: isTC ? '高原湖面基準線' : '高原湖面基准线', color: '#7dd3fc', delay: 4 },
                {
                  y: 165,
                  depth: '-5.3 m',
                  label: isTC ? '滇池平均水深（僅撫仙湖 1/30）' : '滇池平均水深（仅抚仙湖 1/30）',
                  color: '#34d399',
                  delay: 14,
                },
                {
                  y: 315,
                  depth: '-21.5 m',
                  label: isTC ? '洱海最大水深（僅撫仙湖 1/7）' : '洱海最大水深（仅抚仙湖 1/7）',
                  color: '#38bdf8',
                  delay: 26,
                },
              ].map((st, idx) => {
                const sp = interpolate(frame - st.delay, [0, 12], [0, 1], {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                  easing: Easing.out(Easing.back(1.6)),
                });
                return (
                  <div
                    key={idx}
                    style={{
                      position: 'absolute',
                      left: 12,
                      top: st.y,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      opacity: sp,
                      transform: `translateX(${(1 - sp) * 40}px)`,
                    }}
                  >
                    <div
                      style={{
                        width: 30,
                        height: 4,
                        backgroundColor: st.color,
                        boxShadow: `0 0 12px ${st.color}`,
                      }}
                    />
                    <div
                      style={{
                        padding: '8px 18px',
                        borderRadius: 12,
                        backgroundColor: 'rgba(3,18,34,0.88)',
                        border: `1.5px solid ${st.color}88`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                      }}
                    >
                      <span style={{ fontFamily: FONT_MONO, fontSize: 24, fontWeight: 900, color: st.color }}>
                        {st.depth}
                      </span>
                      <span style={{ fontFamily: FONT_SANS, fontSize: 21, fontWeight: 700, color: '#e0f2fe' }}>
                        {st.label}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Abyssal Trench Floor Hero Monument Lockup (-158.9m in Giant 156px Typography!) */}
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 525,
                  width: 828,
                  padding: '26px 32px',
                  borderRadius: 28,
                  background: 'linear-gradient(145deg, rgba(3,20,40,0.92) 0%, rgba(2,10,22,0.84) 100%)',
                  border: '2px solid rgba(253,224,71,0.72)',
                  boxShadow: '0 28px 64px rgba(0,0,0,0.82), 0 0 40px rgba(56,189,248,0.28), inset 0 2px 0 rgba(255,255,255,0.3)',
                  transform: `scale(${1 + monumentRecoil})`,
                  transformOrigin: 'left center',
                  overflow: 'hidden',
                }}
              >
                <SheenSweep startFrame={54} durationFrames={28} color="rgba(253,224,71,0.32)" />
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '5px 16px',
                    borderRadius: 99,
                    backgroundColor: 'rgba(253,224,71,0.16)',
                    border: '1px solid #fde047',
                    marginBottom: 8,
                  }}
                >
                  <span style={{ fontFamily: FONT_SANS, fontSize: 22, fontWeight: 900, color: '#fde047' }}>
                    {isTC ? '▼ 撫仙湖極深海溝探底 · 中國第二深淡水湖' : '▼ 抚仙湖极深海沟探底 · 中国第二深淡水湖'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                  <span
                    style={{
                      fontFamily: FONT_MONO,
                      fontSize: 118,
                      fontWeight: 900,
                      color: '#fde047',
                      lineHeight: 1,
                    }}
                  >
                    -
                  </span>
                  <DigitRoll value="158.9" delay={10} fontSize={142} color="#ffffff" />
                  <span
                    style={{
                      fontFamily: FONT_MONO,
                      fontSize: 58,
                      fontWeight: 900,
                      color: '#38bdf8',
                      textShadow: '0 0 28px rgba(56,189,248,0.9)',
                    }}
                  >
                    m
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= ACT II (f138..305): 03-ISOMETRIC 13× DIANCHI WATER-CUBE DEALING ARENA ================= */}
        {act2T > 0.01 && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              opacity: act2T,
              transform: `translateX(${(1 - act2T) * 280}px) scale(${0.92 + act2T * 0.08})`,
            }}
          >
            {/* Top Arena Kicker Banner */}
            <div
              style={{
                position: 'absolute',
                top: 148,
                left: 48,
                width: 852,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 26px',
                borderRadius: 22,
                background: 'linear-gradient(135deg, rgba(4,24,44,0.92) 0%, rgba(2,14,28,0.84) 100%)',
                border: '1.5px solid rgba(56,189,248,0.6)',
                boxShadow: '0 22px 48px rgba(0,0,0,0.72)',
              }}
            >
              <div>
                <div style={{ fontFamily: FONT_SANS, fontSize: 23, fontWeight: 800, color: '#7dd3fc' }}>
                  {isTC ? '蓄水量等量拆解 · 國家 I 類水佔全國 90%+' : '蓄水量等量拆解 · 国家 I 类水占全国 90%+'}
                </div>
                <div style={{ fontFamily: FONT_MONO, fontSize: 58, fontWeight: 900, color: '#ffffff', marginTop: 2 }}>
                  206.2 <span style={{ fontSize: 34, color: '#38bdf8' }}>{isTC ? '億立方米' : '亿立方米'}</span>
                </div>
              </div>
              <div
                style={{
                  padding: '10px 20px',
                  borderRadius: 16,
                  backgroundColor: 'rgba(253,224,71,0.16)',
                  border: '2px solid #fde047',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontFamily: FONT_MONO, fontSize: 36, fontWeight: 900, color: '#fde047' }}>
                  {isTC ? 'I 類水' : 'I 类水'}
                </div>
                <div style={{ fontFamily: FONT_SANS, fontSize: 19, fontWeight: 800, color: '#fef9c3' }}>
                  {isTC ? '可直接飲用源' : '可直接饮用源'}
                </div>
              </div>
            </div>

            {/* Center 3D Isometric Water-Cube Dealing Stage (`deck-deal-flyin` accelerating cadence!) */}
            <div
              style={{
                position: 'absolute',
                top: 345,
                left: 48,
                width: 852,
                height: 855,
                borderRadius: 28,
                background: 'linear-gradient(180deg, rgba(3,18,34,0.88) 0%, rgba(2,10,20,0.94) 100%)',
                border: '1.5px solid rgba(56,189,248,0.44)',
                boxShadow: '0 28px 64px rgba(0,0,0,0.82)',
                overflow: 'hidden',
              }}
            >
              <SheenSweep startFrame={195} durationFrames={26} />

              {/* Left Column: 1 Giant Fuxian Lake Water Monolith */}
              <div
                style={{
                  position: 'absolute',
                  left: 46,
                  top: 56,
                  width: 330,
                  height: 730,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                }}
              >
                <div
                  style={{
                    width: 260,
                    height: 560,
                    borderRadius: 22,
                    background:
                      'linear-gradient(180deg, rgba(125,211,252,0.85) 0%, rgba(14,165,233,0.78) 45%, rgba(3,105,161,0.92) 100%)',
                    border: '2.5px solid #e0f2fe',
                    boxShadow: '0 0 44px rgba(56,189,248,0.55), inset 0 12px 28px rgba(255,255,255,0.45)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 20,
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontFamily: FONT_SANS, fontSize: 34, fontWeight: 900, color: '#ffffff' }}>
                    {isTC ? '1 個撫仙湖' : '1 个抚仙湖'}
                  </div>
                  <div
                    style={{
                      fontFamily: FONT_MONO,
                      fontSize: 38,
                      fontWeight: 900,
                      color: '#fde047',
                      marginTop: 10,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    206.2 {isTC ? '億m³' : '亿m³'}
                  </div>
                  <div
                    style={{
                      marginTop: 18,
                      padding: '6px 16px',
                      borderRadius: 99,
                      backgroundColor: 'rgba(2,12,24,0.65)',
                      fontFamily: FONT_SANS,
                      fontSize: 21,
                      fontWeight: 800,
                      color: '#bae6fd',
                    }}
                  >
                    {isTC ? '均深 95.2m · 極深 158.9m' : '均深 95.2m · 极深 158.9m'}
                  </div>
                </div>
                <div
                  style={{
                    fontFamily: FONT_SANS,
                    fontSize: 24,
                    fontWeight: 900,
                    color: '#7dd3fc',
                    marginTop: 16,
                  }}
                >
                  {isTC ? '高原深水巨型水庫' : '高原深水巨型水库'}
                </div>
              </div>

              {/* Center Equals Sign */}
              <div
                style={{
                  position: 'absolute',
                  left: 388,
                  top: 380,
                  fontFamily: FONT_MONO,
                  fontSize: 64,
                  fontWeight: 900,
                  color: '#fde047',
                  textShadow: '0 0 24px rgba(253,224,71,0.8)',
                }}
              >
                =
              </div>

              {/* Right Column: 13 Accelerating Dealt Dianchi Water Blocks + 7x Erhai / 4x Taihu Stamp */}
              <div
                style={{
                  position: 'absolute',
                  right: 38,
                  top: 46,
                  width: 390,
                  height: 750,
                }}
              >
                <div
                  style={{
                    fontFamily: FONT_SANS,
                    fontSize: 26,
                    fontWeight: 900,
                    color: '#fde047',
                    textAlign: 'center',
                    marginBottom: 14,
                  }}
                >
                  {isTC ? '連裝 13 個滇池總水量！' : '连装 13 个滇池总水量！'}
                </div>

                {/* 13 Dealt Water Slabs stacking bottom-to-top with accelerating cue (Rule R2!) */}
                <div
                  style={{
                    position: 'relative',
                    width: 350,
                    height: 540,
                    margin: '0 auto',
                  }}
                >
                  {Array.from({ length: 13 }, (_, k) => {
                    // Hard-accelerating departure schedule: gap shrinks from 4.5f down to 1.4f!
                    const cueFrame = 150 + 4.5 * k - 0.14 * k * (k - 1);
                    const dealP = interpolate(frame - cueFrame, [0, 10], [0, 1], {
                      extrapolateLeft: 'clamp',
                      extrapolateRight: 'clamp',
                      easing: Easing.out(Easing.back(1.5)),
                    });
                    const slotY = 496 - k * 39;
                    const curY = slotY - (1 - dealP) * 140;
                    const isTop = k === 12;
                    return (
                      <div
                        key={k}
                        style={{
                          position: 'absolute',
                          left: 16,
                          top: curY,
                          width: 318,
                          height: 33,
                          opacity: dealP,
                          transform: `scale(${0.85 + 0.15 * dealP})`,
                          borderRadius: 9,
                          background: isTop
                            ? 'linear-gradient(90deg, #fde047 0%, #f59e0b 100%)'
                            : 'linear-gradient(90deg, rgba(52,211,153,0.92) 0%, rgba(16,185,129,0.85) 100%)',
                          border: isTop ? '2px solid #ffffff' : '1.5px solid rgba(255,255,255,0.55)',
                          boxShadow: isTop
                            ? '0 0 24px rgba(253,224,71,0.8)'
                            : '0 6px 14px rgba(0,0,0,0.45)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0 16px',
                        }}
                      >
                        <span
                          style={{
                            fontFamily: FONT_SANS,
                            fontSize: 18,
                            fontWeight: 900,
                            color: isTop ? '#04121e' : '#ffffff',
                          }}
                        >
                          {isTC ? `滇池 #${String(k + 1).padStart(2, '0')}` : `滇池 #${String(k + 1).padStart(2, '0')}`}
                        </span>
                        <span
                          style={{
                            fontFamily: FONT_MONO,
                            fontSize: 17,
                            fontWeight: 900,
                            color: isTop ? '#04121e' : '#d1fae5',
                          }}
                        >
                          {isTop ? '★ 13× 滿載!' : '15.6 亿m³'}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Final Equivalency Lockup Stamp after the 13th slab lands (frame 192+) */}
                <div
                  style={{
                    marginTop: 14,
                    padding: '12px 18px',
                    borderRadius: 16,
                    backgroundColor: 'rgba(253,224,71,0.16)',
                    border: '2px solid #fde047',
                    textAlign: 'center',
                    opacity: interpolate(frame, [190, 200], [0, 1], {
                      extrapolateLeft: 'clamp',
                      extrapolateRight: 'clamp',
                    }),
                    transform: `scale(${interpolate(frame, [190, 196, 202], [0.7, 1.08, 1.0], {
                      extrapolateLeft: 'clamp',
                      extrapolateRight: 'clamp',
                    })})`,
                  }}
                >
                  <span style={{ fontFamily: FONT_SANS, fontSize: 23, fontWeight: 900, color: '#fde047' }}>
                    {isTC ? '同於 7 個洱海 · 4 個太湖！' : '同于 7 个洱海 · 4 个太湖！'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
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
 * ============================================================================
 * 2. B05 — Chengjiang Fossil Site Director's Cut (270 frames = 9.0s)
 * Completely De-Templated 2-Act Museum Sticker & Time-Ribbon Journey (`19-paperclip` style!):
 * - Act I (f0..148): Giant Oblique Geological Time-Ribbon Flight (0 Ma -> 66 Ma -> 230 Ma -> Brakes on 5.18亿年 Giant Stamp!)
 * - Act II (f146..270): `19-paperclip` Bold-White-Border Specimen Dissection Stickers (`slap()` physics) + Micron X-Ray Loupe!
 * ============================================================================
 */
export const ChengjiangDirectorV4: React.FC<{ locale: Locale }> = ({ locale }) => {
  const frame = useCurrentFrame();
  const isTC = locale === 'zh-TW';

  // 3-stage timeline-travel velocity curve
  const rawU = Math.max(0, Math.min(1, (frame - 6) / 72));
  const travel =
    rawU < 0.15
      ? (rawU / 0.15) * 0.06
      : rawU < 0.86
        ? 0.06 + ((rawU - 0.15) / 0.71) * 0.86
        : 0.92 + Easing.out(Easing.cubic)((rawU - 0.86) / 0.14) * 0.08;

  // Act I -> Act II transition at frame 146..158 (right as Shen Xi says "微米级封存 20+ 动物门类与天下第一鱼昆明鱼")
  const act2T = interpolate(frame, [146, 158], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const timelineVx = frame >= 12 && frame <= 74 ? 32 * Math.sin(((frame - 12) / 62) * Math.PI) : 0;
  const act2Vx = frame >= 146 && frame <= 158 ? 48 * Math.sin(((frame - 146) / 12) * Math.PI) : 0;

  const camKeys: PortraitCamKey[] = [
    { frame: 0, cx: 470, cy: 960, zoom: 1.08, rotY: -8, rotX: 5, rotZ: -0.8 },
    { frame: 76, cx: 550, cy: 920, zoom: 1.24, rotY: 2, rotX: -2, rotZ: 0 },
    { frame: 146, cx: 540, cy: 900, zoom: 1.28, rotY: 4, rotX: -2.5, rotZ: 0.3 },
    { frame: 158, cx: 515, cy: 845, zoom: 1.38, rotY: -7, rotX: 4, rotZ: -0.6 },
    { frame: 270, cx: 540, cy: 870, zoom: 1.32, rotY: 3, rotX: -2, rotZ: 0 },
  ];

  // Sticker slap helper (from mg-styles-15 `19-paperclip/index.html` line 71)
  const evalStickerSlap = (landFrame: number) => {
    const dt = frame - landFrame;
    if (dt < -6) return { opacity: 0, scale: 1.32, rot: 7, lift: 1 };
    if (dt < 0) {
      const p = (dt + 6) / 6;
      const L = 1 - p * p;
      return { opacity: Math.min(1, p * 2.5), scale: 1 + 0.32 * L, rot: 7 * L, lift: L };
    }
    const wob = Math.exp(-dt * 0.28) * Math.cos(dt * 0.9);
    return { opacity: 1, scale: 1 - 0.04 * wob, rot: -1.1 * wob, lift: 0 };
  };

  const slap1 = evalStickerSlap(156);
  const slap2 = evalStickerSlap(172);

  // Moving Micron X-Ray Loupe in Act II
  const loupeX = interpolate(frame, [175, 255], [140, 620], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.sin),
  });

  const trackW = 1950;
  const camX = travel * (trackW - 760);

  return (
    <AbsoluteFill style={{ backgroundColor: '#05141a' }}>
      <SpeedBlur vx={timelineVx + act2Vx}>
        <ShotcraftCam src="plates_v3/PLATE_FOSSIL.jpg" bgPlaneZ={-80} keys={camKeys} saturate={1.16} />
      </SpeedBlur>

      <TopBottomScrim />

      <Viewport3DHUD keys={camKeys}>
        {/* ================= ACT I (f0..154): OBLIQUE GEOLOGICAL TIME-RIBBON FLIGHT & 5.18亿年 MONUMENT ================= */}
        {act2T < 0.99 && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              opacity: 1 - act2T,
              transform: `translateY(${-act2T * 180}px) scale(${1 - act2T * 0.08})`,
            }}
          >
            {/* Diagonal 3D Geological Time-Ribbon */}
            <div
              style={{
                position: 'absolute',
                top: 210,
                left: 36,
                width: 876,
                height: 220,
                transform: 'rotate(-3.5deg)',
                borderRadius: 24,
                background: 'linear-gradient(90deg, rgba(8,24,30,0.95) 0%, rgba(16,32,28,0.88) 100%)',
                border: '2px solid rgba(253,224,71,0.55)',
                boxShadow: '0 26px 54px rgba(0,0,0,0.78)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: 50 - camX,
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
                    top: 146,
                    height: 6,
                    background: 'linear-gradient(90deg, #38bdf8 0%, #34d399 48%, #fde047 100%)',
                    boxShadow: '0 0 18px #fde047',
                  }}
                />
                {Array.from({ length: 48 }, (_, k) => (
                  <div
                    key={k}
                    style={{
                      position: 'absolute',
                      left: k * 40,
                      top: 132,
                      width: 2.5,
                      height: k % 5 === 0 ? 28 : 14,
                      backgroundColor: k % 5 === 0 ? '#fde047' : 'rgba(255,255,255,0.42)',
                    }}
                  />
                ))}
                {[
                  { at: 0.04, era: isTC ? '0 Ma · 人類文明' : '0 Ma · 人类文明', color: '#38bdf8' },
                  { at: 0.34, era: isTC ? '66 Ma · 白堊紀恐龍滅絕' : '66 Ma · 白垩纪恐龙灭绝', color: '#6ee7b7' },
                  { at: 0.62, era: isTC ? '230 Ma · 第一批恐龍誕生' : '230 Ma · 第一批恐龙诞生', color: '#34d399' },
                  { at: 0.93, era: isTC ? '★ 518 Ma · 玉溪澄江寒武紀大爆發' : '★ 518 Ma · 玉溪澄江寒武纪大爆发', color: '#fde047' },
                ].map((st, idx) => {
                  const px = st.at * (trackW - 180) + 60;
                  return (
                    <div
                      key={idx}
                      style={{
                        position: 'absolute',
                        left: px,
                        top: 32,
                        transform: 'translateX(-50%)',
                        textAlign: 'center',
                      }}
                    >
                      <div
                        style={{
                          padding: '10px 22px',
                          borderRadius: 14,
                          backgroundColor: 'rgba(4,16,22,0.96)',
                          border: `2.5px solid ${st.color}`,
                          boxShadow: `0 0 22px ${st.color}66`,
                          fontFamily: FONT_SANS,
                          fontSize: 25,
                          fontWeight: 900,
                          color: st.color,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {st.era}
                      </div>
                      <div
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: '50%',
                          backgroundColor: st.color,
                          margin: '24px auto 0',
                          boxShadow: `0 0 18px ${st.color}`,
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Giant 5.18亿年 Monument Stamp (Slams in at frame 72 when timeline brakes!) */}
            <div
              style={{
                position: 'absolute',
                top: 790,
                left: 48,
                width: 852,
                padding: '28px 34px',
                borderRadius: 30,
                background: 'linear-gradient(145deg, rgba(16,26,24,0.94) 0%, rgba(6,14,16,0.88) 100%)',
                border: '2.5px solid #fde047',
                boxShadow: '0 30px 68px rgba(0,0,0,0.85), 0 0 44px rgba(253,224,71,0.32)',
                transform: `scale(${interpolate(frame, [68, 76, 84], [0.86, 1.07, 1.0], {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                })})`,
                overflow: 'hidden',
              }}
            >
              <SheenSweep startFrame={76} durationFrames={26} color="rgba(253,224,71,0.4)" />
              <div
                style={{
                  display: 'inline-block',
                  padding: '6px 18px',
                  borderRadius: 10,
                  backgroundColor: '#fde047',
                  color: '#06151a',
                  fontFamily: FONT_SANS,
                  fontSize: 23,
                  fontWeight: 900,
                  letterSpacing: 1,
                }}
              >
                {isTC ? '★ UNESCO 亞洲唯一化石類世界自然遺產' : '★ UNESCO 亚洲唯一化石类世界自然遗产'}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginTop: 10 }}>
                <DigitRoll value="5.18" delay={14} fontSize={140} color="#ffffff" />
                <span
                  style={{
                    fontFamily: FONT_SANS,
                    fontSize: 58,
                    fontWeight: 900,
                    color: '#fde047',
                    textShadow: '0 0 28px rgba(253,224,71,0.85)',
                  }}
                >
                  {isTC ? '億年前' : '亿年前'}
                </span>
              </div>
              <div style={{ fontFamily: FONT_SANS, fontSize: 25, fontWeight: 700, color: '#d1fae5', marginTop: 6 }}>
                {isTC ? '寒武紀生命大爆發搖籃 · 地球動物樹總根系' : '寒武纪生命大爆发摇篮 · 地球动物树总根系'}
              </div>
            </div>
          </div>
        )}

        {/* ================= ACT II (f146..270): 19-PAPERCLIP BOLD-WHITE-STROKE SPECIMEN STICKERS & X-RAY LOUPE ================= */}
        {act2T > 0.01 && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              opacity: act2T,
            }}
          >
            {/* Specimen Sticker #01: 2.0m Anomalocaris (`19-paperclip` 8px white sticker border + slap physics!) */}
            <div
              style={{
                position: 'absolute',
                top: 175,
                left: 52,
                width: 844,
                padding: '24px 30px',
                borderRadius: 28,
                backgroundColor: '#10242c',
                border: '8px solid #FFF8E7',
                boxShadow: `0 ${14 + 36 * slap1.lift}px ${28 + 40 * slap1.lift}px rgba(0,0,0,0.82)`,
                opacity: slap1.opacity,
                transform: `scale(${slap1.scale}) rotate(${-2.2 + slap1.rot}deg)`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div
                    style={{
                      display: 'inline-block',
                      padding: '4px 14px',
                      borderRadius: 8,
                      backgroundColor: '#f97316',
                      color: '#ffffff',
                      fontFamily: FONT_MONO,
                      fontSize: 20,
                      fontWeight: 900,
                    }}
                  >
                    SPECIMEN #01 · ANOMALOCARIS
                  </div>
                  <div style={{ fontFamily: FONT_SANS, fontSize: 48, fontWeight: 900, color: '#fde047', marginTop: 8 }}>
                    {isTC ? '2.0 米寒武紀霸主 · 奇蝦' : '2.0 米寒武纪霸主 · 奇虾'}
                  </div>
                  <div style={{ fontFamily: FONT_SANS, fontSize: 23, fontWeight: 700, color: '#e2e8f0', marginTop: 4 }}>
                    {isTC ? '5億年前海洋頂級掠食者 · 16000枚複眼晶狀體' : '5亿年前海洋顶级掠食者 · 16000枚复眼晶状体'}
                  </div>
                </div>
                <div
                  style={{
                    padding: '14px 22px',
                    borderRadius: 18,
                    backgroundColor: 'rgba(253,224,71,0.14)',
                    border: '2px dashed #fde047',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontFamily: FONT_MONO, fontSize: 42, fontWeight: 900, color: '#fde047' }}>200 cm</div>
                  <div style={{ fontFamily: FONT_SANS, fontSize: 19, fontWeight: 800, color: '#fef08a' }}>
                    {isTC ? '巨型完整體化石' : '巨型完整体化石'}
                  </div>
                </div>
              </div>
            </div>

            {/* Specimen Sticker #02: Haikouichthys "First Fish" + Gliding Micron X-Ray Loupe! */}
            <div
              style={{
                position: 'absolute',
                top: 720,
                left: 52,
                width: 844,
                height: 440,
                padding: '26px 32px',
                borderRadius: 28,
                backgroundColor: '#0b2228',
                border: '8px solid #FFF8E7',
                boxShadow: `0 ${14 + 36 * slap2.lift}px ${28 + 40 * slap2.lift}px rgba(0,0,0,0.85)`,
                opacity: slap2.opacity,
                transform: `scale(${slap2.scale}) rotate(${1.8 + slap2.rot}deg)`,
                overflow: 'hidden',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div
                  style={{
                    display: 'inline-block',
                    padding: '4px 14px',
                    borderRadius: 8,
                    backgroundColor: '#10b981',
                    color: '#041318',
                    fontFamily: FONT_MONO,
                    fontSize: 20,
                    fontWeight: 900,
                  }}
                >
                  SPECIMEN #02 · HAIKOUICHTHYS
                </div>
                <div style={{ fontFamily: FONT_MONO, fontSize: 24, fontWeight: 900, color: '#6ee7b7' }}>
                  {isTC ? '20+ 動物門類 · 300+ 物種' : '20+ 动物门类 · 300+ 物种'}
                </div>
              </div>

              <div style={{ fontFamily: FONT_SANS, fontSize: 52, fontWeight: 900, color: '#34d399', marginTop: 10 }}>
                {isTC ? '“天下第一魚” · 昆明魚' : '“天下第一鱼” · 昆明鱼'}
              </div>
              <div style={{ fontFamily: FONT_SANS, fontSize: 24, fontWeight: 700, color: '#d1fae5', marginTop: 4 }}>
                {isTC
                  ? '人類與所有脊椎動物的五億年前最早祖先！'
                  : '人类与所有脊椎动物的五亿年前最早祖先！'}
              </div>

              {/* Stylized Vertebral Skeleton Blueprint Track + Gliding Micron X-Ray Magnifier Loupe */}
              <div
                style={{
                  position: 'relative',
                  marginTop: 28,
                  width: '100%',
                  height: 155,
                  borderRadius: 18,
                  backgroundColor: 'rgba(3,12,16,0.9)',
                  border: '1.5px solid rgba(52,211,153,0.45)',
                  overflow: 'hidden',
                }}
              >
                <svg width="780" height="155" viewBox="0 0 780 155">
                  {/* Fish contour & myomere ribs */}
                  <path
                    d="M 60 78 Q 240 22, 480 62 L 710 42 L 675 78 L 710 114 L 480 94 Q 240 134, 60 78 Z"
                    fill="rgba(52,211,153,0.14)"
                    stroke="#34d399"
                    strokeWidth="3"
                  />
                  <line x1="80" y1="78" x2="665" y2="78" stroke="#fde047" strokeWidth="4" strokeDasharray="10 6" />
                  {Array.from({ length: 22 }, (_, m) => {
                    const mx = 115 + m * 24;
                    return (
                      <path
                        key={m}
                        d={`M ${mx} 46 L ${mx - 12} 78 L ${mx} 110`}
                        fill="none"
                        stroke="#6ee7b7"
                        strokeWidth="2.2"
                        strokeOpacity="0.7"
                      />
                    );
                  })}
                  <circle cx="105" cy="70" r="9" fill="#fde047" />
                </svg>

                {/* Gliding Circular X-Ray Magnifier Loupe */}
                <div
                  style={{
                    position: 'absolute',
                    left: loupeX,
                    top: 8,
                    width: 138,
                    height: 138,
                    borderRadius: '50%',
                    border: '4px solid #fde047',
                    boxShadow: '0 0 28px #fde047, inset 0 0 24px rgba(52,211,153,0.65)',
                    backgroundColor: 'rgba(16,185,129,0.22)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span style={{ fontFamily: FONT_MONO, fontSize: 16, fontWeight: 900, color: '#fde047' }}>
                    X-RAY 10μm
                  </span>
                  <span
                    style={{
                      fontFamily: FONT_SANS,
                      fontSize: 18,
                      fontWeight: 900,
                      color: '#ffffff',
                      marginTop: 42,
                      backgroundColor: 'rgba(0,0,0,0.78)',
                      padding: '2px 8px',
                      borderRadius: 6,
                    }}
                  >
                    {isTC ? '原始脊椎神經' : '原始脊椎神经'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Viewport3DHUD>
    </AbsoluteFill>
  );
};

/**
 * ============================================================================
 * 3. B07 — Ailao Mountain Director's Cut (251 frames = 8.36s)
 * Completely De-Templated 2-Act Diagonal Altitude Split -> Radial Solar-Brix Dial Journey:
 * - Act I (f0..88): Diagonal Split-Screen Altitude Clash (`3165m 云雾原始森林` vs `500m 红河干热河谷` + `Δ 2665m 垂直落差`)
 * - Act II (f86..251): Fast Vertical Dive (`SpeedBlur`) into the Golden Orange Valley + Giant Circular `15.8° Brix` Sugar-Lock Telemetry Wheel!
 * ============================================================================
 */
export const AilaoDirectorV4: React.FC<{ locale: Locale }> = ({ locale }) => {
  const frame = useCurrentFrame();
  const isTC = locale === 'zh-TW';

  // Entry: bottom-push-stack-wipe
  const pushY = interpolate(frame, [0, 14], [1920, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });

  // Act I -> Act II transition at frame 86..98 (right as Shen Xi says "大海拔温差与强日照，锁住高原冰糖橙甜度！")
  const act2T = interpolate(frame, [86, 98], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const diveVy = frame >= 86 && frame <= 98 ? Math.sin(((frame - 86) / 12) * Math.PI) * 54 : 0;

  const camKeys: PortraitCamKey[] = [
    { frame: 0, cx: 515, cy: 710, zoom: 1.15, rotX: 7, rotY: -6, rotZ: -0.7 },
    { frame: 86, cx: 530, cy: 790, zoom: 1.2, rotX: 4, rotY: -2, rotZ: -0.3 },
    { frame: 98, cx: 550, cy: 1160, zoom: 1.38, rotX: -5, rotY: 5, rotZ: 0.5 },
    { frame: 251, cx: 540, cy: 1200, zoom: 1.44, rotX: -4, rotY: -3, rotZ: 0 },
  ];

  // Radial Brix Gauge sweep in Act II (f96..155)
  const brixP = interpolate(frame, [96, 150], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });
  const brixVal = (brixP * 15.8).toFixed(1);

  return (
    <AbsoluteFill
      style={{
        transform: pushY > 0.5 ? `translateY(${pushY}px)` : undefined,
        boxShadow: pushY > 0.5 ? '0 -30px 90px rgba(251,191,36,0.45)' : undefined,
        backgroundColor: '#061a12',
      }}
    >
      <SpeedBlur vx={0} vy={diveVy}>
        <ShotcraftCam src="plates_v3/PLATE_AILAO.jpg" bgPlaneZ={-80} keys={camKeys} saturate={1.18} />
      </SpeedBlur>

      <TopBottomScrim />

      <Viewport3DHUD keys={camKeys}>
        {/* ================= ACT I (f0..94): DIAGONAL ALTITUDE CLASH (3165m vs 500m) ================= */}
        {act2T < 0.99 && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              opacity: 1 - act2T,
              transform: `translateY(${-act2T * 260}px)`,
            }}
          >
            {/* Upper-Left Cold Cloud-Forest Zone (3165m) */}
            <div
              style={{
                position: 'absolute',
                top: 165,
                left: 48,
                width: 780,
                padding: '24px 30px',
                borderRadius: 28,
                background: 'linear-gradient(135deg, rgba(4,34,24,0.92) 0%, rgba(2,18,14,0.84) 100%)',
                border: '2.5px solid #34d399',
                boxShadow: '0 24px 52px rgba(0,0,0,0.78)',
                transform: 'rotate(-2deg)',
              }}
            >
              <div style={{ fontFamily: FONT_SANS, fontSize: 24, fontWeight: 800, color: '#6ee7b7' }}>
                {isTC ? '▲ 哀牢山主峰冷涼雲霧林帶' : '▲ 哀牢山主峰冷凉云雾林带'}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginTop: 4 }}>
                <span style={{ fontFamily: FONT_MONO, fontSize: 118, fontWeight: 900, color: '#ffffff', lineHeight: 1 }}>
                  3165
                </span>
                <span style={{ fontFamily: FONT_MONO, fontSize: 48, fontWeight: 900, color: '#34d399' }}>m</span>
              </div>
              <div style={{ fontFamily: FONT_SANS, fontSize: 23, fontWeight: 700, color: '#d1fae5', marginTop: 8 }}>
                {isTC ? '終年雲霧繚繞 · 85%高濕度原始森林涵養山泉' : '终年云雾缭绕 · 85%高湿度原始森林涵养山泉'}
              </div>
            </div>

            {/* Center Diagonal Slash & Vertical Drop Stamp (Δ 2665m) */}
            <div
              style={{
                position: 'absolute',
                top: 595,
                left: 145,
                width: 660,
                padding: '14px 28px',
                borderRadius: 99,
                background: 'linear-gradient(90deg, #34d399 0%, #fde047 50%, #f97316 100%)',
                boxShadow: '0 16px 40px rgba(0,0,0,0.85), 0 0 32px rgba(253,224,71,0.55)',
                transform: `rotate(-5deg) scale(${interpolate(frame, [12, 20, 26], [0.5, 1.12, 1.0], {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                })})`,
                textAlign: 'center',
              }}
            >
              <span style={{ fontFamily: FONT_SANS, fontSize: 30, fontWeight: 900, color: '#04120e' }}>
                {isTC ? '⚡ 垂直高差 2665 米 · 焚風立體氣候' : '⚡ 垂直高差 2665 米 · 焚风立体气候'}
              </span>
            </div>

            {/* Lower-Right Dry-Hot River Valley Zone (500m) */}
            <div
              style={{
                position: 'absolute',
                top: 760,
                left: 118,
                width: 780,
                padding: '24px 30px',
                borderRadius: 28,
                background: 'linear-gradient(135deg, rgba(44,18,4,0.92) 0%, rgba(24,10,2,0.84) 100%)',
                border: '2.5px solid #fbbf24',
                boxShadow: '0 24px 52px rgba(0,0,0,0.8)',
                transform: 'rotate(-2deg)',
              }}
            >
              <div style={{ fontFamily: FONT_SANS, fontSize: 24, fontWeight: 800, color: '#fbbf24' }}>
                {isTC ? '▼ 紅河新平乾熱河谷鎖甜帶' : '▼ 红河新平干热河谷锁甜带'}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginTop: 4 }}>
                <span style={{ fontFamily: FONT_MONO, fontSize: 118, fontWeight: 900, color: '#fde047', lineHeight: 1 }}>
                  500
                </span>
                <span style={{ fontFamily: FONT_MONO, fontSize: 48, fontWeight: 900, color: '#f97316' }}>m</span>
              </div>
              <div style={{ fontFamily: FONT_SANS, fontSize: 23, fontWeight: 700, color: '#fef3c7', marginTop: 8 }}>
                {isTC ? '氣流下沉增溫 · 高原陽光直射無霜期 350 天' : '气流下沉增温 · 高原阳光直射无霜期 350 天'}
              </div>
            </div>
          </div>
        )}

        {/* ================= ACT II (f86..251): RADIAL SOLAR-BRIX SUGAR-LOCK TELEMETRY WHEEL ================= */}
        {act2T > 0.01 && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              opacity: act2T,
              transform: `translateY(${(1 - act2T) * 260}px) scale(${0.9 + act2T * 0.1})`,
            }}
          >
            {/* Central Radial Solar-Brix Gauge Wheel centered at (474, 570) */}
            <div
              style={{
                position: 'absolute',
                left: 204,
                top: 260,
                width: 540,
                height: 540,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(24,14,4,0.92) 0%, rgba(10,6,2,0.88) 72%, transparent 100%)',
                boxShadow: '0 28px 68px rgba(0,0,0,0.85)',
              }}
            >
              <svg width="540" height="540" viewBox="0 0 540 540">
                <defs>
                  <linearGradient id="brixArc" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#34d399" />
                    <stop offset="45%" stopColor="#fde047" />
                    <stop offset="100%" stopColor="#f97316" />
                  </linearGradient>
                </defs>
                <circle
                  cx="270"
                  cy="270"
                  r="222"
                  fill="none"
                  stroke="rgba(255,255,255,0.12)"
                  strokeWidth="22"
                />
                <circle
                  cx="270"
                  cy="270"
                  r="222"
                  fill="none"
                  stroke="url(#brixArc)"
                  strokeWidth="24"
                  strokeLinecap="round"
                  strokeDasharray="1395"
                  strokeDashoffset={1395 * (1 - brixP * 0.84)}
                  transform="rotate(-135 270 270)"
                />
                <circle
                  cx="270"
                  cy="270"
                  r="182"
                  fill="none"
                  stroke="rgba(253,224,71,0.35)"
                  strokeWidth="2.5"
                  strokeDasharray="10 8"
                  transform={`rotate(${frame * 0.6} 270 270)`}
                />
              </svg>

              {/* Center Readout inside the Brix Wheel */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                }}
              >
                <span style={{ fontFamily: FONT_SANS, fontSize: 24, fontWeight: 800, color: '#fbbf24' }}>
                  {isTC ? '新平冰糖橙 · 黃金鎖甜度' : '新平冰糖橙 · 黄金锁甜度'}
                </span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
                  <span style={{ fontFamily: FONT_MONO, fontSize: 108, fontWeight: 900, color: '#ffffff', lineHeight: 1 }}>
                    {brixVal}
                  </span>
                  <span style={{ fontFamily: FONT_MONO, fontSize: 42, fontWeight: 900, color: '#fde047' }}>°Brix</span>
                </div>
                <div
                  style={{
                    marginTop: 12,
                    padding: '6px 18px',
                    borderRadius: 99,
                    backgroundColor: 'rgba(249,115,22,0.24)',
                    border: '1.5px solid #fbbf24',
                    fontFamily: FONT_SANS,
                    fontSize: 21,
                    fontWeight: 900,
                    color: '#fef08a',
                  }}
                >
                  {isTC ? '24:1 極致黃金糖酸比' : '24:1 极致黄金糖酸比'}
                </div>
              </div>
            </div>

            {/* 3 Orbital Microclimate Pods Popping Out Around the Wheel */}
            {[
              {
                top: 152,
                left: 60,
                width: 828,
                delay: 112,
                color: '#fde047',
                title: isTC ? '☀ 年均 2200 小時高原強日照' : '☀ 年均 2200 小时高原强日照',
                sub: isTC ? '白天強光合作用瘋狂合成糖分' : '白天强光合作用疯狂合成糖分',
              },
              {
                top: 845,
                left: 52,
                width: 410,
                delay: 122,
                color: '#fb923c',
                title: isTC ? '🌡 16°C 晝夜大溫差' : '🌡 16°C 昼夜大温差',
                sub: isTC ? '夜晚低溫呼吸減弱 · 鎖死果糖不流失' : '夜晚低温呼吸减弱 · 锁死果糖不流失',
              },
              {
                top: 845,
                left: 482,
                width: 418,
                delay: 130,
                color: '#34d399',
                title: isTC ? '💧 3165m 原始森林山泉' : '💧 3165m 原始森林山泉',
                sub: isTC ? '哀牢山頂天然礦物冷泉自流灌溉' : '哀牢山顶天然矿物冷泉自流灌溉',
              },
            ].map((pod, idx) => (
              <CleanGlassCard
                key={idx}
                delay={pod.delay}
                accentColor={pod.color}
                style={{
                  position: 'absolute',
                  top: pod.top,
                  left: pod.left,
                  width: pod.width,
                }}
              >
                <div style={{ fontFamily: FONT_SANS, fontSize: 28, fontWeight: 900, color: pod.color }}>
                  {pod.title}
                </div>
                <div style={{ fontFamily: FONT_SANS, fontSize: 21, fontWeight: 700, color: '#fef9c3', marginTop: 4 }}>
                  {pod.sub}
                </div>
              </CleanGlassCard>
            ))}
          </div>
        )}
      </Viewport3DHUD>
    </AbsoluteFill>
  );
};

/**
 * ============================================================================
 * 4. B09 — 5 μm EV Battery Firewall & 764.9B Cluster Director's Cut (353 frames = 11.76s)
 * Completely De-Templated 3-Act Cyberpunk FUI & Industrial Bento Journey:
 * - Act I (f0..98): 6-Frame `crash-zoom-punch` + Microscopic Caliper (`70μm 人类发丝` vs `5.0μm 湿法隔膜` + Cyan Li+ Flow)
 * - Act II (f98..178): `mg-styles-15` `22-hud` Crimson Red-Alert `135°C 瞬间自动闭孔` + Thermal Sparks Bouncing Off Barrier
 * - Act III (f176..353): 3D Camera Pull-Back (`SpeedBlur`) into `764.9 亿元` Dual-Engine Industrial Bento Matrix!
 * ============================================================================
 */
export const BatteryDirectorV4: React.FC<{ locale: Locale }> = ({ locale }) => {
  const frame = useCurrentFrame();
  const isTC = locale === 'zh-TW';

  const act2Start = 98;
  const act3Start = 176;
  const inAlert = frame >= act2Start && frame < act3Start;
  const inAct3 = frame >= act3Start;
  const accent = inAlert ? '#fb7185' : inAct3 ? '#38bdf8' : '#34d399';

  const act3T = interpolate(frame, [act3Start, act3Start + 14], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const whipVx =
    (frame >= 96 && frame <= 108 ? Math.sin(((frame - 96) / 12) * Math.PI) * 44 : 0) +
    (frame >= act3Start && frame <= act3Start + 14 ? Math.sin(((frame - act3Start) / 14) * Math.PI) * 52 : 0);

  const camKeys: PortraitCamKey[] = [
    { frame: 0, cx: 540, cy: 960, zoom: 1.06, rotY: -8, rotX: 4, rotZ: -0.6 },
    { frame: 6, cx: 540, cy: 960, zoom: 1.01, rotY: -9, rotX: 4.5, rotZ: -0.8 },
    { frame: 12, cx: 540, cy: 935, zoom: 1.34, rotY: 0, rotX: 0, rotZ: 0 },
    { frame: 98, cx: 540, cy: 920, zoom: 1.3, rotY: 8, rotX: -3, rotZ: 0.5 },
    { frame: 176, cx: 535, cy: 930, zoom: 1.28, rotY: -6, rotX: 2, rotZ: -0.4 },
    { frame: 192, cx: 540, cy: 960, zoom: 1.12, rotY: 4, rotX: 5, rotZ: 0 },
    { frame: 353, cx: 540, cy: 960, zoom: 1.18, rotY: -2, rotX: 2, rotZ: 0 },
  ];

  const slamFlash = interpolate(frame, [11, 13, 22], [0, 0.45, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const alertRingT = interpolate(frame, [act2Start, act2Start + 22], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ backgroundColor: '#031110' }}>
      <SpeedBlur vx={whipVx}>
        <ShotcraftCam
          src="plates_v3/PLATE_BATTERY.jpg"
          bgPlaneZ={-85}
          keys={camKeys}
          impactFrame={12}
          impactAmp={16}
          saturate={inAlert ? 1.3 : 1.16}
        >
          {/* World 3D Plane: 22-HUD Rotating Reticles + Li+ Ion / 135°C Thermal Bounce Simulation */}
          <Plane3D z={44} style={{ opacity: 1 - act3T * 0.72 }}>
            <ScanBracketOverlay left={185} top={480} width={590} height={510} color={accent} startFrame={14} passes={3} />
            <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
              <g transform="translate(480, 735)">
                <circle
                  r="235"
                  fill="none"
                  stroke={accent}
                  strokeWidth="2.5"
                  strokeOpacity="0.45"
                  strokeDasharray="24 14 6 14"
                  transform={`rotate(${frame * 1.2})`}
                />
                <circle
                  r="185"
                  fill="none"
                  stroke={inAlert ? '#fda4af' : '#6ee7b7'}
                  strokeWidth="3"
                  strokeOpacity="0.58"
                  strokeDasharray="48 22"
                  transform={`rotate(${-frame * 1.7})`}
                />
                <line
                  x1="0"
                  y1="-225"
                  x2="0"
                  y2="215"
                  stroke={accent}
                  strokeWidth={inAlert ? 9 : 4.5}
                  strokeDasharray={inAlert ? undefined : '12 10'}
                />
                {Array.from({ length: 28 }, (_, i) => {
                  const yOff = -190 + ((i * 14.8 + rand(i * 3) * 18) % 380);
                  const speed = 4.4 + rand(i * 11) * 3.2;
                  if (!inAlert) {
                    const xPos = -210 + ((frame * speed + rand(i * 17) * 420) % 420);
                    return (
                      <g key={i} transform={`translate(${xPos}, ${yOff})`}>
                        <circle r="5.5" fill="#38bdf8" />
                        <line x1="-18" y1="0" x2="-4" y2="0" stroke="#38bdf8" strokeWidth="2.5" strokeOpacity="0.65" />
                      </g>
                    );
                  } else {
                    const cycle = ((frame - act2Start) * speed * 1.4 + rand(i * 19) * 210) % 210;
                    const fromRight = i % 2 === 0;
                    const dist = cycle < 105 ? 210 - cycle * 2 : (cycle - 105) * 2;
                    const xPos = fromRight ? Math.max(8, dist) : -Math.max(8, dist);
                    const hitGlow = dist < 26;
                    return (
                      <g key={i} transform={`translate(${xPos}, ${yOff})`}>
                        <circle r={hitGlow ? 8 : 5.5} fill={hitGlow ? '#fde047' : '#fb7185'} />
                      </g>
                    );
                  }
                })}
              </g>
            </svg>
          </Plane3D>
        </ShotcraftCam>
      </SpeedBlur>

      <TopBottomScrim />

      <Viewport3DHUD keys={camKeys}>
        {/* ================= ACT I (f0..98): MICROSCOPIC CALIPER (70μm Hair vs 5.0μm Membrane) ================= */}
        {frame < act2Start && (
          <div style={{ position: 'absolute', inset: 0 }}>
            <div
              style={{
                position: 'absolute',
                top: 152,
                left: 48,
                width: 852,
                padding: '22px 28px',
                borderRadius: 26,
                background: 'linear-gradient(135deg, rgba(4,28,24,0.92) 0%, rgba(2,16,14,0.84) 100%)',
                border: '2px solid #34d399',
                boxShadow: '0 24px 54px rgba(0,0,0,0.8)',
                overflow: 'hidden',
              }}
            >
              <SheenSweep startFrame={14} durationFrames={24} />
              <div style={{ fontFamily: FONT_SANS, fontSize: 25, fontWeight: 800, color: '#6ee7b7' }}>
                {isTC ? '玉溪恩捷 45億投資 · 16條全自動產線' : '玉溪恩捷 45亿投资 · 16条全自动产线'}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginTop: 4 }}>
                <DigitRoll value="5.0" delay={10} fontSize={114} color="#34d399" />
                <span style={{ fontFamily: FONT_MONO, fontSize: 54, fontWeight: 900, color: '#ffffff' }}>
                  μm {isTC ? '超薄濕法隔膜' : '超薄湿法隔膜'}
                </span>
              </div>

              {/* Microscopic Scale Bar Comparison: 70μm Human Hair vs 5μm Separator */}
              <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: FONT_SANS, fontSize: 20, fontWeight: 800, color: '#94a3b8' }}>
                    <span>{isTC ? '人類頭髮絲直徑' : '人类头发丝直径'}</span>
                    <span style={{ fontFamily: FONT_MONO }}>70.0 μm (14×)</span>
                  </div>
                  <div style={{ width: '100%', height: 22, borderRadius: 6, backgroundColor: 'rgba(148,163,184,0.35)', marginTop: 4 }} />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: FONT_SANS, fontSize: 21, fontWeight: 900, color: '#fde047' }}>
                    <span>{isTC ? '★ 玉溪恩捷濕法鋰電隔膜（僅髮絲 1/14！）' : '★ 玉溪恩捷湿法锂电隔膜（仅发丝 1/14！）'}</span>
                    <span style={{ fontFamily: FONT_MONO }}>5.0 μm (1×)</span>
                  </div>
                  <div
                    style={{
                      width: '7.14%',
                      height: 22,
                      borderRadius: 6,
                      backgroundColor: '#34d399',
                      boxShadow: '0 0 20px #34d399',
                      marginTop: 4,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= ACT II (f98..176): 22-HUD 135°C RED-ALERT THERMAL SHUTDOWN LOCK ================= */}
        {inAlert && (
          <div style={{ position: 'absolute', inset: 0 }}>
            <div
              style={{
                position: 'absolute',
                top: 152,
                left: 48,
                width: 852,
                padding: '24px 30px',
                borderRadius: 28,
                background: 'linear-gradient(135deg, rgba(48,8,18,0.94) 0%, rgba(24,4,10,0.88) 100%)',
                border: '2.5px solid #fb7185',
                boxShadow: '0 26px 60px rgba(0,0,0,0.85), 0 0 44px rgba(251,113,133,0.45)',
                transform: `scale(${1 + dampedSettle(frame - act2Start, 0.14, 0.22) * 0.08})`,
                overflow: 'hidden',
              }}
            >
              <SheenSweep startFrame={act2Start + 2} durationFrames={20} color="rgba(251,113,133,0.4)" />
              <div
                style={{
                  display: 'inline-block',
                  padding: '5px 16px',
                  borderRadius: 8,
                  backgroundColor: '#fb7185',
                  color: '#180208',
                  fontFamily: FONT_MONO,
                  fontSize: 21,
                  fontWeight: 900,
                }}
              >
                THERMAL RUNAWAY FIREWALL · ACTIVE LOCK
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 18, marginTop: 8 }}>
                <span
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 128,
                    fontWeight: 900,
                    color: '#fb7185',
                    lineHeight: 1,
                    textShadow: '0 0 36px rgba(251,113,133,0.9)',
                  }}
                >
                  135°C
                </span>
                <span style={{ fontFamily: FONT_SANS, fontSize: 44, fontWeight: 900, color: '#ffffff' }}>
                  {isTC ? '瞬間閉孔防爆' : '瞬间闭孔防爆'}
                </span>
              </div>
              <div style={{ fontFamily: FONT_SANS, fontSize: 24, fontWeight: 700, color: '#fecdd3', marginTop: 8 }}>
                {isTC
                  ? '高溫觸發奈米微孔毫秒級自閉 · 徹底切斷鋰離子熱失控鏈路！'
                  : '高温触发纳米微孔毫秒级自闭 · 彻底切断锂离子热失控链路！'}
              </div>
            </div>
          </div>
        )}

        {/* ================= ACT III (f176..353): 764.9 BILLION DUAL-ENGINE INDUSTRIAL BENTO WALL ================= */}
        {act3T > 0.01 && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              opacity: act3T,
              transform: `scale(${0.88 + act3T * 0.12})`,
            }}
          >
            {/* Top Mega Industrial Output Monument */}
            <div
              style={{
                position: 'absolute',
                top: 152,
                left: 48,
                width: 852,
                padding: '24px 30px',
                borderRadius: 28,
                background: 'linear-gradient(135deg, rgba(4,22,42,0.94) 0%, rgba(2,12,26,0.88) 100%)',
                border: '2px solid #38bdf8',
                boxShadow: '0 28px 64px rgba(0,0,0,0.85), 0 0 36px rgba(56,189,248,0.28)',
                overflow: 'hidden',
              }}
            >
              <SheenSweep startFrame={act3Start + 10} durationFrames={26} />
              <div style={{ fontFamily: FONT_SANS, fontSize: 25, fontWeight: 800, color: '#7dd3fc' }}>
                {isTC ? '玉溪高新智造全產業鏈 · 雙引擎集群規模' : '玉溪高新智造全产业链 · 双引擎集群规模'}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginTop: 4 }}>
                <DigitRoll value="764.9" delay={act3Start + 6} fontSize={124} color="#fde047" />
                <span style={{ fontFamily: FONT_SANS, fontSize: 52, fontWeight: 900, color: '#ffffff' }}>
                  {isTC ? '億元' : '亿元'}
                </span>
              </div>
            </div>

            {/* Dual-Engine 3D Bento Grid (Engine #1 Lithium New Energy + Engine #2 Walvax Biomedicine) */}
            <div
              style={{
                position: 'absolute',
                top: 470,
                left: 48,
                width: 852,
                display: 'flex',
                flexDirection: 'column',
                gap: 22,
              }}
            >
              {/* Engine #1 Bento */}
              <CleanGlassCard delay={act3Start + 12} accentColor="#34d399" style={{ padding: '26px 30px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div
                      style={{
                        display: 'inline-block',
                        padding: '4px 14px',
                        borderRadius: 8,
                        backgroundColor: 'rgba(52,211,153,0.2)',
                        border: '1px solid #34d399',
                        fontFamily: FONT_MONO,
                        fontSize: 20,
                        fontWeight: 900,
                        color: '#34d399',
                      }}
                    >
                      ENGINE 01 · LITHIUM BATTERY CLUSTER
                    </div>
                    <div style={{ fontFamily: FONT_SANS, fontSize: 44, fontWeight: 900, color: '#ffffff', marginTop: 10 }}>
                      {isTC ? '⚡ 新能源電池全產業鏈集群' : '⚡ 新能源电池全产业链集群'}
                    </div>
                    <div style={{ fontFamily: FONT_SANS, fontSize: 23, fontWeight: 700, color: '#d1fae5', marginTop: 6 }}>
                      {isTC
                        ? '玉溪恩捷 16億㎡隔膜 + 坤天負極 + 豐元正極龍頭齊聚'
                        : '玉溪恩捷 16亿㎡隔膜 + 坤天负极 + 丰元正极龙头齐聚'}
                    </div>
                  </div>
                  <div style={{ fontFamily: FONT_MONO, fontSize: 52, fontWeight: 900, color: '#34d399', whiteSpace: 'nowrap' }}>
                    {isTC ? '16億㎡' : '16亿㎡'}
                  </div>
                </div>
              </CleanGlassCard>

              {/* Engine #2 Bento */}
              <CleanGlassCard delay={act3Start + 24} accentColor="#38bdf8" style={{ padding: '26px 30px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div
                      style={{
                        display: 'inline-block',
                        padding: '4px 14px',
                        borderRadius: 8,
                        backgroundColor: 'rgba(56,189,248,0.2)',
                        border: '1px solid #38bdf8',
                        fontFamily: FONT_MONO,
                        fontSize: 20,
                        fontWeight: 900,
                        color: '#38bdf8',
                      }}
                    >
                      ENGINE 02 · BIOMEDICINE VALLEY
                    </div>
                    <div style={{ fontFamily: FONT_SANS, fontSize: 44, fontWeight: 900, color: '#ffffff', marginTop: 10 }}>
                      {isTC ? '🧬 沃森生物高新醫藥引擎' : '🧬 沃森生物高新医药引擎'}
                    </div>
                    <div style={{ fontFamily: FONT_SANS, fontSize: 23, fontWeight: 700, color: '#e0f2fe', marginTop: 6 }}>
                      {isTC
                        ? '中國疫苗研發智造高地 · 產品遠銷全球 19 個國家'
                        : '中国疫苗研发智造高地 · 产品远销全球 19 个国家'}
                    </div>
                  </div>
                  <div style={{ fontFamily: FONT_MONO, fontSize: 52, fontWeight: 900, color: '#38bdf8', whiteSpace: 'nowrap' }}>
                    {isTC ? '19國' : '19国'}
                  </div>
                </div>
              </CleanGlassCard>
            </div>
          </div>
        )}
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
