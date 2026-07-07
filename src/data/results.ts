// 结局数据。根据角色最终 stats + majorId 匹配。
// 结构方便后续替换/接入服务端。

import type { CharStats } from "@/lib/gameStore";
import type { MajorConfig } from "./majors";

export interface ResultTemplate {
  id: string;
  title: string; // 例："算法工程师"
  emoji: string;
  match: (stats: CharStats, major: MajorConfig) => number; // 得分越高越匹配
  summary: string;
  advice: string;
  achievements: string[];
  shareText: string;
}

const highest = (stats: CharStats): keyof CharStats => {
  return (Object.keys(stats) as (keyof CharStats)[]).reduce((a, b) =>
    stats[a] >= stats[b] ? a : b,
  );
};

export const RESULT_TEMPLATES: ResultTemplate[] = [
  {
    id: "study_king",
    title: "学术卷王",
    emoji: "🎓",
    match: (s) => (s.study > 75 ? s.study : 0) + (s.mental < 50 ? 15 : 0),
    summary: "四年图书馆常客，GPA 稳居前列，代价是发际线和睡眠。",
    advice: "建议保研或直博，别急着投身社会毒打。",
    achievements: ["连续 8 学期奖学金", "毕业论文优秀", "自习室钉子户"],
    shareText: "我用四年换了一张漂亮的成绩单，和一副熊猫眼。",
  },
  {
    id: "intern_king",
    title: "实习卷王",
    emoji: "💼",
    match: (s) => (s.internship > 70 ? s.internship : 0) + (s.money > 60 ? 10 : 0),
    summary: "简历上写满 6 段实习，面试官都记住你的名字了。",
    advice: "秋招起飞，注意别把身体也一起卷进去。",
    achievements: ["6 段大厂实习", "拿到 3 个 SP offer", "面试满级"],
    shareText: "别人还在准备期末，我已经在准备 return offer。",
  },
  {
    id: "chill_soul",
    title: "精神稳定型选手",
    emoji: "🧘",
    match: (s) => (s.mental > 70 ? s.mental : 0) + (s.social > 60 ? 10 : 0),
    summary: "不焦虑、不内耗，稳稳当当拿了毕业证。",
    advice: "这份心态本身就是竞争力，请继续保持。",
    achievements: ["情绪稳定 MVP", "室友最佳倾听者", "从不通宵"],
    shareText: "在人均焦虑的年代，稳定就是超能力。",
  },
  {
    id: "social_butterfly",
    title: "校园社交名人",
    emoji: "🎉",
    match: (s) => (s.social > 75 ? s.social : 0),
    summary: "全校都认识你，走在路上打招呼打到手酸。",
    advice: "适合去做需要人脉的行业：市场、公关、销售、政商。",
    achievements: ["学生会主席", "认识 3 位院长", "毕业晚会主持人"],
    shareText: "毕业最大的收获，是通讯录里 800 个联系人。",
  },
  {
    id: "burnt_out",
    title: "四年 Debug 战士",
    emoji: "🥲",
    match: (s) => (s.mental < 40 ? 60 : 0) + (s.energy < 40 ? 20 : 0),
    summary: "熬过来了，但只剩半条命，钱包和精神都需要重启。",
    advice: "先休息半年，再考虑下一步。gap year 不丢人。",
    achievements: ["连续通宵冠军", "医院常客", "咖啡年消费第一"],
    shareText: "这四年，我把命卖给了 GPA 和 deadline。",
  },
  {
    id: "money_master",
    title: "学生时代小富翁",
    emoji: "💰",
    match: (s) => (s.money > 75 ? s.money : 0),
    summary: "副业接单不停，毕业时存款六位数。",
    advice: "适合创业、自由职业，也可以进金融行业。",
    achievements: ["接单 100+", "淘宝金牌卖家", "室友的债主"],
    shareText: "上大学是为了变优秀，但我顺便变有钱了。",
  },
  {
    id: "balanced",
    title: "六边形战士",
    emoji: "⭐",
    match: (s) => {
      const vals = Object.values(s);
      const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
      const variance =
        vals.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / vals.length;
      return variance < 200 ? 80 : 0;
    },
    summary: "样样都不差，样样都不出众，人生赢家式平衡。",
    advice: "适合大厂管培、公务员，等系统给你派活。",
    achievements: ["综合测评 A", "各项均衡发展", "老师眼中的好学生"],
    shareText: "我不擅长任何事，但我擅长同时做所有事。",
  },
  {
    id: "drift",
    title: "浪迹校园的自由人",
    emoji: "🌿",
    match: (s) =>
      highest(s) === "mental" && s.study < 50 && s.internship < 50 ? 70 : 0,
    summary: "翘课、旅行、追剧，做自己想做的一切。",
    advice: "适合考虑自由职业、写作、艺术方向，或者延毕再体验一年。",
    achievements: ["最会翘课奖", "跨省旅行 12 次", "室友最爱的段子手"],
    shareText: "青春只有一次，我选择先不当大人。",
  },
];

export function matchResult(stats: CharStats, major: MajorConfig): ResultTemplate {
  let best = RESULT_TEMPLATES[0];
  let bestScore = -1;
  for (const t of RESULT_TEMPLATES) {
    const score = t.match(stats, major);
    if (score > bestScore) {
      bestScore = score;
      best = t;
    }
  }
  return best;
}
