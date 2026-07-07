import type { SceneKey } from "@/data/events";

export type SceneAssetType = "image" | "gif" | "sprite" | "lottie";

export interface SceneAssetConfig {
  /** 素材类型：后续支持图片 / GIF / 精灵图 / Lottie */
  type: SceneAssetType;
  /** 素材地址：可以是 CDN URL、相对路径或 .asset.json 的 url */
  src: string;
  /** 辅助说明 */
  alt?: string;
  /** 图片填充方式，默认 cover */
  objectFit?: "cover" | "contain";
  /** 背景色，默认奶油色（素材透明/未加载时显示） */
  backgroundColor?: string;
  /** 是否隐藏默认的像素学生角色（素材自带角色时启用） */
  hideCharacter?: boolean;

  /** 精灵图专用：单帧宽度（px） */
  frameWidth?: number;
  /** 精灵图专用：单帧高度（px） */
  frameHeight?: number;
  /** 精灵图专用：总帧数 */
  frameCount?: number;
  /** 精灵图专用：帧率，默认 8 */
  fps?: number;

  /** Lottie 专用：是否循环，默认 true */
  loop?: boolean;
}

/**
 * 场景素材映射表。
 * 现在先留空，后续把对应场景的素材配置填进来即可无缝替换。
 * 例如：
 * corridor: { type: "image", src: "/assets/scenes/corridor.png", objectFit: "cover" }
 */
export const SCENE_ASSETS: Partial<Record<SceneKey, SceneAssetConfig>> = {};

export function getSceneAsset(scene: SceneKey): SceneAssetConfig | undefined {
  return SCENE_ASSETS[scene];
}
