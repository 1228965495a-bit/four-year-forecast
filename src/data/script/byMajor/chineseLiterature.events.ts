export type ChineseRouteKey = "research" | "teacher" | "civil" | "editor" | "writing" | "media" | "survival";

export type ChineseImpact = {
  text?: number;
  opportunity?: number;
  traits?: Record<string, number>;
  routes?: Partial<Record<ChineseRouteKey, number>>;
  flags?: string[];
  closes?: ChineseRouteKey[];
  experiences?: string[];
  proof?: string;
};

type ChineseOption = {
  id: string;
  text: string;
  feedback: string;
  effects: { stats: Record<string, number> };
  chinese: ChineseImpact;
};

export type ChineseEvent = {
  id: string;
  eventId: string;
  majorId: "chinese_language_literature";
  semester: string | null;
  type: "main" | "route" | "major_random" | "hidden";
  title: string;
  description: string;
  routeIds: ChineseRouteKey[];
  weight: number;
  options: ChineseOption[];
  choices: ChineseOption[];
};

function o(id: string, text: string, feedback: string, energy: number, chinese: ChineseImpact): ChineseOption {
  return { id, text, feedback, effects: { stats: { energy } }, chinese };
}

function e(
  id: string,
  semester: string | null,
  type: ChineseEvent["type"],
  title: string,
  description: string,
  options: ChineseOption[],
  routeIds: ChineseRouteKey[] = [],
  weight = 10,
): ChineseEvent {
  return { id, eventId: id, majorId: "chinese_language_literature", semester, type, title, description, routeIds, weight, options, choices: options };
}

export const CHINESE_CORE_EVENTS: ChineseEvent[] = [
  e("chinese_core_01_reading", "y1s1", "main", "书单发下来，喜欢读书突然要打卡", "现当代文学老师一口气列了十二本书，下周点第一本。你以前半夜想看就看，现在读到第几章、划了哪句话，都可能当堂验收。", [
    o("a", "按周排进度，兴趣书另留一本", "十二本书被塞进课表空隙，你还偷偷留了一本绝不写读书报告。后来才发现，私人阅读也得靠排期抢救。", -5, { text: 7, traits: { readingStamina: 9, interestProtection: 7 }, flags: ["chinese_read_plan"], routes: { research: 4, survival: 2 }, proof: "close_reader" }),
    o("b", "先读最想看的，课堂前再补重点", "第一本看到凌晨两点，第二本上课前只来得及搜人物关系。老师问叙述视角，你脑内只剩“男主最后死了”。", -2, { text: 4, traits: { creativeImpulse: 5, interestProtection: 8, lastMinute: 5 }, flags: ["chinese_read_interest"], routes: { writing: 4, survival: 2 }, proof: "writer" }),
    o("c", "组个读书会，每人负责一本", "四个人一人啃三本。轮到自己负责的书时如数家珍，轮到别人的书时集体点头。", -3, { text: 5, opportunity: 3, traits: { expression: 6, teamBackup: 7 }, flags: ["chinese_read_group"], routes: { media: 3, editor: 2 }, proof: "copywriter" }),
    o("d", "先收齐笔记，考试前集中到场", "网盘很快集齐《重点》《新重点》《老师没说但可能考》。书一页没翻，资料版本考据先开题。", 2, { text: 2, traits: { lastMinute: 9, realityPlanning: 3 }, flags: ["chinese_read_summary"], routes: { survival: 5 }, proof: "ancient_survivor" }),
  ]),
  e("chinese_core_02_ancient", "y1s2", "main", "老师让你解释四句话里的“之”", "四句话里都有“之”，意思却不一样：有时相当于“的”，有时指“他”或“它”，有时放进现代汉语里根本不用翻。老师下一步就要点人回答，你准备怎么把它们分清？", [
    o("a", "先把四句话翻成现代汉语，再比较区别", "你先弄清每句话到底在说什么，再回头看“之”在里面做什么。过程有点慢，但老师换个例句，你也能自己判断。", -7, { text: 9, traits: { textSensitivity: 8, ancientTolerance: 8 }, flags: ["chinese_ancient_parse"], routes: { research: 4 }, experiences: ["四句话里的“之”把你困了半节课"], proof: "ancient_survivor" }),
    o("b", "把这四个例句背下来，考试碰到相似的就套", "四个例句背得很顺，老师一换句子，你突然发现自己只记住了答案，没记住为什么。", -4, { text: 5, traits: { memorization: 8, lastMinute: 4 }, flags: ["chinese_ancient_examples"], routes: { teacher: 2, civil: 2 }, proof: "ancient_survivor" }),
    o("c", "和同桌一人翻两句，再互相挑错", "你们把四句话都说成了现代汉语，争了几轮以后，总算知道自己到底错在哪。", -4, { text: 6, opportunity: 2, traits: { expression: 5, ancientTolerance: 6 }, flags: ["chinese_ancient_pair"], routes: { teacher: 3 }, proof: "copywriter" }),
    o("d", "先记最常考的两种，剩下的期末前再补", "你先保住了最容易拿的分。至于另外两种“之”，暂时继续在课本里自由活动。", 2, { text: 3, traits: { lowCostSurvival: 8, boundarySense: 6 }, flags: ["chinese_ancient_survive"], routes: { survival: 6 }, proof: "ancient_survivor" }),
  ]),
  e("chinese_core_03_paper", "y2s1", "main", "老师说你的选题够写一辈子", "你的题目叫《中国现代文学中的女性书写研究》。老师念完停了两秒：“课程论文只有三千字，你到底准备写哪位作家的哪一篇？”", [
    o("a", "缩到一篇小说，只讲清一个问题", "题目终于从整个现代文学缩到一篇小说。老师没再圈标题，只圈了十四处论证。", -7, { text: 10, opportunity: 3, traits: { topicNarrowing: 10, textSensitivity: 8, revisionPatience: 6 }, flags: ["chinese_paper_narrow"], routes: { research: 9, editor: 2 }, experiences: ["老师让你把选题砍掉三分之二"], proof: "close_reader" }),
    o("b", "保留大题目，靠结构把它撑起来", "目录看起来足以解释半部文学史，正文每一节都只分到几百字。气势保住了，证据在门外排队。", -10, { text: 6, traits: { ambition: 9, stressTolerance: 6, topicNarrowing: -4 }, flags: ["chinese_paper_big"], routes: { writing: 3 }, proof: "writer" }),
    o("c", "拿去问老师，到底该砍哪一半", "老师直接划掉三行，又发来两篇论文：“先照这个大小写。”问题是小了，今晚的阅读量大了。", -6, { text: 8, opportunity: 7, traits: { activeHelp: 8, revisionPatience: 8 }, flags: ["chinese_paper_teacher"], routes: { research: 8 }, proof: "planner" }),
    o("d", "换成熟悉作品，先确保能交", "你没有挑战整个文学史，按时交出一篇不惊艳但能自圆其说的论文。", -3, { text: 5, traits: { realityPlanning: 6, interestProtection: 5 }, flags: ["chinese_paper_safe"], routes: { survival: 5, civil: 2 }, proof: "planner" }),
  ]),
  e("chinese_core_04_expression", "y2s2", "main", "五个群同时艾特你：今晚能交吗", "校刊缺校对，支教队缺试讲，校园媒体缺选题，征文今晚截止，老师还在群里问谁做展示。五个群都显示“正在输入”，你只有一个晚上。", [
    o("a", "去校刊，先把第八版改干净", "你没写自己的文章，先替全刊统一了引号、脚注和三个作者的“最终版”。", -7, { text: 7, opportunity: 8, traits: { editingSense: 10, textSensitivity: 7 }, flags: ["chinese_journal_entry"], closes: ["teacher"], routes: { editor: 10 }, proof: "proofreader" }),
    o("b", "去支教，试试能不能把课讲明白", "第一次试讲超时两分钟，板书挤到右下角。学生听懂了一半，你也第一次看见课堂不是朗诵比赛。", -8, { text: 5, opportunity: 8, traits: { teachingPractice: 10, expression: 7 }, flags: ["chinese_teaching_entry"], closes: ["editor"], routes: { teacher: 10 }, experiences: ["试讲超时但没有完全崩"], proof: "copywriter" }),
    o("c", "进校园媒体，接一条真实选题", "负责人把你的抒情标题删了，换成一句能让人看懂发生了什么的话。浪漫少了，阅读量有了。", -6, { text: 5, opportunity: 9, traits: { mediaSense: 9, expression: 7 }, flags: ["chinese_media_entry"], routes: { media: 10 }, proof: "copywriter" }),
    o("d", "匿名投稿，先让自己的东西出去", "稿子发出后两周没有回音。你每天只刷新一次邮箱，第三周开始刷新两次。", -5, { text: 6, opportunity: 4, traits: { creativeImpulse: 10, rejectionTolerance: 3 }, flags: ["chinese_writing_public_1"], routes: { writing: 8 }, experiences: ["文章没人看但你没有立刻删除"], proof: "writer" }),
  ]),
  e("chinese_core_05_exit", "y3s1", "main", "辅导员问：中文系毕业以后，你想干什么", "屏幕上列着考研、教资、考公、编辑和内容实习。辅导员问：“你准备选哪一个？”刚才还说中文系什么都能干的人，低头开始查每个岗位到底招不招中文系。", [
    o("a", "准备考研，把论文和专业课先做好", "你删掉两份实习收藏，把时间留给论文和老师的第二轮批注。", -7, { text: 8, opportunity: 5, traits: { readingStamina: 7, revisionPatience: 7 }, flags: ["chinese_route_research"], closes: ["media"], routes: { research: 12 }, proof: "close_reader" }),
    o("b", "教资和试讲先排进日历", "普通话、笔试、认定、试讲一共开了四个网页。“毕业去当老师”终于从饭桌答案变成了四次报名费。", -6, { text: 4, opportunity: 5, traits: { teachingPractice: 6, realityPlanning: 8 }, flags: ["chinese_route_teacher"], closes: ["writing"], routes: { teacher: 12 }, proof: "planner" }),
    o("c", "研究岗位表，先看专业代码认不认", "你发现“汉语言文学类”和“中国语言文学类”差两个字，就可能让报名按钮直接变灰。", -4, { opportunity: 5, traits: { civilPlanning: 10, realityPlanning: 10 }, flags: ["chinese_route_civil"], closes: ["research"], routes: { civil: 12 }, experiences: ["第一次看懂岗位表里的专业代码"], proof: "planner" }),
    o("d", "去内容行业试一次，拿作品说话", "你把校刊、推文和课程作业塞进作品集。面试官没问你最喜欢哪个作家，先问这篇推文的数据是谁做的。", -6, { text: 5, opportunity: 8, traits: { portfolioSense: 9, mediaSense: 5 }, flags: ["chinese_route_content"], routes: { editor: 7, media: 7, writing: 5 }, proof: "proofreader" }),
  ]),
  e("chinese_core_06_conflict", "y3s2", "main", "试讲、实习样稿和论文都在这周截止", "编辑让你周五交样稿，试讲队周六磨课，老师周日收论文二稿。三个群都在问“收到吗”，可你这周只够认真做好两件事。", [
    o("a", "先保论文，实习样稿只做到基本要求", "样稿少了一页，论文终于有了第二版。你少了一项能展示的成果，却有时间把论文继续写下去。", -9, { text: 10, opportunity: -2, traits: { revisionPatience: 10, boundarySense: 6 }, flags: ["chinese_conflict_paper"], routes: { research: 10 }, proof: "close_reader" }),
    o("b", "保试讲，论文申请晚两天交", "试讲终于卡在十分钟内。论文老师回了六个字：“收到，下次提前说。”你盯着句号看了很久。", -8, { text: 4, opportunity: 8, traits: { teachingPractice: 10, responsibility: 5 }, flags: ["chinese_conflict_teaching"], routes: { teacher: 10 }, proof: "copywriter" }),
    o("c", "保实习，论文只改最重要的问题", "实习样稿按时上线，论文也完成了必要修改。它没有变成最好的版本，但你没有让两件事一起逾期。", -8, { text: 6, opportunity: 10, traits: { editingSense: 7, deliveryFirst: 9 }, flags: ["chinese_conflict_content"], routes: { editor: 7, media: 7 }, proof: "proofreader" }),
    o("d", "放掉一项额外任务，先保证能睡觉", "你退出一个群聊，剩下两件事都按时交了。履历少了一项，这周也终于没有继续熬夜。", 4, { text: 3, traits: { lowCostSurvival: 11, boundarySense: 10 }, flags: ["chinese_conflict_survival"], routes: { survival: 12 }, proof: "ancient_survivor" }),
  ]),
  e("chinese_core_07_lock", "y4s1", "main", "导师催二稿，报名系统今晚八点关", "招聘岗位还剩三天截止，考试报名今晚八点关闭，导师又在微信问论文二稿在哪。你不能再每件事都准备一点，今天必须先选一件。", [
    o("a", "准备升学，论文就按现在的题目继续写", "题目终于没有继续变大或变新。你开始补证据，而不是重新换题。", -8, { text: 10, opportunity: 5, traits: { topicNarrowing: 8, revisionPatience: 9 }, flags: ["chinese_lock_research"], routes: { research: 12 }, proof: "close_reader" }),
    o("b", "锁定教师岗，拿试讲逐场修", "第一场板书太满，第二场互动太假，第三场终于像一堂真的课。", -9, { text: 5, opportunity: 9, traits: { teachingPractice: 11, stressTolerance: 7 }, flags: ["chinese_lock_teacher"], routes: { teacher: 12 }, proof: "copywriter" }),
    o("c", "锁定公考，把焦虑拆成岗位和日期", "收藏夹从“经验分享”变成职位、限制、报名日和备选方案。未来没定，表格已经能执行。", -7, { text: 4, opportunity: 5, traits: { civilPlanning: 12, realityPlanning: 10 }, flags: ["chinese_lock_civil"], routes: { civil: 12 }, proof: "planner" }),
    o("d", "用作品集投内容岗，自己的东西下班后再写", "白天改简历里的案例，晚上写一点自己的东西。工作和创作终于不用抢同一段时间。", -7, { text: 6, opportunity: 10, traits: { portfolioSense: 9, interestProtection: 8 }, flags: ["chinese_lock_content"], routes: { editor: 6, media: 6, writing: 4 }, proof: "writer" }),
  ]),
  e("chinese_core_08_finish", "y4s2", "main", "答辩结束后，你终于能读一本不用考试的书", "桌上还放着毕业论文第九版和几份求职记录，旁边那本小说却没有老师点名，也不用写读书报告。四年以后，你第一次可以只因为想看而翻开它。", [
    o("a", "把最后两处论证补齐，再交论文", "答辩没有掌声雷动，但老师终于没再说“范围太大”。这个小问题，你确实讲完了。", -6, { text: 9, traits: { revisionPatience: 8, topicNarrowing: 6 }, flags: ["chinese_final_research"], routes: { research: 8 }, experiences: ["论文题目终于没有被要求继续缩小"], proof: "close_reader" }),
    o("b", "带着试讲、申论或作品集去上班", "毕业证上写着汉语言文学，录用你的那一项写着试讲、材料题或三篇上线稿。", -4, { opportunity: 8, traits: { realityPlanning: 7, responsibility: 6 }, flags: ["chinese_final_job"], routes: { teacher: 5, civil: 5, editor: 4, media: 4 }, proof: "planner" }),
    o("c", "继续写，但不要求它立刻养活自己", "那个停在第三段的文档有了第四段。它暂时不负责房租，只负责没有彻底消失。", 1, { text: 5, traits: { creativeImpulse: 9, interestProtection: 10 }, flags: ["chinese_final_writing"], routes: { writing: 10, survival: 3 }, experiences: ["把写作保留成副业"], proof: "writer" }),
    o("d", "以后看书，不写读书报告", "你合上论文，重新打开那本没划考点的小说。读到喜欢的句子时，第一反应终于不是“这段能不能当论据”。", 5, { opportunity: 5, traits: { lowCostSurvival: 9, interestProtection: 12 }, flags: ["chinese_final_survival"], routes: { survival: 12 }, experiences: ["大四仍保留一本只为自己读的书"], proof: "ancient_survivor" }),
  ]),
];

export const CHINESE_ROUTE_EVENTS: ChineseEvent[] = [
  e("chinese_route_research_01", "y2s2", "route", "十四处批注改完，老师又标了十一处", "你按老师的红字改了一整晚。第二天文档回来，原来的十四处少了，新批注又多了十一处，其中五处都在问：“依据呢？”", [
    o("a", "再缩一层，只保留最硬的证据", "标题从二十二个字缩到十三个字。能复制粘贴的背景先没了，正文终于开始说人话。", -6, { text: 8, opportunity: 5, traits: { topicNarrowing: 8, revisionPatience: 8 }, flags: ["chinese_paper_second_revision"], routes: { research: 8 }, proof: "close_reader" }),
    o("b", "只改老师圈出的地方，先交上去", "红圈少了一半，但没有被圈出的逻辑问题还留在正文里。", -2, { text: 4, traits: { deliveryFirst: 6 }, routes: { survival: 4 }, proof: "planner" }),
    o("c", "换成更熟的作品，停止追这个问题", "论文顺利交了，老师记住的那个小问题停在上学期。", 1, { text: 3, traits: { interestProtection: 5 }, closes: ["research"], routes: { survival: 5 }, proof: "ancient_survivor" }),
  ], ["research"]),
  e("chinese_route_research_02", "y3s1", "route", "夏令营材料要你用三百字说清选题", "你原来的摘要有八百字，还没写到问题本身。报名页面只剩三百字和一个不会被感动的字数统计。", [
    o("a", "删背景，直接写问题和证据", "三百字终于出现了一个能回答的问题。", -5, { text: 7, opportunity: 7, traits: { topicNarrowing: 8 }, routes: { research: 9 }, proof: "close_reader" }),
    o("b", "保住文学感，把方法挤到最后", "开头很好看，评审仍要翻到最后才知道你准备研究什么。", -4, { text: 5, traits: { creativeImpulse: 5 }, routes: { writing: 3, research: 3 }, proof: "writer" }),
    o("c", "不投这次，把论文继续做实", "你错过一张报名表，保住了不为截止时间临时换题的节奏。", 2, { text: 5, traits: { boundarySense: 7 }, routes: { research: 5, survival: 3 }, proof: "planner" }),
  ], ["research"]),
  e("chinese_route_research_03", "y3s2", "route", "报告现场有人问你“所以呢”", "你讲完文本细节，台下老师问：“这个细节改变了我们对作品的什么理解？”准备好的页码很多，结论突然需要本人到场。", [
    o("a", "回到文本，承认结论还差一步", "你没硬拔高度，报告结束后老师给了一个更具体的追问。", -6, { text: 8, opportunity: 6, traits: { ambiguityTolerance: 7, revisionPatience: 7 }, flags: ["chinese_research_question"], routes: { research: 9 }, proof: "close_reader" }),
    o("b", "用大概念把结论先架起来", "术语顺利登场，第二个问题开始追问它们和文本到底什么关系。", -5, { text: 4, traits: { theoryTolerance: 6, ambition: 5 }, routes: { research: 4 }, proof: "writer" }),
    o("c", "把问题记下，报告后找老师单聊", "公开场合没答满，私下讨论反而让毕业论文多了一条能走的路。", -4, { opportunity: 8, traits: { activeHelp: 8 }, routes: { research: 8 }, proof: "planner" }),
  ], ["research"]),
  e("chinese_route_research_04", "y4s1", "route", "导师第一次没说“范围太大”", "开题结束，导师沉默几秒，只问材料够不够。你差点没反应过来：题目终于不用再拆。", [
    o("a", "不庆祝，先把缺的材料列出来", "快乐持续了三分钟，检索清单持续到晚上。", -6, { text: 9, traits: { readingStamina: 8, realityPlanning: 6 }, flags: ["chinese_topic_final"], routes: { research: 10 }, experiences: ["老师记住了你的选题"], proof: "close_reader" }),
    o("b", "趁机把题目再扩大一点", "导师把刚拿开的红笔重新拿了回来。", -3, { text: 3, traits: { ambition: 8, topicNarrowing: -5 }, routes: { writing: 3 }, proof: "writer" }),
    o("c", "按当前范围写完，不再追求全解释", "你放过了整个时代，终于对一篇作品负责到底。", -4, { text: 7, traits: { deliveryFirst: 7, boundarySense: 6 }, routes: { research: 7, survival: 3 }, proof: "planner" }),
  ], ["research"]),

  e("chinese_route_teacher_01", "y2s2", "route", "十分钟试讲，开场用了四分钟", "你精心设计的导入从作者生平讲到时代背景，计时器已经走过四分钟，课文还没正式出现。", [
    o("a", "砍掉一半导入，先让学生开口", "作者生平只剩两句，课堂终于不再是你的单人播客。", -5, { text: 5, opportunity: 6, traits: { teachingPractice: 9, expression: 6 }, flags: ["chinese_teaching_revise"], routes: { teacher: 8 }, proof: "copywriter" }),
    o("b", "加快语速，努力把设计全讲完", "内容讲完了，评委的笔记停在“语速像倍速播放”。", -7, { text: 4, traits: { stressTolerance: 6 }, routes: { teacher: 4 }, proof: "planner" }),
    o("c", "保留导入，删掉最后的互动", "课堂很完整，学生唯一的任务是保持在线。", -3, { text: 4, traits: { teachingPractice: 3 }, routes: { teacher: 4 }, proof: "copywriter" }),
  ], ["teacher"]),
  e("chinese_route_teacher_02", "y3s1", "route", "教资报名页不接受“以后再说”", "普通话证书、笔试科目、照片尺寸和报名时间同时出现。亲戚口中的“当老师稳定”，终于拆成一串具体步骤。", [
    o("a", "按考试节点准备，不和论文抢同一周", "教资进了日历，也第一次承认时间安排比热情可靠。", -5, { opportunity: 5, traits: { teachingPractice: 6, realityPlanning: 9 }, flags: ["chinese_teacher_cert"], routes: { teacher: 9 }, proof: "planner" }),
    o("b", "先报名，复习交给未来的自己", "未来的你准时收到一个更近的截止日期。", -2, { traits: { lastMinute: 8 }, routes: { teacher: 4, survival: 2 }, proof: "ancient_survivor" }),
    o("c", "先去听真实课堂，再决定考不考", "一节课里有教学，也有纪律、作业和三个同时举手的问题。滤镜少了，判断多了。", -4, { opportunity: 7, traits: { teachingPractice: 7, realityPlanning: 6 }, routes: { teacher: 7, survival: 2 }, proof: "copywriter" }),
  ], ["teacher"]),
  e("chinese_route_teacher_03", "y3s2", "route", "实习班级没有配合你的教学设计", "你准备了层层递进的问题，第一排没人举手，最后一排正在交换橡皮。教案很完整，课堂有自己的剧情。", [
    o("a", "换个更具体的问题，把人叫回来", "问题小了，终于有人愿意回答。你第一次现场改教案而不是硬演。", -7, { text: 5, opportunity: 7, traits: { teachingPractice: 10, ambiguityTolerance: 7 }, routes: { teacher: 10 }, experiences: ["第一次脱稿讲完一部作品"], proof: "copywriter" }),
    o("b", "按教案继续，至少把流程走完", "每个环节都准时出现，学生的注意力没有。", -4, { traits: { deliveryFirst: 7 }, routes: { teacher: 4, survival: 3 }, proof: "planner" }),
    o("c", "课后问指导老师哪里失控了", "老师只改了你的第一个提问，你下节课少沉默了两分钟。", -5, { opportunity: 6, traits: { activeHelp: 8, teachingPractice: 7 }, routes: { teacher: 8 }, proof: "planner" }),
  ], ["teacher"]),
  e("chinese_route_teacher_04", "y4s1", "route", "评委说“请模拟学生回答”", "试讲现场没有学生，评委要求你既提问、又等待、再替空气回答。你需要同时扮演老师、学生和课堂秩序。", [
    o("a", "留出停顿，再自然接住答案", "空气配合得一般，你至少没有把互动演成自问自答连播。", -6, { opportunity: 9, traits: { teachingPractice: 10, stressTolerance: 8 }, flags: ["chinese_teacher_interview"], routes: { teacher: 11 }, proof: "copywriter" }),
    o("b", "减少互动，把知识点讲稳", "课堂感弱了一点，表达没有在紧张里散架。", -4, { text: 6, traits: { realityPlanning: 6 }, routes: { teacher: 7 }, proof: "planner" }),
    o("c", "临场加一个复杂活动", "活动很新，倒计时也很诚实。铃响时你还在分组。", -8, { traits: { creativeImpulse: 7, stressTolerance: 4 }, routes: { teacher: 4 }, proof: "writer" }),
  ], ["teacher"]),

  e("chinese_route_civil_01", "y3s1", "route", "岗位表开始追问你的专业代码", "你搜索“中文类可报”，结果里同时出现汉语言文学、中国语言文学和专业不限。一个字的差别，可能就是报名按钮的颜色。", [
    o("a", "逐条核对目录，不拿经验帖当结论", "收藏少了，能报的岗位反而第一次变准确。", -5, { opportunity: 6, traits: { civilPlanning: 10, textSensitivity: 5 }, flags: ["chinese_civil_codes"], routes: { civil: 9 }, proof: "planner" }),
    o("b", "只看专业不限，省下筛选时间", "能点开的岗位少了一大截，好处是不用再猜“文学类”到底包不包含你。", -2, { traits: { lowCostSurvival: 6 }, routes: { civil: 5, survival: 3 }, proof: "ancient_survivor" }),
    o("c", "先收藏热门岗位，条件以后再看", "收藏夹很繁荣，报名时有一半因条件不符自动毕业。", 0, { traits: { lastMinute: 7 }, routes: { civil: 3 }, proof: "planner" }),
  ], ["civil"]),
  e("chinese_route_civil_02", "y3s2", "route", "申论老师把你的漂亮开头整段划掉", "你用一百二十字铺陈时代背景，老师在旁边只写了四个字：“答案在哪？”这不是文学赏析，阅卷人不会为氛围加分。", [
    o("a", "删掉抒情，先把结构和任务写清", "句子没那么漂亮，阅卷人终于不用猜你准备回答什么。", -6, { text: 6, traits: { civilPlanning: 8, structureSense: 9 }, routes: { civil: 9 }, proof: "planner" }),
    o("b", "保留开头，把观点补在后面", "文学感和任务感勉强同居，字数先提出了意见。", -5, { text: 5, traits: { expression: 5 }, routes: { civil: 5, writing: 2 }, proof: "writer" }),
    o("c", "套模板先练速度，之后再改语言", "答案按时写完，所有段落都像在同一家培训机构长大。", -3, { traits: { deliveryFirst: 7, realityPlanning: 5 }, routes: { civil: 6 }, proof: "planner" }),
  ], ["civil"]),
  e("chinese_route_civil_03", "y4s1", "route", "报名最后一天，三个岗位灰了两个", "第一个提示专业不符，第二个要求两年基层经历，第三个照片审核不通过。离系统关闭还剩四十三分钟。", [
    o("a", "保一个主报，再留两个现实备选", "你没有把全部希望压在最热门的名字上，报名表终于提交成功。", -5, { opportunity: 7, traits: { civilPlanning: 11, realityPlanning: 10 }, flags: ["chinese_civil_submitted"], routes: { civil: 11 }, proof: "planner" }),
    o("b", "只冲最想要的，其他都不报", "目标很集中，容错也很有个性。", -3, { traits: { idealDrive: 7, stressTolerance: 4 }, routes: { civil: 7 }, proof: "writer" }),
    o("c", "转投专业不限，先把名报上", "这次专业栏终于没有变红。至于中文系四年学了什么，等进面再想办法讲。", -2, { opportunity: 5, traits: { lowCostSurvival: 7 }, routes: { civil: 6, survival: 5 }, proof: "ancient_survivor" }),
  ], ["civil"]),

  e("chinese_route_editor_01", "y2s2", "route", "校刊的“最终版”后面已经有七个数字", "作者刚说不改了，群里又发来一段新结尾。你手上同时有最终版5、最终版7和一个没有后缀但修改时间最新的文件。", [
    o("a", "统一文件名，先锁定唯一底稿", "文学争鸣还没开始，版本管理先恢复了秩序。", -5, { text: 6, opportunity: 6, traits: { editingSense: 9, responsibility: 6 }, flags: ["chinese_journal_version"], routes: { editor: 9 }, proof: "proofreader" }),
    o("b", "逐个比对，确保一句都没丢", "你找回一段好结尾，也失去一个完整晚上。", -8, { text: 8, traits: { textSensitivity: 9, overResponsibility: 7 }, routes: { editor: 8 }, proof: "proofreader" }),
    o("c", "让作者自己确认，别替所有人收尾", "群聊安静了十分钟，随后真的出现了一个被确认的版本。", -2, { opportunity: 4, traits: { boundarySense: 8, expression: 5 }, routes: { editor: 6, survival: 3 }, proof: "copywriter" }),
  ], ["editor"]),
  e("chinese_route_editor_02", "y3s1", "route", "编辑实习第一天先改十个标题", "你以为第一天会坐下来读稿，负责人发来十个旧标题和一张后台截图：“下午三点前，每个再写五版。”", [
    o("a", "保住信息，重写成能看懂的标题", "没有标题党，点击率也没有继续躺平。", -6, { text: 6, opportunity: 8, traits: { editingSense: 8, mediaSense: 5 }, flags: ["chinese_editor_titles"], routes: { editor: 8, media: 4 }, experiences: ["编辑实习里改了十个标题"], proof: "proofreader" }),
    o("b", "按数据最好的模板批量改", "数据短暂抬头，十篇文章像共用一个标题生成器。", -4, { opportunity: 6, traits: { mediaSense: 7, deliveryFirst: 6 }, routes: { media: 7 }, proof: "copywriter" }),
    o("c", "和负责人争取保留原来的表达", "你保住两个标题，也第一次学会拿内容理由而不是审美直觉谈修改。", -7, { text: 7, opportunity: 5, traits: { expression: 8, editingSense: 6 }, routes: { editor: 7 }, proof: "copywriter" }),
  ], ["editor"]),
  e("chinese_route_editor_03", "y3s2", "route", "作者问第八版到底还要改什么", "你圈出结构、事实和三处病句，作者回复：“读起来不是挺顺的吗？”编辑工作突然变成一场需要证据的沟通。", [
    o("a", "逐条说明为什么改，不只发修订稿", "沟通多花半小时，第九版少了三次来回。", -7, { text: 8, opportunity: 7, traits: { editingSense: 10, expression: 7 }, flags: ["chinese_editor_author"], routes: { editor: 10 }, proof: "proofreader" }),
    o("b", "只改硬伤，风格全部还给作者", "稿件按时过了，你也没有把每句话都改成自己的口气。", -3, { text: 5, traits: { boundarySense: 8 }, routes: { editor: 7, survival: 3 }, proof: "planner" }),
    o("c", "自己全改完，省下解释时间", "文件很整齐，作者在下一版把一半句子又改了回去。", -9, { text: 6, traits: { overResponsibility: 9 }, routes: { editor: 5 }, proof: "proofreader" }),
  ], ["editor"]),
  e("chinese_route_editor_04", "y4s1", "route", "校刊截稿夜又少了一篇稿子", "版面已经排好，作者突然失联。群里所有人都说“我这边基本完成”，最后一块空白开始看你。", [
    o("a", "重排版面，不临时灌一篇水稿", "页数少了两页，整本刊物没有因此出现一篇来历可疑的文章。", -6, { text: 7, opportunity: 7, traits: { editingSense: 8, responsibility: 7 }, flags: ["chinese_journal_delivered"], routes: { editor: 10 }, experiences: ["校刊第八版校对完成"], proof: "proofreader" }),
    o("b", "自己补一篇，先把空出来的版面填上", "刊物按时交了，你自己的论文却少改了一晚。这次缺稿最后还是由你的时间补上。", -10, { text: 6, traits: { overResponsibility: 10, creativeImpulse: 5 }, routes: { editor: 6, writing: 4 }, proof: "writer" }),
    o("c", "让负责人决定，别默认自己接锅", "空白没有消失，但责任终于回到了有权限的人手里。", 1, { traits: { boundarySense: 10, lowCostSurvival: 6 }, routes: { survival: 6, editor: 4 }, proof: "planner" }),
  ], ["editor"]),

  e("chinese_route_media_01", "y2s2", "route", "负责人把你的标题改得不像文学", "你写的是《在离别的季节里重新相遇》，负责人改成《毕业生返校活动本周六举行》。后台第一次明确站在信息这边。", [
    o("a", "接受直白标题，把表达留在正文", "读者终于知道发生了什么，正文也没有被改成通知。", -4, { text: 5, opportunity: 7, traits: { mediaSense: 9, editingSense: 4 }, flags: ["chinese_media_title"], routes: { media: 9 }, proof: "copywriter" }),
    o("b", "保留原题，再加一句信息副标题", "浪漫和信息各占一行，手机端差点装不下。", -5, { text: 6, traits: { creativeImpulse: 5, mediaSense: 5 }, routes: { media: 6, writing: 2 }, proof: "writer" }),
    o("c", "照负责人版本发，先看数据", "数据比上次好，至于读者喜欢标题还是活动，你暂时无法证明。", -2, { opportunity: 6, traits: { dataAnxiety: 6, realityPlanning: 5 }, routes: { media: 7 }, proof: "planner" }),
  ], ["media"]),
  e("chinese_route_media_02", "y3s1", "route", "热点只给你四小时写完", "选题会上刚确定方向，平台热度已经开始往下掉。你有材料、有观点，但没有一整天慢慢修句子。", [
    o("a", "先核事实和结构，少追一点速度", "发布晚了一小时，内容没在评论区被第一条事实纠错带走。", -7, { text: 7, opportunity: 6, traits: { mediaSense: 7, responsibility: 7 }, routes: { media: 8 }, proof: "proofreader" }),
    o("b", "先发能用版，数据起来再补", "文章抢到一波流量，修改记录也公开见证了你的边写边核。", -5, { opportunity: 9, traits: { deliveryFirst: 9, dataAnxiety: 6 }, routes: { media: 9 }, proof: "copywriter" }),
    o("c", "放弃热点，做一个能长期看的选题", "当天数据很安静，两周后仍有人从搜索里点进来。", -6, { text: 8, traits: { readingStamina: 6, interestProtection: 6 }, routes: { editor: 5, media: 5 }, proof: "close_reader" }),
  ], ["media"]),
  e("chinese_route_media_03", "y3s2", "route", "阅读量涨了，评论区却没聊正文", "你精心写的文章突然传播，评论区一半在讨论标题，另一半在艾特朋友。数据很好，作品是否被真正读完仍然没有统计项。", [
    o("a", "把标题、发布时间和正文重新对一遍", "你记下这次读者从哪点进来、在哪退出，没有立刻把个人简介改成“十万加操盘手”。", -5, { text: 6, opportunity: 9, traits: { mediaSense: 9, realityPlanning: 7 }, flags: ["chinese_media_viral"], routes: { media: 9 }, experiences: ["一篇随手写的内容意外传播"], proof: "planner" }),
    o("b", "立刻照这个标题再做三篇", "第二篇还行，第三篇开始像第一篇的远房亲戚。", -7, { opportunity: 7, traits: { dataAnxiety: 10, deliveryFirst: 6 }, routes: { media: 7 }, proof: "copywriter" }),
    o("c", "把流量引到自己真正想写的内容", "跳转率不高，但第一次有人从热点文章读到了你的长稿。", -6, { text: 8, opportunity: 7, traits: { creativeImpulse: 7, interestProtection: 6 }, routes: { writing: 7, media: 5 }, proof: "writer" }),
  ], ["media"]),

  e("chinese_route_writing_01", "y2s2", "route", "退稿邮件只有一句“感谢来稿”", "你把邮件往下滑了三遍，没有修改建议，也没有隐藏的编辑鼓励。作品第一次公开，反馈只有一扇礼貌关上的门。", [
    o("a", "隔一周重读，自己标出最虚的地方", "你删掉最舍不得的开头，故事终于提前发生。", -6, { text: 7, traits: { creativeImpulse: 8, rejectionTolerance: 8, revisionPatience: 6 }, flags: ["chinese_writing_continue_2"], routes: { writing: 8 }, experiences: ["投稿收到第一条真正来自自己的修改意见"], proof: "writer" }),
    o("b", "换个平台原样再投一次", "第二个平台也很安静。你确认问题可能不全是平台。", -3, { opportunity: 3, traits: { rejectionTolerance: 5 }, routes: { writing: 5 }, proof: "writer" }),
    o("c", "先停公开，把写作留回私人文件夹", "作品没有继续被评价，创作也暂时不用向数据解释。", 2, { traits: { interestProtection: 9, boundarySense: 6 }, closes: ["writing"], routes: { survival: 5 }, proof: "ancient_survivor" }),
  ], ["writing"]),
  e("chinese_route_writing_02", "y3s1", "route", "第十二个开头又停在第三段", "你的文件夹有六个标题、三个世界观和十二个开头。每个开头都很认真，正文集体保持低调。", [
    o("a", "选最普通的一个，先写到结尾", "中段没有开头惊艳，但文件第一次出现“完稿”两个字。", -8, { text: 9, traits: { completionHabit: 10, creativeImpulse: 7 }, flags: ["chinese_writing_finished_1"], routes: { writing: 10 }, experiences: ["创作终于越过第三段"], proof: "writer" }),
    o("b", "继续换题，直到找到最想写的那个", "第十三个开头顺利出生，前十二个表示欢迎。", -4, { text: 4, traits: { creativeImpulse: 10, perfectionism: 9 }, flags: ["chinese_writing_openings"], routes: { writing: 5 }, experiences: ["创作停在第三段"], proof: "writer" }),
    o("c", "参加互评，用截止日期换完稿", "互评前夜你写完最后两千字。结构有点喘，故事至少真的抵达结尾。", -9, { text: 8, opportunity: 6, traits: { completionHabit: 8, stressTolerance: 6 }, flags: ["chinese_writing_workshop"], routes: { writing: 8 }, proof: "copywriter" }),
  ], ["writing"]),
  e("chinese_route_writing_03", "y3s2", "route", "编辑认真回复了你的第二次投稿", "邮件没有直接采用，只写了三条具体意见：人物动机、段落节奏、结尾太急。第一次有人不是礼貌关门，而是认真看完。", [
    o("a", "按意见重写，但不把声音全换掉", "第二版变得更稳，也仍然像你写的。", -8, { text: 10, opportunity: 9, traits: { revisionPatience: 10, rejectionTolerance: 8 }, flags: ["chinese_writing_feedback"], routes: { writing: 12 }, experiences: ["投稿收到第一条认真反馈"], proof: "writer" }),
    o("b", "逐条照改，先争取采用", "稿件更符合栏目，几个你喜欢的拐弯也一起被拉直。", -6, { text: 7, opportunity: 8, traits: { deliveryFirst: 7 }, routes: { writing: 8, editor: 3 }, proof: "proofreader" }),
    o("c", "保留原稿，另外写一个新版本", "两个版本都活着，你的精力开始要求参与版权讨论。", -10, { text: 9, traits: { creativeImpulse: 8, overResponsibility: 7 }, routes: { writing: 8 }, proof: "writer" }),
  ], ["writing"]),
  e("chinese_route_writing_04", "y4s1", "route", "简历改到第六版，长稿还停在第三段", "白天改简历，晚上打开文档，光标还停在上周那句话后面。每次刚想往下写，招聘软件又弹出一句“HR刚刚活跃”。", [
    o("a", "每周只保两晚，慢也继续写", "进度不适合截图，但文档每周都真的多一点。", -5, { text: 7, traits: { completionHabit: 8, interestProtection: 10 }, flags: ["chinese_writing_kept"], routes: { writing: 10, survival: 3 }, proof: "writer" }),
    o("b", "先停到求职结束，不拿内疚催稿", "文档暂停了，兴趣没有被强行加班耗尽。", 3, { traits: { interestProtection: 10, realityPlanning: 8 }, flags: ["chinese_writing_paused"], routes: { survival: 7, writing: 3 }, proof: "planner" }),
    o("c", "全力冲完，拿它做毕业前的作品", "你交出一份完整长稿，也把最后一个月的睡眠写进了成本。", -12, { text: 12, opportunity: 8, traits: { completionHabit: 10, stressTolerance: 7 }, flags: ["chinese_writing_portfolio"], routes: { writing: 12 }, proof: "writer" }),
  ], ["writing"]),
];

export const CHINESE_RANDOM_EVENTS: ChineseEvent[] = [
  e("chinese_random_01", null, "major_random", "群聊突然让你帮忙改一条官宣", "朋友说“你中文系的，帮我写得自然一点”。恋爱是他们谈的，语气、节奏和标点突然归你负责。", [
    o("a", "问清楚想说什么，再替他整理", "你把五段语音压成三句话，朋友的人生第一次有了编辑。", -3, { text: 4, opportunity: 3, traits: { expression: 7, emotionalLabor: 6 }, flags: ["chinese_friend_copy"], experiences: ["替朋友写完一条官宣文案"], proof: "copywriter" }),
    o("b", "给个模板，让本人自己填", "文案没那么惊艳，恋爱终于由当事人亲自表述。", 1, { traits: { boundarySense: 7 }, routes: { survival: 2 }, proof: "planner" }),
    o("c", "顺手写三版供选择", "朋友很满意，你又获得一次没有署名的加急改稿。", -5, { text: 5, traits: { overResponsibility: 8, expression: 6 }, proof: "copywriter" }),
  ]),
  e("chinese_random_02", null, "major_random", "小组展示前一晚，主讲人失联", "群文件里只有半份提纲，主讲人的头像安静得很稳定。明早第一节课，剩下的人开始在群里互相“你看到了吗”。", [
    o("a", "接下结构，不替所有人写全文", "展示能讲，失联者那一页仍然保留了合理的空白感。", -5, { text: 5, opportunity: 4, traits: { teamBackup: 7, boundarySense: 6 }, experiences: ["被默认成为小组汇报救场人"], proof: "copywriter" }),
    o("b", "全接下来，今晚一次性救完", "课堂顺利，凌晨三点的你没有参与掌声。", -10, { text: 7, traits: { overResponsibility: 10, stressTolerance: 5 }, proof: "copywriter" }),
    o("c", "立刻联系老师，按实际分工汇报", "群聊短暂尴尬，责任第一次没有平均分给在线的人。", 0, { traits: { responsibility: 6, boundarySense: 9 }, proof: "planner" }),
  ]),
  e("chinese_random_03", null, "major_random", "文学史资料出现三个互相冲突的版本", "群里一份说重点到晚清，一份说考到现代，还有一份标题写着“老师亲口说”，但没人记得是哪位老师。", [
    o("a", "回课件和课堂记录核对", "重点没有缩成十页，但至少不再由文件名决定真伪。", -4, { text: 6, traits: { readingStamina: 5, textSensitivity: 4 }, proof: "close_reader" }),
    o("b", "三份都背，避免押错", "风险被平均分摊，睡眠也被平均分摊。", -8, { text: 7, traits: { memorization: 8, stressTolerance: 4 }, proof: "ancient_survivor" }),
    o("c", "只背共同部分，剩下交给运气", "你找到资料的最大公约数，考场负责检验它够不够大。", 1, { text: 3, traits: { lowCostSurvival: 7 }, proof: "ancient_survivor" }),
  ]),
  e("chinese_random_04", null, "major_random", "你在菜单上先发现了一个病句", "同桌还在选喝什么，你盯着“本店提供免费赠送小食”沉默了两秒。中文系训练开始在非工作时间自动运行。", [
    o("a", "忍住，正常点单", "病句继续营业，你保住了一顿饭的社交气氛。", 2, { traits: { boundarySense: 5, textSensitivity: 3 }, proof: "proofreader" }),
    o("b", "拍下来发群里共同鉴赏", "五分钟后，群里开始讨论“免费”和“赠送”谁该先走。", -1, { traits: { textSensitivity: 7, expression: 5 }, proof: "close_reader" }),
    o("c", "礼貌提醒店员可以改一下", "店员说谢谢，第二周招牌真的少了两个字。", -2, { opportunity: 2, traits: { editingSense: 6, expression: 5 }, proof: "proofreader" }),
  ]),
  e("chinese_random_05", null, "major_random", "旧书摊出现一本绝版作品集", "价格够你吃三顿饭，书页里还有前任读者的批注。课程不要求，论文暂时也用不上。", [
    o("a", "买下，只为自己读", "这本书没有增加任何报名资格，只让私人书架多了一个不交作业的位置。", 1, { text: 4, traits: { interestProtection: 9, readingStamina: 4 }, proof: "close_reader" }),
    o("b", "拍下书名，先去图书馆找", "浪漫少了一点，饭钱和阅读都保住了。", 2, { text: 4, traits: { realityPlanning: 6 }, proof: "planner" }),
    o("c", "算了，当前书单已经读不完", "你把页面关了，桌上那三本塑封未拆的理论书同时松了口气。", 3, { traits: { boundarySense: 6 }, proof: "ancient_survivor" }),
  ]),
  e("chinese_random_06", null, "major_random", "亲戚又问你毕业是不是当老师", "饭桌安静了一秒，所有人都等中文系本人给出标准答案。问题很短，你的备选路线已经排到第四项。", [
    o("a", "把几条真实出口讲清楚", "亲戚听懂了教师、编辑和内容，跨行那部分仍然被概括成“自由职业”。", -2, { opportunity: 2, traits: { expression: 7, realityPlanning: 5 }, proof: "copywriter" }),
    o("b", "先说还在探索，不现场答辩", "答案不完整，但你的职业规划没有被饭桌提前定稿。", 2, { traits: { boundarySense: 7, ambiguityTolerance: 5 }, proof: "planner" }),
    o("c", "顺势说考公，把话题结束", "饭桌满意了，岗位表在远处听见了自己的名字。", 1, { traits: { civilPlanning: 5 }, routes: { civil: 3 }, proof: "planner" }),
  ]),
  e("chinese_random_07", null, "major_random", "图书馆闭馆广播响在最关键一页", "你终于看懂理论文章前半段，广播提醒十五分钟后闭馆。作者刚准备定义核心概念，宿管也准备锁门。", [
    o("a", "拍下页码，明天从这里继续", "理解没有连夜完成，阅读线索至少没有失踪。", -2, { text: 5, traits: { readingStamina: 7 }, proof: "close_reader" }),
    o("b", "站着读完，今晚必须搞懂", "概念读完了，回宿舍以后只剩概念还醒着。", -7, { text: 7, traits: { stressTolerance: 5, readingStamina: 5 }, proof: "close_reader" }),
    o("c", "先看结论，过程以后再补", "你知道作者最后同意什么，中间为什么同意暂时处于折叠状态。", 1, { text: 3, traits: { lastMinute: 6 }, proof: "ancient_survivor" }),
  ]),
  e("chinese_random_08", null, "major_random", "社团海报上的引号左右不统一", "活动明天开始，宣传已经发遍全校。你不是负责人，但那两种引号在屏幕上轮流向你招手。", [
    o("a", "提醒负责人，顺手发正确版本", "海报重发了，活动没有因为引号统一获得额外观众。你仍然睡得更安稳。", -2, { opportunity: 3, traits: { editingSense: 7 }, proof: "proofreader" }),
    o("b", "假装没看见，活动内容更重要", "引号继续各自生活，你成功完成一次非必要校对戒断。", 2, { traits: { boundarySense: 7 }, proof: "planner" }),
    o("c", "只在自己朋友圈转发时修掉", "你拥有全校唯一标点正确的私人版本。", -1, { traits: { textSensitivity: 5, lowCostSurvival: 3 }, proof: "proofreader" }),
  ]),
  e("chinese_random_09", null, "major_random", "征文通知写着“题材不限”", "题材不限，字数三千，今晚截止。文件夹里刚好有一个开头，唯一的问题是它真的只有开头。", [
    o("a", "补成完整稿，接受它不完美", "结尾有点急，但投稿附件第一次不是半成品。", -8, { text: 7, opportunity: 5, traits: { completionHabit: 8, creativeImpulse: 6 }, flags: ["chinese_writing_public_random"], routes: { writing: 5 }, proof: "writer" }),
    o("b", "不为截止日期硬凑，继续慢写", "你错过了这次比赛，但也没有为了赶稿草草补一个结尾。", 2, { traits: { interestProtection: 7, boundarySense: 5 }, routes: { writing: 2, survival: 2 }, proof: "planner" }),
    o("c", "换成交过的课程随笔改一版", "投稿按时，原创热情暂时由旧作代理出席。", -4, { text: 5, opportunity: 4, traits: { deliveryFirst: 6 }, routes: { editor: 3 }, proof: "proofreader" }),
  ]),
  e("chinese_random_10", null, "major_random", "跨行面试突然让你改一段用户文案", "岗位名称和中文系没有直接关系，面试官发来一段说不清重点的提示语，让你十分钟内改得更清楚。", [
    o("a", "先拆信息，再把动作写到第一句", "你把四行绕口通知改成两句话。面试官没问你背过哪些作家，只问：“为什么不一开始就这么写？”", -4, { text: 5, opportunity: 8, traits: { structureSense: 8, realityPlanning: 6 }, flags: ["chinese_cross_skill"], routes: { survival: 6, media: 3 }, experiences: ["中文能力在跨行面试里意外派上用场"], proof: "copywriter" }),
    o("b", "把语言写得更有感染力", "句子好看了，用户下一步该点哪里仍然需要推理。", -3, { text: 4, traits: { creativeImpulse: 6 }, routes: { writing: 3 }, proof: "writer" }),
    o("c", "保留原意，只修病句和歧义", "语气没有大改，但用户终于能看懂下一步该点击还是等待。", -2, { text: 5, traits: { editingSense: 7, textSensitivity: 6 }, routes: { editor: 4, survival: 3 }, proof: "proofreader" }),
  ]),
];

export const CHINESE_HIDDEN_EVENTS: ChineseEvent[] = [
  e("chinese_hidden_reading_callback", "y4s1", "hidden", "大一划烂的那本书又回来了", "毕业论文检索到最后，你发现大一读书会里做满批注的那本小说，正好保存着一个不用重新补读的细节。", [
    o("a", "沿着旧批注重读，不照搬当年结论", "四年前的你负责留下痕迹，现在的你负责推翻其中一半。", -5, { text: 9, traits: { textSensitivity: 8, readingStamina: 6 }, flags: ["chinese_callback_reading"], routes: { research: 7, editor: 3 }, experiences: ["大一读过的书在毕业论文里重新出现"], proof: "close_reader" }),
  ]),
  e("chinese_hidden_paper_callback", "y4s1", "hidden", "导师这次没有让你继续缩题", "大二那次被砍掉三分之二的题目，教会你先问一个能写完的问题。开题表上，导师第一次把红笔停在正文。", [
    o("a", "保住这个小问题，把证据补完整", "导师看完标题，只说：“可以，往下写。”你等了四年，终于没听见“这个范围还是有点大”。", -5, { text: 9, opportunity: 6, traits: { topicNarrowing: 9 }, flags: ["chinese_callback_paper"], routes: { research: 9 }, experiences: ["论文题目终于没有被要求继续缩小"], proof: "close_reader" }),
  ]),
  e("chinese_hidden_journal_callback", "y4s1", "hidden", "校刊真的把你留到了最后一期", "大二你只是来帮一次校对，后来每个截稿夜都有人问你版本到底以哪个为准。最后一期封底上，编辑名单已经有了你的名字。", [
    o("a", "交完最后一版，也把流程留给下一届", "你没有成为永久补位者，校刊也没有随着你毕业失去文件命名规则。", -5, { text: 7, opportunity: 9, traits: { editingSense: 9, responsibility: 7 }, flags: ["chinese_callback_journal"], routes: { editor: 10 }, experiences: ["校园刊物意外成为长期项目"], proof: "proofreader" }),
  ]),
  e("chinese_hidden_writing_callback", "y4s1", "hidden", "那篇没人看的文章收到了新评论", "两年前的匿名文章忽然多了一条留言：“这一段我反复读了几次。”数据仍然很小，反馈第一次具体到一句话。", [
    o("a", "回复以后继续写，不把它当爆款预告", "你没有截图宣布自己被看见，只是把停在第三段的新稿又往下写了两百字。", -4, { text: 8, opportunity: 7, traits: { creativeImpulse: 9, rejectionTolerance: 9 }, flags: ["chinese_callback_writing"], routes: { writing: 12 }, experiences: ["低反馈之后仍然继续写"], proof: "writer" }),
  ]),
  e("chinese_hidden_teaching_callback", "y3s2", "hidden", "临时代课让你重新考虑教师路线", "你原本没准备走师范线，支教老师临时请假，你拿着一份不熟的教案站到讲台前。下课铃响时，最后一排有人追问那篇课文。", [
    o("a", "把这次认真记下来，再补一次试讲", "你回宿舍把收藏半年的教资报名页点开了。这次不是为了应付亲戚，是想看看自己还能不能再讲好一节。", -6, { text: 5, opportunity: 8, traits: { teachingPractice: 10, idealDrive: 6 }, flags: ["chinese_callback_teaching"], routes: { teacher: 10 }, experiences: ["临时试讲改变了职业想法"], proof: "copywriter" }),
  ]),
  e("chinese_hidden_media_callback", "y4s1", "hidden", "爆过一次的标题没能复制第二次", "你照着那篇高数据内容做了续篇，阅读量只剩零头。平台很诚实：偶然可以复盘，不能直接继承。", [
    o("a", "保留有效结构，重新做选题", "你删掉“复刻爆款”的文件名，重新找采访对象。第二篇没有十万加，至少不是第一篇换个标题。", -5, { text: 6, opportunity: 7, traits: { mediaSense: 10, realityPlanning: 8 }, flags: ["chinese_callback_media"], routes: { media: 10 }, proof: "planner" }),
  ]),
  e("chinese_hidden_language_turn", "y3s2", "hidden", "你对虚词的兴趣超过了故事情节", "同学讨论人物命运，你却在追一句话为什么换个语序就变了语气。文学阅读没有消失，语言本身开始抢走镜头。", [
    o("a", "去找语言学老师问一条能走的路", "你拿到一份新书单，里面没有人物小传，只有语料、结构和更多问题。", -6, { text: 9, opportunity: 8, traits: { textSensitivity: 10, ancientTolerance: 7 }, flags: ["chinese_callback_language"], routes: { research: 9 }, experiences: ["从文学转向语言学"], proof: "ancient_survivor" }),
  ]),
  e("chinese_hidden_lowcost_callback", "y4s2", "hidden", "组员说最后一版交给你最放心", "你没有拿满奖项，也很少主动包揽全场。但四年里答应过的稿子、汇报和校对都按时有回音。", [
    o("a", "收下这句“不够卷，但很可靠”", "你没拿过最高分，也没在群里抢过活。但大家真到交稿前，还是会先问你那份有没有问题。", 4, { opportunity: 6, traits: { lowCostSurvival: 10, responsibility: 8 }, flags: ["chinese_callback_lowcost"], routes: { survival: 10 }, experiences: ["低耗玩家获得稳定肯定"], proof: "planner" }),
  ]),
];

export const CHINESE_EVENTS = [
  ...CHINESE_CORE_EVENTS,
  ...CHINESE_ROUTE_EVENTS,
  ...CHINESE_RANDOM_EVENTS,
  ...CHINESE_HIDDEN_EVENTS,
];
