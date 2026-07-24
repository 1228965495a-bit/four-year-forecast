import { readFile, writeFile } from "node:fs/promises";
import { annotateEventPool } from "../src/lib/eventCopyQuality.ts";
import { applyLawCopy } from "../src/data/script/byMajor/law.copy.ts";
import {
  LAW_ROGUELITE_EVENTS,
  LAW_ROGUELITE_RANDOM_EVENTS,
} from "../src/data/script/byMajor/law.roguelite.events.ts";
import { applyCSCopy } from "../src/data/script/byMajor/computerScience.copy.ts";
import {
  applyClinicalMedicineCopy,
} from "../src/data/script/byMajor/clinicalMedicine.copy.ts";
import {
  CLINICAL_EVENTS,
} from "../src/data/script/byMajor/clinicalMedicine.events.ts";
import {
  CHINESE_EVENTS,
} from "../src/data/script/byMajor/chineseLiterature.events.ts";
import {
  ACCOUNTING_EVENTS,
} from "../src/data/script/byMajor/accounting.roguelite.events.ts";

const root = new URL("../", import.meta.url);
const json = async (path) => JSON.parse(await readFile(new URL(path, root), "utf8"));
const pools = {
  law: annotateEventPool(applyLawCopy([
    ...await json("src/data/script/byMajor/law.events.json"),
    ...LAW_ROGUELITE_EVENTS,
    ...LAW_ROGUELITE_RANDOM_EVENTS,
  ]), "law"),
  computer_science: annotateEventPool(
    applyCSCopy(await json("src/data/script/byMajor/computer_science.events.json")),
    "computer_science",
  ),
  clinical_medicine: annotateEventPool(
    applyClinicalMedicineCopy(CLINICAL_EVENTS),
    "clinical_medicine",
  ),
  chinese_language_literature: annotateEventPool(CHINESE_EVENTS, "chinese_language_literature"),
  accounting: annotateEventPool(ACCOUNTING_EVENTS, "accounting"),
};

const report = [];
const failures = [];
for (const [majorId, events] of Object.entries(pools)) {
  const eligible = events.filter((event) => !["gg_check"].includes(event.type));
  const low = eligible.filter((event) => event.copyNotes.eventQualityScore < 7);
  const noHumor = eligible.filter((event) => event.copyNotes.quality.humorImpact === 0);
  const generic = eligible.filter((event) => event.copyNotes.quality.professionalSpecificity < 2);
  const ai = eligible.filter((event) => event.copyNotes.aiTraceFlags.length);
  const distribution = Object.groupBy(eligible, (event) => event.copyNotes.humorType);
  const intensity = Object.groupBy(eligible, (event) => event.copyNotes.humorIntensity);
  const core = eligible.filter((event) => ["main", "core"].includes(event.type));
  const weakCore = core.filter((event) => event.copyNotes.eventQualityScore < 9);
  failures.push(...low.map((event) => ({ majorId, event })));
  report.push({
    majorId,
    total: eligible.length,
    low,
    noHumor,
    generic,
    ai,
    weakCore,
    average: eligible.reduce((sum, event) => sum + event.copyNotes.eventQualityScore, 0) / Math.max(1, eligible.length),
    distribution: Object.fromEntries(Object.entries(distribution).map(([key, value]) => [key, value.length])),
    intensity: Object.fromEntries(Object.entries(intensity).map(([key, value]) => [key, value.length])),
  });
}

const markdown = [
  "# 五专业事件文案审计",
  "",
  "生成方式：使用 Node.js 直接运行 `scripts/audit-event-copy.mjs --write`",
  "",
  ...report.flatMap((item) => [
    `## ${item.majorId}`,
    "",
    `- 正式事件：${item.total}`,
    `- 平均分：${item.average.toFixed(2)} / 10`,
    `- 低于 7 分：${item.low.length}`,
    `- 绷不住程度为 0：${item.noHumor.length}`,
    `- 专业辨识度低于 2：${item.generic.length}`,
    `- 核心事件低于 9 分：${item.weakCore.length}`,
    `- AI 痕迹命中：${item.ai.length}`,
    `- 专业辨识度待人工复核：${item.generic.slice(0, 18).map((event) => event.id).join("，") || "无"}`,
    `- 核心事件待提升：${item.weakCore.map((event) => `${event.id}(${event.copyNotes.eventQualityScore})`).join("，") || "无"}`,
    `- 强度分布：${Object.entries(item.intensity).map(([key, value]) => `${key}=${value}`).join("，")}`,
    `- 笑点类型：${Object.entries(item.distribution).map(([key, value]) => `${key}=${value}`).join("，")}`,
    "",
    ...(item.low.length
      ? [
          "| 事件 | 分数 | 主要问题 | 截图句 |",
          "| --- | ---: | --- | --- |",
          ...item.low.map((event) => {
            const notes = event.copyNotes;
            const issues = [
              notes.quality.professionalSpecificity < 2 ? "专业辨识度" : "",
              notes.quality.concreteness < 1 ? "缺少细节" : "",
              notes.quality.humorImpact < 1 ? "无绷不住点" : "",
              notes.quality.choiceTension < 2 ? "选择张力" : "",
              notes.quality.futureValue < 1 ? "无后续价值" : "",
            ].filter(Boolean).join("、");
            return `| ${event.id} | ${notes.eventQualityScore} | ${issues} | ${notes.screenshotLine.replaceAll("|", "｜")} |`;
          }),
          "",
        ]
      : ["本专业没有低于 7 分的正式事件。", ""]),
  ]),
].join("\n");

if (process.argv.includes("--write")) {
  await writeFile(new URL("docs/event-copy-audit.md", root), markdown);
}

console.log(markdown);
if (failures.length) process.exitCode = 1;
