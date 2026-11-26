#!/usr/bin/env bash
set -euo pipefail

# 一键拉取并挂载 8 大 AI 3D / 丝滑运镜 / MG 动效开源武器库到目标工作区 .agents/skills/
# 用法: bash install_8_toolkit.sh [目标工作区路径，默认当前目录]

WORKSPACE="${1:-$(pwd)}"
BASE="$WORKSPACE/ai_3d_motion_toolkit"
SKILLS="$WORKSPACE/.agents/skills"
RULES="$WORKSPACE/.agents/rules"

export GIT_TERMINAL_PROMPT=0
mkdir -p "$BASE" "$SKILLS" "$RULES"

REPOS=(
  "img2threejs|https://github.com/img2threejs/img2threejs.git"
  "Motion2MixamoRig|https://github.com/MaxLiu22/Motion2MixamoRig.git"
  "dsh-blender-plugin|https://github.com/sixtysevenlf/dsh-blender-plugin.git"
  "dioramas|https://github.com/blendi-remade/dioramas.git"
  "video-shotcraft|https://github.com/Vincentwei1021/video-shotcraft.git"
  "lemo-opuscar|https://github.com/lemomo-ai/lemo-opuscar.git"
  "jianying-headless|https://github.com/GdLinkLock/jianying-headless.git"
  "mg-styles-15|https://github.com/Vincentwei1021/mg-styles-15.git"
)

echo ">>> [1/3] 拉取 8 大 AI 3D 与动效开源仓库至: $BASE"
pids=()
for item in "${REPOS[@]}"; do
  name="${item%%|*}"
  url="${item##*|}"
  dest="$BASE/$name"
  if git -C "$dest" rev-parse --verify HEAD >/dev/null 2>&1; then
    echo "  [已存在跳过] $name"
  else
    rm -rf "$dest"
    (
      if GIT_TERMINAL_PROMPT=0 git clone --depth 1 "$url" "$dest" >/tmp/toolkit_clone_${name}.log 2>&1; then
        echo "  [克隆成功] $name"
      else
        echo "  [克隆失败] $name -> $(tail -n 2 /tmp/toolkit_clone_${name}.log | tr '\n' ' ')"
      fi
    ) &
    pids+=($!)
  fi
done
for pid in "${pids[@]}"; do wait "$pid" || true; done

echo ">>> [2/3] 注册全部 8 个 Skills 至工作区: $SKILLS"
[ -d "$BASE/video-shotcraft" ] && ln -sfn "$BASE/video-shotcraft" "$SKILLS/video-shotcraft"
[ -d "$BASE/img2threejs" ] && ln -sfn "$BASE/img2threejs" "$SKILLS/img2threejs"
[ -d "$BASE/lemo-opuscar/plugin/skills/lemo-opuscar" ] && ln -sfn "$BASE/lemo-opuscar/plugin/skills/lemo-opuscar" "$SKILLS/lemo-opuscar"
[ -d "$BASE/dsh-blender-plugin/skills/blender-modeling" ] && ln -sfn "$BASE/dsh-blender-plugin/skills/blender-modeling" "$SKILLS/blender-modeling"

JY_SKILL="$(find "$BASE/jianying-headless" -maxdepth 4 -iname "SKILL.md" 2>/dev/null | head -n 1 || true)"
if [ -n "$JY_SKILL" ]; then
  ln -sfn "$(dirname "$JY_SKILL")" "$SKILLS/jianying-headless"
fi

# 为未自带根 SKILL.md 的 3 个仓库生成标准包装 SKILL.md
mkdir -p "$SKILLS/mg-styles-15" "$SKILLS/dioramas" "$SKILLS/motion2mixamorig"

cat > "$SKILLS/mg-styles-15/SKILL.md" <<EOF
---
name: mg-styles-15
description: 15 种顶级代码生成 MG 动态设计风格库（含 9:16 综艺花字 18-hanazi、极光玻璃、赛博 HUD、液体动效、等距 2.5D、贴纸科普等完整源码与提示词）。
---
# mg-styles-15
- 本地仓库根目录：\`$BASE/mg-styles-15\`
- 中文说明：\`$BASE/mg-styles-15/README.zh-CN.md\`
- 源码与提示词：\`demos/<slug>/\` 与 \`prompts/<slug>.md\`
EOF

cat > "$SKILLS/dioramas/SKILL.md" <<EOF
---
name: dioramas
description: 基于 Three.js 与 WebGL 的电影级交互式 3D 场景开源框架（含 20 个完整电影感 3D 样板站与 AI 资产优化脚本 scripts/optimize.mjs）。
---
# Dioramas
- 本地仓库根目录：\`$BASE/dioramas\`
- 主文档：\`$BASE/dioramas/README.md\`
EOF

cat > "$SKILLS/motion2mixamorig/SKILL.md" <<EOF
---
name: motion2mixamorig
description: 将视频或参考图中的单人人体动作自动重定向到 Adobe Mixamo 绑定 3D 角色上，输出 .glb 骨骼动画（支持 CLI 与 Blender 4.2+ 扩展）。
---
# Motion2MixamoRig
- 本地仓库根目录：\`$BASE/Motion2MixamoRig\`
- 中文指南：\`$BASE/Motion2MixamoRig/docs/i18n/README.zh-Hans.md\`
EOF

echo ">>> [3/3] 验收本窗口 Skills 清单:"
for d in "$SKILLS"/*; do
  if [ -f "$d/SKILL.md" ]; then
    echo "  [OK] $(basename "$d")"
  fi
done
echo "完成！8 大 AI 3D 与动效武器库已就绪。"
