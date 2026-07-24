export type MajorAvailability = "available" | "unavailable";
export type MajorEntryType = "game" | "community_vote";

export interface MajorExperienceConfig {
  id: string;
  name: string;
  shortName?: string;
  subtitle: string;
  totalSemesters: number;
  stageNames: string[];
  graduationYear: number;
  order: number;
  availability: MajorAvailability;
  releasePhase: number;
  entryType: MajorEntryType;
  previewTitle?: string;
  previewBody?: string;
}

const FOUR_YEAR_STAGES = [
  "大一上",
  "大一下",
  "大二上",
  "大二下",
  "大三上",
  "大三下",
  "大四上",
  "大四下",
];

export const MAJOR_EXPERIENCES: MajorExperienceConfig[] = [
  {
    id: "law",
    name: "法学",
    subtitle: "家里已经开始叫你大律师，而你还不知道法考到底考几科。",
    totalSemesters: 8,
    stageNames: FOUR_YEAR_STAGES,
    graduationYear: 4,
    order: 1,
    availability: "available",
    releasePhase: 1,
    entryType: "game",
  },
  {
    id: "computer_science",
    name: "计算机科学与技术",
    shortName: "计算机",
    subtitle: "第一行代码还没跑起来，第一条报错已经来接你入学。",
    totalSemesters: 8,
    stageNames: FOUR_YEAR_STAGES,
    graduationYear: 4,
    order: 2,
    availability: "available",
    releasePhase: 2,
    entryType: "game",
  },
  {
    id: "clinical_medicine",
    name: "临床医学",
    subtitle: "别人四年毕业，你的培养方案表示事情没有这么简单。",
    totalSemesters: 10,
    stageNames: [...FOUR_YEAR_STAGES, "大五上", "大五下"],
    graduationYear: 5,
    order: 3,
    availability: "available",
    releasePhase: 3,
    entryType: "game",
    previewTitle: "你收到了临床医学录取通知书。",
    previewBody: "别人的本科以四年为单位，你的培养方案显然另有安排。课程、见习、考研和规培正在前面排队。",
  },
  {
    id: "chinese_language_literature",
    name: "汉语言文学",
    shortName: "汉语言",
    subtitle: "你以为是读小说，古代汉语和现当代文学已经在门口等你。",
    totalSemesters: 8,
    stageNames: FOUR_YEAR_STAGES,
    graduationYear: 4,
    order: 4,
    availability: "available",
    releasePhase: 4,
    entryType: "game",
    previewTitle: "你的中文系课表已经送达。",
    previewBody: "小说当然会读，但古代汉语、文学史、文论和论文提纲也都拿到了你的学号。这里的浪漫，通常需要先交一份三千字读书报告。",
  },
  {
    id: "accounting",
    name: "会计学",
    subtitle: "大一还在问借贷是什么意思，大四已经开始怀疑为什么账又对不上。",
    totalSemesters: 8,
    stageNames: FOUR_YEAR_STAGES,
    graduationYear: 4,
    order: 5,
    availability: "available",
    releasePhase: 5,
    entryType: "game",
    previewTitle: "你的第一本账已经翻开。",
    previewBody: "借和贷并不负责解释方向，报表也不会因为你很努力就自动平衡。准则、审计、税法和 CPA 已经按顺序坐进教室。",
  },
  {
    id: "community_next_major",
    name: "下一专业，由你决定",
    shortName: "下一专业",
    subtitle: "没有你的专业？把它投进下一轮本科副本。",
    totalSemesters: 0,
    stageNames: [],
    graduationYear: 0,
    order: 6,
    availability: "available",
    releasePhase: 6,
    entryType: "community_vote",
  },
];

export const MAJOR_EXPERIENCE_BY_ID: Record<string, MajorExperienceConfig> = Object.fromEntries(
  MAJOR_EXPERIENCES.map((major) => [major.id, major]),
);

export const FORMAL_MAJOR_EXPERIENCES = MAJOR_EXPERIENCES.filter(
  (major) => major.entryType === "game",
);

export function getMajorExperienceConfig(majorId: string | null | undefined) {
  return majorId ? MAJOR_EXPERIENCE_BY_ID[majorId] ?? null : null;
}

export function canEnterMajorGame(majorId: string | null | undefined) {
  const config = getMajorExperienceConfig(majorId);
  return config?.entryType === "game" && config.availability === "available";
}

export function majorEntryPath(majorId: string) {
  const config = getMajorExperienceConfig(majorId);
  if (!config) return "/major";
  if (config.entryType === "community_vote") return "/next-major-vote";
  if (config.availability === "unavailable") return `/major-preview/${config.id}`;
  return "/intro";
}
