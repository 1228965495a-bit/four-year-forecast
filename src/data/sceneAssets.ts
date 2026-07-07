// 场景素材配置：与事件解耦，key 用字符串（可选）。
// 事件本身没有 sceneKey 时，SceneStage 会用默认场景。

export type SceneAssetType = "image" | "gif" | "sprite" | "lottie";

export type SceneKey =
  | "classroom" | "library" | "dorm" | "canteen"
  | "field" | "club" | "office" | "corridor";

export interface SceneAssetConfig {
  type: SceneAssetType;
  src: string;
  alt?: string;
  objectFit?: "cover" | "contain";
  backgroundColor?: string;
  hideCharacter?: boolean;
  frameWidth?: number;
  frameHeight?: number;
  frameCount?: number;
  fps?: number;
  loop?: boolean;
}

export const SCENE_ASSETS: Partial<Record<SceneKey, SceneAssetConfig>> = {};

export function getSceneAsset(scene: SceneKey | string | undefined): SceneAssetConfig | undefined {
  if (!scene) return undefined;
  return SCENE_ASSETS[scene as SceneKey];
}
