// 专业脚本注册表。
// 每加一个专业脚本，就在下面 import 并加入 MAJOR_SCRIPTS。

import type { MajorScript } from "./types";

// === 在这里注册专业脚本 ===
// import lawScript from "./law";
// import csScript from "./cs";

const REGISTERED: MajorScript[] = [
  // lawScript,
  // csScript,
];

export const MAJOR_SCRIPTS: Record<string, MajorScript> = Object.fromEntries(
  REGISTERED.map((s) => [s.majorId, s]),
);

export function getMajorScript(majorId: string | null | undefined): MajorScript | null {
  if (!majorId) return null;
  return MAJOR_SCRIPTS[majorId] ?? null;
}

export type { MajorScript } from "./types";
