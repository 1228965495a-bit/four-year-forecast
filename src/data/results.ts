// 结局数据。基于新属性体系匹配。
// 结构：多个人格模板，每个模板给出分数、总结、成就、分享文案；结果页会补上专业名字。

import type { CharStats } from "@/lib/gameStore";
import type { MajorConfig } from "./majors";
import { getMajorScript } from "./scripts";

export type SurvivalRating =
  | "非常适合，但会掉电"
  | "能读，但别只看滤镜"
  | "谨慎报考，系统建议先备份精神电量"
  | "不建议硬冲，除非你嘴硬浓度很高"
  | "可以冲，做好电量管理";

export interface ResultTemplate {
  id: string;
  /** 用 {major} 占位符自动替换为专业名 */
  titleTemplate: string;
  match: (stats: CharStats, major: MajorConfig) => number;
  /** 一句话本科总结（可用 {major} 占位符） */
  summary: string;
  advice: string;
  achievements: string[];
  shareText: string;
}

export const RESULT_TEMPLATES: ResultTemplate[] = [
  {
    id: "die_hard_survivor",
    titleTemplate: "{major}·嘴硬型幸存者",
    match: (s) => s.mouthHard * 1.2 + (s.filter < 40 ? 25 : 0) + (s.gpa > 55 ? 10 : 0),
    summary:
      "你嘴上说再也不学{major}了，但看到相关新闻还是会下意识开口点评一句。",
    advice: "可以冲，但别只因为电视剧里的行业形象很帅。真正的本科生活会把滤镜拆开给你看。",
    achievements: ["嘴硬续命", "经验贴收藏家", "期末周幸存者"],
    shareText: "我说这专业不行了四年，但我还是读完了。",
  },
  {
    id: "burnt_filter",
    titleTemplate: "{major}·精英滤镜破碎者",
    match: (s) => (100 - s.filter) * 1.1 + (s.escape > 55 ? 20 : 0),
    summary:
      "你带着满格滤镜进来，四年后学会了在朋友圈只发风景照。{major}是好专业，但你已经知道它不是童话。",
    advice: "谨慎报考。除非你能接受「理想 vs 现实」的落差，否则先做半年行业调研。",
    achievements: ["滤镜破碎大师", "深夜转专业调研员", "现实主义觉醒"],
    shareText: "四年前我以为我在选未来，四年后我知道我在选加班时长。",
  },
  {
    id: "gpa_warrior",
    titleTemplate: "{major}·绩点战神",
    match: (s) => s.gpa * 1.3 + (s.battery < 40 ? 15 : 0),
    summary:
      "四年图书馆常客，GPA 稳稳前列，代价是精神电量常年低于 30%。你可能是老师最爱、室友最怕的类型。",
    advice: "适合保研或直博，但别急着把身体也一起卷进去。",
    achievements: ["8 学期奖学金", "自习室钉子户", "0 挂科俱乐部"],
    shareText: "我用四年换了一张漂亮的成绩单，和一副熊猫眼。",
  },
  {
    id: "battery_dead",
    titleTemplate: "{major}·电量告急型选手",
    match: (s) => (100 - s.battery) * 1.2 + (s.hairline < 50 ? 20 : 0),
    summary:
      "你熬过来了，但精神电量长期红灯，钱包和睡眠都在等重启。{major}没害你，但也没放过你。",
    advice: "不建议硬冲。请先备份精神电量再决定是否 gap 一年。",
    achievements: ["通宵冠军", "咖啡年消费第一", "医院常客"],
    shareText: "这四年，我把命卖给了 GPA 和 deadline。",
  },
  {
    id: "obsession_true_love",
    titleTemplate: "{major}·真爱选手",
    match: (s) => s.obsession * 1.2 + (s.escape < 25 ? 20 : 0),
    summary:
      "你是真的喜欢{major}。每次讲起本专业眼睛都在发光，四年后依然想继续深造。稀有物种。",
    advice: "非常适合，但会掉电。建议提前规划保研或读研路径，别被就业焦虑打乱节奏。",
    achievements: ["专业真爱粉", "老师最爱学生", "本专业代言人"],
    shareText: "别人在劝退，我在续费。这专业我先替你读了四年，读完还想读研。",
  },
  {
    id: "escape_runner",
    titleTemplate: "{major}·中途跑路型玩家",
    match: (s) => s.escape * 1.3 + (s.obsession < 40 ? 15 : 0),
    summary:
      "你从大二开始就在研究转专业 / 跨考 / 出国 / 转码。{major}对你来说是一个跳板。",
    advice: "如果你确定不喜欢，越早跑路越好。别用嘴硬浓度绑架自己。",
    achievements: ["转专业调研员", "跨考选手", "简历重写 15 次"],
    shareText: "我把本科当成了一次预演，真正想做的事在毕业之后才开始。",
  },
  {
    id: "illusion_high",
    titleTemplate: "{major}·就业幻觉型选手",
    match: (s) => s.illusion * 1.2 + (s.gpa < 55 ? 10 : 0),
    summary:
      "你觉得毕业一定会有个 offer 在等你——因为你参加了 5 个学生组织、投过 60 份实习、简历上写了「熟练掌握」。",
    advice: "能读，但别只看滤镜。多和已经毕业 2 年的学长学姐聊聊真实薪资。",
    achievements: ["履历包装大师", "PPT 大满贯", "学生组织常驻"],
    shareText: "简历越来越漂亮，我越来越不知道自己想干嘛。",
  },
  {
    id: "balanced_survivor",
    titleTemplate: "{major}·六边形幸存者",
    match: (s) => {
      const vals = [s.obsession, s.battery, s.filter, s.gpa, s.illusion, 100 - s.escape];
      const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
      const variance = vals.reduce((sum, v) => sum + (v - avg) ** 2, 0) / vals.length;
      return variance < 220 ? 90 : 0;
    },
    summary:
      "你不上头也不跑路，绩点凑合，精神在线。你是老师、家长、HR 眼里最省心的那种毕业生。",
    advice: "可以冲，做好电量管理。你这种平衡型选手适合大厂管培、公务员、稳字当头的赛道。",
    achievements: ["情绪稳定 MVP", "综合测评 A", "从不掉电"],
    shareText: "我不擅长任何事，但我擅长同时做所有事。",
  },
];

export function matchResult(stats: CharStats, major: MajorConfig) {
  // 优先用专业脚本里的 endings；没有就用通用池
  const script = getMajorScript(major.id);
  const pool: ResultTemplate[] =
    script?.endings?.length ? script.endings : RESULT_TEMPLATES;

  let best = pool[0];
  let bestScore = -1;
  for (const t of pool) {
    const score = t.match(stats, major);
    if (score > bestScore) { bestScore = score; best = t; }
  }
  const majorName = major.name;
  return {
    id: best.id,
    title: best.titleTemplate.replace(/\{major\}/g, majorName),
    summary: best.summary.replace(/\{major\}/g, majorName),
    advice: best.advice.replace(/\{major\}/g, majorName),
    achievements: best.achievements,
    shareText: best.shareText,
  };
}

/** 幸存评级：不用百分比，用有梗的话。 */
export function survivalRating(stats: CharStats): SurvivalRating {
  if (stats.battery < 35 || stats.hairline < 40) return "不建议硬冲，除非你嘴硬浓度很高";
  if (stats.filter < 40) return "能读，但别只看滤镜";
  if (stats.escape > 60) return "谨慎报考，系统建议先备份精神电量";
  if (stats.obsession > 70) return "非常适合，但会掉电";
  return "可以冲，做好电量管理";
}
