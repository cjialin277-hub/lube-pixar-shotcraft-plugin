import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { DigitRoll } from '../shotcraft/DigitRoll';
import { CleanGlassCard, ScanBracketOverlay, ShotcraftCam } from '../shotcraft/ShotcraftCam';
import { dampedSettle } from '../shotcraft/helpers/motion';
import { FONT_MONO, FONT_SANS, Locale } from './ScienceInserts';

const TopScrim: React.FC<{ color?: string }> = ({ color = 'rgba(2,10,20,0.82)' }) => (
  <>
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 460,
        background: `linear-gradient(180deg, ${color} 0%, rgba(2,10,20,0.38) 60%, transparent 100%)`,
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
        background: 'linear-gradient(0deg, rgba(2,10,20,0.92) 0%, rgba(2,10,20,0.52) 55%, transparent 100%)',
        pointerEvents: 'none',
      }}
    />
  </>
);

/**
 * B03 — Fuxian Lake: video-shotcraft `circle-match-iris` + 2.5D Deep-Dive ShotcraftCam + `DigitRoll` 158.9m!
 */
export const FuxianLakeShotcraftV3: React.FC<{ locale: Locale }> = ({ locale }) => {
  const frame = useCurrentFrame();
  const isTC = locale === 'zh-TW';

  // video-shotcraft circle-match-iris: expands over exact 10f overlap while B02 lake splash stays 100% live underneath!
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

  // Left vertical depth ruler tracks downward with the dive
  const divePct = interpolate(frame, [10, 130], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });

  return (
    <AbsoluteFill
      style={{
        clipPath: irisT < 0.99 ? `circle(${irisR}px at 540px 1440px)` : undefined,
        backgroundColor: '#031324',
      }}
    >
      <ShotcraftCam
        src="plates_v3/PLATE_LAKE.jpg"
        keys={[
          { frame: 0, cx: 540, cy: 760, zoom: 1.08, rotX: 6, rotY: -3, rotZ: -0.6 },
          { frame: 140, cx: 525, cy: 1020, zoom: 1.2, rotX: -2, rotY: 3.5, rotZ: 0.4 },
          { frame: 310, cx: 540, cy: 1140, zoom: 1.28, rotX: -4, rotY: 2, rotZ: 0 },
        ]}
        saturate={1.12}
      />

      <TopScrim />

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

      {/* Left vertical depth-gauge scale bar */}
      <div
        style={{
          position: 'absolute',
          left: 48,
          top: 420,
          width: 4,
          height: 580,
          borderRadius: 4,
          backgroundColor: 'rgba(125,211,252,0.22)',
        }}
      >
        <div
          style={{
            width: '100%',
            height: `${divePct * 100}%`,
            borderRadius: 4,
            background: 'linear-gradient(180deg, #38bdf8, #06b6d4, #fde047)',
            boxShadow: '0 0 14px #38bdf8',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: `${divePct * 100}%`,
            left: -5,
            width: 14,
            height: 14,
            borderRadius: '50%',
            backgroundColor: '#fde047',
            boxShadow: '0 0 18px #fde047',
            transform: 'translateY(-50%)',
          }}
        />
      </div>

      {/* Hero Metric Header with DigitRoll Odometer */}
      <div style={{ position: 'absolute', top: 148, left: 48, width: 852 }}>
        <div
          style={{
            fontFamily: FONT_SANS,
            fontSize: 28,
            fontWeight: 800,
            color: '#7dd3fc',
            letterSpacing: 1.5,
            textShadow: '0 2px 12px rgba(0,0,0,0.8)',
          }}
        >
          {isTC ? '撫仙湖 · 中國第二深淡水湖' : '抚仙湖 · 中国第二深淡水湖'}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 6 }}>
          <DigitRoll value="158.9" delay={8} fontSize={106} color="#ffffff" />
          <span
            style={{
              fontFamily: FONT_MONO,
              fontSize: 44,
              fontWeight: 900,
              color: '#38bdf8',
              textShadow: '0 0 24px rgba(56,189,248,0.8)',
            }}
          >
            m
          </span>
        </div>
      </div>

      {/* 2 Clean Zero-Flicker Glass Cards (strictly above subtitle zone, inside 48..900 safe width) */}
      <div
        style={{
          position: 'absolute',
          top: 1090,
          left: 48,
          width: 852,
          display: 'flex',
          gap: 18,
        }}
      >
        <CleanGlassCard delay={18} accentColor="#38bdf8" style={{ flex: 1 }}>
          <div style={{ fontFamily: FONT_MONO, fontSize: 38, fontWeight: 900, color: '#38bdf8' }}>
            {isTC ? '206.2 億方' : '206.2 亿方'}
          </div>
          <div style={{ fontFamily: FONT_SANS, fontSize: 22, fontWeight: 700, color: '#e0f2fe', marginTop: 4 }}>
            {isTC ? '≈ 13滇池 · 7洱海 · 4太湖' : '≈ 13滇池 · 7洱海 · 4太湖'}
          </div>
        </CleanGlassCard>
        <CleanGlassCard delay={30} accentColor="#fde047" style={{ flex: 1 }}>
          <div style={{ fontFamily: FONT_MONO, fontSize: 38, fontWeight: 900, color: '#fde047' }}>
            {isTC ? 'I 類水 90%+' : 'I 类水 90%+'}
          </div>
          <div style={{ fontFamily: FONT_SANS, fontSize: 22, fontWeight: 700, color: '#fef9c3', marginTop: 4 }}>
            {isTC ? '全國重點湖泊總量' : '全国重点湖泊总量'}
          </div>
        </CleanGlassCard>
      </div>
    </AbsoluteFill>
  );
};

/**
 * B05 — Chengjiang Fossil Site: video-shotcraft `timeline-travel` 3-stage velocity track + spring pop cards + brake push-in!
 */
export const ChengjiangShotcraftV3: React.FC<{ locale: Locale }> = ({ locale }) => {
  const frame = useCurrentFrame();
  const isTC = locale === 'zh-TW';

  // video-shotcraft timeline-travel 3-stage speed curve: [0,0.15,0.86,1] -> [0,0.06,0.92,1]
  const rawU = Math.max(0, Math.min(1, (frame - 8) / 86));
  const travel =
    rawU < 0.15
      ? (rawU / 0.15) * 0.06
      : rawU < 0.86
        ? 0.06 + ((rawU - 0.15) / 0.71) * 0.86
        : 0.92 + Easing.out(Easing.cubic)((rawU - 0.86) / 0.14) * 0.08;

  // Brake push-in right as timeline lands on 5.18亿年 (frame 92..106)
  const brakePush = interpolate(frame, [90, 104], [1.0, 1.07], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  const stops = [
    { at: 0.05, era: isTC ? '現代' : '现代', tag: '0 Ma', color: '#38bdf8' },
    { at: 0.48, era: isTC ? '恐龍時代' : '恐龙时代', tag: '2.3 亿年', color: '#34d399' },
    { at: 0.94, era: isTC ? '★ 玉溪澄江' : '★ 玉溪澄江', tag: '5.18 亿年', color: '#fde047' },
  ];

  // Translate timeline horizontally so active marker sweeps smoothly across 852px viewport
  const trackW = 1650;
  const camX = travel * (trackW - 760);

  return (
    <AbsoluteFill style={{ backgroundColor: '#05141a' }}>
      <ShotcraftCam
        src="plates_v3/PLATE_FOSSIL.jpg"
        keys={[
          { frame: 0, cx: 480, cy: 960, zoom: 1.08, rotY: -5, rotX: 3 },
          { frame: 90, cx: 560, cy: 940, zoom: 1.15, rotY: 2, rotX: 0 },
          { frame: 105, cx: 540, cy: 920, zoom: 1.26, rotY: 0, rotX: -2 },
          { frame: 275, cx: 540, cy: 890, zoom: 1.32, rotY: 3, rotX: -2.5 },
        ]}
        saturate={1.15}
      />

      <TopScrim color="rgba(5,18,24,0.88)" />

      {/* Top Hero Header with DigitRoll */}
      <div
        style={{
          position: 'absolute',
          top: 148,
          left: 48,
          width: 852,
          transform: `scale(${brakePush})`,
          transformOrigin: 'left top',
        }}
      >
        <div style={{ fontFamily: FONT_SANS, fontSize: 28, fontWeight: 800, color: '#fbbf24', letterSpacing: 1.5 }}>
          {isTC ? '玉溪 · 澄江化石地世界自然遺產' : '玉溪 · 澄江化石地世界自然遗产'}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 4 }}>
          <DigitRoll value="5.18" delay={14} fontSize={106} color="#ffffff" />
          <span
            style={{
              fontFamily: FONT_SANS,
              fontSize: 44,
              fontWeight: 900,
              color: '#fde047',
              textShadow: '0 0 24px rgba(250,204,21,0.75)',
            }}
          >
            {isTC ? '億年前' : '亿年前'}
          </span>
        </div>
      </div>

      {/* Horizontal `timeline-travel` Ruler & Spring Pop Milestone Pins */}
      <div
        style={{
          position: 'absolute',
          top: 392,
          left: 48,
          width: 852,
          height: 150,
          overflow: 'hidden',
          borderRadius: 18,
          background: 'linear-gradient(90deg, rgba(4,16,24,0.86) 0%, rgba(4,16,24,0.64) 85%, rgba(4,16,24,0.92) 100%)',
          border: '1px solid rgba(250,204,21,0.34)',
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
          {/* Main ruler rail */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 98,
              height: 4,
              background: 'linear-gradient(90deg, #38bdf8, #34d399, #fde047)',
              borderRadius: 4,
            }}
          />
          {/* Sub-tick dots for crisp velocity sense (timeline-travel rule!) */}
          {Array.from({ length: 42 }, (_, k) => (
            <div
              key={k}
              style={{
                position: 'absolute',
                left: k * 39,
                top: 90,
                width: 2,
                height: k % 5 === 0 ? 18 : 10,
                backgroundColor: 'rgba(255,255,255,0.38)',
              }}
            />
          ))}
          {/* Milestone cards springing up 6f before arrival */}
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
                  top: 18,
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
                    backgroundColor: 'rgba(5,18,26,0.94)',
                    border: `2px solid ${st.color}`,
                    boxShadow: `0 0 18px ${st.color}55`,
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

      {/* 2 Punchy Fossil Highlights at bottom safe zone */}
      <div style={{ position: 'absolute', top: 1090, left: 48, width: 852, display: 'flex', gap: 18 }}>
        <CleanGlassCard delay={24} accentColor="#fde047" style={{ flex: 1 }}>
          <div style={{ fontFamily: FONT_SANS, fontSize: 32, fontWeight: 900, color: '#fde047' }}>
            {isTC ? '亞洲唯一化石類' : '亚洲唯一化石类'}
          </div>
          <div style={{ fontFamily: FONT_SANS, fontSize: 22, fontWeight: 700, color: '#fef9c3', marginTop: 4 }}>
            {isTC ? '20+ 門類 · 300+ 寒武紀物種' : '20+ 门类 · 300+ 寒武纪物种'}
          </div>
        </CleanGlassCard>
        <CleanGlassCard delay={38} accentColor="#34d399" style={{ flex: 1 }}>
          <div style={{ fontFamily: FONT_SANS, fontSize: 32, fontWeight: 900, color: '#34d399' }}>
            {isTC ? '天下第一魚' : '天下第一鱼'}
          </div>
          <div style={{ fontFamily: FONT_SANS, fontSize: 22, fontWeight: 700, color: '#d1fae5', marginTop: 4 }}>
            {isTC ? '昆明魚 · 微米級軟軀體封存' : '昆明鱼 · 微米级软躯体封存'}
          </div>
        </CleanGlassCard>
      </div>
    </AbsoluteFill>
  );
};

/**
 * B07 — Ailao Mountain: Parallax Bottom-Push Wipe + 2.5D Aerial Tilt Glide from misty forest to golden orange valley!
 */
export const AilaoShotcraftV3: React.FC<{ locale: Locale }> = ({ locale }) => {
  const frame = useCurrentFrame();
  const isTC = locale === 'zh-TW';

  // Bottom-push stack wipe entry over 14f (video-shotcraft bottom-push-stack-wipe!)
  const pushY = interpolate(frame, [0, 14], [1920, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });

  return (
    <AbsoluteFill
      style={{
        transform: pushY > 0.5 ? `translateY(${pushY}px)` : undefined,
        boxShadow: pushY > 0.5 ? '0 -30px 90px rgba(251,191,36,0.45)' : undefined,
        backgroundColor: '#061a12',
      }}
    >
      <ShotcraftCam
        src="plates_v3/PLATE_AILAO.jpg"
        keys={[
          { frame: 0, cx: 520, cy: 740, zoom: 1.18, rotX: 6, rotY: -4.5, rotZ: -0.6 },
          { frame: 120, cx: 550, cy: 1010, zoom: 1.24, rotX: 0, rotY: 2.5, rotZ: 0.4 },
          { frame: 255, cx: 540, cy: 1180, zoom: 1.3, rotX: -4, rotY: 4, rotZ: 0 },
        ]}
        saturate={1.15}
      />

      <TopScrim color="rgba(5,20,14,0.82)" />

      <div style={{ position: 'absolute', top: 148, left: 48, width: 852 }}>
        <div style={{ fontFamily: FONT_SANS, fontSize: 28, fontWeight: 800, color: '#6ee7b7', letterSpacing: 1.5 }}>
          {isTC ? '哀牢山 · 立體生態地理密碼' : '哀牢山 · 立体生态地理密码'}
        </div>
        <div
          style={{
            fontFamily: FONT_SANS,
            fontSize: 64,
            fontWeight: 900,
            color: '#ffffff',
            marginTop: 8,
            textShadow: '0 6px 24px rgba(0,0,0,0.75)',
          }}
        >
          {isTC ? '原始森林 × 乾熱河谷' : '原始森林 × 干热河谷'}
        </div>
      </div>

      <div style={{ position: 'absolute', top: 1090, left: 48, width: 852, display: 'flex', gap: 18 }}>
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
    </AbsoluteFill>
  );
};

/**
 * B09 — 5 μm EV Battery Firewall: video-shotcraft `crash-zoom-punch` (6f slam + damped impact shake)
 * + `scan-bracket-sweep` laser HUD + `135°C` thermal red-alert shockwave + `DigitRoll`!
 */
export const BatteryShotcraftV3: React.FC<{ locale: Locale }> = ({ locale }) => {
  const frame = useCurrentFrame();
  const isTC = locale === 'zh-TW';

  // Thermal alert triggers right as Shen Xi says "135度瞬间闭孔防爆" (~3.7s = frame 110)
  const alertStart = 110;
  const inAlert = frame >= alertStart;
  const accent = inAlert ? '#fb7185' : '#34d399';

  // Radial shockwave ring on slam impact (frame 12) and thermal alert (frame 110)
  const slamRingT = interpolate(frame, [12, 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const alertRingT = interpolate(frame, [alertStart, alertStart + 22], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const slamFlash = interpolate(frame, [11, 13, 22], [0, 0.42, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const alertRecoil = dampedSettle(Math.max(0, frame - alertStart), 0.14, 0.22) * 0.08;

  return (
    <AbsoluteFill style={{ backgroundColor: '#031110' }}>
      <ShotcraftCam
        src="plates_v3/PLATE_BATTERY.jpg"
        keys={[
          // Anticipation pull-back (f0..6) -> 6-frame CRASH-ZOOM PUNCH (f6..12) -> smooth orbit settle all way to f355!
          { frame: 0, cx: 540, cy: 960, zoom: 1.06, rotY: -6, rotX: 3 },
          { frame: 6, cx: 540, cy: 960, zoom: 1.02, rotY: -7, rotX: 3.5 },
          { frame: 12, cx: 540, cy: 940, zoom: 1.32, rotY: 0, rotX: 0 },
          { frame: 110, cx: 540, cy: 925, zoom: 1.24, rotY: 4.5, rotX: -2 },
          { frame: 230, cx: 535, cy: 945, zoom: 1.18, rotY: -3.5, rotX: 2 },
          { frame: 355, cx: 540, cy: 960, zoom: 1.26, rotY: 2, rotX: -1.5 },
        ]}
        impactFrame={12}
        impactAmp={15}
        saturate={inAlert ? 1.25 : 1.14}
      />

      <TopScrim color="rgba(3,14,14,0.86)" />

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

      {/* video-shotcraft `scan-bracket-sweep` locked right onto the glowing 5μm separator core */}
      <ScanBracketOverlay left={170} top={490} width={620} height={540} color={accent} startFrame={16} passes={3} />

      {/* Hero Metric Header: 5 μm -> flips to 135°C Thermal Lock! */}
      <div
        style={{
          position: 'absolute',
          top: 148,
          left: 48,
          width: 852,
          transform: `scale(${1 + alertRecoil})`,
          transformOrigin: 'left top',
        }}
      >
        <div style={{ fontFamily: FONT_SANS, fontSize: 28, fontWeight: 800, color: accent, letterSpacing: 1.5 }}>
          {inAlert
            ? isTC
              ? '高溫瞬間自動閉孔 · 鎖死電池熱失控'
              : '高温瞬间自动闭孔 · 锁死电池热失控'
            : isTC
              ? '5 微米濕法鋰電隔膜 · 僅髮絲 1/14'
              : '5 微米湿法锂电隔膜 · 仅发丝 1/14'}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginTop: 6 }}>
          {inAlert ? (
            <span
              style={{
                fontFamily: FONT_MONO,
                fontSize: 104,
                fontWeight: 900,
                color: '#fb7185',
                textShadow: '0 0 34px rgba(251,113,133,0.85)',
              }}
            >
              135°C
            </span>
          ) : (
            <>
              <DigitRoll value="5" delay={12} fontSize={106} color="#34d399" />
              <span
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 58,
                  fontWeight: 900,
                  color: '#ffffff',
                  textShadow: '0 0 24px rgba(52,211,153,0.75)',
                }}
              >
                μm
              </span>
            </>
          )}
        </div>
      </div>

      <div style={{ position: 'absolute', top: 1090, left: 48, width: 852, display: 'flex', gap: 18 }}>
        <CleanGlassCard delay={22} accentColor="#34d399" style={{ flex: 1 }}>
          <div style={{ fontFamily: FONT_MONO, fontSize: 36, fontWeight: 900, color: '#34d399' }}>
            {isTC ? '45億 · 16產線' : '45亿 · 16产线'}
          </div>
          <div style={{ fontFamily: FONT_SANS, fontSize: 22, fontWeight: 700, color: '#d1fae5', marginTop: 4 }}>
            {isTC ? '玉溪恩捷 · 年產 16億㎡' : '玉溪恩捷 · 年产 16亿㎡'}
          </div>
        </CleanGlassCard>
        <CleanGlassCard delay={34} accentColor="#38bdf8" style={{ flex: 1 }}>
          <div style={{ fontFamily: FONT_MONO, fontSize: 36, fontWeight: 900, color: '#38bdf8' }}>
            {isTC ? '764.9 億元' : '764.9 亿元'}
          </div>
          <div style={{ fontFamily: FONT_SANS, fontSize: 22, fontWeight: 700, color: '#e0f2fe', marginTop: 4 }}>
            {isTC ? '新能源集群 × 沃森生物' : '新能源集群 × 沃森生物'}
          </div>
        </CleanGlassCard>
      </div>
    </AbsoluteFill>
  );
};
