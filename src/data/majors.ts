// 专业数据。结构对齐 MajorConfig，方便后续接入真实数据源。
// 说明：所有数值 0-100；tags 用中文标签；iconPath 预留正式素材路径。

export type MajorTag =
  | "热门"
  | "卷度高"
  | "就业向"
  | "烧脑"
  | "兴趣向"
  | "稳定"
  | "慎选"
  | "冷门"
  | "情怀";

export type MajorCategory =
  | "人文"
  | "社科"
  | "理科"
  | "工科"
  | "医学"
  | "商科"
  | "艺术"
  | "教育";

export interface MajorStats {
  interest: number; // 兴趣
  pressure: number; // 压力
  employment: number; // 就业
  salary: number; // 薪资
  growth: number; // 成长
  stability: number; // 稳定
}

export interface MajorConfig {
  id: string;
  name: string;
  emoji: string; // 占位 icon
  iconPath?: string; // 例：/assets/icons/law.png
  category: MajorCategory;
  tags: MajorTag[];
  fit: number; // 适配度 0-100
  stats: MajorStats;
  reasons: string[]; // 推荐理由
  warnings: string[]; // 慎入人群
  endings: string[]; // 可能结局方向
  aftereffects: string[]; // 专业后遗症
  diagnosis: string; // 系统诊断
  pressureLevel: "低" | "中" | "高" | "极高";
  employmentDirection: string[];
}

export const MAJORS: MajorConfig[] = [
  {
    id: "law",
    name: "法学",
    emoji: "⚖️",
    category: "社科",
    tags: ["热门", "卷度高", "慎选"],
    fit: 72,
    stats: { interest: 60, pressure: 85, employment: 55, salary: 70, growth: 75, stability: 60 },
    reasons: ["逻辑思维强", "喜欢辩论和推理", "追求正义感"],
    warnings: ["不喜欢背书", "抗压能力较弱", "对文字工作没耐心"],
    endings: ["法考战士", "红圈律师", "选调生", "转码逃兵"],
    aftereffects: ["法条 PTSD", "开口即引用", "熬夜背书"],
    diagnosis: "看似稳重，实则一路狂奔的马拉松。",
    pressureLevel: "极高",
    employmentDirection: ["律所", "公检法", "公务员", "企业法务"],
  },
  {
    id: "business",
    name: "商科",
    emoji: "💼",
    category: "商科",
    tags: ["热门", "就业向"],
    fit: 68,
    stats: { interest: 55, pressure: 70, employment: 78, salary: 78, growth: 70, stability: 60 },
    reasons: ["善于沟通", "喜欢商业案例", "对数字有感觉"],
    warnings: ["社恐重度患者", "厌恶 PPT", "不爱小组作业"],
    endings: ["咨询打工人", "创业选手", "互联网中层", "考公上岸"],
    aftereffects: ["PPT 焦虑", "满嘴 SWOT", "开会成瘾"],
    diagnosis: "综合能力强，但要小心变成 PPT 工厂。",
    pressureLevel: "高",
    employmentDirection: ["咨询", "投行", "快消", "互联网运营"],
  },
  {
    id: "ai",
    name: "人工智能",
    emoji: "🤖",
    category: "工科",
    tags: ["热门", "卷度高", "烧脑", "就业向"],
    fit: 82,
    stats: { interest: 75, pressure: 88, employment: 85, salary: 92, growth: 90, stability: 55 },
    reasons: ["数学不差", "喜欢新技术", "抗折腾"],
    warnings: ["数学恐惧", "不爱调参", "对论文过敏"],
    endings: ["算法工程师", "大模型玩家", "AI 创业者", "转产品经理"],
    aftereffects: ["debug 到凌晨", "GPU 依赖", "论文焦虑"],
    diagnosis: "站在风口上，但风大也容易吹感冒。",
    pressureLevel: "极高",
    employmentDirection: ["大厂算法", "AI 创业", "研究院", "读博"],
  },
  {
    id: "cs",
    name: "计算机 / 软件工程",
    emoji: "💻",
    category: "工科",
    tags: ["热门", "卷度高", "就业向"],
    fit: 80,
    stats: { interest: 72, pressure: 82, employment: 88, salary: 88, growth: 82, stability: 60 },
    reasons: ["逻辑清晰", "自学能力强", "抗坐"],
    warnings: ["讨厌数学", "受不了长期加班", "眼睛不好"],
    endings: ["后端工程师", "全栈开发", "开源作者", "润出去"],
    aftereffects: ["颈椎警告", "咖啡依赖", "GitHub 上瘾"],
    diagnosis: "就业香，但发际线要看运气。",
    pressureLevel: "高",
    employmentDirection: ["互联网", "外企", "开源", "海外"],
  },
  {
    id: "ee",
    name: "电气工程",
    emoji: "⚡",
    category: "工科",
    tags: ["稳定", "就业向", "烧脑"],
    fit: 70,
    stats: { interest: 55, pressure: 70, employment: 82, salary: 72, growth: 65, stability: 88 },
    reasons: ["动手能力强", "追求稳定", "对电感兴趣"],
    warnings: ["讨厌实验课", "怕出差", "对国企体制不适应"],
    endings: ["电网人", "芯片工程师", "研究院研究员", "考公"],
    aftereffects: ["电路图 PTSD", "早八常态", "工装依赖"],
    diagnosis: "国之重器，铁饭碗预定。",
    pressureLevel: "中",
    employmentDirection: ["国家电网", "两桶油", "芯片", "研究院"],
  },
  {
    id: "medicine",
    name: "临床医学",
    emoji: "🩺",
    category: "医学",
    tags: ["慎选", "卷度高", "稳定", "情怀"],
    fit: 65,
    stats: { interest: 70, pressure: 95, employment: 75, salary: 60, growth: 85, stability: 80 },
    reasons: ["有救人志向", "记忆力强", "耐得住寂寞"],
    warnings: ["晕血", "不能熬夜", "接受不了 5+3+3"],
    endings: ["规培医生", "三甲主治", "转医美", "改行考公"],
    aftereffects: ["值班脸", "咖啡依赖", "见血冷静"],
    diagnosis: "情怀支撑的长征，回报期比别人晚十年。",
    pressureLevel: "极高",
    employmentDirection: ["三甲医院", "基层医院", "医药", "考研"],
  },
  {
    id: "chinese",
    name: "汉语言文学",
    emoji: "📚",
    category: "人文",
    tags: ["兴趣向", "冷门", "稳定"],
    fit: 66,
    stats: { interest: 82, pressure: 45, employment: 55, salary: 50, growth: 60, stability: 72 },
    reasons: ["爱看书", "文字功底强", "喜欢思考"],
    warnings: ["讨厌背古文", "希望高薪就业", "不爱写作"],
    endings: ["中学老师", "编辑", "自由撰稿人", "考公"],
    aftereffects: ["咬文嚼字", "买书成瘾", "文艺青年"],
    diagnosis: "灵魂丰盈，钱包精瘦。",
    pressureLevel: "低",
    employmentDirection: ["教育", "出版", "文案", "公务员"],
  },
  {
    id: "journalism",
    name: "新闻传播",
    emoji: "📰",
    category: "人文",
    tags: ["热门", "慎选"],
    fit: 62,
    stats: { interest: 70, pressure: 65, employment: 55, salary: 55, growth: 68, stability: 45 },
    reasons: ["爱表达", "关注社会议题", "喜欢内容创作"],
    warnings: ["社恐", "不爱出差", "文字慢工"],
    endings: ["新媒体运营", "记者", "MCN 编导", "自媒体"],
    aftereffects: ["选题焦虑", "deadline 依赖", "文字洁癖"],
    diagnosis: "行业震荡，但会讲故事的人永远有位置。",
    pressureLevel: "中",
    employmentDirection: ["媒体", "互联网内容", "公关", "自媒体"],
  },
  {
    id: "english",
    name: "英语",
    emoji: "🌐",
    category: "人文",
    tags: ["稳定", "冷门"],
    fit: 60,
    stats: { interest: 58, pressure: 50, employment: 52, salary: 52, growth: 55, stability: 65 },
    reasons: ["语感好", "喜欢跨文化交流", "考试型选手"],
    warnings: ["只爱语言不爱文学", "希望硬技能", "对 AI 翻译焦虑"],
    endings: ["中学老师", "翻译", "外贸", "跨专业考研"],
    aftereffects: ["中英夹杂", "语法警察", "口音焦虑"],
    diagnosis: "工具属性强，需搭配第二技能。",
    pressureLevel: "低",
    employmentDirection: ["教育", "翻译", "外贸", "外企"],
  },
  {
    id: "psy",
    name: "心理学",
    emoji: "🧠",
    category: "社科",
    tags: ["兴趣向", "慎选"],
    fit: 64,
    stats: { interest: 78, pressure: 55, employment: 50, salary: 50, growth: 65, stability: 55 },
    reasons: ["想理解人心", "共情能力强", "喜欢科研"],
    warnings: ["以为是读心术", "抗压能力弱", "不爱统计"],
    endings: ["咨询师", "HR", "用户研究", "读博做科研"],
    aftereffects: ["人均分析师", "MBTI 常挂嘴边", "过度共情"],
    diagnosis: "先照顾好自己，再去救别人。",
    pressureLevel: "中",
    employmentDirection: ["咨询", "HR", "用户研究", "科研"],
  },
  {
    id: "arch",
    name: "建筑学",
    emoji: "🏛️",
    category: "工科",
    tags: ["慎选", "卷度高", "情怀"],
    fit: 58,
    stats: { interest: 72, pressure: 90, employment: 45, salary: 55, growth: 68, stability: 40 },
    reasons: ["爱画图", "空间感强", "有理想主义情怀"],
    warnings: ["讨厌通宵", "身体差", "追求稳定就业"],
    endings: ["设计院打工人", "独立建筑师", "转 UI 设计", "考公"],
    aftereffects: ["通宵体质", "手模依赖", "甲方 PTSD"],
    diagnosis: "浪漫职业的浪漫代价。",
    pressureLevel: "极高",
    employmentDirection: ["设计院", "地产", "转行设计", "考公"],
  },
  {
    id: "design",
    name: "设计学",
    emoji: "🎨",
    category: "艺术",
    tags: ["兴趣向", "热门"],
    fit: 70,
    stats: { interest: 82, pressure: 65, employment: 60, salary: 60, growth: 70, stability: 45 },
    reasons: ["审美在线", "创意多", "爱折腾工具"],
    warnings: ["讨厌改稿", "怕被甲方 PUA", "追求稳定"],
    endings: ["UI/UX 设计师", "品牌设计", "独立设计师", "自由职业"],
    aftereffects: ["改稿 PTSD", "Figma 依赖", "字体洁癖"],
    diagnosis: "作品即人品，甲方决定寿命。",
    pressureLevel: "高",
    employmentDirection: ["互联网", "4A", "品牌", "自由职业"],
  },
  {
    id: "edu",
    name: "教育学",
    emoji: "🍎",
    category: "教育",
    tags: ["稳定", "就业向"],
    fit: 68,
    stats: { interest: 62, pressure: 55, employment: 68, salary: 55, growth: 60, stability: 82 },
    reasons: ["喜欢和小孩相处", "追求稳定", "有教书育人理想"],
    warnings: ["讨厌开会", "怕家长", "追求高薪"],
    endings: ["中小学教师", "教研员", "培训机构", "考公"],
    aftereffects: ["职业性微笑", "教师病嗓子", "家长群 PTSD"],
    diagnosis: "编制稳，代价是耐心存款。",
    pressureLevel: "中",
    employmentDirection: ["公立学校", "教研", "培训", "考公"],
  },
  {
    id: "acct",
    name: "会计学",
    emoji: "🧾",
    category: "商科",
    tags: ["稳定", "就业向"],
    fit: 66,
    stats: { interest: 50, pressure: 70, employment: 78, salary: 62, growth: 60, stability: 78 },
    reasons: ["细心", "耐心好", "喜欢考证"],
    warnings: ["讨厌数字", "不爱加班", "追求创意"],
    endings: ["四大审计", "企业财务", "CFO", "考公进税务"],
    aftereffects: ["Excel 手", "加班季崩溃", "考证成瘾"],
    diagnosis: "证越多越贵，命也越薄。",
    pressureLevel: "高",
    employmentDirection: ["四大", "国企财务", "税务局", "投行后台"],
  },
  {
    id: "finance",
    name: "金融学",
    emoji: "💹",
    category: "商科",
    tags: ["热门", "卷度高", "就业向"],
    fit: 72,
    stats: { interest: 65, pressure: 82, employment: 75, salary: 82, growth: 72, stability: 55 },
    reasons: ["数感好", "对市场敏感", "抗压能力强"],
    warnings: ["不爱应酬", "受不了加班", "对绩效敏感"],
    endings: ["投行分析师", "券商研究员", "银行柜员", "考公"],
    aftereffects: ["盘面焦虑", "西装革履", "K 线依赖"],
    diagnosis: "高薪 & 内卷双高的赛道。",
    pressureLevel: "极高",
    employmentDirection: ["投行", "券商", "基金", "银行"],
  },
  {
    id: "bio",
    name: "生物科学",
    emoji: "🧬",
    category: "理科",
    tags: ["慎选", "冷门", "情怀"],
    fit: 55,
    stats: { interest: 78, pressure: 78, employment: 45, salary: 50, growth: 75, stability: 40 },
    reasons: ["热爱生命科学", "耐心做实验", "有读博打算"],
    warnings: ["希望稳定就业", "受不了做实验", "怕青虫"],
    endings: ["实验室打工人", "读博做科研", "转生信/医药", "改行"],
    aftereffects: ["移液枪手", "论文焦虑", "凌晨养细胞"],
    diagnosis: "劝退赛道的祖师爷，但真爱者的乐园。",
    pressureLevel: "高",
    employmentDirection: ["药企", "科研院所", "读博", "跨专业"],
  },
  {
    id: "math",
    name: "数学",
    emoji: "➗",
    category: "理科",
    tags: ["烧脑", "兴趣向"],
    fit: 74,
    stats: { interest: 75, pressure: 80, employment: 68, salary: 72, growth: 82, stability: 60 },
    reasons: ["逻辑强", "耐得住寂寞", "追求本质"],
    warnings: ["讨厌抽象", "希望速成", "追求应用"],
    endings: ["量化研究员", "算法工程师", "科研学者", "教师"],
    aftereffects: ["证明癖", "符号依赖", "对'显然'过敏"],
    diagnosis: "冷门赛道，热门底子。",
    pressureLevel: "高",
    employmentDirection: ["量化", "算法", "科研", "教育"],
  },
  {
    id: "phys",
    name: "物理学",
    emoji: "🪐",
    category: "理科",
    tags: ["烧脑", "冷门", "情怀"],
    fit: 65,
    stats: { interest: 80, pressure: 82, employment: 55, salary: 62, growth: 78, stability: 55 },
    reasons: ["追求真理", "抽象思维强", "爱做实验"],
    warnings: ["就业焦虑", "耐不住科研", "想快速变现"],
    endings: ["高校科研", "半导体工程师", "转码/量化", "教师"],
    aftereffects: ["公式脑", "宇宙焦虑", "对'差不多'零容忍"],
    diagnosis: "宇宙的浪漫，通常需要读到博。",
    pressureLevel: "高",
    employmentDirection: ["科研院所", "半导体", "量化", "教育"],
  },
  {
    id: "history",
    name: "历史学",
    emoji: "📜",
    category: "人文",
    tags: ["冷门", "兴趣向"],
    fit: 60,
    stats: { interest: 78, pressure: 40, employment: 45, salary: 45, growth: 55, stability: 65 },
    reasons: ["热爱阅读", "有考据癖", "喜欢慢生活"],
    warnings: ["追求高薪", "不爱背书", "受不了论文"],
    endings: ["中学老师", "博物馆", "考公", "读博做研究"],
    aftereffects: ["年代顺口溜", "考据癖", "书香呆气"],
    diagnosis: "岁月静好，钱包同样静好。",
    pressureLevel: "低",
    employmentDirection: ["教育", "文博", "公务员", "科研"],
  },
  {
    id: "socio",
    name: "社会学",
    emoji: "🌍",
    category: "社科",
    tags: ["兴趣向", "慎选"],
    fit: 62,
    stats: { interest: 76, pressure: 55, employment: 50, salary: 50, growth: 62, stability: 55 },
    reasons: ["关注社会议题", "喜欢田野", "共情能力强"],
    warnings: ["讨厌调研", "受不了不确定", "追求高薪"],
    endings: ["用户研究", "NGO", "公务员", "读博"],
    aftereffects: ["结构性焦虑", "田野中毒", "解构一切"],
    diagnosis: "看透社会，工作难找。",
    pressureLevel: "中",
    employmentDirection: ["用研", "公务员", "NGO", "科研"],
  },
  {
    id: "phil",
    name: "哲学",
    emoji: "🕯️",
    category: "人文",
    tags: ["冷门", "情怀"],
    fit: 55,
    stats: { interest: 82, pressure: 45, employment: 40, salary: 45, growth: 60, stability: 55 },
    reasons: ["爱思考", "耐读原典", "追求本质"],
    warnings: ["希望快就业", "怕孤独", "受不了空谈"],
    endings: ["高校科研", "考公", "跨专业转行", "自由职业"],
    aftereffects: ["存在主义发作", "深夜精神内耗", "掉书袋"],
    diagnosis: "读的是宇宙，找的工作是宇宙的边角料。",
    pressureLevel: "低",
    employmentDirection: ["科研", "教育", "公务员", "写作"],
  },
];

export const MAJOR_CATEGORIES: MajorCategory[] = [
  "人文", "社科", "理科", "工科", "医学", "商科", "艺术", "教育",
];

export const PRESSURE_LEVELS = ["低", "中", "高", "极高"] as const;

export const EMPLOYMENT_TAGS = [
  "互联网", "国企", "公务员", "科研", "教育", "医疗", "金融", "自由职业",
];

export function getMajorById(id: string): MajorConfig | undefined {
  return MAJORS.find((m) => m.id === id);
}
