// 专业脚本类型定义。
// 每个专业可以有自己的一套事件 + 结局；未提供的字段会 fallback 到通用池。

import type { GameEvent } from "../events";
import type { ResultTemplate } from "../results";

export interface MajorScript {
  /** 对应 MajorConfig.id */
  majorId: string;

  /** 开场旁白（可选，展示在第一个学期前） */
  intro?: string;

  /**
   * 本专业专属事件池。
   * - 如果提供，semester 页优先从这里 pickEvents。
   * - 如果不足以覆盖 TOTAL_STEPS，会自动补充通用 EVENTS。
   * - 也可以指定 step 让某个事件必定出现在某一周（可选）。
   */
  events?: Array<GameEvent & { step?: number }>;

  /**
   * 本专业专属结局模板。
   * - 如果提供，matchResult 只在这些里挑；否则用通用 RESULT_TEMPLATES。
   */
  endings?: ResultTemplate[];

  /**
   * 可选：额外系统吐槽 / 彩蛋（预留，暂未使用）。
   */
  cameos?: string[];
}
