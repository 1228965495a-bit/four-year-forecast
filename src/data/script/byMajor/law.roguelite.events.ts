type SemesterKey = "y1s1" | "y1s2" | "y2s1" | "y2s2" | "y3s1" | "y3s2" | "y4s1";

type DecisionEffects = {
  energy: number;
  professional: number;
  opportunity: number;
  persona: Record<string, number>;
  routes: Record<string, number>;
  evidence?: string;
  flags?: string[];
};

function option(id: string, text: string, feedback: string, effects: DecisionEffects) {
  return {
    id,
    text,
    feedback,
    effects: {
      stats: { energy: effects.energy },
      lawResources: { professionalAccumulation: effects.professional, opportunity: effects.opportunity },
      lawPersona: effects.persona,
      lawRoutes: effects.routes,
      personaEvidence: effects.evidence ? [effects.evidence] : [],
      flagsAdd: effects.flags ?? [],
    },
  };
}

function event(id: string, semester: SemesterKey, title: string, description: string, options: ReturnType<typeof option>[]) {
  return { id, majorId: "law", semester, type: "resource", title, description, tags: ["资源取舍", "本周只能保住一部分"], options };
}

function incident(id: string, semester: SemesterKey, title: string, description: string, options: ReturnType<typeof option>[]) {
  return { id, majorId: "law", semester, type: "roguelite_random", title, description, tags: ["随机插曲"], options };
}

function crisis(
  id: string,
  semester: SemesterKey,
  title: string,
  description: string,
  conditions: Record<string, unknown>,
  options: ReturnType<typeof option>[],
) {
  return {
    id,
    majorId: "law",
    semester,
    type: "roguelite_random",
    title,
    description,
    conditions,
    weight: 4,
    tags: ["事故现场", "这次真会 GG"],
    options,
  };
}

export const LAW_ROGUELITE_EVENTS = [
  event("law_resource_y1s1_001", "y1s1", "第一次闭卷周，辩论队偏要今晚招新", "法理学小测在周五，辩论队试训在周四晚。你的精力只够认真准备一边，另一边最多留下一个礼貌的背影。", [
    option("a", "保住小测，给辩论队发一封体面退庭申请", "你在试训群里说下次一定。法理学分数保住了，但那张发言席暂时没有你的名字。", { energy: -9, professional: 8, opportunity: -3, persona: { ruleSensitivity: 5, realityPlanning: 3 }, routes: { academic: 5 }, evidence: "rule_keeper" }),
    option("b", "去试训，把小测复习压缩成睡前四十分钟", "你在台上说得很完整，回宿舍后发现法理学也准备对你进行反方质询。", { energy: -14, professional: 3, opportunity: 8, persona: { expression: 8, stressTolerance: 3 }, routes: { advocacy: 6 }, evidence: "advocate" }),
    option("c", "两边都做最低交付，今晚先保住睡眠", "你没有成为任何一边的明星，但第二天醒来时仍然认识自己。", { energy: 5, professional: 1, opportunity: -1, persona: { ambiguityTolerance: 5, realityPlanning: 4 }, routes: { survival: 6 }, evidence: "planner" }),
  ]),
  event("law_resource_y1s1_002", "y1s1", "图书馆最后一张座位，旁边是模拟法庭开放旁听", "你刚摊开法理学教材，学姐发来消息：模拟法庭临时多出一个旁听名额，现在不去，下一次不保证还有。", [
    option("a", "守住座位，把今天的概念真正读懂", "学姐回了一个“好”。你少了一次入口，却第一次能用自己的话解释法的价值。", { energy: -8, professional: 9, opportunity: -4, persona: { ruleSensitivity: 7, ambiguityTolerance: -3 }, routes: { academic: 5 }, evidence: "rule_keeper" }),
    option("b", "合上教材去旁听，先看看法律如何被说出口", "你没听懂全部论证，但记住了一个事实：声音大不等于证据充分。", { energy: -10, professional: 4, opportunity: 7, persona: { expression: 6, evidence: 1 }, routes: { advocacy: 5 }, evidence: "advocate" }),
    option("c", "把名额转给室友，换他下周替你占座", "你用一次机会换来两天稳定学习时间，大学人情第一次被你做成了可执行协议。", { energy: 2, professional: 4, opportunity: 1, persona: { realityPlanning: 8, responsibility: 3 }, routes: { survival: 3, academic: 2 }, evidence: "planner" }),
  ]),

  event("law_resource_y1s2_001", "y1s2", "宪法论文、法律援助值班和六级同周开庭", "三件事都写着“很重要”，你的日历却只剩两个晚上。系统不支持把一个人复制成三个法学生。", [
    option("a", "论文写扎实，退出本周法律援助值班", "老师在页边写了“有自己的问题意识”。援助站则把你的名字从排班表上轻轻划掉。", { energy: -13, professional: 10, opportunity: -5, persona: { idealDrive: 6, ruleSensitivity: 5 }, routes: { academic: 7 }, evidence: "rule_keeper" }),
    option("b", "去援助站，论文按合格线收尾", "你第一次发现真实求助不会按教材章节出现。论文少了一点锋芒，现实多了一张脸。", { energy: -14, professional: 5, opportunity: 8, persona: { responsibility: 8, ambiguityTolerance: 6 }, routes: { advocacy: 3, firm: 3 }, evidence: "mediator" }),
    option("c", "先保六级和睡眠，两项法学任务都做最低交付", "你没有在本周获得法学高光，但也没有让六月的自己回来起诉你。", { energy: 3, professional: -2, opportunity: -2, persona: { realityPlanning: 8, stressTolerance: 4 }, routes: { survival: 7, detour: 2 }, evidence: "planner" }),
  ]),
  event("law_resource_y1s2_002", "y1s2", "小组汇报少了一个人，老师办公室还亮着灯", "队友突然失联，汇报只剩半成品；同一时间，任课老师开放了本学期最后一次答疑。你只能赶上一边。", [
    option("a", "留下补完整组材料，让汇报先活下来", "汇报顺利结束。从此组员默认你“特别能扛”，这句夸奖开始具有长期法律效力。", { energy: -16, professional: 6, opportunity: 4, persona: { responsibility: 10, stressTolerance: 4 }, routes: { advocacy: 3 }, evidence: "mediator" }),
    option("b", "去找老师，把自己的问题问清楚", "小组得分不算漂亮，但老师第一次记住了你，以及你那个不像标准答案的问题。", { energy: -9, professional: 9, opportunity: 7, persona: { idealDrive: 7, ruleSensitivity: 5 }, routes: { academic: 7 }, evidence: "rule_keeper" }),
    option("c", "把失联记录发群里，要求全员重新分工", "你没有替任何人完成奇迹，只完成了证据固定和责任划分。群里沉默，但任务开始移动。", { energy: -6, professional: 3, opportunity: -1, persona: { evidence: 2, realityPlanning: 7, responsibility: -3 }, routes: { firm: 2, survival: 3 }, evidence: "evidence" }),
  ]),

  event("law_resource_y2s1_001", "y2s1", "民法闭卷、案例比赛、律所内推只隔了三天", "闭卷考试决定绩点，案例比赛可能认识老师，学长的律所内推今晚截止。你最多认真押两项，但三条路都声称错过不候。", [
    option("a", "守绩点和比赛，放弃这次律所内推", "你把请求权基础写进了答卷，也写进了比赛材料。律所入口关上时没有发出声音。", { energy: -17, professional: 13, opportunity: 1, persona: { ruleSensitivity: 8, stressTolerance: 5 }, routes: { academic: 8, advocacy: 3 }, evidence: "rule_keeper" }),
    option("b", "接内推并保考试，退出案例比赛", "你的简历第一次进入真实邮箱。比赛群里少了你，实习群里多了一个“收到请回复”。", { energy: -16, professional: 7, opportunity: 10, persona: { realityPlanning: 9, stressTolerance: 4 }, routes: { firm: 9 }, evidence: "planner" }),
    option("c", "只保考试，拒绝把本周变成人类压力测试", "你看着另外两条路线从通知栏滑走，换来一次没有心悸的闭卷考试。", { energy: 4, professional: 6, opportunity: -7, persona: { ambiguityTolerance: 5, realityPlanning: 5 }, routes: { survival: 8 }, evidence: "planner" }),
  ]),
  event("law_resource_y2s1_002", "y2s1", "四十八小时后交案例分析，学姐同时问你要不要参赛", "现有作业已经足够让周末消失，参赛却可能带来老师推荐。你能借来的只有时间，利息由下周的自己偿还。", [
    option("a", "接比赛，接受连续两个晚上高强度运转", "材料按时交了，你也被学姐记住了。代价是周一早课上，你的灵魂对签到提出管辖权异议。", { energy: -20, professional: 11, opportunity: 9, persona: { stressTolerance: 9, responsibility: 5 }, routes: { academic: 5, advocacy: 4 }, evidence: "advocate" }),
    option("b", "拒绝比赛，把案例分析做成自己的能力", "你少了一张合照和一次认识人的机会，但第一次不靠模板写完了完整论证。", { energy: -11, professional: 12, opportunity: -5, persona: { ruleSensitivity: 8, idealDrive: 5 }, routes: { academic: 7 }, evidence: "rule_keeper" }),
    option("c", "找同学交换资料，各自保住一半周末", "你没有独自证明强大，而是把两个人的时间拼成了一个能交付的答案。", { energy: -7, professional: 6, opportunity: 4, persona: { responsibility: 5, ambiguityTolerance: 6 }, routes: { survival: 5 }, evidence: "mediator" }),
  ]),

  event("law_resource_y2s2_001", "y2s2", "转专业窗口只开七天，模拟法庭名单今晚截止", "查转专业规则需要材料和绩点，模拟法庭需要训练和队友。两边都不是点一下报名就能完成，你只能认真经营一扇门。", [
    option("a", "准备转专业材料，退出模拟法庭选拔", "你把课程表、名额和要求做成了表格。发言席没有等你，但逃生门第一次出现了清晰的门把手。", { energy: -13, professional: -3, opportunity: -6, persona: { realityPlanning: 11, escape: 3 }, routes: { transfer: 11 }, evidence: "escape" }),
    option("b", "留在模拟法庭，把转专业页面关掉", "你在训练里第一次把一个观点说到自己也相信。教务页面关闭时，系统没有替你保存草稿。", { energy: -16, professional: 8, opportunity: 7, persona: { expression: 11, idealDrive: 5 }, routes: { advocacy: 11 }, evidence: "advocate" }),
    option("c", "两边都先问清规则，不立刻承诺任何一边", "你没有得到名额，也没有错过截止日。你先把模糊焦虑变成了两张条件清单。", { energy: -8, professional: 2, opportunity: -2, persona: { evidence: 2, realityPlanning: 9, ambiguityTolerance: 4 }, routes: { transfer: 5, survival: 3 }, evidence: "evidence" }),
  ]),
  event("law_resource_y2s2_002", "y2s2", "老师课题、法院旁听和一晚完整睡眠", "老师临时缺一个资料整理助手，法院明天有公开庭审，而你已经连续五天靠闹钟叫醒另一个闹钟。", [
    option("a", "接老师课题，旁听下次再说", "你在数据库里查到眼神失焦，老师却记住了那个会追原始出处的人。", { energy: -17, professional: 10, opportunity: 9, persona: { evidence: 2, ruleSensitivity: 7 }, routes: { academic: 9 }, evidence: "evidence" }),
    option("b", "去法院旁听，拒绝替课题组熬夜", "你第一次听见真实法庭里的停顿、改口和沉默。老师的课题组则找到了另一个助手。", { energy: -10, professional: 8, opportunity: 3, persona: { ambiguityTolerance: 8, expression: 4 }, routes: { advocacy: 5, firm: 3 }, evidence: "advocate" }),
    option("c", "都不接，今晚把睡眠列为不可处分权利", "第二天你精神完整地走进教室。机会没有回来，但你的注意力终于回来了。", { energy: 10, professional: -2, opportunity: -6, persona: { stressTolerance: 5, realityPlanning: 5 }, routes: { survival: 9 }, evidence: "planner" }),
  ]),

  event("law_resource_y3s1_001", "y3s1", "实习面试、法考课和模拟法庭在同一张日历上", "一个决定真实工作入口，一个决定考试准备，一个决定表达路线。你的精力余额明确表示：三者不可兼得。", [
    option("a", "押实习面试，暂停本月模拟法庭训练", "你拿到了进入律所的临时通行证，也第一次见到律政剧主动省略的工作内容。", { energy: -15, professional: 8, opportunity: 12, persona: { realityPlanning: 10, stressTolerance: 4 }, routes: { firm: 12 }, evidence: "planner" }),
    option("b", "押模拟法庭，法考和实习都降为保底", "你站上发言席时很亮，回宿舍后发现另外两条路线都进入了未读消息。", { energy: -18, professional: 8, opportunity: 7, persona: { expression: 12, idealDrive: 5 }, routes: { advocacy: 13 }, evidence: "advocate" }),
    option("c", "保法考节奏，拒绝新增任何高风险承诺", "你没有获得本月最显眼的经历，但复习进度第一次没有被临时任务肢解。", { energy: -9, professional: 10, opportunity: -7, persona: { ruleSensitivity: 6, realityPlanning: 8 }, routes: { civil: 4, academic: 5 }, evidence: "rule_keeper" }),
  ]),
  event("law_resource_y3s1_002", "y3s1", "带教今晚要检索，导师明早要提纲，队友正在求救", "三个人都说“不会占用你太久”。根据既往判例，这句话通常意味着今晚已经不属于你。", [
    option("a", "先交带教检索，让真实工作排第一", "凌晨一点，带教回了“收到”。两个字很短，你用于换取它的夜晚很长。", { energy: -19, professional: 10, opportunity: 10, persona: { evidence: 2, stressTolerance: 8 }, routes: { firm: 11 }, evidence: "evidence" }),
    option("b", "先写导师提纲，放弃实习里的表现机会", "导师在提纲上留下三处修改，也留下了下一次讨论的时间。带教没有催你，只把任务转给了别人。", { energy: -15, professional: 12, opportunity: 6, persona: { idealDrive: 8, ruleSensitivity: 6 }, routes: { academic: 11 }, evidence: "rule_keeper" }),
    option("c", "帮队友拆任务，但明确不替他完成", "你给出结构、截止时间和责任人，没有把整份材料抱回自己宿舍。关系保住了，边界也第一次没有撤诉。", { energy: -8, professional: 5, opportunity: 5, persona: { responsibility: 5, realityPlanning: 8 }, routes: { survival: 5, advocacy: 2 }, evidence: "mediator" }),
  ]),

  event("law_resource_y3s2_001", "y3s2", "保研论文、考公资料和律所实习同时向你招手", "这不是兴趣测试，而是三条路线开始要求真金白银的时间。继续平均用力，最可能得到三份平均水平的焦虑。", [
    option("a", "把机会集中给论文和老师推荐", "你开始对脚注格式产生条件反射，也终于拥有了一条能讲清楚的学术路径。", { energy: -17, professional: 13, opportunity: -3, persona: { idealDrive: 8, ruleSensitivity: 8 }, routes: { academic: 14 }, evidence: "rule_keeper" }),
    option("b", "把机会集中给岗位表和考试计划", "你用表格处理焦虑：岗位、条件、时间线、备选方案。世界没有变简单，但至少可以筛选。", { energy: -13, professional: 6, opportunity: -2, persona: { realityPlanning: 13, stressTolerance: 4 }, routes: { civil: 15 }, evidence: "planner" }),
    option("c", "接受律所实习，暂停论文和考公投入", "你开始用检索结果、版本号和交付时间理解法律工作。其他两条路线没有消失，只是明显变窄。", { energy: -19, professional: 10, opportunity: 10, persona: { realityPlanning: 9, evidence: 1 }, routes: { firm: 15 }, evidence: "evidence" }),
  ]),
  event("law_resource_y3s2_002", "y3s2", "法律援助来了真实求助，期末复习只剩四天", "求助者的问题无法延期，考试也不会因为你富有同情心而少考一章。你必须决定这周谁先得到完整的你。", [
    option("a", "接下求助，接受期末成绩可能下滑", "教材里的法律关系突然有了姓名和语气。你付出了绩点风险，也得到了一次无法复制的现实练习。", { energy: -18, professional: 9, opportunity: 7, persona: { responsibility: 11, ambiguityTolerance: 8 }, routes: { advocacy: 5, firm: 4 }, evidence: "mediator" }),
    option("b", "专心备考，把求助转给更有余力的同学", "你没有假装自己能救所有人，而是完成了转介。考试保住了，英雄叙事没有发生。", { energy: -10, professional: 10, opportunity: -2, persona: { realityPlanning: 8, responsibility: 2 }, routes: { academic: 7, civil: 4 }, evidence: "planner" }),
    option("c", "先做事实清单，再限定只帮到周三", "你没有无限接锅，也没有直接离场。求助被拆成可处理的问题，你的复习时间只被判了缓刑。", { energy: -13, professional: 8, opportunity: 4, persona: { evidence: 2, responsibility: 6, realityPlanning: 6 }, routes: { firm: 3, survival: 4 }, evidence: "evidence" }),
  ]),

  event("law_resource_y4s1_001", "y4s1", "秋招面试、法考冲刺和论文开题三案并审", "每一件都关系未来，每一件都能吞掉一整周。你终于理解，大四不是选择更多，而是放弃必须更具体。", [
    option("a", "保秋招面试，法考改成长线准备", "你把简历里的每个动词都准备了证据。法考进度落后，但工作入口第一次变得真实。", { energy: -16, professional: 8, opportunity: 11, persona: { realityPlanning: 10, expression: 5 }, routes: { firm: 13 }, evidence: "planner" }),
    option("b", "保法考冲刺，主动放弃本轮秋招", "你关掉招聘页面，世界突然安静了一点。代价是别人谈 offer 时，你只能谈正确率。", { energy: -15, professional: 12, opportunity: -9, persona: { ruleSensitivity: 8, stressTolerance: 7 }, routes: { civil: 7, academic: 6 }, evidence: "rule_keeper" }),
    option("c", "先把论文开题做稳，其他路线延后一周", "导师终于不再问“你的问题意识在哪里”。秋招和法考没有消失，只是一起在门外敲门。", { energy: -13, professional: 13, opportunity: -4, persona: { idealDrive: 7, realityPlanning: 5 }, routes: { academic: 12 }, evidence: "rule_keeper" }),
  ]),
  event("law_resource_y4s1_002", "y4s1", "一个不完美的 offer，撞上还没出结果的考试", "offer 要求两天内答复，考试结果和更想去的岗位都还在路上。稳定、可能性和继续等待，不能同时拥有。", [
    option("a", "先接 offer，用确定性结束等待", "你没有等到最理想的答案，但先替毕业后的自己保住了一块落脚地。", { energy: 5, professional: 3, opportunity: -4, persona: { realityPlanning: 13, ambiguityTolerance: -5 }, routes: { firm: 12 }, evidence: "planner" }),
    option("b", "拒绝 offer，继续等真正想走的路线", "你保住了可能性，也把不确定性完整留在了自己手里。每天查邮箱开始成为一种新型必修课。", { energy: -12, professional: 4, opportunity: 5, persona: { idealDrive: 11, ambiguityTolerance: 8 }, routes: { academic: 4, civil: 5, detour: 4 }, evidence: "advocate" }),
    option("c", "向对方争取延期，不提前替自己判决", "你没有立刻接受，也没有浪漫拒绝，而是第一次把谈判用在了自己的人生上。", { energy: -8, professional: 5, opportunity: 3, persona: { expression: 7, evidence: 1, realityPlanning: 8 }, routes: { firm: 6, advocacy: 5 }, evidence: "evidence" }),
  ]),
  event("law_resource_y1s1_003", "y1s1", "补退选只剩十分钟，法理名师和周五空课不可兼得", "抢到名师意味着周五早八，保住空课意味着跟一个据说会把 PPT 念出感情的老师。教务系统正在倒计时。", [
    option("a", "换进名师班，接受每周五被闹钟依法传唤", "你得到一门值得听的课，也失去了大学里最像周末的半天。", { energy: -8, professional: 8, opportunity: 3, persona: { idealDrive: 6, ruleSensitivity: 4 }, routes: { academic: 5 }, evidence: "rule_keeper" }),
    option("b", "保住空课，靠自己和教材建立委托关系", "周五上午归你所有。至于法理学，你与教材形成了事实上的共同生活。", { energy: 4, professional: 2, opportunity: -2, persona: { realityPlanning: 7, stressTolerance: 3 }, routes: { survival: 5 }, evidence: "planner" }),
    option("c", "先问遍学长学姐，再按往年考核方式下注", "你用二十条聊天记录换来一张课程风险表，第一次把选课做成尽调。", { energy: -5, professional: 4, opportunity: 4, persona: { evidence: 2, realityPlanning: 8 }, routes: { firm: 3, academic: 2 }, evidence: "evidence" }),
  ]),
  event("law_resource_y1s2_003", "y1s2", "法律科普号催稿，期末重点刚发了六十页", "你的第一篇署名推文今晚截稿，老师同时把六十页重点扔进群里，并补了一句‘不多，大家理解为主’。", [
    option("a", "把推文写到能发，复习先抓老师反复强调的部分", "推文收获了三位数阅读量，你也学会了在六十页里辨认老师的语气证据。", { energy: -13, professional: 5, opportunity: 8, persona: { expression: 8, ambiguityTolerance: 4 }, routes: { advocacy: 5 }, evidence: "advocate" }),
    option("b", "退出本期推文，完整啃完考试重点", "账号少了一篇内容，你的笔记多了一套能在考场上救命的结构。", { energy: -11, professional: 9, opportunity: -4, persona: { ruleSensitivity: 7, idealDrive: 4 }, routes: { academic: 6 }, evidence: "rule_keeper" }),
    option("c", "交一篇短稿，给复习留出不可侵占的时间", "编辑说还能再展开，你说下期一定。双方都知道这是一次附期限的承诺。", { energy: -6, professional: 4, opportunity: 2, persona: { realityPlanning: 9, expression: 3 }, routes: { survival: 4, advocacy: 2 }, evidence: "planner" }),
  ]),
  event("law_resource_y2s1_003", "y2s1", "老师招研究助理，条件是先整理三百份裁判文书", "这是认识老师的入口，也是一个会把周末压缩成 Excel 行号的入口。报名邮件只需要一分钟，后续代价不支持撤回。", [
    option("a", "报名，把三百份文书当成学术入场券", "你开始在裁判文书里看见规律，也开始在梦里看见案号。", { energy: -18, professional: 12, opportunity: 10, persona: { evidence: 2, idealDrive: 7 }, routes: { academic: 11 }, evidence: "evidence" }),
    option("b", "不报名，保住课程和自己的周末", "你错过了一次被老师记住的机会，但周日晚上没有对人生提起确认之诉。", { energy: 7, professional: 3, opportunity: -7, persona: { realityPlanning: 8, stressTolerance: 4 }, routes: { survival: 8 }, evidence: "planner" }),
    option("c", "先问清署名、工时和具体产出再决定", "老师第一次收到一封像尽职调查清单的报名邮件，也第一次认真回复了你的问题。", { energy: -7, professional: 7, opportunity: 5, persona: { evidence: 3, ruleSensitivity: 5 }, routes: { firm: 5, academic: 4 }, evidence: "evidence" }),
  ]),
  event("law_resource_y2s2_003", "y2s2", "模拟法庭队友赛前失联，你的转专业材料还差一页", "队友负责的质证稿一片空白，转专业申请今晚关窗。救场意味着材料可能来不及，先救自己意味着全队一起沉默。", [
    option("a", "替队友补质证稿，转专业申请下次再说", "你把全队从沉默里捞出来，也亲手关掉了这一轮转专业窗口。", { energy: -18, professional: 9, opportunity: 6, persona: { responsibility: 11, expression: 5 }, routes: { advocacy: 10 }, evidence: "mediator" }),
    option("b", "先交转专业材料，让队伍按缺席事实处理", "申请成功进入系统。队友第二天出现时，群里的空气已经足够单独构成证据。", { energy: -11, professional: -3, opportunity: -4, persona: { realityPlanning: 12, responsibility: -4 }, routes: { transfer: 13 }, evidence: "escape" }),
    option("c", "只补质证框架，同时把失联经过发给领队", "你没有独自填完所有坑，而是把事实、责任和最低交付一起摆上桌。", { energy: -10, professional: 6, opportunity: 2, persona: { evidence: 3, responsibility: 5, realityPlanning: 7 }, routes: { advocacy: 4, survival: 4 }, evidence: "evidence" }),
  ]),
  event("law_resource_y3s1_003", "y3s1", "法院实习第一天，带教让你留下做一份‘很快的’检索", "末班地铁还有四十分钟，检索范围没有边界，带教说做完发他就行。你突然理解了‘很快’属于相对概念。", [
    option("a", "留下做完，先让带教记住可靠", "你赶上了最后一班地铁，也在二十三点五十八分收到一个‘辛苦’。", { energy: -18, professional: 10, opportunity: 10, persona: { stressTolerance: 8, responsibility: 6 }, routes: { firm: 8, civil: 3 }, evidence: "planner" }),
    option("b", "先确认检索范围，约定明早交第一版", "任务从宇宙大小缩成了八个关键词。边界没有伤害职业形象，反而救了双方一晚。", { energy: -8, professional: 8, opportunity: 6, persona: { expression: 6, evidence: 2, realityPlanning: 7 }, routes: { firm: 7 }, evidence: "evidence" }),
    option("c", "按时离开，实习不值得拿健康无限担保", "你坐上地铁时还有电量。第二天带教没有夸你，但任务照样继续。", { energy: 5, professional: 1, opportunity: -6, persona: { stressTolerance: 5, realityPlanning: 8 }, routes: { survival: 9 }, evidence: "planner" }),
  ]),
  event("law_resource_y3s2_003", "y3s2", "交换名额、实习续期和保研夏令营同日截止", "三个申请都要求一套不同版本的你：国际化的你、能干活的你、会研究的你。今晚只能精修一份。", [
    option("a", "精修夏令营材料，把研究方向讲成一条路", "你的个人陈述终于不像关键词拼盘，另外两封邮件则停在草稿箱。", { energy: -15, professional: 12, opportunity: 5, persona: { idealDrive: 9, ruleSensitivity: 5 }, routes: { academic: 13 }, evidence: "rule_keeper" }),
    option("b", "拿下实习续期，让真实工作继续积累", "带教回复了欢迎继续。你的暑假有了去处，也失去了‘什么都可能’的浪漫。", { energy: -13, professional: 9, opportunity: 10, persona: { realityPlanning: 10, stressTolerance: 4 }, routes: { firm: 13 }, evidence: "planner" }),
    option("c", "押交换名额，允许路线暂时偏离标准答案", "申请寄出后你第一次期待一张陌生课表。确定性下降了，世界半径上升了。", { energy: -11, professional: 3, opportunity: 8, persona: { ambiguityTolerance: 11, idealDrive: 5 }, routes: { detour: 9, transfer: 4 }, evidence: "advocate" }),
  ]),
  event("law_resource_y4s1_003", "y4s1", "论文资料付费墙、面试模拟和毕业照撞在一天", "数据库要付费，学长只在今晚有空模拟面试，班群说错过毕业照不补拍。大四开始用纪念、机会和成果争夺同一块时间。", [
    option("a", "约学长模拟面试，毕业照靠后期补存在感", "你纠正了三个面试漏洞，也在班级合照里获得了一个精心修入的位置。", { energy: -12, professional: 6, opportunity: 11, persona: { realityPlanning: 9, expression: 6 }, routes: { firm: 10 }, evidence: "planner" }),
    option("b", "解决论文资料，先让答辩有东西可答", "你拿到关键文献。朋友圈里全班站得整整齐齐，你在数据库里独自毕业。", { energy: -13, professional: 13, opportunity: -3, persona: { ruleSensitivity: 7, idealDrive: 6 }, routes: { academic: 10 }, evidence: "rule_keeper" }),
    option("c", "去拍毕业照，今晚不再把人生全部折算成产出", "论文和面试都没有因此毁灭。你得到一张多年后还能证明自己确实来过的照片。", { energy: 6, professional: -2, opportunity: -2, persona: { ambiguityTolerance: 6, stressTolerance: 5 }, routes: { survival: 9 }, evidence: "mediator" }),
  ]),
];

export const LAW_ROGUELITE_RANDOM_EVENTS = [
  crisis("law_crisis_y2s1_final_week", "y2s1", "四门闭卷挤在六天里，你已经开始法条串台", "民法题刚读到请求权基础，脑子里却自动播放刑法构成要件。行政法笔记摊在左边，商法重点压在泡面下面。距离第一场考试还有三十六小时。", {
    any: [
      { type: "stat", key: "energy", op: "<=", value: 65 },
      { type: "hiddenStat", key: "ruleSensitivity", op: ">=", value: 62 },
    ],
  }, [
    option("a", "放弃四门全优，按考试顺序只救最近两门", "你第一次承认时间表比意志力更有法律效力。两门重点清楚了，另外两门接受普通通过。", { energy: 7, professional: 2, opportunity: -2, persona: { realityPlanning: 9, ambiguityTolerance: 4 }, routes: { survival: 8 }, evidence: "planner" }),
    option("b", "咖啡续杯，四门一起背到天亮", "凌晨四点，你把无权代理写进了犯罪构成，把行政行为撤销成了可撤销合同。电脑还亮着，人已经停止区分部门法。", { energy: -24, professional: 5, opportunity: 0, persona: { stressTolerance: -8, ruleSensitivity: 4 }, routes: { academic: 3 }, evidence: "rule_keeper", flags: ["law_mid_gg_final_week"] }),
    option("c", "拉同学互换重点，承认一个人背不完全部", "你贡献民法框架，同学贡献行政法押题。没有人独立完成奇迹，但大家终于知道明天考什么。", { energy: -6, professional: 6, opportunity: 4, persona: { responsibility: 5, realityPlanning: 6 }, routes: { survival: 5, academic: 2 }, evidence: "mediator" }),
  ]),
  crisis("law_crisis_y2s2_moot_court", "y2s2", "模拟法庭开庭前两小时，队友集体进入失联状态", "主辩稿停在“尊敬的审判长”，证据目录错了三页，负责打印的人最后上线时间是昨晚。领队在群里问：谁能先顶一下？", {
    any: [
      { type: "stat", key: "energy", op: "<=", value: 68 },
      { type: "hiddenStat", key: "responsibility", op: ">=", value: 62 },
    ],
  }, [
    option("a", "砍掉所有花活，只保一套能开庭的最低版本", "你删掉炫技环节，重排证据顺序。比赛不一定漂亮，但至少不会由一页空白担任主辩。", { energy: -8, professional: 7, opportunity: 3, persona: { realityPlanning: 8, expression: 4 }, routes: { advocacy: 6, survival: 3 }, evidence: "planner" }),
    option("b", "主辩、材料、打印全接过来，今天我就是全组", "你一人完成开庭、质证和后勤。散庭时裁判问团队如何分工，你差点提交自己的器官清单。", { energy: -25, professional: 8, opportunity: 3, persona: { responsibility: 10, stressTolerance: -10 }, routes: { advocacy: 7 }, evidence: "mediator", flags: ["law_mid_gg_moot_court"] }),
    option("c", "群里点名分工，缺谁的部分就如实缺席", "沉默的队友陆续恢复民事行为能力。你没有替全组制造奇迹，只让每个人重新成为责任主体。", { energy: -5, professional: 5, opportunity: 2, persona: { evidence: 2, responsibility: -3, expression: 7 }, routes: { advocacy: 4, survival: 4 }, evidence: "evidence" }),
  ]),
  crisis("law_crisis_y3s1_internship_v12", "y3s1", "带教凌晨一点发来一句：整体不错，简单改一下", "附件名是“合同终版_v7”。消息下面跟着十六条修改意见，最后一条写着“明早上班前给我”。你八点半还有一场闭卷考试。", {
    any: [
      { type: "stat", key: "energy", op: "<=", value: 68 },
      { type: "hiddenStat", key: "realityPlanning", op: ">=", value: 62 },
    ],
  }, [
    option("a", "先交可用版，明确说明早上有考试", "你把最要命的三处改完，剩下的列成清单。带教没有鼓掌，但也没有宣布你的职业生涯当场终结。", { energy: -7, professional: 6, opportunity: 2, persona: { expression: 7, realityPlanning: 8 }, routes: { firm: 5, survival: 3 }, evidence: "planner" }),
    option("b", "把“最终版”改到天亮，考试靠法感", "文件从 v7 长到 v12，天也亮了。合同保存成功，你走进考场时发现自己的大脑没有自动保存。", { energy: -28, professional: 8, opportunity: 6, persona: { stressTolerance: -10, responsibility: 7 }, routes: { firm: 8 }, evidence: "planner", flags: ["law_mid_gg_internship_v12"] }),
    option("c", "关电脑睡觉，明早先考试再处理实习", "你没有用一次实习替整学期成绩作无限担保。第二天消息仍在那里，但你至少看得懂题干。", { energy: 9, professional: -2, opportunity: -5, persona: { realityPlanning: 9, stressTolerance: 5 }, routes: { survival: 8 }, evidence: "planner" }),
  ]),
  crisis("law_crisis_y3s2_exam_accuracy", "y3s2", "法考正确率连续三天向下，你开始刷经验贴求判决", "三百道题刷完，正确率从 52% 稳定降到 41%。收藏夹里已经有二十七篇上岸经验，脑子里的知识点正在互相撤销。", {
    any: [
      { type: "stat", key: "energy", op: "<=", value: 70 },
      { type: "hiddenStat", key: "ruleSensitivity", op: ">=", value: 65 },
    ],
  }, [
    option("a", "关掉经验贴，只复盘今天真正错掉的二十题", "错题数量没有立刻变少，但每一道终于有了死因。正确率第一次停止自由落体。", { energy: -6, professional: 9, opportunity: 0, persona: { evidence: 3, ruleSensitivity: 6, realityPlanning: 4 }, routes: { civil: 4, academic: 3 }, evidence: "evidence" }),
    option("b", "再开一套卷证明 41% 只是偶然", "新卷用 39% 完成了举证。你成功证明前一天不是偶然，也暂时失去了继续证明的精神能力。", { energy: -25, professional: 3, opportunity: -1, persona: { stressTolerance: -9, ambiguityTolerance: -6 }, routes: { civil: 5 }, evidence: "rule_keeper", flags: ["law_mid_gg_exam_accuracy"] }),
    option("c", "把法考改成长线，不在本周给人生判终局", "你从冲刺表里删掉三套卷，换回睡眠和一份能执行的复盘计划。考试没有消失，灾难叙事先退庭了。", { energy: 8, professional: 4, opportunity: -3, persona: { realityPlanning: 10, ambiguityTolerance: 6 }, routes: { survival: 6, civil: 3 }, evidence: "planner" }),
  ]),
  crisis("law_crisis_y4s1_thesis_versions", "y4s1", "导师说整体不错，再改一版；你找不到哪版是整体", "桌面上躺着 final、final2、真的final 和 final_导师意见。明早要交开题修改稿，每一份都像最新版，又都缺一点东西。", {
    any: [
      { type: "stat", key: "energy", op: "<=", value: 72 },
      { type: "stat", key: "professionalAccumulation", op: ">=", value: 45 },
    ],
  }, [
    option("a", "建版本表，只保留一个母版重新合并", "你花了一小时做原本早该做的事。论文终于只剩一个现在时，文件夹里的历史版本被依法封存。", { energy: -7, professional: 10, opportunity: 0, persona: { evidence: 2, realityPlanning: 9 }, routes: { academic: 6, survival: 2 }, evidence: "evidence" }),
    option("b", "继续凭文件名寻找“真的最终版”", "你在四份文档之间来回复制，最后把旧段落覆盖了新修改。论文通过查重之前，你先没通过版本识别。", { energy: -24, professional: -4, opportunity: -2, persona: { stressTolerance: -10, realityPlanning: -7 }, routes: { academic: 3 }, evidence: "rule_keeper", flags: ["law_mid_gg_thesis_versions"] }),
    option("c", "带着四个版本找导师，当面确认哪份能救", "导师沉默了三秒，帮你圈出母版。尴尬只持续了一会儿，独自猜版本本来会持续一整夜。", { energy: -5, professional: 7, opportunity: 3, persona: { expression: 6, ambiguityTolerance: 5 }, routes: { academic: 5 }, evidence: "mediator" }),
  ]),
  incident("law_incident_y1s1_001", "y1s1", "图书馆座位争议，全桌请法学生现场判案", "对面同学说水杯占座有效，旁边同学主张离席二十分钟视为放弃。你只是来背书，却突然获得临时审判权。", [
    option("a", "先查馆规，再宣布水杯不具备民事主体资格", "围观群众对结论基本满意，对你真的打开馆规这件事尤其震撼。", { energy: -4, professional: 4, opportunity: 2, persona: { evidence: 1, ruleSensitivity: 4 }, routes: { academic: 2 } }),
    option("b", "提议拼桌，拒绝让一只水杯制造校园判例", "争议在两分钟内解决。你没有留下判决书，只留下了两个座位。", { energy: 1, professional: 1, opportunity: 3, persona: { responsibility: 3, ambiguityTolerance: 3 }, routes: { advocacy: 2 } }),
  ]),
  incident("law_incident_y1s2_001", "y1s2", "选课系统崩了，群里开始征集违约责任", "全班卡在提交页面，有人主张教务处构成根本违约，有人已经开始制作损失清单。", [
    option("a", "截图保存，按公告和时间顺序整理事实", "十分钟后系统恢复，你的证据包失去诉讼价值，却意外成了群里的操作指南。", { energy: -3, professional: 3, opportunity: 2, persona: { evidence: 2, realityPlanning: 3 }, routes: { firm: 2 } }),
    option("b", "先去吃饭，拒绝对加载图标进行法律分析", "你回来时系统已经恢复，唯一损失是一顿饭期间错过了四十七条群消息。", { energy: 4, professional: 0, opportunity: -1, persona: { stressTolerance: 4 }, routes: { survival: 3 } }),
  ]),
  incident("law_incident_y2s1_001", "y2s1", "校园墙捡到耳机，评论区要求你证明所有权", "失主说耳机是他的，评论区要求公开序列号、购买记录和使用痕迹。一场失物招领逐渐长成证据法课堂。", [
    option("a", "私下核对特征，提醒大家别公开个人信息", "耳机顺利归还。评论区没等到公开审判，只等到一句‘已解决’。", { energy: -4, professional: 4, opportunity: 3, persona: { evidence: 2, responsibility: 3 }, routes: { firm: 2 } }),
    option("b", "围观但不接案，今天只做普通路人", "案件在你划走后自行解决。事实证明，不是每次看见争议都必须自动出庭。", { energy: 3, professional: 0, opportunity: 0, persona: { realityPlanning: 3 }, routes: { survival: 2 } }),
  ]),
  incident("law_incident_y2s2_001", "y2s2", "老师考前四十八小时宣布：开卷，但只能带一本书", "全班先欢呼，再发现一本到场意味着目录、索引和贴签将共同决定命运。开卷考试正式转型为书本导航竞赛。", [
    option("a", "重做目录和索引，把教材训练成搜索引擎", "你的书长出了五颜六色的标签，翻页速度开始具有职业选手气质。", { energy: -8, professional: 6, opportunity: 0, persona: { ruleSensitivity: 5, realityPlanning: 4 }, routes: { academic: 4 } }),
    option("b", "继续理解案例，不参加贴签军备竞赛", "你带着一本外表朴素的教材进场，决定相信大脑仍有最低限度的管辖权。", { energy: -5, professional: 5, opportunity: 0, persona: { ambiguityTolerance: 4, idealDrive: 3 }, routes: { advocacy: 2 } }),
  ]),
  incident("law_incident_y3s1_001", "y3s1", "实习群二十三点四十七分突然有人 @ 你", "消息只有一句‘这个明早能给吗’，没有主语，没有附件，也没有说明‘这个’究竟是什么。", [
    option("a", "立即回复，先把任务范围问清楚", "五轮消息后，你终于确认对方 @ 错了人。今晚最大的产出是排除责任主体。", { energy: -5, professional: 2, opportunity: 2, persona: { evidence: 2, expression: 3 }, routes: { firm: 3 } }),
    option("b", "静音睡觉，明早按工作时间处理", "第二天你发现对方确实 @ 错了人。边界第一次以未读消息的形式为你胜诉。", { energy: 6, professional: 0, opportunity: -1, persona: { realityPlanning: 4, stressTolerance: 3 }, routes: { survival: 4 } }),
  ]),
  incident("law_incident_y3s2_001", "y3s2", "你在校园墙写的法律分析突然爆了", "原本只想纠正一个常识错误，结果转发过千。评论区开始咨询劳动、租房、恋爱和室友外卖失踪。", [
    option("a", "补充免责声明，只回答自己能核实的部分", "热度下降了一点，可信度上升了一点。你拒绝从学生一夜晋升为全科免费法律顾问。", { energy: -7, professional: 6, opportunity: 7, persona: { evidence: 2, responsibility: 3 }, routes: { advocacy: 5 } }),
    option("b", "趁热做成系列，接受本周复习进度缩水", "账号涨粉了，复习计划也开始掉粉。你第一次体会到表达真的会带来机会和账单。", { energy: -13, professional: 4, opportunity: 10, persona: { expression: 8, stressTolerance: 3 }, routes: { advocacy: 7 } }),
  ]),
  incident("law_incident_y4s1_001", "y4s1", "面试前夜，亲戚发来一份合同让你‘顺手看看’", "文件二十八页，亲戚说不复杂，只想知道能不能签。你的面试稿还停在自我介绍第二句。", [
    option("a", "说明不能替代律师，只标出最明显的风险", "亲戚得到三条风险提示，你保住了大部分面试时间，也保住了职业边界。", { energy: -7, professional: 5, opportunity: 1, persona: { expression: 4, responsibility: 4 }, routes: { firm: 4 } }),
    option("b", "婉拒，今晚只对自己的面试承担责任", "亲戚回了一个‘好吧’。你第一次发现拒绝免费审合同并不会自动失去亲属关系。", { energy: 3, professional: 1, opportunity: -1, persona: { realityPlanning: 5, stressTolerance: 3 }, routes: { survival: 4 } }),
  ]),
];
