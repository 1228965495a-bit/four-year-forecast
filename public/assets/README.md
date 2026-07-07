# 素材目录

请把正式素材放到 `public/assets/` 下：

- `backgrounds/` 校园背景、场景横幅
- `characters/` 角色头像、立绘
- `icons/` 专业 icon、事件 icon
- `badges/` 成就徽章
- `ui/` 边框、按钮、装饰件

代码中当前使用 emoji 占位，替换方式：

```tsx
// 替换前
<div>🧑‍🎓</div>
// 替换后
<img src="/assets/characters/freshman.png" alt="新生" />
```

专业数据里的 `iconPath` 字段可以填 `/assets/icons/law.png` 等，然后在 `MajorCard`
里改成 `<img src={major.iconPath} />` 即可。
