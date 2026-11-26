# 8 大 AI 3D / 丝滑运镜 / MG 动效开源武器库速查手册

运行 `scripts/install_8_toolkit.sh <workspace>` 后，以下 8 套高星仓库会统一落盘到 `<workspace>/ai_3d_motion_toolkit/` 并全部挂载至 `<workspace>/.agents/skills/`：

| # | 项目名称 | 上游仓库 | 核心用途 | 什么时候调用 |
| :-: | :--- | :--- | :--- | :--- |
| 1 | **video-shotcraft** | `Vincentwei1021/video-shotcraft` | Remotion 152 张电影镜头配方卡（`PageCam` / `ClipCard` / `DigitRoll` / `FlashCut` / 审美品控判例） | 设计任何 Remotion 丝滑运镜、卡点转场、数据动效与终检 |
| 2 | **mg-styles-15** | `Vincentwei1021/mg-styles-15` | 15 种顶级代码生成 MG 动效（含 9:16 花字 `18-hanazi`、极光玻璃、赛博 HUD、液体、贴纸科普） | 给短视频加高能花字、扁平/等距/玻璃/HUD 动态设计风格 |
| 3 | **img2threejs** | `img2threejs/img2threejs` | 参考图纯代码重建高质量 PBR Three.js 3D 对象（多视角门控） | 需要把特定产品/文物/道具参考图精准重建为可动画 3D 代码模型 |
| 4 | **lemo-opuscar** | `lemomo-ai/lemo-opuscar` | 51 种纯代码电影短片风格库（油画、水彩、浮世绘、卫星简报、产品拆解、纪实剪辑） | 不依赖 AI 视频模型，直接靠代码做风格化艺术短片或解说大片 |
| 5 | **dioramas** | `blendi-remade/dioramas` | 20 套电影感 Three.js / WebGL 3D 交互场景与 HDRI 布光、meshopt 资产优化脚本 | 搭建高质量灯光材质的交互式 WebGL/Three.js 3D 场景 |
| 6 | **blender-modeling** | `sixtysevenlf/dsh-blender-plugin` | AI 实时驱动 Blender 建模插件与 15 工具（白模、比例量测、装配体检、导出门控） | 需要 Blender 级真 3D 建模、硬表面/有机体与转台渲染 |
| 7 | **motion2mixamorig** | `MaxLiu22/Motion2MixamoRig` | 将单人实拍或 AI 视频动作自动重定向到 Adobe Mixamo 骨骼 3D 角色（导出 `.glb`） | 动作捕捉平替，把视频人体动作映射到 3D 绑定角色 |
| 8 | **jianying-headless** | `GdLinkLock/jianying-headless` | Apple Silicon Mac 无头批量生成、修改与原生导出剪映专业版多轨草稿 | 需要程序化生成可二次编辑的剪映专业版工程或无界面导出 |
