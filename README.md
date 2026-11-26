# 🎬 Lube 皮克斯 3D 运镜动效工坊 (`lube-pixar-shotcraft-plugin`)

一套面向 **Google Antigravity (AGY)** 的 9:16 竖屏「**皮克斯 3D 动漫剧情 × Shotcraft 电影级丝滑运镜 × MG 弹跳花字 × ElevenLabs v4 精准对口型**」全自动制片插件，并内置 **8 大 AI 3D / 运镜 / 动效开源武器库一键装配脚本**。

---

## ⚡ 一键安装（任何电脑通用）

在 Antigravity 终端或对话里执行：

```bash
agy plugin install https://github.com/cjialin277-hub/lube-pixar-shotcraft-plugin
```

如需将 8 大配套开源仓库（`video-shotcraft`、`mg-styles-15`、`img2threejs`、`lemo-opuscar`、`dioramas`、`dsh-blender-plugin`、`Motion2MixamoRig`、`jianying-headless`）一键拉取并自动注册到当前项目工作区的 `.agents/skills/`：

```bash
bash ~/.gemini/config/plugins/lube-pixar-shotcraft/scripts/install_8_toolkit.sh "$(pwd)"
```

---

## 🌟 核心能力一览

| 模块 | 解决什么痛点 | 关键技术方案 |
| :--- | :--- | :--- |
| **无商标皮克斯 3D 词法** | 写 `Pixar/Disney` 或幼童大头易被视频模型静默拦截 | 纯物理光影词法 + 成人比例锁定，实测 `Omni 1.2 Flash` 8/8 镜一次过关 |
| **毫秒级真对口型 + 原片拟音保留** | AI 原片偶尔吞字含糊、干播音配音容易“出戏” | `faster-whisper` 提取原片真实张闭嘴时间窗 + `ElevenLabs eleven_v4` 贴脸声优保音调卡口型 + 空间微混响 + 静音门限保留原片水花/星光拟音 |
| **Shotcraft 电影级丝滑运镜** | 科普插页像廉价暗色 PPT、切换硬切生硬 | `0` 积分 3D 剖面大片 + `ShotcraftCam` 2.5D 倾斜相机 + 4 套不重样运镜转场（水花圆心光圈切 / 三段变速时间轴 / 云海推屏 / 6帧急推撞停震屏 + 激光扫描） |
| **MG 9:16 弹性花字 + 无黑框大字幕** | 黑底盒子压画面、WebGL 叠毛玻璃易闪黑块 | `HanaziPop` 三层描边弹跳花字 + `CleanGlassCard` 零闪烁高光卡 + 无黑框双层投影单行电影字幕 + 手机安全区十二宫格自动检验 |
| **8 大 AI 3D 武器库一键集成** | 找仓库、配 Skill、处理失效链接太耗时 | `install_8_toolkit.sh` 并行拉取并自动链接 8 大高星仓库到工作区 `.agents/skills/` |

---

## 📦 内置 8 大开源武器库（通过 `install_8_toolkit.sh` 一键部署）

1. **[video-shotcraft](https://github.com/Vincentwei1021/video-shotcraft)** — Remotion 152 张电影镜头配方卡与运镜组件库
2. **[mg-styles-15](https://github.com/Vincentwei1021/mg-styles-15)** — 15 种顶级 MG 动效与 9:16 综艺花字完整源码与提示词
3. **[img2threejs](https://github.com/img2threejs/img2threejs)** — 参考图纯代码重建质量门控 PBR Three.js 3D 模型
4. **[lemo-opuscar](https://github.com/lemomo-ai/lemo-opuscar)** — 51 种纯代码电影风格短片制作库
5. **[dioramas](https://github.com/blendi-remade/dioramas)** — 20 套电影感 Three.js / WebGL 3D 交互场景框架
6. **[dsh-blender-plugin](https://github.com/sixtysevenlf/dsh-blender-plugin)** — AI 实时驱动 Blender 建模插件与 15 工具
7. **[Motion2MixamoRig](https://github.com/MaxLiu22/Motion2MixamoRig)** — 视频人体动作重定向到 Mixamo 3D 骨骼角色
8. **[jianying-headless](https://github.com/GdLinkLock/jianying-headless)** — 剪映专业版无头自动化编辑与导出 Skill

---

## 📁 插件目录结构

```text
lube-pixar-shotcraft-plugin/
├── plugin.json                              # Antigravity 插件清单
├── assets/logo.svg                          # 插件图标
├── rules/AGENTS.md                          # 插件启用即生效的 7 条防坑护栏
├── scripts/
│   ├── install_8_toolkit.sh                 # 一键拉取并挂载 8 大开源武器库到当前工作区
│   └── build_pixar_shotcraft_master.py      # ElevenLabs v4 精准对口型 + 门限拟音 + -14 LUFS 混音脚本
└── skills/pixar-shotcraft-studio/
    ├── SKILL.md                             # 四阶段全流程制片技能指南
    ├── references/
    │   ├── eight-toolkit-guide.md           # 8 大武器库速查路由表
    │   └── prompt-playbook.md               # 无商标皮克斯 3D 与 0 积分剖面大片词法圣经
    └── templates/                           # 开箱即用的 Remotion v4 运镜/花字/场景组件源码
```

---

## 🔐 安全与合规说明
- 仓库内**不含任何 API Key、私有媒体文件或本地磁盘硬编码路径**；
- `ElevenLabs` 密钥从环境变量 `ELEVENLABS_API_KEY` 或 `~/.elevenlabs.key` 读取；
- 详尽第三方开源署名与许可见 [NOTICE.md](./NOTICE.md)。
