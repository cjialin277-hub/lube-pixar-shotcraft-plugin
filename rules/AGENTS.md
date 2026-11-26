# Lube 皮克斯 3D 运镜动效工坊 · 生产强制护栏

只要 `lube-pixar-shotcraft` 插件处于启用状态，执行 3D 动漫科普、竖屏 9:16 电影级运镜或 MG 动效生产时，必须严格遵守以下 7 条铁律：

1. **无商标皮克斯词法与成人比例铁律（防静默拦截）**：
   - 严禁在发往 Google Flow（`Nano Banana Pro` / `Omni 1.2 Flash` / `Veo`）的任何提示词中写入受版权保护的工作室或片名（`Pixar`、`Disney`、`Soul`、`Luca`、`Ratatouille`、`Coco` 等）；
   - 统一使用纯物理视觉描述（`Original warm theatrical 3D CGI feature animation... tall adult proportions`），严禁幼童大头比例，防止视频模型静默超时拦截。
2. **多项目严格隔离 + 单镜顺序拍摄**：
   - 调用画布/Flow 生成接口时，每次显式传参 `project_id`，绝不修改全局 `.env` 或置顶项目；
   - `Omni 1.2 Flash` 真对口型视频坚持单镜顺序拍摄（`batch=1`），每条成片均经 4 帧拼图视觉过审 + Whisper 口型窗口校验后再投下一镜。
3. **引擎版本锁定 V4（禁止降级）**：
   - 语音合成强制使用 `ElevenLabs eleven_v4`（严禁降级 `v3`）；
   - 视频代码合成强制使用 `Remotion v4`，并严格单源双版输出简体（`zh-CN`）与繁体（`zh-TW`）1080×1920 30fps 成片。
4. **声音贴合角色年龄与画内真实拟音保留**：
   - 配音演员声线必须匹配角色年龄与气质（例如 24 岁知性元气向导严禁误用 10 岁幼童音）；
   - 用 `faster-whisper` 锁定 Omni 原生张闭嘴窗口，再用 FFmpeg 保音调轻变速卡嘴型 + 空间空气感微混响，并用精确静音门限只保留原片非人声动作拟音（水花、星光、脚步），严禁尾字回声泄漏。
5. **拒绝廉价静态黑底积木 PPT（一镜一式绝不重样）**：
   - 科普插页优先使用 `0` 积分皮克斯同光影 3D 剖面电影大片 + `ShotcraftCam` 2.5D 倾斜运镜 + `video-shotcraft` 差异化运镜配方（`circle-match-iris` / `timeline-travel` / `bottom-push-stack-wipe` / `crash-zoom-punch` + `scan-bracket-sweep`），每段收紧在 `6–11s` 内，一种运镜手法全片只当一次主角。
6. **严禁 WebGL 上方叠加 `backdropFilter`（防黑块闪烁 Bug）**：
   - 所有悬浮数据卡统一使用 `CleanGlassCard` 零闪烁渐变高光玻璃卡，禁止依赖 `backdropFilter: blur()` 避免 Chromium 渲染闪烁黑块；字幕采用无黑框粗白字双层投影单行排版，确保零孤字换行与手机端安全区 100% 避让。
7. **交付前动态成片亲审（P1 铁律）**：
   - 禁止只看几张静帧就交片；交付前必须从最终导出的 MP4 中截取关键转场动态切片亲自看画听声复核，确认零闪烁、零叠声、零口型漂移且响度达标 `-14 LUFS` 后才可交付。
