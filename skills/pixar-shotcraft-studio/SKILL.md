---
name: pixar-shotcraft-studio
description: 9:16 竖屏皮克斯 3D 动漫科普 × Shotcraft 电影级丝滑运镜 × MG 弹跳花字 × ElevenLabs eleven_v4 精准对口型全自动制片技能。涵盖无商标 3D 角色与 0 积分 3D 剖面大片出图、Omni 1.2 Flash 单镜真对口型拍摄、faster-whisper 张闭嘴锁帧 + 原片水花/星光拟音保留、Remotion v4 四大不重样运镜转场与繁简双语 1080p 交付，以及一键安装 8 大 AI 3D 与动效开源武器库。
---

# Pixar Shotcraft Studio（9:16 皮克斯 3D 动漫 × Shotcraft 丝滑运镜制片流水线）

本技能将「**3D 动画剧情表演** + **电影级 2.5D/3D 运镜数据可视化** + **9:16 弹性综艺花字** + **广电级精准对口型配音**」封装成一套可一键复现的 4 阶段工业化工作流。

---

## 阶段 0：按需一键挂载 8 大 AI 3D 与动效武器库

如果当前工作区尚未安装 8 大开源武器库（`video-shotcraft`、`mg-styles-15`、`img2threejs`、`lemo-opuscar`、`dioramas`、`dsh-blender-plugin`、`Motion2MixamoRig`、`jianying-headless`），先运行本插件自带脚本一键拉取并自动注册至 `<workspace>/.agents/skills/`：

```bash
bash "<plugin_root>/scripts/install_8_toolkit.sh" "<workspace_root>"
```

各仓库定位与调用速查见 [`references/eight-toolkit-guide.md`](./references/eight-toolkit-guide.md)。

---

## 阶段 1：0 积分角色三视图 + 分镜首帧 + 3D 剖面大片（`Nano Banana Pro`）

详细词法与雷词黑名单见 [`references/prompt-playbook.md`](./references/prompt-playbook.md)。

1. **严禁商标词与幼童大头比例**：
   - 严禁出现 `Pixar` / `Disney` / 电影片名（如 `Soul`、`Luca`、`Ratatouille`、`Coco`），否则下游 `Omni 1.2 Flash` / `Veo 3.1` 会在 340s 后静默超时失败；
   - 角色比例锁定修长成人（`tall adult proportions`），用纯物理光影词描述暖光电影级 3D CGI 质感。
2. **先出角色白底母版，再锁装出分镜首帧**：
   - 每位常驻主角固定特征（发型、眼镜、外套材质、颈巾/饰品、随身灵宠）写入参考图生图，确保 8–10 镜全片不换装、不分屏。
3. **4 张 0 积分电影级 3D 剖面大片（彻底取代廉价暗色积木 PPT）**：
   - 每段数据/地理/原理科普插页，先用 `Nano Banana Pro`（0 积分）生成 1 张与主动画 100% 同光影质感的 9:16 3D 剖面大片（画面严禁自带文字/数字/水印，上方预留干净暗部呼吸空间交给 Remotion 4x 锐度动效排版）。

---

## 阶段 2：`Omni 1.2 Flash` 单镜顺序真对口型拍摄

1. **多项目隔离 + 单镜顺序（`batch=1`）**：
   - 每次调用画布 MCP 必须显式传入指定 `project_id`，绝不修改全局 `.env` 或置顶项目；
   - 严格拍一条、验一条（4 帧拼图肉眼过审 + `faster-whisper` 抽中文张闭嘴时间窗），通过后再投下一镜。
2. **双人轮换开口结构（8 秒镜头黄金配比）**：
   - `0.0–3.3s` 画面左侧角色开口提问/吐槽；
   - `3.5–7.4s` 画面右侧角色微笑回应/抛反转；
   - `7.3–8.0s` 留出动作收尾与真实环境拟音（跳水溅花、光环绽放、风声笑意），严禁内嵌字幕。

---

## 阶段 3：`ElevenLabs eleven_v4` 精准对口型混音 + 原片拟音门限保留

直接复用插件脚本 [`scripts/build_pixar_shotcraft_master.py`](../../scripts/build_pixar_shotcraft_master.py)：

1. **声线必须贴合角色年龄与画风**：
   - 严禁把低幼小学生声线套在 24 岁都市女主身上，也严禁用严肃纪录片播音腔套在亮色 3D 动画角色上；
   - 推荐组合：清亮元气 24 岁电影女主（如 `Anna Su`）+ 阳光利落青年男主（如 Voice Design 定制国漫少年男主），全程锁定 **`eleven_v4`**（禁止降级 `v3`）。
2. **毫秒级张闭嘴对齐 + 动画空间微混响**：
   - 用本地 `faster-whisper` 读取每条 Omni 视频中男女主的实际开口区间 `[l_s..l_e]`、`[s_s..s_e]`；
   - 对 `eleven_v4` 纯净中文对白做保音调轻变速（`atempo` 限幅 `0.90x–1.20x`）严丝合缝卡进嘴型窗口，并加轻度院线空气感均衡与微短反射（`highpass=f=95,equalizer=f=3200:t=q:w=1.4:g=1.2,aecho=0.88:0.88:16:0.06`），让声音真正“嵌进 3D 场景里”。
3. **零回声门限保留原片真实拟音**：
   - 用 `pre_margin=0.18s / post_margin=0.32s` 的余弦静音门限将原片说话段彻底归零（消灭 AI 原片吞字错读），同时放行非说话区间的真实水花、星光、脚步声；
   - 叠加 `+4 dB` 人声增益 + 商用授权 BGM 自动闪避 + CC0 卡点转场音效 + 两遍 EBU R128 **`-14 LUFS`** 响度定标。

---

## 阶段 4：`Remotion v4` × Shotcraft 丝滑运镜 + MG 花字 + 双语交付

直接将 [`templates/shotcraft/`](./templates/shotcraft/) 复制到你的 Remotion 工程 `src/shotcraft/` 中使用：

1. **一镜一式，绝不重样的 4 套电影运镜模板**（参考 [`templates/scenes/ShotcraftInsertsV4.tsx`](./templates/scenes/ShotcraftInsertsV4.tsx)）：
   - **`circle-match-iris`**：从上镜真实圆形动作（如水花波纹）圆心炸开同心光圈切入 2.5D 深潜运镜 + `DigitRoll` 机械滚轮数字；
   - **`timeline-travel`**：三段非线性变速横移时间轴（缓起→冲刺→末段急刹推近）+ Spring 弹立里程碑卡；
   - **`bottom-push-stack-wipe`**：视差云海自下而上推屏 + 2.5D 倾斜航拍滑翔；
   - **`crash-zoom-punch` + `scan-bracket-sweep`**：6 帧预备回拉→急推撞停微震（`14px·e^(-t/1.9)`）+ 四角 L 括号激光往复扫描 + 高潮红光警报冲击波。
2. **8 段主动画注入生命力**（参考 [`templates/YuxiShotcraftV4.tsx`](./templates/YuxiShotcraftV4.tsx)）：
   - 非线性呼吸微推/微拉（`1.00 → 1.045`）+ `FlashCut` 暖白高光切镜 + `HanaziPop` 三层描边 9:16 弹性花字（仅在安全空白区短暂弹出 1.4s，绝不挡人脸）；
   - **无黑框电影单行大字幕**（`36px / 高亮 39px` 粗白字 + 双层深阴影，零黑盒子、零孤字换行）；
   - **零闪烁卡片规范**：所有悬浮卡使用 `CleanGlassCard`，严禁在 WebGL 上叠加 `backdropFilter` 防止 Chromium 渲染闪黑块。
3. **交付前必过两道铁门**：
   - 先渲染 **12 节手机安全区十二宫格** 检查顶部/右侧点赞区/底部标题区 100% 零遮挡；
   - 导出 1080×1920 30fps（CRF 18）简体与繁体双语成片后，必须抽取关键转场动态 MP4 切片亲自看画听声复核，全部通过再交付！
