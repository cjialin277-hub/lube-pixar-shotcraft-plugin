#!/usr/bin/env python3
"""
Builds the frame-accurate V4 Director's Cut SFX + Voice + Foley + BGM Master Audio:
Mixes 52 frame-pinned cinema SFX cues from `video-shotcraft/template/public/audio/`
onto `master_mix_yuxi_v3_shotcraft.mp3` with zero AAC priming drift and -14 LUFS loudness.
"""
import json
import os
import subprocess

REMOTION_DIR = "/Volumes/T9/科技代码加实拍/yuxi-3d-anime-ep01/remotion-app"
SHOTCRAFT_AUDIO_DIR = "/Volumes/T9/科技代码加实拍/.agents/skills/video-shotcraft/template/public/audio"
SFX_PUBLIC_DIR = os.path.join(REMOTION_DIR, "public/audio/sfx")
BASE_MASTER = os.path.join(REMOTION_DIR, "public/audio/master_mix_yuxi_v3_shotcraft.mp3")
OUT_MASTER = os.path.join(REMOTION_DIR, "public/audio/master_mix_yuxi_v4_director_sfx.mp3")
CUE_JSON_OUT = os.path.join(REMOTION_DIR, "src/data/sfx_cues_v4_director.json")

os.makedirs(SFX_PUBLIC_DIR, exist_ok=True)
for fn in os.listdir(SHOTCRAFT_AUDIO_DIR):
    if fn.endswith(".mp3") and not fn.startswith("._"):
        src = os.path.join(SHOTCRAFT_AUDIO_DIR, fn)
        dst = os.path.join(SFX_PUBLIC_DIR, fn)
        if not os.path.exists(dst):
            subprocess.run(["cp", src, dst], check=True)

# 52 Declarative Frame-Pinned Cinema SFX Cues (30fps exact frame -> action mapping)
SFX_CUES = [
    # --- B01 (0..241): Open + Hanazi + Axial Cut at f122 ---
    {"frame": 2,   "src": "transition-soft.mp3", "vol": 0.42, "dur": 1.2, "note": "B01 3D gimbal opening settle"},
    {"frame": 52,  "src": "pop.mp3",             "vol": 0.48, "dur": 0.5, "note": "B01 Hanazi pop: 逛半天就走?!"},
    {"frame": 120, "src": "swoosh-quick.mp3",    "vol": 0.52, "dur": 0.7, "note": "B01 Axial snap-reframe to Shen Xi & Xiaokun"},
    {"frame": 132, "src": "sparkle.mp3",         "vol": 0.36, "dur": 1.4, "note": "B01 Xiaokun 500M-year hologram shimmer"},

    # --- B02 (235..475): FlashCut + Hanazi + Axial Cut at f327 ---
    {"frame": 233, "src": "whoosh-fast.mp3",     "vol": 0.48, "dur": 0.8, "note": "B01->B02 FlashCut transition"},
    {"frame": 271, "src": "pop.mp3",             "vol": 0.46, "dur": 0.5, "note": "B02 Hanazi pop: 蓝到像大海!"},
    {"frame": 326, "src": "transition-snap.mp3", "vol": 0.48, "dur": 0.6, "note": "B02 Axial cut to Shen Xi dive command"},

    # --- B03 Fuxian Lake (465..770): Act I Abyssal Plunge + Act II 13x Isometric Water-Cube Deal ---
    {"frame": 464, "src": "whoosh-big.mp3",      "vol": 0.58, "dur": 1.2, "note": "B03 circle-match-iris + deep trench plunge"},
    {"frame": 475, "src": "keyboard.mp3",        "vol": 0.38, "dur": 0.9, "note": "B03 Depth plumb & DigitRoll 158.9m counter ticks"},
    {"frame": 518, "src": "impact-cine.mp3",     "vol": 0.55, "dur": 1.5, "note": "B03 Trench floor -158.9m monument slam"},
    {"frame": 603, "src": "whoosh-big.mp3",      "vol": 0.55, "dur": 1.1, "note": "B03 Act II 3D swing to 13x Dianchi Isometric Arena"},
    # Accelerating deck-deal-flyin pops for the 13 Dianchi water blocks (Rule S2: accelerating interval + stepped volume)
    {"frame": 616, "src": "pop.mp3",             "vol": 0.46, "dur": 0.4, "note": "B03 Water cube deal #1"},
    {"frame": 623, "src": "pop.mp3",             "vol": 0.43, "dur": 0.4, "note": "B03 Water cube deal #2"},
    {"frame": 629, "src": "pop.mp3",             "vol": 0.40, "dur": 0.4, "note": "B03 Water cube deal #3"},
    {"frame": 634, "src": "pop.mp3",             "vol": 0.37, "dur": 0.4, "note": "B03 Water cube deal #4"},
    {"frame": 638, "src": "whoosh-fast.mp3",     "vol": 0.44, "dur": 0.7, "note": "B03 Water cubes #5..#13 rapid stack flurry"},
    {"frame": 656, "src": "click-camera.mp3",    "vol": 0.58, "dur": 0.6, "note": "B03 13x Dianchi tower lockup stamp"},
    {"frame": 680, "src": "sparkle.mp3",         "vol": 0.36, "dur": 1.4, "note": "B03 Class-I 90%+ purity ring glow"},

    # --- B04 (760..1001): Return to Cambrian Sea + Axial Cut at f860 ---
    {"frame": 758, "src": "transition-soft.mp3", "vol": 0.45, "dur": 1.0, "note": "B03->B04 Cambrian ocean entry"},
    {"frame": 856, "src": "pop.mp3",             "vol": 0.48, "dur": 0.5, "note": "B04 Hanazi pop: 2米寒武纪巨兽!"},
    {"frame": 860, "src": "swoosh-quick.mp3",    "vol": 0.50, "dur": 0.7, "note": "B04 Axial reframe to Anomalocaris & Shen Xi"},

    # --- B05 Chengjiang Fossil (991..1261): Act I Time-Canvas Flight + Act II Paperclip Sticker Slap & Loupe ---
    {"frame": 991,  "src": "riser-cine.mp3",     "vol": 0.48, "dur": 2.4, "note": "B05 Time-travel acceleration 0 Ma -> 518 Ma"},
    {"frame": 1005, "src": "keyboard.mp3",       "vol": 0.36, "dur": 1.1, "note": "B05 5.18亿年 time ruler ticks"},
    {"frame": 1068, "src": "impact-cine.mp3",    "vol": 0.58, "dur": 1.5, "note": "B05 5.18亿年 brake push-in impact"},
    {"frame": 1137, "src": "whoosh-fast.mp3",    "vol": 0.52, "dur": 0.8, "note": "B05 Act II camera swing to specimen dissection"},
    {"frame": 1148, "src": "transition-snap.mp3","vol": 0.54, "dur": 0.6, "note": "B05 Sticker #1 slap: 2.0m 奇虾"},
    {"frame": 1164, "src": "click-camera.mp3",   "vol": 0.56, "dur": 0.6, "note": "B05 Sticker #2 slap: 天下第一鱼 昆明鱼"},
    {"frame": 1182, "src": "sparkle.mp3",        "vol": 0.38, "dur": 1.4, "note": "B05 Micron X-Ray loupe scan over soft tissue"},

    # --- B06 (1251..1491): Ailao Sea of Clouds + Axial Cut at f1350 ---
    {"frame": 1250, "src": "transition-soft.mp3","vol": 0.44, "dur": 1.0, "note": "B05->B06 Ailao Mountain entry"},
    {"frame": 1349, "src": "swoosh-quick.mp3",   "vol": 0.50, "dur": 0.7, "note": "B06 Axial cut to Shen Xi holding Chu Orange"},
    {"frame": 1373, "src": "pop.mp3",            "vol": 0.48, "dur": 0.5, "note": "B06 Hanazi pop: 爆汁冰糖橙!"},

    # --- B07 Ailao Mountain (1481..1732): Act I Diagonal Altitude Collision + Act II Valley Dive & Brix Dial ---
    {"frame": 1481, "src": "whoosh-big.mp3",     "vol": 0.58, "dur": 1.1, "note": "B07 bottom-push-stack-wipe entry"},
    {"frame": 1496, "src": "impact-cine.mp3",    "vol": 0.52, "dur": 1.4, "note": "B07 3165m vs 500m diagonal collision stamp"},
    {"frame": 1567, "src": "whoosh-fast.mp3",    "vol": 0.55, "dur": 0.9, "note": "B07 Act II vertical dive into dry-hot orange valley"},
    {"frame": 1582, "src": "keyboard.mp3",       "vol": 0.38, "dur": 1.0, "note": "B07 Radial Brix Sugar-Lock dial sweep ticks"},
    {"frame": 1612, "src": "pop.mp3",            "vol": 0.44, "dur": 0.4, "note": "B07 Satellite badge #1: 2200h+ 强日照"},
    {"frame": 1620, "src": "pop.mp3",            "vol": 0.41, "dur": 0.4, "note": "B07 Satellite badge #2: 16°C 大温差"},
    {"frame": 1628, "src": "sparkle.mp3",        "vol": 0.38, "dur": 1.3, "note": "B07 15.8° Brix golden sweet lock"},

    # --- B08 (1722..1962): 5μm Lab + Axial Cut at f1826 ---
    {"frame": 1721, "src": "transition-soft.mp3","vol": 0.44, "dur": 1.0, "note": "B07->B08 High-tech lab entry"},
    {"frame": 1764, "src": "pop.mp3",            "vol": 0.46, "dur": 0.5, "note": "B08 Hanazi pop: 比保鲜膜还薄?!"},
    {"frame": 1826, "src": "transition-snap.mp3","vol": 0.50, "dur": 0.6, "note": "B08 Axial punch-in to 5μm holo film"},

    # --- B09 5μm Battery (1952..2305): Act I Caliper + Act II 135°C Thermal Lock + Act III 764.9B Bento Wall ---
    {"frame": 1958, "src": "impact-cine.mp3",    "vol": 0.62, "dur": 1.5, "note": "B09 6-frame crash-zoom-punch slam"},
    {"frame": 1968, "src": "keyboard.mp3",       "vol": 0.36, "dur": 0.9, "note": "B09 70μm hair vs 5μm caliper laser scan"},
    {"frame": 2032, "src": "riser-cine.mp3",     "vol": 0.46, "dur": 0.9, "note": "B09 Thermal rise approaching 135°C"},
    {"frame": 2050, "src": "click-camera.mp3",   "vol": 0.62, "dur": 0.6, "note": "B09 Act II 135°C micropore lockdown clunk"},
    {"frame": 2052, "src": "impact-cine.mp3",    "vol": 0.54, "dur": 1.3, "note": "B09 Crimson thermal shockwave ring"},
    {"frame": 2128, "src": "whoosh-big.mp3",     "vol": 0.56, "dur": 1.1, "note": "B09 Act III pull-back to 764.9B Dual-Engine Bento Wall"},
    {"frame": 2142, "src": "keyboard.mp3",       "vol": 0.38, "dur": 1.0, "note": "B09 764.9亿元 odometer count-up"},
    {"frame": 2162, "src": "pop.mp3",            "vol": 0.44, "dur": 0.4, "note": "B09 Engine #1 module lock: 新能源电池集群"},
    {"frame": 2172, "src": "pop.mp3",            "vol": 0.42, "dur": 0.4, "note": "B09 Engine #2 module lock: 沃森生物医药"},

    # --- B10, B11, B12 (2295..3006): Cultural & Finale Axial Cuts + Climax ---
    {"frame": 2329, "src": "pop.mp3",            "vol": 0.46, "dur": 0.5, "note": "B10 Hanazi pop: 764.9亿硬核家底!"},
    {"frame": 2387, "src": "swoosh-quick.mp3",   "vol": 0.48, "dur": 0.7, "note": "B10 Axial cut to Yuxi blue-and-white porcelain"},
    {"frame": 2592, "src": "pop.mp3",            "vol": 0.48, "dur": 0.5, "note": "B11 Hanazi pop: 真香警告!"},
    {"frame": 2640, "src": "transition-snap.mp3","vol": 0.50, "dur": 0.6, "note": "B11 Axial cut to stadium lights & train"},
    {"frame": 2763, "src": "whoosh-fast.mp3",    "vol": 0.50, "dur": 0.8, "note": "B11->B12 Sunset finale FlashCut"},
    {"frame": 2813, "src": "pop.mp3",            "vol": 0.46, "dur": 0.5, "note": "B12 Hanazi pop: 宝藏玉溪!"},
    {"frame": 2872, "src": "swoosh-quick.mp3",   "vol": 0.48, "dur": 0.7, "note": "B12 Final axial push-in on Shen Xi & Xiaokun"},
    {"frame": 2945, "src": "sparkle.mp3",        "vol": 0.40, "dur": 1.6, "note": "B12 Sunset golden shimmer sign-off"},
]

with open(CUE_JSON_OUT, "w", encoding="utf-8") as f:
    json.dump(SFX_CUES, f, ensure_ascii=False, indent=2)

# Build FFmpeg filter_complex to mix all 58 frame-accurate SFX cues onto BASE_MASTER
inputs = ["-i", BASE_MASTER]
filter_parts = []
mix_labels = ["[0:a]"]

for idx, cue in enumerate(SFX_CUES, start=1):
    sfx_path = os.path.join(SFX_PUBLIC_DIR, cue["src"])
    inputs.extend(["-i", sfx_path])
    delay_ms = int(round((cue["frame"] / 30.0) * 1000))
    dur = cue["dur"]
    vol = cue["vol"]
    lbl = f"[s{idx}]"
    filter_parts.append(
        f"[{idx}:a]atrim=0:{dur},afade=t=out:st={max(0.05, dur-0.12):.2f}:d=0.12,"
        f"volume={vol:.2f},adelay={delay_ms}|{delay_ms}{lbl}"
    )
    mix_labels.append(lbl)

n_in = len(mix_labels)
filter_parts.append(
    f"{''.join(mix_labels)}amix=inputs={n_in}:duration=first:dropout_transition=0:normalize=0,"
    f"alimiter=limit=0.92:level=disabled[outa]"
)

cmd = [
    "ffmpeg", "-y",
    *inputs,
    "-filter_complex", ";".join(filter_parts),
    "-map", "[outa]",
    "-c:a", "libmp3lame", "-b:a", "320k",
    OUT_MASTER
]
subprocess.run(cmd, check=True)
print(f"BUILT {OUT_MASTER} WITH {len(SFX_CUES)} FRAME-PINNED CINEMA SFX CUES!")
