// 分类/emoji 展示映射：从 majors.json 的 category / id 映射到 UI 展示。

const MAJOR_EMOJI: Record<string, string> = {
  computer_science: "💻",
  artificial_intelligence: "🤖",
  clinical_medicine: "🩺",
  finance: "",
  accounting: "🧮",
  journalism_communication: "📰",
  electrical_engineering: "⚡",
  english: "🌐",
  teacher_education: "🍎",
  chinese_language_literature: "📜",
  architecture: "🏛️",
  stomatology: "🦷",
  psychology: "🧠",
  civil_engineering: "🏗️",
  electronic_information: "🔌",
  design: "🎨",
  nursing: "💉",
  mechanical_engineering: "⚙️",
  business_administration: "💼",
  pharmacy: "💊",
};

export function majorEmoji(id: string): string {
  return MAJOR_EMOJI[id] ?? "🎓";
}

/** 后端类别 → 展示大类 */
export const CATEGORY_DISPLAY: Record<string, string> = {
  文法人文池: "人文",
  文理交叉池: "文理",
  工科信息池: "工科",
  工科制造池: "工科",
  工科建造池: "工科",
  医学健康池: "医学",
  商科管理池: "经管",
  教育稳定池: "教育",
  设计建造池: "艺术",
};

export function displayCategory(raw: string): string {
  return CATEGORY_DISPLAY[raw] ?? raw;
}

export const CATEGORY_TINT: Record<string, string> = {
  人文: "var(--tan)",
  文理: "var(--sky)",
  工科: "var(--sunny)",
  医学: "var(--cherry)",
  经管: "#f4b860",
  教育: "#b7d8a3",
  艺术: "#e59fd0",
};

export function categoryTint(raw: string): string {
  return CATEGORY_TINT[displayCategory(raw)] ?? "var(--sky)";
}
