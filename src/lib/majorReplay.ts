import type {
  BehaviorVector,
  EmergingPortraitResult,
  LegacyExperienceSelection,
  NextLifeIntent,
  PreviousRunSummary,
  ReplayRecommendation,
  ReplayRunContext,
} from "./replaySystem";

type ReplayState = {
  majorId: string;
  semesterIdx: number;
  hiddenStats: Record<string, number>;
  routeScores?: Record<string, number>;
  flags: string[];
  seenEvents: string[];
  history?: Array<{
    eventId?: string;
    choiceId?: string;
    title: string;
    choice: string;
    feedback: string;
  }>;
  specialExperiences?: string[];
  replayContext?: ReplayRunContext | null;
  shownPortraitIds?: string[];
};

type ReplayChoice = {
  id?: string;
  text?: string;
  feedback?: string;
  replayTags?: string[];
  replayRouteId?: string;
  effects?: Record<string, unknown>;
};

type ReplayEvent = {
  id: string;
  title?: string;
  description?: string;
  type?: string;
  tags?: string[];
  options?: ReplayChoice[];
  choices?: ReplayChoice[];
  [key: string]: unknown;
};

type RouteConfig = {
  id: string;
  title: string;
  action: string;
  tags: string[];
};

type MajorConfig = {
  routes: RouteConfig[];
  opposite: Record<string, string>;
  legacies: Array<LegacyExperienceSelection & { routeIds: string[] }>;
  firstEventPrefix: string;
  opening: Record<string, { title: string; description: string; option: string; feedback: string }>;
  portraitNouns: Record<string, [string, string, string]>;
};

export const REPLAY_MAJOR_IDS = [
  "law",
  "computer_science",
  "clinical_medicine",
  "chinese_language_literature",
  "accounting",
] as const;

export function supportsMajorReplay(majorId: string) {
  return REPLAY_MAJOR_IDS.includes(majorId as (typeof REPLAY_MAJOR_IDS)[number]);
}

const CONFIGS: Record<string, MajorConfig> = {
  computer_science: {
    routes: [
      route("algorithm", "算法竞赛线", "下一把，真把这道题调通", ["depth", "persistence"]),
      route("project", "项目开发线", "下一把，先让项目真的能交", ["delivery", "responsibility"]),
      route("job", "大厂实习就业线", "下一把，别等大三才写简历", ["planning", "career"]),
      route("lab", "考研实验室线", "下一把，去问这段代码为什么", ["depth", "academic"]),
      route("product", "产品技术混合线", "下一把，先问需求到底是什么", ["communication", "boundary"]),
      route("opensource", "开源贡献隐藏线", "下一把，把第一条 PR 发出去", ["exploration", "documentation"]),
      route("survival", "面向搜索引擎生存线", "下一把，少装一个新框架", ["boundary", "stability"]),
    ],
    opposite: { algorithm: "product", project: "lab", job: "opensource", lab: "project", product: "algorithm", opensource: "job", survival: "algorithm" },
    legacies: [
      legacy("cs_error_first", "会往上翻第一处报错", "终端最后一行通常只负责吓人，真正出事的位置可能在上面。", ["algorithm", "lab"]),
      legacy("cs_local_warning", "听得懂“我本地能跑”", "这句话出现时，你会先问版本、环境和没提交的配置文件。", ["project", "survival"]),
      legacy("cs_git_smell", "认得出冲突前兆", "有人说“我就改了一点”时，你已经准备先拉分支再看。", ["project", "opensource"]),
      legacy("cs_requirement_moves", "知道需求还会改", "按钮颜色只是开场，第二天很可能连用户是谁都换了。", ["product"]),
      legacy("cs_resume_gap", "见过简历空白期", "你知道项目名写上去不算结束，还得讲清自己到底做了哪一块。", ["job"]),
      legacy("cs_docs_before_clone", "克隆前先看 README", "少敲十分钟命令，有时能少装两个小时环境。", ["opensource", "lab"]),
    ],
    firstEventPrefix: "computer_science_",
    opening: {
      algorithm: opening("开机第一周，OJ 已经给你判了三种错", "上一局你到期末才学会看报错。这次同一道题同时送来 WA、TLE 和一位说“很简单”的室友。", "先造最小样例，看它到底错在哪一步", "你没有重写整份代码。第三个样例终于暴露了那个少写的等号。"),
      project: opening("第一次小组作业，群里已经出现“我本地能跑”", "仓库还没建，四个人的环境已经各自稳定。有人发来压缩包 final2，没人知道数据库在哪。", "先建仓库和启动说明，再分功能", "群里少了一点开工气势，多了一份今晚真的能照着跑的 README。"),
      job: opening("大一新生群突然开始交换大厂路线图", "有人收藏了八十道题，有人已经把“精通”写进简历。你上一局直到大三才发现项目经历不能靠收藏夹生成。", "先做一个能讲清楚的小项目，不抄岗位黑话", "简历仍然很空，但第一行开始有了能被追问的东西。"),
      lab: opening("老师发来第一份读不懂的代码和一句“先跑起来”", "依赖停更、数据缺失、说明只有三行。上一局你把跑不起来当成自己不适合科研。", "先列出缺什么，再带着具体问题去问", "老师没替你修环境，却终于回答了一个能继续往下走的问题。"),
      product: opening("需求会第一分钟，大家已经在争按钮放左还是放右", "用户是谁没人确定，截止日期倒是非常确定。上一局你写完才知道做的不是对方要的。", "先问谁会用、哪一步最痛，再谈页面", "会议安静了两秒。按钮还没画，返工范围先缩小了一半。"),
      opensource: opening("你盯上一条标着 good first issue 的开源问题", "评论区已经有六个人认领，文档还假设你天生会配环境。上一局你收藏了仓库，从没点过提交。", "先复现问题，补一条别人也能照做的记录", "代码还没改，你的复现步骤先被维护者点了赞。"),
      survival: opening("第一周，六门课都说“作业不多”", "每门只有一次大作业，恰好全在同一个周末。上一局你靠通宵证明自己还能开机。", "先选一门认真做，其余按能交付的范围来", "你少学了两个刚火的框架，也第一次没在凌晨重装系统。"),
    },
    portraitNouns: {
      depth: ["报错第一行追踪员", "断点常驻人口", "根因不找到不关机的人"],
      delivery: ["先跑起来派", "演示日前交付者", "能把半成品送上台的人"],
      boundary: ["需求确认新手", "范围冻结尝试者", "“这版不加了”执行官"],
      responsibility: ["仓库补位员", "主分支夜班保安", "全组默认合并负责人"],
      exploration: ["README 翻页者", "陌生仓库试住户", "开源入口常驻用户"],
    },
  },
  clinical_medicine: {
    routes: [
      route("diagnosis", "诊断推理线", "下一把，先把时间线问全", ["reasoning", "care"]),
      route("surgery", "操作实践线", "下一把，承认不会再上手", ["practice", "responsibility"]),
      route("research", "科研积累线", "下一把，先查原始数据", ["academic", "depth"]),
      route("planning", "升学规划线", "下一把，把轮转和考试放进同一张表", ["planning", "stability"]),
      route("humanities", "医学人文线", "下一把，先听完病人那句话", ["care", "communication"]),
      route("detour", "医学转向隐藏线", "下一把，看看白大褂之外", ["exploration", "boundary"]),
      route("survival", "低耗可靠生存线", "下一把，不拿睡眠冒充责任心", ["boundary", "stability"]),
    ],
    opposite: { diagnosis: "humanities", surgery: "research", research: "surgery", planning: "detour", humanities: "diagnosis", detour: "planning", survival: "surgery" },
    legacies: [
      legacy("clinical_question", "听得懂带教追问", "老师问“还有呢”时，你知道他可能在等鉴别诊断，不是在宣布你不配学医。", ["diagnosis"]),
      legacy("clinical_unknown", "敢把不知道说完整", "不熟的操作先承认，再找人确认，比硬着头皮碰运气更像负责。", ["surgery", "survival"]),
      legacy("clinical_timeline", "先对日期再下结论", "症状、用药和检查不在同一天，病历也不会替你自动排序。", ["diagnosis", "research"]),
      legacy("clinical_collision", "见过轮转撞上考试", "实习表和备考计划各自都很合理，放在同一周就不是。", ["planning"]),
      legacy("clinical_emotion", "认得情绪吸收过量", "听见痛苦和把所有痛苦背回宿舍，是两件事。", ["humanities", "survival"]),
      legacy("clinical_whitecoat", "知道白大褂不是唯一出口", "换方向不等于四年清零，医学训练也可以带去别处。", ["detour"]),
    ],
    firstEventPrefix: "clinical_",
    opening: {
      diagnosis: opening("第一次 PBL，病史每个人记得都不一样", "主诉写三天，家属说一周，检验单上的日期又更早。上一局你急着猜病名，把时间线留给了运气。", "先把症状、用药和检查按日期排开", "病名还没出现，三个互相打架的说法先被你找了出来。"),
      surgery: opening("技能课轮到你上手，旁边已经排了十二个人", "你只看过老师演示一次，后面的同学都在等。上一局你最怕说不会，于是手和脑子一起发抖。", "先说哪一步不确定，请老师再看一次", "队伍多等了一分钟，你少把一次练习演成一次硬撑。"),
      research: opening("师兄把表格发来：数据基本齐了", "基本齐的意思是三列空白、两个口径和一张不知道谁改过的总表。", "先核变量定义和缺失值，不急着跑结果", "漂亮图晚了一天，返工少了一整周。"),
      planning: opening("培养办发来轮转表，考试群同时开始倒计时", "两张表单独看都排得下，叠在一起有三周完全重合。", "先标冲突，再决定哪件事需要提前", "焦虑没有消失，但它第一次有了日期和负责人。"),
      humanities: opening("问诊练习里，标准问题问完了，病人还没说完", "计时器在走，同学等着换人。上一局你把完整流程做完，却漏掉了对方最想说的那句。", "停十秒，让他把那句话说完", "你少问了一个标准问题，听见了他为什么一直不肯吃药。"),
      detour: opening("第一次穿白大褂，你先注意到自己并没有想象中激动", "同学在拍照，家里在等朋友圈。你上一局把迟疑压到毕业前才敢承认。", "先记下这种感觉，也去看看医学之外的课程", "白大褂照样穿上了，另一扇门也没有被你假装不存在。"),
      survival: opening("第一周，大家开始比赛谁昨晚睡得更少", "凌晨两点被说成努力，早上清醒反而像没投入。上一局你用电量证明责任心，最后谁都没照顾好。", "今晚按时睡，明天把不会的列出来问", "你少背了二十页，第二天第一次听清老师到底问了什么。"),
    },
    portraitNouns: {
      reasoning: ["病史排序员", "鉴别诊断列单者", "先问证据再报病名的人"],
      care: ["多听十秒的人", "情绪接收站", "会关心也会留边界的人"],
      practice: ["操作台候补", "步骤复核者", "敢承认不会的可靠上手者"],
      planning: ["轮转表对齐员", "冲突日期标记者", "把五年摊进日历的人"],
      boundary: ["睡眠保留试验者", "低电量止损员", "不拿透支冒充敬业的人"],
    },
  },
  chinese_language_literature: {
    routes: [
      route("research", "文学研究保研线", "下一把，把题目缩到能写完", ["depth", "academic"]),
      route("teacher", "师范教资考编线", "下一把，试讲别把一节课塞进十分钟", ["communication", "planning"]),
      route("civil", "考公考编稳定线", "下一把，先查专业代码认不认", ["planning", "stability"]),
      route("editor", "出版编辑内容线", "下一把，改稿先问谁负责终版", ["editing", "responsibility"]),
      route("writing", "写作创作隐藏线", "下一把，先把第一版写完", ["expression", "exploration"]),
      route("media", "新媒体与表达线", "下一把，别把标题改到不像人话", ["expression", "delivery"]),
      route("survival", "中文系万金油生存线", "下一把，不让每份热爱都变作业", ["boundary", "stability"]),
    ],
    opposite: { research: "media", teacher: "writing", civil: "writing", editor: "research", writing: "civil", media: "research", survival: "writing" },
    legacies: [
      legacy("chinese_topic", "见过题目大到写不完", "“论中国文学”看起来很有气势，真正落笔时只剩一个空白文档。", ["research"]),
      legacy("chinese_version", "认得出第八版前兆", "一句“再顺一下”可能只改两句，也可能让全文重新长一遍。", ["editor", "media"]),
      legacy("chinese_trial", "知道十分钟装不下一生", "试讲不是把一章内容加速朗读，删掉也是教学。", ["teacher"]),
      legacy("chinese_code", "先看岗位专业代码", "“不限专业”下面的备注栏，往往还有第二套世界观。", ["civil"]),
      legacy("chinese_reading", "知道阅读不必每次交作业", "不是每本喜欢的书都要立刻产出观点、论文和朋友圈。", ["writing", "survival"]),
      legacy("chinese_copy", "知道会写不等于全都你写", "主笔、校对、排版和收尾，本来可以是四个岗位。", ["media", "editor"]),
    ],
    firstEventPrefix: "chinese_",
    opening: {
      research: opening("第一次论文选题，你写下“论中国文学中的女性”", "老师看了三秒：很好，再小一点。上一局你到第八版才懂，宏大不是深刻，常常只是写不完。", "缩到一篇作品里的一个具体问题", "题目没那么像学术巨著了，正文却第一次知道从哪开始。"),
      teacher: opening("第一次十分钟试讲，你准备了二十八页 PPT", "导入、作者生平、时代背景、文本分析和升华一个不少。上一局你讲到下课，还没进入正文。", "只留一个目标，其他内容忍痛删掉", "PPT 瘦了二十页，台下的人终于知道这十分钟要听懂什么。"),
      civil: opening("就业群发来一张“汉语言可报岗位大全”", "标题写着大全，点开后地区、应届和专业代码各删掉一半。", "先按真实条件筛一遍，再决定要不要备考", "表格从八百行变成十七行。梦想小了一点，入口真实了很多。"),
      editor: opening("社团推文发来四份“最终版”", "文件名分别是 final、final2、真的final 和用这个。上一局你默默合完，所有人都以为自己交得很规范。", "先定唯一终版和修改负责人，再开始合", "群里安静了十秒，版本第一次没有继续繁殖。"),
      writing: opening("写作课要求交一篇你真正想写的东西", "光标闪了二十分钟。你读过太多好句子，轮到自己写时，每一句都先被内心编辑删掉。", "先写完一个不好看的第一版", "它不高级，也不完整，但文档终于不再只有标题。"),
      media: opening("校园号让你把一篇三千字讲座稿改成爆款", "要求是年轻、走心、有深度，还不能改原意。上一局你把标题磨到凌晨，阅读量仍然很有边界。", "先抓一个人话冲突，不堆热词", "标题没喊时代青年，点开的人反而看懂了这场讲座在吵什么。"),
      survival: opening("老师布置自由阅读，你的快乐立刻开始计学分", "喜欢的小说旁边多了批注、汇报和三千字心得。上一局你毕业后半年都不想再打开书。", "留一本只读不汇报的书", "你少积累了一份可展示成果，保住了一点阅读还属于自己的感觉。"),
    },
    portraitNouns: {
      depth: ["问题缩小练习生", "脚注增殖观察员", "终于写得完的人"],
      expression: ["第一版幸存者", "删掉高级词的人", "把人话放回文字的人"],
      editing: ["错字雷达", "版本命名纠察员", "终版真正负责人"],
      planning: ["出口表浏览者", "岗位条件筛选员", "先看代码再心动的人"],
      boundary: ["快乐阅读保留者", "不把热爱全交作业的人", "文字劳动边界守门员"],
    },
  },
  accounting: {
    routes: [
      route("audit", "会计师事务所审计线", "下一把，资料不齐就写不齐", ["evidence", "responsibility"]),
      route("enterprise", "企业财务实务线", "下一把，缺签字不靠意念补", ["delivery", "boundary"]),
      route("cpa", "CPA考证与深造线", "下一把，少报一科真学完", ["planning", "depth"]),
      route("tax", "税务与合规线", "下一把，把“应该可以”补全前提", ["evidence", "risk"]),
      route("analysis", "财务分析与管理会计线", "下一把，先解释钱卡在哪", ["reasoning", "communication"]),
      route("civil", "考公考编稳定线", "下一把，先看岗位认不认会计", ["planning", "stability"]),
      route("survival", "数字万金油生存线", "下一把，不再默认收总表", ["boundary", "stability"]),
    ],
    opposite: { audit: "analysis", enterprise: "cpa", cpa: "enterprise", tax: "analysis", analysis: "tax", civil: "audit", survival: "cpa" },
    legacies: [
      legacy("accounting_formula", "会检查公式有没有少拖一行", "总数很自信不代表范围完整，最后一行尤其擅长独自生活。", ["enterprise", "analysis"]),
      legacy("accounting_materials", "听得懂“资料基本齐了”", "基本齐通常还差合同、签字、原件，以及一个愿意回消息的人。", ["audit", "tax"]),
      legacy("accounting_note", "会把风险写进备注", "口头说应该可以时，你知道该补上资料和口径前提。", ["tax"]),
      legacy("accounting_total", "知道总表最后会等谁", "四个人都完成自己的部分，不代表它们来自同一个世界。", ["enterprise", "survival"]),
      legacy("accounting_cent", "见过一分钱不肯消失", "差额小不等于原因小，它可能只是一个被复制了两百行的公式。", ["audit", "analysis"]),
      legacy("accounting_plan", "见过四科全过计划", "收藏四门网课很快，真的学完一门需要另一种勇气。", ["cpa", "civil"]),
    ],
    firstEventPrefix: "accounting_",
    opening: {
      audit: opening("第一份盘点表，仓库说“差不多都在”", "表上有，货架没有；货架有，标签又不是这个名字。上一局你先把差异调平，后来才发现调掉的是问题。", "先记录差异和证据，不替仓库解释", "表暂时没平，问题却第一次没有被你的公式吃掉。"),
      enterprise: opening("月末第一天，业务拿来一张没签字的报销单", "他说领导知道、下午补、以前都这么过。上一局你先帮忙入账，下午一直没有来。", "先挂起，签字到了再过", "对方觉得你不够灵活。傍晚签字真的来了，这次不是靠记忆补的。"),
      cpa: opening("开学第一周，你的 CPA 计划已经排满四科", "网课、教材和经验帖全部到位，只有一天仍然只有二十四小时。", "先选一科，排到能执行完", "计划表不再壮观，第一章却真的看完了。"),
      tax: opening("亲戚问你：这样开票应该没问题吧", "合同没看、业务没说、付款也没发生，问题已经要求你回答“能”或“不能”。", "先问交易到底怎么发生，再说判断", "家庭群嫌你问题多，但一句应该可以终于没有凭空出生。"),
      analysis: opening("第一张利润表很好看，现金却没回来", "老师问为什么。上一局你加了三种颜色，没有一个颜色能解释钱在哪。", "去看应收和库存，不先换图表模板", "图少了一张，答案多了两笔没回款和一仓库没卖掉的货。"),
      civil: opening("岗位群发来“会计学上岸友好岗”", "名字很友好，专业代码、应届限制和户籍条件各有自己的意见。", "先筛条件，再收藏经验帖", "收藏夹少了很多励志故事，报名表多了两个真的能选的岗位。"),
      survival: opening("小组作业收表，四个人发来四个最终版", "列名、日期格式和合计范围没有一项相同。上一局你默默收完，组员以为表格会自动长成总表。", "退回去统一模板，每个人对自己的明细负责", "群里沉默了十五秒。你没立刻成为默认收尾人。"),
    },
    portraitNouns: {
      evidence: ["原件索要者", "日期对质员", "每个数字都要回到出处的人"],
      responsibility: ["差额接收者", "底稿收尾人", "全组默认总表负责人"],
      planning: ["考试计划收藏者", "科目删减执行者", "真的学完一科的人"],
      boundary: ["补签等待者", "总表退回练习生", "不替所有人关账的人"],
      reasoning: ["合计行观察员", "现金去向追踪者", "能解释数字为什么变的人"],
    },
  },
};

export const MAJOR_PORTRAIT_CHECKPOINTS: Record<string, number[]> = {
  computer_science: [2, 4, 6],
  clinical_medicine: [2, 5, 8],
  chinese_language_literature: [2, 4, 6],
  accounting: [2, 4, 6],
};

export function createMajorReplayContext(
  intent: NextLifeIntent,
  previousRun: PreviousRunSummary,
  legacyExperience: LegacyExperienceSelection,
): ReplayRunContext {
  return {
    intent,
    previousRun,
    legacyExperience,
    shownPortraitIds: [],
    pendingPortraits: [],
    behaviorCounts: {},
    recentBehaviorTags: [],
    openingNovelCount: 0,
    completedEventCount: 0,
  };
}

export function deriveMajorReplayRecommendations(
  state: ReplayState,
  currentRouteId: string,
  _currentPersonaId: string,
  priorRuns: PreviousRunSummary[],
): [ReplayRecommendation, ReplayRecommendation] {
  const config = CONFIGS[state.majorId];
  if (!config) throw new Error(`Replay config missing for ${state.majorId}`);
  const alternatives = config.routes.filter((item) => item.id !== currentRouteId);
  const recent = new Set(priorRuns.slice(-2).map((run) => run.routeId));
  const near = [...alternatives].sort((a, b) =>
    Number(state.routeScores?.[b.id] ?? 0) - Number(state.routeScores?.[a.id] ?? 0)
    + (recent.has(a.id) ? 12 : 0) - (recent.has(b.id) ? 12 : 0))[0];
  const oppositeId = config.opposite[currentRouteId];
  const opposite = alternatives.find((item) => item.id === oppositeId)
    ?? alternatives.find((item) => item.id !== near.id)
    ?? alternatives[0];
  const history = state.history ?? [];
  const fork = [...history].find((item) => item.eventId && !item.eventId.includes("hidden")) ?? history[0];
  return [
    makeRecommendation("near_miss", near, fork
      ? `在“${fork.title}”里，你选择了“${fork.choice}”。当时如果把更多时间留给另一项，你可能就会走向这里。`
      : "你离这条路并不远，只是几次关键选择里，把时间留给了别的事情。"),
    makeRecommendation("opposite", opposite, `上一局你把最多力气用在“${config.routes.find((item) => item.id === currentRouteId)?.title ?? currentRouteId}”。这一把会故意奖励另一种处理问题的方式。`),
  ];

  function makeRecommendation(
    targetType: "near_miss" | "opposite",
    target: RouteConfig,
    explanation: string,
  ): ReplayRecommendation {
    return {
      targetType,
      routeId: target.id,
      routeTitle: target.title,
      heading: targetType === "near_miss" ? "你差点活成的那个人" : "和你完全相反的那个人",
      explanation,
      actionLabel: target.action,
      targetBehaviorTags: target.tags,
      legacyExperience: config.legacies.find((item) => item.routeIds.includes(target.id)) ?? config.legacies[0],
    };
  }
}

export function createMajorNextLifeIntent(
  majorId: string,
  recommendation: ReplayRecommendation,
  sourceRun: PreviousRunSummary,
): NextLifeIntent {
  return {
    majorId,
    sourceRunId: sourceRun.runId,
    targetType: recommendation.targetType,
    targetRouteId: recommendation.routeId,
    targetBehaviorTags: recommendation.targetBehaviorTags,
    sourceMemoryIds: sourceRun.keyMemoryIds,
    selectedAt: Date.now(),
  };
}

export function buildMajorPreviousRunSummary(
  state: ReplayState,
  routeId: string,
  personaId: string,
): PreviousRunSummary {
  const chronological = [...(state.history ?? [])].reverse();
  const choicesByEvent: PreviousRunSummary["choicesByEvent"] = {};
  for (const item of chronological) {
    if (!item.eventId) continue;
    choicesByEvent[item.eventId] = {
      optionId: item.choiceId ?? "",
      optionText: item.choice,
      outcome: item.feedback,
    };
  }
  return {
    runId: `${state.majorId}-${Date.now()}-${simpleHash(chronological.map((item) => `${item.eventId}:${item.choiceId}`).join("|"))}`,
    majorId: state.majorId,
    openingEventIds: chronological.flatMap((item) => item.eventId ? [item.eventId] : []).slice(0, 3),
    seenEventIds: [...state.seenEvents],
    selectedOptionIds: chronological.map((item) => `${item.eventId}:${item.choiceId}`),
    choicesByEvent,
    routeId,
    personaId,
    keyMemoryIds: [...new Set([...state.flags, ...(state.specialExperiences ?? [])])].slice(-20),
    routeScores: { ...(state.routeScores ?? {}) },
    behaviorVector: behaviorVector(state),
    completedAt: Date.now(),
  };
}

export function recordMajorReplayChoice(state: ReplayState, choice: ReplayChoice) {
  const context = state.replayContext;
  if (!context) return;
  const tags = Array.isArray(choice?.replayTags) ? choice.replayTags : inferTags(choice?.text ?? "");
  for (const tag of tags) context.behaviorCounts[tag] = Number(context.behaviorCounts[tag] ?? 0) + 1;
  context.recentBehaviorTags = [...context.recentBehaviorTags, ...tags].slice(-8);
  context.completedEventCount += 1;
  if (choice?.replayRouteId) {
    state.routeScores ??= {};
    state.routeScores[choice.replayRouteId] = Number(state.routeScores[choice.replayRouteId] ?? 0) + 6;
  }
}

export function decorateMajorReplayEvent(state: ReplayState, event: ReplayEvent | null | undefined) {
  const context = state.replayContext;
  const config = CONFIGS[state.majorId];
  if (!context || !config || !event) return event;
  const previous = context.previousRun.choicesByEvent[event.id];
  const isOpening = context.completedEventCount === 0 && event.id.startsWith(config.firstEventPrefix);
  const openingCopy = config.opening[context.intent.targetRouteId] ?? Object.values(config.opening)[0];
  const options = [...(event.options ?? event.choices ?? [])];
  if (isOpening && !options.some((item) => item.id === `replay_${context.intent.targetRouteId}`)) {
    options.push({
      id: `replay_${context.intent.targetRouteId}`,
      text: openingCopy.option,
      feedback: openingCopy.feedback,
      effects: { stats: { energy: -3 } },
      replayTags: context.intent.targetBehaviorTags,
      replayRouteId: context.intent.targetRouteId,
    });
  }
  return {
    ...event,
    title: isOpening ? openingCopy.title : event.title,
    description: isOpening ? openingCopy.description : event.description,
    tags: isOpening ? [...new Set([...(event.tags ?? []), "二周目开局"])] : event.tags,
    previousChoiceHint: previous
      ? { previousOptionText: previous.optionText, previousOutcomeSummary: previous.outcome }
      : null,
    legacyExperienceHint: legacyHint(context.legacyExperience, event, isOpening),
    isNewVariant: isOpening,
    hasNewIntentOption: isOpening,
    options,
    choices: options,
  };
}

export function deriveMajorPortraits(state: ReplayState, checkpoint: number): EmergingPortraitResult[] {
  const config = CONFIGS[state.majorId];
  if (!config) return [];
  const counts = state.replayContext?.behaviorCounts ?? {};
  const rankedTags = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const targetTag = rankedTags[0]?.[0]
    ?? config.routes.find((item) => item.id === strongestRoute(state))?.tags[0]
    ?? Object.keys(config.portraitNouns)[0];
  const nouns = config.portraitNouns[targetTag] ?? Object.values(config.portraitNouns)[0];
  const stage = checkpoint <= 2 ? 0 : checkpoint <= 5 ? 1 : 2;
  const latest = state.history?.[0];
  return [{
    id: `${state.majorId}_${targetTag}_${stage}`,
    title: nouns[stage],
    description: latest
      ? `你在“${latest.title}”里选择了“${latest.choice}”，这已经不是一次孤立的决定。`
      : "你最近几次都用了相似的方法处理问题。",
    evidenceText: `目前最常出现的选择方式：${targetTag}。这不是最终结论，后面仍然可以改变。`,
  }];
}

function route(id: string, title: string, action: string, tags: string[]): RouteConfig {
  return { id, title, action, tags };
}

function legacy(id: string, title: string, description: string, routeIds: string[]) {
  return { id, title, description, routeIds };
}

function opening(title: string, description: string, option: string, feedback: string) {
  return { title, description, option, feedback };
}

function strongestRoute(state: ReplayState) {
  return Object.entries(state.routeScores ?? {}).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "";
}

function legacyHint(legacyExperience: LegacyExperienceSelection, event: ReplayEvent, isOpening: boolean) {
  if (!isOpening && !/core|main|route/.test(event.id ?? "")) return null;
  return `${legacyExperience.title}：${legacyExperience.description}`;
}

function inferTags(text: string) {
  const tags: string[] = [];
  if (/先问|确认|说清|沟通/.test(text)) tags.push("communication");
  if (/拒绝|不接|只留|范围|按时睡/.test(text)) tags.push("boundary");
  if (/查|证据|日期|原始|报错/.test(text)) tags.push("evidence");
  if (/计划|日期|筛|提前/.test(text)) tags.push("planning");
  if (/写完|交付|先做/.test(text)) tags.push("delivery");
  return tags.length ? tags : ["stability"];
}

function behaviorVector(state: ReplayState): BehaviorVector {
  const hidden = (key: string) => clamp(Number(state.hiddenStats[key] ?? 50));
  const scores = Object.values(state.routeScores ?? {});
  const routePeak = clamp(Math.max(0, ...scores) * 6);
  return {
    expression: hidden("expression"),
    planning: hidden("realityPlanning"),
    riskTaking: clamp(100 - hidden("stablePreference")),
    responsibility: hidden("responsibility"),
    exploration: hidden("technicalCuriosity"),
    stability: hidden("stablePreference"),
    academicDrive: clamp((hidden("academicDrive") + routePeak) / 2),
    boundarySetting: hidden("boundarySense"),
  };
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function simpleHash(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) hash = ((hash << 5) - hash + value.charCodeAt(index)) | 0;
  return Math.abs(hash).toString(36);
}
