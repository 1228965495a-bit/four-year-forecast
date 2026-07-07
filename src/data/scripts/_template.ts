// 专业脚本模板 —— 复制这个文件，改成 xxx.ts，然后在 index.ts 里注册。
//
// 使用步骤：
//   1. cp _template.ts law.ts
//   2. 修改下面的 majorId 对应 src/data/majors.ts 里的 id
//   3. 往 events / endings 填内容（都可选，缺省就用通用池）
//   4. 打开 src/data/scripts/index.ts，加一行 register

import type { MajorScript } from "./types";

const script: MajorScript = {
  majorId: "REPLACE_ME", // 必须和 MajorConfig.id 完全一致

  intro: "开场旁白：一段专业特色的开幕吐槽。",

  events: [
    // {
    //   id: "law_first_moot",
    //   scene: "classroom",
    //   category: "学业",
    //   title: "第一次模拟法庭",
    //   description: "你被临时抽中做辩方，PPT 还没做完。",
    //   options: [
    //     {
    //       label: "硬着头皮上",
    //       effects: [{ key: "gpa", delta: 6 }, { key: "battery", delta: -8 }],
    //       feedback: "你的嘴硬拯救了这场庭辩。",
    //     },
    //     // ...
    //   ],
    //   // 可选：step 指定这个事件必须出现在第几周
    //   // step: 2,
    // },
  ],

  endings: [
    // {
    //   id: "law_bar_warrior",
    //   titleTemplate: "{major}·法考战神",
    //   match: (s) => s.gpa * 1.2 + s.obsession * 0.5,
    //   summary: "你把四年过成了一场超长法考集训。",
    //   advice: "适合考研深造或直接冲法考。",
    //   achievements: ["法条 PTSD", "背书机器", "模拟法庭 MVP"],
    //   shareText: "别人问我值不值，我说：先过法考再说。",
    // },
  ],
};

export default script;
