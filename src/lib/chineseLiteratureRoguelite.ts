import {
  CHINESE_HIDDEN_EVENTS,
  CHINESE_ROUTE_EVENTS,
  CHINESE_RANDOM_EVENTS,
  type ChineseRouteKey,
} from "@/data/script/byMajor/chineseLiterature.events";
import { annotateEventPool, humorTypeRepeatPenalty } from "./eventCopyQuality";

const CHINESE_OPTIONAL_COPY_POOL = annotateEventPool(
  [...CHINESE_ROUTE_EVENTS, ...CHINESE_RANDOM_EVENTS],
  "chinese_language_literature",
);

type MutableChineseState = {
  stats: Record<string, number>;
  majorStats: Record<string, number>;
  hiddenStats: Record<string, number>;
  flags: string[];
  routes: string[];
  seenEvents: string[];
  routeScores?: Record<string, number>;
  specialExperiences?: string[];
  pendingTrend?: string | null;
  initialTrait?: string | null;
};

type ChineseGameLike = MutableChineseState & {
  history: Array<{ semester: string; title: string; choice: string; feedback: string }>;
  semesterIdx: number;
};

export const CHINESE_MEMORIES = [
  { id: "chinese_saved_notes", title: "带走一份不互相打架的文学史笔记", description: "开局获得 6 点文本积累。" },
  { id: "chinese_saved_submission", title: "保留一个认真看稿的联系人", description: "开局获得 8 点表达机会。" },
  { id: "chinese_route_sheet", title: "提前看过一次中文系出口表", description: "开局就知道专业代码差两个字也会被卡。" },
] as const;

export const CHINESE_START_TRAITS = [
  { id: "novel_reader", title: "你真的很喜欢看小说", description: "书单里有几本早就读过，论文格式则完全没见过。你会读书，但还不知道读完要交三千字。" },
  { id: "essay_writer", title: "你从小作文经常被当范文", description: "你对自己的文笔很有信心。开学后，文献综述会亲自来谈。" },
  { id: "job_posts", title: "你提前搜过“中文系能干什么”", description: "文学滤镜没完全掉，但岗位表、教资和内容实习已经进入收藏夹。" },
  { id: "adjusted", title: "你是被调剂进中文系的", description: "别人报到时聊最喜欢的作家，你先查这个专业到底能不能转出去。" },
] as const;

export function getChineseStartTrait(id?: string | null) {
  return CHINESE_START_TRAITS.find((trait) => trait.id === id) ?? null;
}

export const CHINESE_ROUTE_DEFINITIONS = [
  { id: "research", title: "文学研究保研线", ending: "题目终于小到能在毕业前写完", summary: "你的选题曾经想包办半部文学史，后来被老师一刀刀砍到只剩一篇小说。最后那版标题很短，参考文献很长，好消息是导师终于没说“范围太大”。", shareText: "我的中文系结局：选题从半部文学史缩到一扇窗，终于在毕业前写完了。" },
  { id: "teacher", title: "师范教资考编线", ending: "试讲不再由你和空气共同完成", summary: "你第一次试讲，导入讲了四分钟，板书挤到右下角，空气学生拒绝举手。后来倒计时响起时，你刚好讲完最后一句。", shareText: "我的中文系结局：试讲终于不超时，空气学生也愿意配合我回答了。" },
  { id: "civil", title: "考公考编稳定线", ending: "文学流派没研究完，岗位代码先研究明白了", summary: "你收藏过一百篇上岸经验，最后真正有用的是职位表、专业目录和报名截止时间。别人问中文系学了什么，你先反问：岗位代码认不认？", shareText: "我的中文系结局：别人研究文学流派，我把岗位专业代码研究到了小数点后两位。" },
  { id: "editor", title: "出版编辑内容线", ending: "最终版第八次成为最终版", summary: "你以为编辑每天读好稿，后来每天都在找错字、追作者、锁底稿，以及确认“最终版2”到底是不是最终版。至少交付那天，参考文献还在。", shareText: "我的中文系结局：最终版改到第八版，至少这次引号和参考文献都活到了交付。" },
  { id: "writing", title: "写作创作隐藏线", ending: "第十二个开头终于有了结尾", summary: "退稿邮件只写“感谢来稿”，阅读量长期保持个位数。你还是把停在第三段的文档拖到了结尾，又按下了一次发送。", shareText: "我的中文系隐藏结局：文件夹里十二个开头，终于有一个活着走到了结尾。" },
  { id: "media", title: "新媒体与表达线", ending: "学了四年文本细读，先把标题写到有人点", summary: "十万加只来过一次，照着写的续篇只剩零头。你没把简介改成爆款操盘手，而是老老实实重做选题、采访和标题。", shareText: "我的中文系结局：会分析叙述视角，也会先回答这个标题到底有没有人点。" },
  { id: "survival", title: "中文系万金油生存线", ending: "油自己炼了，锅也真的找到了", summary: "你没把每条路都卷满，也没让四年只剩一张成绩单。后来跨行面试让你改一段通知，你两分钟写清楚了，面试官问：为什么原来不这么写？", shareText: "我的中文系结局：万金油没有自动配锅，但我把阅读写作炼成了跨行被动技能。" },
] as const;

export const CHINESE_PERSONAS = [
  {
    id: "close_reader", title: "过度解读型阅读者",
    verdict: "别人看到“今天天气不错”，你已经开始判断说话人态度、叙述距离，以及这句话到底有没有潜台词。",
    tags: ["潜台词雷达", "叙述视角常开", "细节拒绝路过"],
    shareText: "我的中文系人格是过度解读型阅读者：一句话可以很简单，但我不同意它只需要一种解释。",
    score: (s: MutableChineseState) => personaScore(s, "textSensitivity", "readingStamina", "close_reader"),
  },
  {
    id: "proofreader", title: "人形错别字检测器",
    verdict: "内容还没看完，“的地得”、左右引号和全角标点已经先在你脑内亮起红灯。",
    tags: ["标点统一执法", "病句自动标红", "最终版核验员"],
    shareText: "我的中文系人格是人形错别字检测器：情绪可以不稳定，标点最好统一。",
    score: (s: MutableChineseState) => personaScore(s, "editingSense", "textSensitivity", "proofreader"),
  },
  {
    id: "copywriter", title: "朋友圈文案外包户",
    verdict: "别人负责生日、官宣、离职和毕业，你负责把他们没说清楚的情绪整理成一句完整的话。",
    tags: ["群聊表达补位", "官宣代写", "发言稿急诊"],
    shareText: "我的中文系人格是朋友圈文案外包户：朋友负责经历人生，我负责给人生配文。",
    score: (s: MutableChineseState) => personaScore(s, "expression", "teamBackup", "copywriter"),
  },
  {
    id: "unfinished_writer", title: "选题比正文先死型写手",
    verdict: "你的文件夹里有十二个开头、六个标题和三个世界观，正文曾经长期保持神秘，好在至少有一个被你拖到了结尾。",
    tags: ["开头批量生产", "完稿低频刷新", "灵感常驻"],
    shareText: "我的中文系人格是选题比正文先死型写手：灵感来得很勤，完稿来得比较讲缘分。",
    score: (s: MutableChineseState) => personaScore(s, "creativeImpulse", "completionHabit", "writer"),
  },
  {
    id: "ancient_survivor", title: "古代汉语渡劫幸存者",
    verdict: "你已经无法平静地看待一个“之”字，总觉得它后面藏着词性、用法和一道五分题。",
    tags: ["虚词警觉", "通假字条件反射", "期末存活"],
    shareText: "我的中文系人格是古代汉语渡劫幸存者：现代人正常说话，我先分析这个“其”到底指谁。",
    score: (s: MutableChineseState) => personaScore(s, "ancientTolerance", "memorization", "ancient_survivor"),
  },
  {
    id: "job_sheet", title: "岗位表文学研究员",
    verdict: "别人研究文学流派，你研究岗位专业代码；未来还没确定，主报、备选和Plan D已经各自有一列。",
    tags: ["专业代码考据", "焦虑表格化", "备选排到D"],
    shareText: "我的中文系人格是岗位表文学研究员：文学理想还在，Excel也没闲着。",
    score: (s: MutableChineseState) => personaScore(s, "civilPlanning", "realityPlanning", "planner"),
  },
] as const;

const CORE_IDS = [
  "chinese_core_01_reading",
  "chinese_core_02_ancient",
  "chinese_core_03_paper",
  "chinese_core_04_expression",
  "chinese_core_05_exit",
  "chinese_core_06_conflict",
  "chinese_core_07_lock",
  "chinese_core_08_finish",
];

export function createChineseRunState(state: MutableChineseState, runNumber: number) {
  state.routeScores = Object.fromEntries(CHINESE_ROUTE_DEFINITIONS.map((route) => [route.id, route.id === "survival" ? 1 : 0]));
  state.specialExperiences = [];
  state.stats.energy = 78;
  state.stats.textAccumulation = 20;
  state.stats.expressionOpportunity = 15;
  for (const key of [
    "idealDrive", "realityPlanning", "stressTolerance", "ambiguityTolerance", "responsibility", "expression",
    "textSensitivity", "readingStamina", "interestProtection", "ancientTolerance", "memorization",
    "topicNarrowing", "revisionPatience", "editingSense", "teachingPractice", "civilPlanning",
    "creativeImpulse", "completionHabit", "mediaSense", "portfolioSense", "teamBackup",
    "boundarySense", "lowCostSurvival", "rejectionTolerance",
  ]) state.hiddenStats[key] ??= 50;
  const seed = Math.max(1, runNumber);
  state.hiddenStats.chineseRunSeed = seed;
  state.hiddenStats.chineseChoiceCount = 0;
  const trait = CHINESE_START_TRAITS[(seed * 7 + 2) % CHINESE_START_TRAITS.length];
  state.initialTrait = trait.id;
  applyStartTrait(state, trait.id);
}

export function applyChineseChoiceLayer(state: MutableChineseState, _event: any, choice: any) {
  const impact = choice.chinese ?? {};
  state.routeScores ??= {};
  state.specialExperiences ??= [];
  state.stats.textAccumulation = clamp(Number(state.stats.textAccumulation ?? 20) + Number(impact.text ?? 0));
  state.stats.expressionOpportunity = clamp(Number(state.stats.expressionOpportunity ?? 15) + Number(impact.opportunity ?? 0));
  for (const [key, value] of Object.entries(impact.traits ?? {})) add(state.hiddenStats, key, Number(value));
  for (const [key, value] of Object.entries(impact.routes ?? {})) add(state.routeScores, key, Number(value));
  for (const flag of impact.flags ?? []) pushUnique(state.flags, flag);
  for (const route of impact.closes ?? []) pushUnique(state.flags, `chinese_closed_${route}`);
  for (const title of impact.experiences ?? []) pushUnique(state.specialExperiences, title);
  if (impact.proof) add(state.hiddenStats, `chineseProof_${impact.proof}`, 1);
  state.hiddenStats.chineseChoiceCount = Number(state.hiddenStats.chineseChoiceCount ?? 0) + 1;
  state.pendingTrend = state.hiddenStats.chineseChoiceCount % 3 === 0 ? deriveTrend(state) : null;
}

export function pickChineseCoreEvent(state: MutableChineseState & { semesterIdx: number }) {
  const id = CORE_IDS[state.semesterIdx];
  return id && !state.seenEvents.includes(id) ? id : null;
}

export function shouldDrawChineseOptional(state: MutableChineseState & { semesterIdx: number }) {
  if (state.semesterIdx >= 7) return false;
  const seed = Number(state.hiddenStats.chineseRunSeed ?? 1);
  const skips = new Set<number>();
  for (let salt = 0; skips.size < 2; salt += 1) skips.add(stableIndex(seed * 31 + salt * 19 + 5, 7));
  return !skips.has(state.semesterIdx);
}

export function pickChineseOptionalEvent(state: MutableChineseState & { semesterIdx: number }) {
  const semester = semesterKey(state.semesterIdx);
  const committedRoute = deriveCommittedRoute(state);
  const candidates = CHINESE_OPTIONAL_COPY_POOL
    .filter((event) => !state.seenEvents.includes(event.id))
    .filter((event) => event.semester === null || event.semester === semester)
    .filter((event) => event.routeIds.every((route) => !state.flags.includes(`chinese_closed_${route}`)))
    .filter((event) => event.routeIds.length === 0 || event.routeIds.some((route) => Number(state.routeScores?.[route] ?? 0) >= 4));
  if (!candidates.length) return null;
  const seed = Number(state.hiddenStats.chineseRunSeed ?? 1);
  return candidates
    .map((event) => ({
      event,
      score: (event.weight
        + Math.max(0, ...event.routeIds.map((route) => Number(state.routeScores?.[route] ?? 0))) * 1.6
        + (committedRoute && event.routeIds.includes(committedRoute) ? 30 : 0)
        + stableIndex(seed * 97 + state.semesterIdx * 37 + stableHash(event.id), 13))
        * humorTypeRepeatPenalty(CHINESE_OPTIONAL_COPY_POOL, state.seenEvents, event),
    }))
    .sort((a, b) => b.score - a.score)[0].event.id;
}

export function pickChineseCallbackEvent(state: MutableChineseState & { semesterIdx: number }) {
  if (state.seenEvents.filter((id) => id.startsWith("chinese_hidden_")).length >= 2) return null;
  const candidates: Array<[boolean, string]> = [
    [state.semesterIdx >= 6 && hasAny(state, ["chinese_read_plan", "chinese_read_group"]) && dim(state, "readingStamina") >= 60, "chinese_hidden_reading_callback"],
    [state.semesterIdx >= 6 && hasAny(state, ["chinese_paper_narrow", "chinese_paper_teacher"]) && hasAny(state, ["chinese_paper_second_revision", "chinese_lock_research"]), "chinese_hidden_paper_callback"],
    [state.semesterIdx >= 6 && hasAny(state, ["chinese_journal_entry", "chinese_journal_version"]) && dim(state, "editingSense") >= 64, "chinese_hidden_journal_callback"],
    [state.semesterIdx >= 6 && hasAny(state, ["chinese_writing_public_1", "chinese_writing_public_random"]) && hasAny(state, ["chinese_writing_continue_2", "chinese_writing_finished_1", "chinese_writing_feedback"]), "chinese_hidden_writing_callback"],
    [state.semesterIdx >= 5 && Number(state.stats.expressionOpportunity ?? 0) >= 25 && dim(state, "teachingPractice") >= 58, "chinese_hidden_teaching_callback"],
    [state.semesterIdx >= 6 && state.flags.includes("chinese_media_viral"), "chinese_hidden_media_callback"],
    [state.semesterIdx >= 5 && state.flags.includes("chinese_ancient_parse") && dim(state, "textSensitivity") >= 64, "chinese_hidden_language_turn"],
    [state.semesterIdx >= 7 && (dim(state, "lowCostSurvival") >= 62 || dim(state, "civilPlanning") >= 70) && dim(state, "responsibility") >= 50, "chinese_hidden_lowcost_callback"],
  ];
  return candidates.find(([hit, id]) => hit && !state.seenEvents.includes(id))?.[1] ?? null;
}

export function shouldFollowChineseEvent(state: MutableChineseState & { semesterEventCount?: number }, next: any) {
  return Boolean(next && next.type === "hidden" && Number(state.semesterEventCount ?? 0) < 3);
}

export function deriveChineseResult(game: ChineseGameLike) {
  const route = deriveRoute(game);
  const persona = [...CHINESE_PERSONAS].sort((a, b) => b.score(game) - a.score(game))[0];
  const experiences = deriveExperiences(game);
  return {
    route,
    persona,
    experiences,
    reasons: deriveReasons(game, route.id, persona.id),
    viralStats: [
      { label: "看到病句后的忍耐时间", value: clamp(100 - dim(game, "editingSense")) },
      { label: "一句话潜台词分析层数", value: clamp(dim(game, "textSensitivity")) },
      { label: "文件夹未完稿存活率", value: clamp(dim(game, "creativeImpulse") - dim(game, "completionHabit") + 50) },
    ],
    story: buildStory(game),
    lockedHint: deriveLockedHint(game, route.id),
    replayChallenge: deriveReplayChallenge(route.id),
    fit: deriveFit(game, route.id),
  };
}

function deriveRoute(state: MutableChineseState) {
  const ranked = CHINESE_ROUTE_DEFINITIONS
    .filter((route) => !state.flags.includes(`chinese_closed_${route.id}`))
    .map((route) => ({ route, score: Number(state.routeScores?.[route.id] ?? 0) }))
    .sort((a, b) => b.score - a.score);
  return ranked[0]?.route ?? CHINESE_ROUTE_DEFINITIONS[6];
}

function deriveExperiences(game: ChineseGameLike) {
  const items = (game.specialExperiences ?? []).map((title) => ({ id: simpleHash(title), title }));
  const candidates: Array<[boolean, string, string]> = [
    [game.flags.includes("chinese_callback_reading"), "reading", "大一读过的书在毕业论文里重新出现"],
    [game.flags.includes("chinese_callback_paper"), "paper", "论文题目终于没有被要求继续缩小"],
    [game.flags.includes("chinese_callback_journal"), "journal", "校园刊物意外成为长期项目"],
    [game.flags.includes("chinese_callback_writing"), "writing", "个位数阅读量之后仍然继续写"],
    [game.flags.includes("chinese_callback_teaching"), "teaching", "代完一节课后点开教资报名页"],
    [game.flags.includes("chinese_callback_language"), "language", "从文学转向语言学"],
    [game.flags.includes("chinese_callback_lowcost"), "lowcost", "没抢过活，却成了交稿前最让人放心的人"],
    [dim(game, "ancientTolerance") >= 66, "ancient", "古代汉语期末渡劫成功"],
    [dim(game, "editingSense") >= 68, "editing", "最终版校对没有丢参考文献"],
  ];
  for (const [hit, id, title] of candidates) if (hit && !items.some((item) => item.title === title)) items.push({ id, title });
  return items.slice(0, 8);
}

function deriveReasons(game: ChineseGameLike, routeId: string, personaId: string) {
  const route = CHINESE_ROUTE_DEFINITIONS.find((item) => item.id === routeId)!;
  const persona = CHINESE_PERSONAS.find((item) => item.id === personaId)!;
  const proofLabels: Record<string, string> = {
    close_reader: "你反复选择回到文本细节，而不是只记现成结论。",
    proofreader: "你多次处理版本、病句、标点和真实改稿。",
    copywriter: "你经常把模糊表达整理成别人能听懂的话。",
    writer: "退稿和个位数阅读量都没能让你删掉下一个文档。",
    ancient_survivor: "你没有把所有课程都学到最好，但一直能按时完成阅读和作业。",
    planner: "你真的查过截止日期、专业代码和不能报的条件。",
  };
  return [
    `四年里，你最常把时间花在“${route.title}”相关的事情上。`,
    `你不止一次做出符合“${persona.title}”的选择，所以这个结果不是最后一题临时决定的。`,
    proofLabels[personaId],
  ];
}

function buildStory(game: ChineseGameLike) {
  return ["大一", "大二", "大三", "大四"].map((year) => {
    const rows = [...game.history].reverse().filter((item) => String(item.semester ?? "").startsWith(year));
    return { year, text: rows[0] ? `${rows[0].title}：你选择了“${rows[0].choice}”。` : "这一年没有留下完整记录。" };
  });
}

function deriveLockedHint(state: MutableChineseState, routeId: string) {
  const next = CHINESE_ROUTE_DEFINITIONS
    .filter((route) => route.id !== routeId && !state.flags.includes(`chinese_closed_${route.id}`))
    .sort((a, b) => Number(state.routeScores?.[b.id] ?? 0) - Number(state.routeScores?.[a.id] ?? 0))[0];
  if (state.flags.includes("chinese_writing_public_1") && !state.flags.includes("chinese_writing_feedback")) {
    return "你公开过一篇文章，但退稿以后没有再改。那封“感谢来稿”还躺在邮箱里。";
  }
  return next ? `你差一点走到“${next.title}”。下一局大二时换一个群回复，那边的后续会更早找上你。` : "这一局你拒绝了太多额外任务。下一局多答应一次试讲、改稿或投稿，会有人继续来找你。";
}

function deriveReplayChallenge(routeId: string) {
  const copy: Record<string, string> = {
    research: "下一局别缩选题，看看《中国文学中的一切》能不能活到三千字。",
    teacher: "下一局不报教资，先去校刊或校园媒体接一次真实改稿。",
    civil: "下一局暂时不打开岗位表，连续三个学期保留一次创作。",
    editor: "下一局别替校刊收第八版，去试讲一次，或者把自己的稿发出去。",
    writing: "下一局继续写，但也打开一次教资、岗位表或招聘软件。",
    media: "下一局放弃追热点，试着把一篇没人看的长稿改到第二版。",
    survival: "下一局只挑一件最费电的事，看看认真卷一次会发生什么。",
  };
  return copy[routeId] ?? "下一局换几个答案，再读一次这四年。";
}

function deriveFit(state: MutableChineseState, routeId: string) {
  return {
    strengths: [
      dim(state, "textSensitivity") >= 64 ? "你对措辞、结构和语气差异很敏感。" : "你能把说不清楚的材料整理成别人看得懂的文字。",
      dim(state, "interestProtection") >= 64 ? "你知道如何给私人阅读与写作保留空间。" : "你愿意为明确目标承受一段高强度文本训练。",
    ],
    risks: dim(state, "overResponsibility") > dim(state, "boundarySense") + 8
      ? "你容易成为默认改稿和表达补位者，需要更早确认范围。"
      : "中文能力需要通过作品、试讲、论文或材料写作被具体证明，不能只停在“万金油”。",
    direction: `你的选择更接近“${CHINESE_ROUTE_DEFINITIONS.find((item) => item.id === routeId)?.title ?? "中文系训练"}”。这只是游戏里的本科结果，不能代替真实院校培养方案和职业咨询。`,
  };
}

function deriveTrend(state: MutableChineseState) {
  const ranked = CHINESE_ROUTE_DEFINITIONS
    .map((route) => ({ route, score: Number(state.routeScores?.[route.id] ?? 0) }))
    .sort((a, b) => b.score - a.score);
  return `你最近几次选择都更接近“${ranked[0].route.title}”，下一次怎么选仍然可能改变方向。`;
}

function deriveCommittedRoute(state: MutableChineseState): ChineseRouteKey | null {
  if (state.flags.includes("chinese_route_research")) return "research";
  if (state.flags.includes("chinese_route_teacher")) return "teacher";
  if (state.flags.includes("chinese_route_civil")) return "civil";
  if (state.flags.includes("chinese_route_content")) {
    if (state.flags.includes("chinese_writing_public_1") || state.flags.includes("chinese_writing_public_random")) return "writing";
    if (state.flags.includes("chinese_media_entry")) return "media";
    if (state.flags.includes("chinese_journal_entry")) return "editor";
    return Number(state.routeScores?.media ?? 0) > Number(state.routeScores?.editor ?? 0) ? "media" : "editor";
  }
  if (state.flags.includes("chinese_writing_public_1") || state.flags.includes("chinese_writing_public_random")) return "writing";
  if (state.flags.includes("chinese_teaching_entry")) return "teacher";
  if (state.flags.includes("chinese_media_entry")) return "media";
  if (state.flags.includes("chinese_journal_entry")) return "editor";
  return null;
}

function applyStartTrait(state: MutableChineseState, id: string) {
  if (id === "novel_reader") { add(state.hiddenStats, "readingStamina", 8); add(state.hiddenStats, "interestProtection", 6); add(state.routeScores!, "research", 3); }
  if (id === "essay_writer") { add(state.hiddenStats, "expression", 8); add(state.hiddenStats, "creativeImpulse", 8); add(state.routeScores!, "writing", 3); }
  if (id === "job_posts") { add(state.hiddenStats, "realityPlanning", 8); add(state.hiddenStats, "civilPlanning", 5); add(state.routeScores!, "civil", 3); }
  if (id === "adjusted") { state.stats.energy = clamp(state.stats.energy + 5); add(state.hiddenStats, "interestProtection", 6); add(state.routeScores!, "survival", 4); }
}

function personaScore(state: MutableChineseState, first: string, second: string, proof: string) {
  const count = dim(state, `chineseProof_${proof}`);
  const proofScore = Math.min(count, 3) * 10 + Math.max(0, count - 3) * 2;
  return dim(state, first) * 0.55 + dim(state, second) * 0.35 + proofScore;
}

function hasAny(state: MutableChineseState, flags: string[]) { return flags.some((flag) => state.flags.includes(flag)); }
function semesterKey(index: number) { return ["y1s1", "y1s2", "y2s1", "y2s2", "y3s1", "y3s2", "y4s1", "y4s2"][index]; }
function dim(state: MutableChineseState, key: string) { return Number(state.hiddenStats[key] ?? 0); }
function add(bag: Record<string, number>, key: string, value: number) { bag[key] = Number(bag[key] ?? 0) + value; }
function pushUnique<T>(list: T[], item: T) { if (!list.includes(item)) list.push(item); }
function clamp(value: number) { return Math.max(0, Math.min(100, Math.round(value))); }
function stableIndex(value: number, length: number) { return (stableHash(String(value)) >>> 0) % length; }
function stableHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
function simpleHash(value: string) { return stableHash(value).toString(36); }
