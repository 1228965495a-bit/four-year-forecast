# Batch 03 Buttons 3-Slice Pixel UI

本目录包含 Batch 03 像素风按钮 sheet 切出的 9 组 3-slice 按钮素材，共 27 个 PNG。每组按钮由 `left cap`、`middle tile`、`right cap` 三段组成。

## 使用方式

推荐用三列布局拼接按钮：左端头固定宽，中段横向重复，右端头固定宽。

```css
.pixel-button {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: stretch;
}
.pixel-button__mid {
  background-repeat: repeat-x;
  background-size: auto 100%;
}
```

## 按钮组清单

| 顺序 | id | left | middle | right | 用途 |
| --- | --- | --- | --- | --- | --- |
| 1 | `primary-h56` | `primary-h56-left.png` | `primary-h56-mid.png` | `primary-h56-right.png` | 首页开始按钮 / 确认进入副本 / 截图分享按钮 |
| 2 | `primary-h88` | `primary-h88-left.png` | `primary-h88-mid.png` | `primary-h88-right.png` | 双行文字事件选项 / 重要选择按钮 |
| 3 | `secondary-h56` | `secondary-h56-left.png` | `secondary-h56-mid.png` | `secondary-h56-right.png` | 换个专业继续受苦 / 返回 / 次级操作 |
| 4 | `danger-h56` | `danger-h56-left.png` | `danger-h56-mid.png` | `danger-h56-right.png` | 强行冲刺 / 高风险选项 / 危险操作 |
| 5 | `option-h64` | `option-h64-left.png` | `option-h64-mid.png` | `option-h64-right.png` | 事件页普通选项按钮 |
| 6 | `option-h88` | `option-h88-left.png` | `option-h88-mid.png` | `option-h88-right.png` | 事件页双行选项按钮 |
| 7 | `ghost-h44` | `ghost-h44-left.png` | `ghost-h44-mid.png` | `ghost-h44-right.png` | 返回 / 查看详情 / 次级小按钮 |
| 8 | `chip-active-h32` | `chip-active-h32-left.png` | `chip-active-h32-mid.png` | `chip-active-h32-right.png` | 专业选择页分类筛选选中态 |
| 9 | `chip-default-h32` | `chip-default-h32-left.png` | `chip-default-h32-mid.png` | `chip-default-h32-right.png` | 专业选择页分类筛选默认态 |

## 切图说明

- 源图按照从上到下的按钮组顺序处理，每组内按照 left / middle / right 输出。
- left 和 right 保留完整端头、边框与阴影。
- middle tile 从原中段中心裁出 32px 宽主体，并保留 3px 安全边距，适合横向 `repeat-x`。
- 未缩放素材，所有 PNG 保持原始像素裁切尺寸。

## 透明背景说明

源图是 RGB PNG，透明区域表现为棋盘格，并非真实 alpha 通道。本批导出时已识别并移除边缘连通棋盘格背景，输出为透明底 RGBA PNG。若在少量边缘看到浅灰残留，可针对单个切片微调 alpha 边缘。

## 文件

- `manifest.json`：Lovable / 前端接入用按钮组清单。
- `*-left.png`：按钮左端头。
- `*-mid.png`：按钮中段重复 tile。
- `*-right.png`：按钮右端头。
