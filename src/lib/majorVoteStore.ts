export interface MajorVoteOption {
  id: string;
  name: string;
  teaser: string;
  enabled: boolean;
}

export interface MajorVoteResults {
  status: "not_public";
  message: string;
}

export interface MajorVoteSelection extends MajorVoteOption {
  custom: boolean;
}

const VOTE_STORAGE_KEY = "nextMajorVote";

export const MAJOR_VOTE_OPTIONS: MajorVoteOption[] = [
  {
    id: "electrical_engineering",
    name: "电气工程及其自动化",
    teaser: "电路、电机、电网和实验报告，看看你能不能从高数一路送电到毕业。",
    enabled: true,
  },
  {
    id: "psychology",
    name: "心理学",
    teaser: "你以为是分析别人，入学后发现统计学先开始分析你。",
    enabled: true,
  },
  {
    id: "artificial_intelligence",
    name: "人工智能",
    teaser: "模型还没训练好，显存、数据和截止日期已经开始争夺你的注意力。",
    enabled: true,
  },
  {
    id: "english",
    name: "英语",
    teaser: "别人以为你天天追英美剧，你正在语言学、文学和专八之间来回切换。",
    enabled: true,
  },
  {
    id: "finance",
    name: "金融学",
    teaser: "入学时想看懂市场，大二开始先努力看懂高等数学和资产负债表。",
    enabled: true,
  },
  {
    id: "journalism_communication",
    name: "新闻传播学",
    teaser: "热点五分钟换一个，选题、拍摄、剪辑和甲方修改意见永远同时到达。",
    enabled: true,
  },
];

export function getCurrentVote(): MajorVoteSelection | null {
  if (typeof window === "undefined") return null;
  const stored = window.localStorage.getItem(VOTE_STORAGE_KEY);
  if (!stored) return null;

  const legacyOption = MAJOR_VOTE_OPTIONS.find((option) => option.id === stored);
  if (legacyOption) return { ...legacyOption, custom: false };

  try {
    const parsed = JSON.parse(stored) as Partial<MajorVoteSelection>;
    if (parsed.custom && typeof parsed.name === "string") {
      const name = normalizeCustomMajorName(parsed.name);
      if (name.length >= 2) {
        return {
          id: "custom",
          name,
          teaser: "这个专业已加入你的下一轮提名。",
          enabled: true,
          custom: true,
        };
      }
    }

    const option = MAJOR_VOTE_OPTIONS.find((candidate) => candidate.id === parsed.id);
    return option ? { ...option, custom: false } : null;
  } catch {
    return null;
  }
}

export function submitVote(majorId: string) {
  const option = MAJOR_VOTE_OPTIONS.find((candidate) => candidate.id === majorId && candidate.enabled);
  if (!option) throw new Error(`unknown or disabled vote option: ${majorId}`);
  const selection = { ...option, custom: false };
  storeVote(selection);
  return selection;
}

export function submitCustomVote(rawName: string) {
  const name = normalizeCustomMajorName(rawName);
  if (name.length < 2 || name.length > 30) {
    throw new Error("专业名称需要填写 2–30 个字符");
  }
  const selection: MajorVoteSelection = {
    id: "custom",
    name,
    teaser: "这个专业已加入你的下一轮提名。",
    enabled: true,
    custom: true,
  };
  storeVote(selection);
  return selection;
}

export function getVoteResults(): MajorVoteResults {
  return {
    status: "not_public",
    message: "目前只记录你自己的选择，不展示没有真实数据来源的排名。",
  };
}

function storeVote(selection: MajorVoteSelection) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(VOTE_STORAGE_KEY, JSON.stringify(selection));
  }
}

function normalizeCustomMajorName(value: string) {
  return value.trim().replace(/\s+/g, " ");
}
