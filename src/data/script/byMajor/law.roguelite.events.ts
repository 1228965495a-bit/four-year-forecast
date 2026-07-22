type SemesterKey = "y1s1" | "y1s2" | "y2s1" | "y2s2" | "y3s1" | "y3s2" | "y4s1";

type DecisionEffects = {
  energy: number;
  professional: number;
  opportunity: number;
  persona: Record<string, number>;
  routes: Record<string, number>;
  evidence: string;
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
      personaEvidence: [effects.evidence],
    },
  };
}

function event(id: string, semester: SemesterKey, title: string, description: string, options: ReturnType<typeof option>[]) {
  return { id, majorId: "law", semester, type: "resource", title, description, tags: ["资源取舍", "本周只能保住一部分"], options };
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
];

