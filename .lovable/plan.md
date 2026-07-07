## 目标

把《这专业我先替你读了四年》的 UI 全面重构成「像素风校园人生模拟器 + 星露谷式暖色 UI + 经营游戏信息面板」，移动端优先，桌面端三栏。保持现有游戏数据 (`data/majors.ts`、`data/events.ts`、`data/results.ts`) 和核心逻辑 (`gameStore.ts`) 完全不动。

## 一、设计系统（先建，避免每页乱写样式）

在 `src/styles.css` 里扩充 pixel theme token（暖米色/羊皮纸/深棕描边/金黄成就/红橙危险等），新增以下通用 UI 组件在 `src/components/ui/`：

- `PixelPanel.tsx`：奶油底 + 深棕 3px 描边 + 硬阴影，支持可选标题条（羊皮纸黄）
- `PixelButton.tsx`（复用现有并增强）：新增 hover 上浮、按压回弹、danger / success / accent 变体
- `PixelCard.tsx`：卡片壳，支持 selected / hover 高亮描边
- `StatBar.tsx`：带小图标 + 标签 + 数值 + 颜色分档的横向条
- `TagBadge.tsx`：像素风小标签（热门/挑战/稳定/就业向 等）
- `SemesterTimeline.tsx`：横向学期节点条，标出「大一上…大四下」
- `CharacterPanel.tsx`：角色档案 + 专业 + 学期 + 成就徽章
- `EventCard.tsx`：任务卡（图标 + 标题 + 描述 + 消耗/收益/风险 + 主按钮）

保留原有 `PhoneFrame`、`SceneStage`、`PixelIcon` 不动。旧的 `PixelPanel`、`PixelButton`、`PixelCard`（在 `components/game/` 下）继续被别处引用，新组件放 `components/ui/` 独立命名，避免破坏现有引用。

## 二、页面改造顺序

按顺序改，每步保持可跑：

1. **首页 `routes/index.tsx`**：改成像素游戏启动器
   - 大像素标题 + 校园背景条（沿用 `HomeHeroScene`，只重排）
   - 主按钮「开始模拟 / 进入大学副本」
   - 辅助按钮：专业图鉴（跳 major）、角色设定、读取进度
   - 左下便签卡（今日提示 / 剧透 / 版本号）

2. **专业选择页 `routes/major.tsx`**：改成「选择副本 / 专业排行」
   - 顶部分类 tab（全部 / 热门 / 工科 / 人文社科 / 经管 / 医学 / 农林 / 艺术）—— 分类从 `majors.ts` 已有字段推导，不新增字段
   - 手机端：tab + 卡片列表 + 底部选中详情抽屉
   - 桌面端（≥sm phone frame 内仍是竖屏，所以维持单列 + 底部 sheet；不做真三栏，保持竖屏一致）
   - 每张卡片：图标 + 名称 + 分档 S/A/B（按 `hotScore` 推导）+ 热度 + 6 条属性条 + 标签

3. **学期页 `routes/semester.tsx`**：改成经营面板
   - 顶部：`SemesterTimeline` + 6 项明面数值 HUD（保持现有字段）
   - 中间：`SceneStage` 保留
   - 事件区改用 `EventCard`：图标 + 标题 + 描述 + 每个选项显示「消耗 / 收益 / 风险」预览
   - 选项反馈 sheet 不立即消失，要求点「继续」推进（现在也是这样，加强样式）
   - 右侧角色/诊断在竖屏 phone frame 下作为折叠抽屉（沿用现有）

4. **结果页 `routes/result.tsx`**：结算卡精修
   - 结局标题 + 评级 + 专业适配度 + 6 项最终数值条 + 代表成就 + 专业后遗症 + 系统诊断 + 分享文案
   - 保持现有截图友好结构，替换为新 `PixelPanel` / `StatBar` / `TagBadge`

## 三、风格 token（styles.css 增补）

新增：
- `--parchment: #F1E1B8`（羊皮纸标题条）
- `--danger: #E5644A`（危险 / 跑路提示）
- `--gold: #F0B23A`（成就徽章）
- `--wood: #7A4A2B`（木边替补，用在专业副本卡的角标）
- 新增 utility：`pixel-panel-title`（羊皮纸标题条）、`tag-hot / tag-stable / tag-hard`、`stat-bar-*`（按属性色）
- 卡片 hover：边框颜色跳到 `--cherry` + 硬阴影从 4px 变 5px

## 四、不动的东西

- `data/majors.ts` / `data/events.ts` / `data/results.ts` 字段和内容
- `gameStore.ts` 属性体系（保持 6 明 2 隐）
- `PhoneFrame` 竖屏容器（移动优先约束不变）

## 五、自检

改完后手动跑首页 → 专业 → 学期 → 结果全流程截图，确认：
- 首页像启动器不像普通网页
- 专业页有排行/副本感
- 学期页有经营面板感
- 结果页适合截图
- 手机 390x844 视图不溢出
- 无 undefined / NaN
