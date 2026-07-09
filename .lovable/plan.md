# 中途结束页 & 结算页参考图重构

参考你给的两张图，做两件事：
1. **新增中途结算页**（`/midway-result`）—— 参考图 1「跑路预备役」
2. **重构现有结算页**（`/result`）—— 参考图 2「嘴硬战神」

两页共用一套通用组件（横幅标题、鉴定徽章、属性条、便签、底部按钮），避免重复。

---

## 一、路由改动

- 新增 `src/routes/midway-result.tsx`（`/midway-result`）。
- `semester.tsx` 顶栏「结」按钮：
  - 现在：`gameStore.set({ finished: true }); navigate('/result')`。
  - 改为：`gameStore.set({ midwayFinished: true }); navigate('/midway-result')`（不进正常结算，保留完整属性快照）。
- `gameStore` 新增 `midwayFinished: boolean` 字段（emptyState 默认 false），并在 `reset()` 里清空。

## 二、共用组件（新建 `src/components/result/`）

- `ResultBanner` — 头部：奖章 + 主标题 +（可选）副标题横幅。支持 tier: "S"|"C" 变体切色。
- `TagBadgeGrid` — 3×2 网格，每个 badge = 图标 + 文字（嘴硬型选手 / DDL幸存者 / 高薪幻觉中 …）。基于当前 stats + flags 生成规则，中途 vs 毕业各一套规则。
- `StatBarList` — 名称 + 像素条 + 数值，两列或一列。中途版：6 项 HUD；毕业版：6 项 HUD。
- `KeyChoicesTimeline` — 大一/大二/大三/大四 选项 A/B 徽章 + 一句概述（毕业版用，读 `game.history`）。
- `AchievementList` — 图标 + 标题 + 说明（毕业版用）。
- `FuturePinnedNote` — 图钉便签块（信封 emoji + 文本）。
- `ResultActionRow` — 三个 pixel 按钮：返回主菜单 / 重新开启人生 / 分享。

全部用现有 `PixelPanel9`、`PixelStatBar`、`PixelDebuffBadge` 等既有像素皮肤，配色沿用 `--cream/--parchment/--cherry/--sage/--sunny/--ink`。

## 三、中途结算页布局（参考图 1）

```text
[顶栏]  大一·上   法学·云上大学        1/8   结
[banner] 中途结算! (小挂旗)
[banner] 跑路预备役 (大标题) + 奖章
[红缎带] 你按下了结束键，提前结束本科副本 / 跑路不是失败，是战略转移
[素材位] 场景图（校门口+背影） —— <SceneStage>
[面板] 你的中途学籍鉴定  → TagBadgeGrid (3×2)
[两列] 当前状态 (StatBarList 6 项)  |  中途报告 (文案)
[便签] 来自未来的你 …
[按钮行] 返回主菜单 / 重新开启人生 / 分享烂尾结局
```

## 四、毕业结算页重构（参考图 2）

保留现有 `pickEnding()` 数据流。骨架换成：

```text
[顶栏]  大四·下 · 毕业季   结局达成 8/8   活
[banner] 结局达成! + S 章 + 大标题「{ending.title}」+ 主角像素立绘
[红缎带] {ending.summary}
[面板] 你的本科学籍鉴定  → TagBadgeGrid (3×2)
[三列] 综合评价（头像+文案+6 stat bars） | 关键选择 (4 个 A/B) | 获得成就 (3 条)
[便签] 来自未来的你 …（advice + shareText）
[按钮行] 返回主菜单 / 重新开启人生 / 分享结局
```

原「查看详细报告」抽屉保留，链接放在便签下方。

## 五、鉴定 Tag 生成规则（简版）

写一个 `deriveResultTags(game)` 帮手：按属性阈值 + flags 选 6 个标签。示例：
- `stats.obsession >= 60` → 嘴硬型选手
- `stats.escape >= 70` → 逃跑冲动 MAX
- `stats.energy >= 70` → 电量尚可
- `stats.filter >= 60` → 摸鱼先行者
- `stats.hallucination >= 60` → 高薪幻觉中
- 毕业专属 flags 触发 DDL 幸存者 / debug 人 等
- 中途专属：法考再说 / 保命第一

字段以 statsMeta 为准；不够 6 个用默认 fallback 填。

## 六、验证

- `tsgo` 类型通过。
- 手动过：进入 semester → 点「结」→ 落到中途页；正常打完 → 落到毕业页。

## 七、暂不做（后续可加）

- 场景素材、主角立绘、S 章徽章图片 —— **留素材位**，用现有 `SceneStage` 占位 + emoji 兜底，之后你出图直接换。
- 分享图截图导出（现在依旧走文案 share）。
- 剩余 8 个面板素材迁 CDN —— 按你之前说的"一口气处理"，我在这次一起把 `panel-report / panel-card / panel-profile / panel-note-blue / panel-diagnosis / panel-sheet / panel-small / panel-warning` 全部压到 512 附近 + 上 CDN。

---

要不要我按这个方案直接开始实现？或者哪块要调整（例如中途页 tag 生成规则、想不想立刻要主角立绘素材位）？
