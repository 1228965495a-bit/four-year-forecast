export type ClinicalRouteKey =
  | "diagnosis"
  | "surgery"
  | "research"
  | "planning"
  | "humanities"
  | "detour"
  | "survival";

export type ClinicalImpact = {
  medical?: number;
  opportunity?: number;
  traits?: Record<string, number>;
  routes?: Partial<Record<ClinicalRouteKey, number>>;
  flags?: string[];
  closes?: ClinicalRouteKey[];
  experiences?: string[];
  proof?: string;
};

type ClinicalOption = {
  id: string;
  text: string;
  feedback: string;
  effects: { stats: Record<string, number> };
  clinical: ClinicalImpact;
};

export type ClinicalEvent = {
  id: string;
  eventId: string;
  majorId: "clinical_medicine";
  semester: string | null;
  type: "main" | "route" | "major_random" | "hidden";
  title: string;
  description: string;
  routeIds: ClinicalRouteKey[];
  weight: number;
  options: ClinicalOption[];
  choices: ClinicalOption[];
};

function o(
  id: string,
  text: string,
  feedback: string,
  energy: number,
  clinical: ClinicalImpact,
  stats: Record<string, number> = {},
): ClinicalOption {
  return {
    id,
    text,
    feedback,
    effects: { stats: { energy, ...stats } },
    clinical,
  };
}

function e(
  id: string,
  semester: string | null,
  type: ClinicalEvent["type"],
  title: string,
  description: string,
  options: ClinicalOption[],
  routeIds: ClinicalRouteKey[] = [],
  weight = 10,
): ClinicalEvent {
  return {
    id,
    eventId: id,
    majorId: "clinical_medicine",
    semester,
    type,
    title,
    description,
    routeIds,
    weight,
    options,
    choices: options,
  };
}

export const CLINICAL_CORE_EVENTS: ClinicalEvent[] = [
  e("clinical_core_01_entry", "y1s1", "main", "解剖课前，教室第一次安静下来", "老师没有讲传奇病例，只认真介绍了捐献者与课堂边界。刚才还在讨论白大褂合不合身的人都收了声。医学的第一课没有滤镜，只有尊重。", [
    o("a", "把课堂规范逐条记下来", "你没有说漂亮话，只把名字、流程和不能越过的边界记得很牢。", -3, { medical: 5, traits: { clinicalCaution: 7, idealDrive: 3 }, flags: ["clinical_respect_first"], routes: { diagnosis: 2 }, experiences: ["解剖课第一次真正安静下来"], proof: "guideline" }),
    o("b", "先问清课程怎么学、怎么考", "敬畏没有妨碍你关心期末。老师给了范围，也提醒你别把人体结构背成互不认识的地名。", -2, { medical: 4, traits: { realityPlanning: 6 }, flags: ["clinical_practical_entry"], routes: { planning: 2, survival: 2 }, proof: "planner" }),
    o("c", "承认自己有点怕，先慢慢适应", "你没有硬装镇定。下课时心跳恢复了，滤镜少了一层，留下来的尊重反而更具体。", 1, { traits: { ambiguityTolerance: 4, boundarySense: 6, idealDrive: 2 }, flags: ["clinical_honest_entry"], routes: { humanities: 3, survival: 2 }, proof: "idealist" }, { filter: -6 }),
  ]),
  e("clinical_core_02_study", "y1s2", "main", "每门基础课都觉得自己是唯一一门", "生化、组胚、生理同时发来重点，三个老师都说“跟着进度就不难”。你的进度只有一份，重点已经开始争夺同一块脑区。", [
    o("a", "自己画框架，再往里面塞细节", "第一晚只整理完两章，看起来比刷题慢。至少第二天翻开时，你知道知识该放在哪里。", -7, { medical: 9, traits: { timelineSense: 8, studyFramework: 9 }, flags: ["clinical_study_framework"], routes: { diagnosis: 5, research: 2 }, proof: "timeline" }),
    o("b", "跟着题库背，先保住考试", "你迅速知道哪些词最常出现在选项里。至于它们为什么同时出现，暂时交给下学期解释。", -5, { medical: 5, traits: { memorizationStamina: 7, realityPlanning: 4 }, flags: ["clinical_study_questionbank"], routes: { planning: 3, survival: 3 }, proof: "planner" }),
    o("c", "拉三个人组队，各自整理一门", "资料很快凑齐了，格式像来自三个平行宇宙。你负责把标题统一，也顺便学会了开口确认。", -4, { medical: 5, opportunity: 3, traits: { teamBackup: 8, expression: 5 }, flags: ["clinical_study_team"], routes: { humanities: 3, survival: 2 }, proof: "buffer" }),
    o("d", "期末前集中背，平时先活着", "日常睡眠保住了。期末周到来时，六百页课件也完整保住了自己。", 3, { medical: 2, traits: { lastMinute: 10, stressTolerance: 2 }, flags: ["clinical_study_cram"], routes: { survival: 5 }, proof: "predictor" }, { gpaWill: -3 }),
  ]),
  e("clinical_core_03_mechanism", "y2s1", "main", "标准答案会背，老师偏问为什么", "病例讨论写着发热、乏力和几项化验结果。你刚把最像的答案圈出来，老师追问：“哪条信息支持？哪条又对不上？”题库突然失去选择题格式。", [
    o("a", "把症状按时间重排，再列矛盾点", "答案晚了几分钟，但你找到了两处不能硬塞进同一结论的信息。", -6, { medical: 9, traits: { timelineSense: 10, clinicalCaution: 6 }, flags: ["clinical_case_timeline"], routes: { diagnosis: 8 }, proof: "timeline" }),
    o("b", "先说最可能的，再查依据补完整", "你给了方向，也把“不确定”留在句子里。老师没夸你果断，只说这个顺序至少安全。", -5, { medical: 7, traits: { clinicalCaution: 9, guidelineHabit: 7 }, flags: ["clinical_case_verify"], routes: { diagnosis: 6, planning: 2 }, proof: "guideline" }),
    o("c", "拉同组同学各解释一段机制", "四个人拼出了一条能走通的链。你个人没有包办，但讨论没有停在互相看脸。", -4, { medical: 6, opportunity: 3, traits: { teamBackup: 8, expression: 6 }, flags: ["clinical_case_team"], routes: { humanities: 4, diagnosis: 3 }, proof: "buffer" }),
    o("d", "按记住的标准答案先答完", "病名说对了，理由像从另一道题借来的。老师点点头：“答案认识，病例还不认识。”", -2, { medical: 3, traits: { memorizationStamina: 5, clinicalCaution: -3 }, flags: ["clinical_case_answer_only"], routes: { survival: 3 }, proof: "predictor" }),
  ]),
  e("clinical_core_04_skill", "y2s2", "main", "技能课第一次失败，老师还站在旁边", "练习时动作顺序背得很熟，真正轮到你，手套、器械和无菌区同时开始考你。老师没有催，只问：“你现在最不确定哪一步？”", [
    o("a", "停下来先复述流程，再重新做", "你没有靠速度掩盖混乱。第二遍慢得明显，但每一步终于属于同一个流程。", -7, { medical: 8, traits: { operationPractice: 8, clinicalCaution: 8 }, flags: ["clinical_skill_process"], routes: { surgery: 7 }, proof: "guideline" }),
    o("b", "请同学指出刚才哪一步开始错", "同学只改了一个手位，你却少重复了三次错误动作。求助没有替你完成，只替你缩短了弯路。", -5, { medical: 7, opportunity: 3, traits: { activeHelp: 9, operationPractice: 7 }, flags: ["clinical_skill_help"], routes: { surgery: 6, humanities: 2 }, proof: "buffer" }),
    o("c", "课后留下来再练几轮", "最后一轮没有突然变成天才，只是手不再一听见老师脚步就自动改方向。", -10, { medical: 10, traits: { operationPractice: 11, stressTolerance: 6 }, flags: ["clinical_skill_repeat"], routes: { surgery: 9 }, experiences: ["一次失败后的重新练习"], proof: "idealist" }),
    o("d", "先旁观别人，今天不勉强上手", "你保住了无菌边界，也错过了这次练习量。谨慎成立，回避也留下了记录。", 1, { traits: { boundarySense: 8, clinicalAvoidance: 7 }, flags: ["clinical_skill_observe"], routes: { survival: 4 }, proof: "guideline" }),
  ]),
  e("clinical_core_05_history", "y3s1", "main", "问诊对象说“反正一直不舒服”", "模拟问诊进行到第三分钟，对方把半年前、上周和今天早上的症状揉成一句话。老师在旁边计时，你需要把故事理顺，又不能把人问成一道填空题。", [
    o("a", "先确认最困扰的问题，再追时间线", "对方终于说清先后顺序。你多用了半分钟，病历却第一次像一段能读懂的经历。", -6, { medical: 8, traits: { timelineSense: 9, interviewPatience: 7 }, flags: ["clinical_interview_timeline"], routes: { diagnosis: 6, humanities: 5 }, proof: "timeline" }),
    o("b", "按系统逐项问，保证不漏项目", "信息收得很全，语气像一张会说话的表格。老师提醒你：完整和听得进去不是同一件事。", -5, { medical: 7, traits: { clinicalCaution: 6, expression: 2 }, flags: ["clinical_interview_structured"], routes: { diagnosis: 5, planning: 2 }, proof: "guideline" }),
    o("c", "让对方先讲完，再归纳确认", "计时器响得有点早，但对方纠正了一处你原本会写错的信息。倾听占了时间，也省下了误解。", -7, { medical: 6, traits: { interviewPatience: 10, emotionalLabor: 7, expression: 6 }, flags: ["clinical_interview_listen"], routes: { humanities: 9 }, proof: "buffer" }),
    o("d", "礼貌打断，把问题拉回考试模板", "你按时问完了，时间线仍有两个洞。老师没有扣你礼貌分，只在病历旁画了两个问号。", -3, { medical: 3, traits: { realityPlanning: 4, interviewPatience: -4 }, flags: ["clinical_interview_rushed"], routes: { planning: 2, survival: 3 }, proof: "planner" }),
  ]),
  e("clinical_core_06_routes", "y3s2", "main", "科研、考研和临床机会同时发来消息", "导师问你愿不愿进项目，学姐把考研节点表发进群，技能中心又开放了练习名额。三个入口都写着“尽快回复”，你的精力只够认真接住一个半。", [
    o("a", "进项目，但先问清自己具体做什么", "老师把任务说得很具体：读文献、清数据、每周汇报。项目没有自动变成果，工作量先变清楚了。", -7, { medical: 5, opportunity: 7, traits: { researchPatience: 7, clinicalCaution: 4 }, flags: ["clinical_research_entry"], closes: ["surgery"], routes: { research: 9 }, proof: "guideline" }),
    o("b", "先定考研方向，把复习节奏排出来", "未来仍然不确定，但日历先有了颜色。你放弃了这轮项目，也获得了一个能执行的起点。", -5, { medical: 4, opportunity: 2, traits: { examPlanning: 10, realityPlanning: 8 }, flags: ["clinical_plan_entry"], closes: ["research"], routes: { planning: 10 }, proof: "planner" }),
    o("c", "把时间留给技能和病例训练", "简历暂时少了一行，手里的病例和操作却没有被“以后再练”继续延期。", -6, { medical: 8, opportunity: 4, traits: { operationPractice: 6, timelineSense: 5 }, flags: ["clinical_clinical_entry"], closes: ["research"], routes: { diagnosis: 5, surgery: 5 }, proof: "timeline" }),
    o("d", "三个都不全接，先保课程和睡眠", "群聊里的机会继续滚动，你没有全部上车。课程按时交了，人也没有在大三提前进入省电保护。", 4, { medical: 3, traits: { boundarySense: 9, lowCostSurvival: 9 }, flags: ["clinical_boundary_choice"], closes: ["research", "surgery"], routes: { survival: 10 }, proof: "guideline" }),
  ]),
  e("clinical_core_07_rounds", "y4s1", "main", "查房停在了你没预习的那床", "老师翻到化验单，抬头叫了你的名字。你昨晚准备的是隔壁床，眼前这份病历只看过首页。队伍已经停下，空气开始替你倒计时。", [
    o("a", "先把已知时间线说清，不会的承认", "你没有猜诊断。老师让你回去补两项依据，尴尬保住了，病例也真的记住了。", -6, { medical: 8, opportunity: 4, traits: { clinicalCaution: 10, timelineSense: 8 }, flags: ["clinical_rounds_honest"], routes: { diagnosis: 9 }, experiences: ["第一次如实说“我不知道”"], proof: "guideline" }),
    o("b", "按昨晚准备的框架快速组织回答", "框架救了开头，细节还是露了空。至少你没有把所有知识点同时倒在病床前。", -8, { medical: 7, traits: { studyFramework: 8, stressTolerance: 6 }, flags: ["clinical_rounds_framework"], routes: { diagnosis: 6, planning: 3 }, proof: "predictor" }),
    o("c", "请同组补充自己没看到的信息", "同组接住了两项结果，你负责把前后顺序重新串起来。不是个人高光，但汇报完整落地。", -5, { medical: 6, opportunity: 5, traits: { teamBackup: 8, responsibility: 5 }, flags: ["clinical_rounds_team"], routes: { humanities: 5, diagnosis: 4 }, proof: "buffer" }),
    o("d", "先赌一个最像的答案", "病名没有完全偏，依据却经不起第二问。老师只说：“学生最安全的能力，是知道什么时候别赌。”", -3, { medical: 2, traits: { clinicalCaution: -8, ambiguityTolerance: -2 }, flags: ["clinical_rounds_guess"], routes: { survival: 2 }, proof: "predictor" }),
  ]),
  e("clinical_core_08_rotation", "y4s2", "main", "轮转表把你分去了没想过的科室", "你原本把未来押在熟悉的方向，排班系统却把你送进一个完全陌生的科室。老师风格、工作节奏和沟通方式都与经验贴不一样。", [
    o("a", "先完整跟一轮，再判断喜不喜欢", "你没有因为第一天站到腿麻就立刻下结论。两周后，新的偏好真的长出了一点证据。", -7, { medical: 7, opportunity: 7, traits: { ambiguityTolerance: 8, idealDrive: 4 }, flags: ["clinical_rotation_open"], routes: { diagnosis: 3, surgery: 3, humanities: 3 }, experiences: ["轮转后改变科室偏好"], proof: "idealist" }),
    o("b", "按原计划复习，不让轮转带跑方向", "科室体验被压缩成必要任务，考研节奏没有断。你守住了计划，也主动放弃了一次路线改写。", -5, { medical: 4, traits: { examPlanning: 9, realityPlanning: 7 }, flags: ["clinical_rotation_plan"], closes: ["detour"], routes: { planning: 8 }, proof: "planner" }),
    o("c", "多问带教真实工作，不只看高光", "你问了值班、培养路径和最难适应的部分。答案不浪漫，但终于比论坛标题完整。", -5, { medical: 6, opportunity: 6, traits: { realityPlanning: 7, expression: 5 }, flags: ["clinical_rotation_reality"], routes: { detour: 5, survival: 3 }, proof: "guideline" }),
    o("d", "完成最低要求，别再给自己加任务", "你没有成为科室里最亮眼的学生，但交接、记录和该做的任务都没有失联。", 3, { medical: 3, traits: { lowCostSurvival: 10, boundarySense: 8 }, flags: ["clinical_rotation_lowcost"], routes: { survival: 10 }, proof: "guideline" }),
  ]),
  e("clinical_core_09_boss", "y5s1", "main", "实习任务把考研计划截成了两半", "上午跟组、下午补材料、晚上复习。日历上的计划没有错，现实只是拒绝按日历出现。导师、带教和倒计时都在等你回复。", [
    o("a", "保考研主线，主动压缩其他任务", "你把不能兼顾的部分说清，失去一项机会，复习节奏终于没有每天重启。", -7, { medical: 4, traits: { examPlanning: 10, boundarySense: 7 }, flags: ["clinical_boss_plan"], closes: ["research"], routes: { planning: 11 }, proof: "planner" }),
    o("b", "保临床任务，复习改成碎片节奏", "整块复习时间消失了，你把知识点塞进交班前后。效率不漂亮，但临床没有只剩签到。", -9, { medical: 8, opportunity: 5, traits: { stressTolerance: 8, responsibility: 7 }, flags: ["clinical_boss_clinical"], routes: { diagnosis: 5, surgery: 5 }, proof: "idealist" }),
    o("c", "科研只做能解释清的部分，拒绝挂名", "成果数量没有突然增加，但你终于能说清自己处理过哪组数据、为什么返工。", -8, { medical: 6, opportunity: 6, traits: { researchPatience: 9, clinicalCaution: 6 }, flags: ["clinical_boss_research"], routes: { research: 10 }, proof: "guideline" }),
    o("d", "先砍掉额外目标，保证基本完成", "你没有同时拿满实习、科研和考研。培养任务按时落地，睡眠也勉强保住了法律地位。", 5, { medical: 3, traits: { lowCostSurvival: 12, boundarySense: 10 }, flags: ["clinical_boss_survival"], closes: ["research", "surgery"], routes: { survival: 12 }, proof: "guideline" }),
  ]),
  e("clinical_core_10_future", "y5s2", "main", "毕业去向表只允许你填一个答案", "五年的课程、轮转、项目和计划最后挤进一张表。你放弃过一些入口，也把另一些习惯练成了本能。现在要选的不是最体面的答案，而是下一段能继续走的路。", [
    o("a", "继续临床，把不会的留给下一阶段学", "你没有把毕业写成全知全能。下一关更长，但你已经知道核对、求助和边界比逞强可靠。", -4, { medical: 7, opportunity: 4, traits: { idealDrive: 7, clinicalCaution: 7 }, flags: ["clinical_final_clinical"], routes: { diagnosis: 5, surgery: 4, humanities: 3 }, proof: "idealist" }),
    o("b", "走升学路线，把长期计划继续执行", "倒计时没有消失，只是换了名字。你带走了能解释的积累，也留下了没能兼顾的科室机会。", -5, { medical: 6, traits: { examPlanning: 9, realityPlanning: 8 }, flags: ["clinical_final_postgrad"], routes: { planning: 7, research: 5 }, proof: "planner" }),
    o("c", "保留医学训练，转向临床之外", "白大褂没有穿到底，医学却已经接管了你的检索习惯、风险意识和表达方式。", 1, { medical: 4, opportunity: 5, traits: { realityPlanning: 8, scienceCommunication: 7 }, flags: ["clinical_final_detour"], routes: { detour: 12 }, experiences: ["临床之外的医学入口"], proof: "guideline" }, { obsession: -4 }),
    o("d", "先完成毕业，不替十年后的自己承诺", "你把毕业证和还能正常开机的自己一起带了出来。没有满成就，但每一步都没有假装无限电量。", 5, { medical: 3, traits: { lowCostSurvival: 12, boundarySense: 9 }, flags: ["clinical_final_survival"], routes: { survival: 12 }, experiences: ["低耗生存仍准时交付"], proof: "guideline" }),
  ]),
];

const ROUTE_EVENTS: ClinicalEvent[] = [
  e("clinical_route_diagnosis_01", "y3s1", "route", "病例摘要里有两条时间线打架", "同一份记录里，“三天前起病”和“昨晚突然加重”被写成一团。汇报只剩十分钟，你得决定先修答案还是先修事实。", [
    o("a", "回到原始记录，逐项核对时间", "你找到一处抄写错位。结论没有变得华丽，汇报终于不再前后互殴。", -5, { medical: 7, traits: { timelineSense: 9, clinicalCaution: 6 }, flags: ["clinical_timeline_saved"], routes: { diagnosis: 8 }, experiences: ["病历时间线救场成功"], proof: "timeline" }),
    o("b", "先保结论，细节汇报后再补", "汇报按时开始，第二问就落在那处细节上。你记住了时间线不会因为 PPT 做完就自动一致。", -2, { medical: 3, traits: { lastMinute: 5 }, routes: { survival: 3 }, proof: "predictor" }),
    o("c", "请同组分别核对病史和检查", "两个人同时发现问题，代价是你们临时删掉了最后一页漂亮总结。", -4, { medical: 6, opportunity: 3, traits: { teamBackup: 7 }, routes: { diagnosis: 5, humanities: 3 }, proof: "buffer" }),
  ], ["diagnosis"]),
  e("clinical_route_diagnosis_02", "y4s1", "route", "老师只问了一句：为什么不是另一个", "你说出了最可能的方向，老师没有点头，反而抛出一个很像的替代答案。队伍继续等着，你得展示的是思路，不是押题命中率。", [
    o("a", "列支持和反对证据，不抢结论", "老师没有替你宣布正确，只让你把缺的检查记下来。第一次“不确定”也能成为完整回答。", -6, { medical: 8, traits: { clinicalCaution: 9, ambiguityTolerance: 7 }, routes: { diagnosis: 9 }, proof: "guideline" }),
    o("b", "把相关章节全背一遍再来回答", "第二天你能说出更多病名，也更清楚信息不够时背得再多仍然不能硬选。", -9, { medical: 9, traits: { memorizationStamina: 8, predictorHabit: 6 }, routes: { diagnosis: 6, planning: 2 }, proof: "predictor" }),
    o("c", "问老师自己漏掉的关键线索", "问题没有替你降难度，却给了下一次看病例的入口。", -4, { medical: 6, opportunity: 4, traits: { activeHelp: 8 }, routes: { diagnosis: 6 }, proof: "timeline" }),
  ], ["diagnosis"]),
  e("clinical_route_diagnosis_03", "y4s2", "route", "化验结果更新，昨天的判断需要重写", "病例没有义务维护你的面子。新结果出来后，原本顺畅的解释多了一个大洞，汇报稿却已经发给全组。", [
    o("a", "主动标出变化，重做鉴别顺序", "你公开推翻了自己的一部分判断。没人鼓掌，但错误没有继续穿着正式格式往下走。", -7, { medical: 9, traits: { clinicalCaution: 10, timelineSense: 7 }, flags: ["clinical_revision_honest"], routes: { diagnosis: 9 }, proof: "guideline" }),
    o("b", "保留原稿，只补一句可能性", "文档改动最小，逻辑缺口也原样保留。老师看完只圈出那句“考虑”。", -2, { medical: 2, traits: { clinicalCaution: -4 }, routes: { survival: 2 }, proof: "predictor" }),
    o("c", "拉同组做一次十分钟快速复盘", "你们删掉两页结论，换来一条更诚实的时间线。", -5, { medical: 7, opportunity: 3, traits: { teamBackup: 7, responsibility: 5 }, routes: { diagnosis: 6, humanities: 3 }, proof: "buffer" }),
  ], ["diagnosis"]),
  e("clinical_route_diagnosis_04", "y5s1", "route", "查房前夜，你列了十八个可能问题", "床号、检查、鉴别和老师上周问过的坑都进了清单。凌晨一点，范围仍在生长，你必须决定什么时候停止准备。", [
    o("a", "只保高风险信息和三条核心依据", "清单从十八页缩成三页。老师问到第四页时你不会，但前三页真的说清了。", -6, { medical: 7, traits: { predictorHabit: 8, boundarySense: 6 }, routes: { diagnosis: 6, planning: 4 }, proof: "predictor" }),
    o("b", "全部看完，今晚不留未知数", "未知数没有清零，睡眠先清零。第二天你确实多答了一题，语速像低电量语音包。", -13, { medical: 9, traits: { predictorHabit: 11, overResponsibility: 7 }, routes: { diagnosis: 6 }, proof: "predictor" }),
    o("c", "和同组拆题，每人守一块", "老师随机点人时，你们至少知道谁能补哪部分。团队没有共享大脑，勉强共享了盲区。", -5, { medical: 6, opportunity: 4, traits: { teamBackup: 9 }, routes: { diagnosis: 5, humanities: 3 }, proof: "buffer" }),
  ], ["diagnosis"]),

  e("clinical_route_surgery_01", "y2s2", "route", "缝合垫上的线结总在最后一步散开", "动作视频看了三遍，手里仍然像同时多了两根线。旁边同学已经打完第五个结，你的第一个正在考虑离家出走。", [
    o("a", "把动作拆慢，每次只纠正一步", "速度没有追上别人，线结终于不再靠运气维持。", -7, { medical: 7, traits: { operationPractice: 9, clinicalCaution: 5 }, flags: ["clinical_suture_repeat"], routes: { surgery: 8 }, proof: "guideline" }),
    o("b", "请同学看手位，不看最终结果", "同学只推了一下你的手腕，之前散掉的结突然有了原因。", -5, { medical: 6, traits: { activeHelp: 8, operationPractice: 7 }, routes: { surgery: 7, humanities: 2 }, proof: "buffer" }),
    o("c", "先记住考试流程，熟练以后再补", "流程分拿到了，手感仍然停在“知道应该怎么做”。", -3, { medical: 3, traits: { memorizationStamina: 4 }, routes: { planning: 2, survival: 3 }, proof: "planner" }),
  ], ["surgery"]),
  e("clinical_route_surgery_02", "y4s1", "route", "手术室站到腿失去存在感", "你的位置主要负责看、记和别碰无菌区。两个小时后，注意力与小腿同时开始申请下班，老师忽然问你刚才那一步为什么这样处理。", [
    o("a", "先复述看到的步骤，不猜没听清的部分", "回答不完整，但没有把观察包装成懂了。老师让你下次提前看流程。", -8, { medical: 7, opportunity: 4, traits: { clinicalCaution: 8, stressTolerance: 5 }, routes: { surgery: 7 }, experiences: ["手术室站到腿失去存在感"], proof: "guideline" }),
    o("b", "提前把术式流程背到能预判下一步", "下次你真的跟上了节奏，代价是前一晚的睡眠只参与了开头。", -11, { medical: 9, traits: { predictorHabit: 8, operationPractice: 5 }, routes: { surgery: 8 }, proof: "predictor" }),
    o("c", "承认今天只看懂一半，回去复盘", "老师没有把你赶出去，只发来一个章节号。你的机会没有升级，可信度悄悄加了一格。", -6, { medical: 7, opportunity: 5, traits: { clinicalCaution: 9, activeHelp: 5 }, routes: { surgery: 7 }, proof: "guideline" }),
  ], ["surgery"]),
  e("clinical_route_surgery_03", "y4s2", "route", "技能考核顺序突然提前", "你原本排在下午，系统把你挪到第二个。手套还没戴，心率已经完成热身。排在后面的人开始默默看你。", [
    o("a", "按固定核对顺序做，不追速度", "你没有最快，关键步骤也没有在紧张里失踪。", -7, { medical: 7, traits: { operationPractice: 8, clinicalCaution: 8, stressTolerance: 6 }, routes: { surgery: 9 }, experiences: ["技能考核顺序突然提前"], proof: "guideline" }),
    o("b", "先深呼吸，再请老师确认起始条件", "一句确认没有显得笨，反而拦住了你拿错规格。", -5, { medical: 6, opportunity: 4, traits: { activeHelp: 7, boundarySense: 6 }, routes: { surgery: 7 }, proof: "buffer" }),
    o("c", "靠肌肉记忆直接开始", "前半程很顺，最后一步因为跳过核对重新来过。手很快，流程没有义务跟着快。", -6, { medical: 4, traits: { operationPractice: 6, clinicalCaution: -4 }, routes: { surgery: 5 }, proof: "idealist" }),
  ], ["surgery"]),
  e("clinical_route_surgery_04", "y5s1", "route", "老师愿意再给你一次练习机会", "大二那次失败没有从记录里消失。你后来反复练过，也几次在不熟时主动说停。老师今天问：“准备好就在指导下再试一次。”", [
    o("a", "先复述边界和流程，再接受指导", "动作仍不完美，但你知道什么时候继续、什么时候停。老师记住的是稳定，不是逞强。", -8, { medical: 9, opportunity: 7, traits: { operationPractice: 10, clinicalCaution: 9 }, flags: ["clinical_skill_callback_done"], routes: { surgery: 11 }, experiences: ["一次失败后的重新练习"], proof: "guideline" }),
    o("b", "今天状态不好，申请改天再练", "机会没有立刻兑现，却没有因为一句拒绝消失。你第一次把谨慎用在自己身上。", 1, { opportunity: 3, traits: { boundarySense: 10, clinicalCaution: 7 }, routes: { survival: 5, surgery: 3 }, proof: "guideline" }),
    o("c", "抓住机会直接上，边做边问", "你在指导下完成了，过程中问了三次。敢尝试和会求助终于没有互相排斥。", -10, { medical: 8, opportunity: 6, traits: { operationPractice: 8, activeHelp: 8 }, routes: { surgery: 10 }, proof: "buffer" }),
  ], ["surgery"]),

  e("clinical_route_research_01", "y3s2", "route", "给导师的第一封邮件停在草稿箱", "你改了七遍自我介绍，仍然觉得“对科研感兴趣”像一句没有证据的套话。项目名额不会等邮件自动变得完美。", [
    o("a", "先读两篇老师的文章，再具体提问", "邮件不长，但终于能看出你找的是这位老师，不是群发联系人。", -6, { medical: 6, opportunity: 7, traits: { researchPatience: 8, clinicalCaution: 5 }, flags: ["clinical_research_mail"], routes: { research: 9 }, proof: "guideline" }),
    o("b", "跟学长进项目，先从清数据开始", "入口来得快，工作也具体得几乎没有滤镜。第一周你只和缺失值打交道。", -5, { medical: 4, opportunity: 6, traits: { researchPatience: 6, teamBackup: 5 }, flags: ["clinical_research_senior"], routes: { research: 7 }, proof: "buffer" }),
    o("c", "先不联系，当前课程已经满载", "你错过这轮名额，也没有让课程和项目一起烂尾。拒绝是一项真实选择。", 4, { traits: { boundarySense: 8, lowCostSurvival: 6 }, closes: ["research"], routes: { survival: 7 }, proof: "guideline" }),
  ], ["research"]),
  e("clinical_route_research_02", "y4s1", "route", "数据第八次对不上", "同一张表换了三个版本，样本数每次都差一点。群里有人建议先做分析，你盯着那几个消失的人数，知道它们不会自己回来。", [
    o("a", "回到原始记录，查每次筛选条件", "第六列的一个条件写反了。结果没有显著，错误至少不再显著。", -9, { medical: 7, traits: { researchPatience: 10, timelineSense: 6 }, flags: ["clinical_research_audit"], routes: { research: 10 }, experiences: ["科研数据第八次对不上"], proof: "timeline" }),
    o("b", "把问题和当前结果一起报告导师", "导师没有生气，只回了句：“先把口径统一，再谈图。”你少做了一张注定重画的图。", -6, { opportunity: 5, traits: { clinicalCaution: 9, researchPatience: 7 }, flags: ["clinical_research_report"], routes: { research: 8 }, proof: "guideline" }),
    o("c", "先补一版能汇报的，之后再清理", "周会顺利过去，技术债换成数据债，继续坐在下周议程里。", -5, { medical: 2, traits: { lastMinute: 6 }, routes: { research: 4, survival: 2 }, proof: "predictor" }),
  ], ["research"]),
  e("clinical_route_research_03", "y4s2", "route", "导师说：再补一组，应该就完整了", "上一组结果刚整理完，新问题又从图里长出来。实习排班和考研计划都在旁边等着，你不可能把所有时间都交给“再补一点”。", [
    o("a", "先问补这组要回答什么问题", "任务从“再做一些”缩成一个能判断完成与否的问题。科研第一次出现边界。", -7, { medical: 6, opportunity: 6, traits: { researchPatience: 8, boundarySense: 7 }, routes: { research: 9 }, proof: "guideline" }),
    o("b", "接下任务，压缩实习后的休息", "数据补齐了，精力也被补成了负债。成果有进展，人开始靠咖啡维持统计学意义。", -13, { medical: 7, opportunity: 8, traits: { researchPatience: 9, overResponsibility: 8 }, routes: { research: 10 }, proof: "idealist" }),
    o("c", "说明当前排期，暂时不接新一组", "项目没有因此把你除名，但这轮成果可能赶不上材料节点。你保住了可持续，也付了机会成本。", 2, { opportunity: -2, traits: { boundarySense: 10, realityPlanning: 6 }, routes: { survival: 6, research: 3 }, proof: "guideline" }),
  ], ["research"]),
  e("clinical_route_research_04", "y5s1", "route", "面试老师问：这个项目里你到底做了什么", "项目名称写在简历上很漂亮，问题却只认具体动作。你需要说明数据、返工和限制，不能只复述导师的研究方向。", [
    o("a", "把自己做过和没做过的分开讲", "成果没有被包装成独立完成，返工过程反而成了最可信的一段。", -5, { medical: 6, opportunity: 8, traits: { clinicalCaution: 9, researchPatience: 7 }, flags: ["clinical_research_explained"], routes: { research: 11 }, proof: "guideline" }),
    o("b", "重点讲最终结果，过程尽量压缩", "老师追问数据口径时，你的项目经验突然只剩标题字号。", -3, { opportunity: 1, traits: { clinicalCaution: -4 }, routes: { research: 4 }, proof: "predictor" }),
    o("c", "诚实说项目未完成，讲清学到的核对方法", "没有成果光环，但你能解释为什么某次分析不能继续往下做。", -4, { medical: 5, opportunity: 5, traits: { researchPatience: 8, clinicalCaution: 8 }, routes: { research: 8, detour: 3 }, proof: "guideline" }),
  ], ["research"]),

  e("clinical_route_planning_01", "y3s2", "route", "经验贴看了二十篇，方向反而更多了", "院校、科室、考试范围和培养路径各有一张表。收藏夹越来越专业，真正能执行的计划仍停在“尽早开始”。", [
    o("a", "只定未来六周，先跑一轮再改", "计划没有覆盖人生，只覆盖了下一轮复习。它第一次从收藏夹进入日历。", -5, { medical: 5, traits: { examPlanning: 9, realityPlanning: 7 }, flags: ["clinical_plan_six_weeks"], routes: { planning: 9 }, proof: "planner" }),
    o("b", "把五年后路径一次全部算清", "表格精确到规培结束，今天该看哪章仍然空着。远期焦虑获得了高清版本。", -7, { traits: { examPlanning: 8, predictorHabit: 7 }, routes: { planning: 6 }, proof: "predictor" }),
    o("c", "先问学姐真实节点，再删掉一半信息", "你失去了十二篇收藏，换来三个必须提前准备的节点。", -4, { opportunity: 5, traits: { realityPlanning: 8, activeHelp: 5 }, routes: { planning: 8 }, proof: "planner" }),
  ], ["planning"]),
  e("clinical_route_planning_02", "y4s1", "route", "轮转和复习在同一晚抢你", "第二天要跟查房，复习计划写着完成一整章。两个任务都不能靠“更加努力”自动扩容，你必须决定今晚少做哪一件。", [
    o("a", "查房准备做到够用，保留复习主线", "你没有成为明天最闪亮的学生，复习也没有因为每次临时任务无限延期。", -7, { medical: 5, traits: { examPlanning: 9, boundarySense: 6 }, routes: { planning: 9 }, proof: "planner" }),
    o("b", "先把病例准备完整，复习周末补", "查房表现稳了，周末计划又多一笔债。临床机会和长期计划开始真实争夺时间。", -8, { medical: 7, opportunity: 5, traits: { responsibility: 7 }, routes: { diagnosis: 4, planning: 5 }, proof: "idealist" }),
    o("c", "两边都做，睡眠先退出竞争", "凌晨三点计划看似全部完成。第二天老师叫你时，知识正在从缓存里逐个下线。", -14, { medical: 6, traits: { overResponsibility: 9, predictorHabit: 7 }, routes: { planning: 6 }, proof: "predictor" }),
  ], ["planning"]),
  e("clinical_route_planning_03", "y4s2", "route", "原本想报的方向突然缩了名额", "群里消息一刷新，你收藏半年的目标多了限制。情绪很想把之前的计划全部判废，报名时间却没有暂停。", [
    o("a", "保留主方向，同时补一个现实备选", "备选不是认输，是给波动留位置。你的计划第一次允许世界不按预测运行。", -5, { opportunity: 4, traits: { examPlanning: 9, ambiguityTolerance: 6, realityPlanning: 8 }, flags: ["clinical_plan_backup"], routes: { planning: 10 }, proof: "planner" }),
    o("b", "继续押原方向，不被一条消息带走", "专注保住了，风险也集中在同一个入口。", -4, { traits: { idealDrive: 6, examPlanning: 6 }, routes: { planning: 7 }, proof: "idealist" }),
    o("c", "重新调查临床之外的医学方向", "搜索结果不再只有科室排名。你第一次把医学训练和临床岗位分开思考。", -3, { opportunity: 5, traits: { realityPlanning: 8, detourCuriosity: 9 }, flags: ["clinical_detour_research"], routes: { detour: 8, planning: 3 }, proof: "guideline" }),
  ], ["planning"]),
  e("clinical_route_planning_04", "y5s1", "route", "考研计划已经改到第十二版", "前十一版分别死于轮转、科研、临时任务和对自己电量的误判。第十二版空出了一些缓冲，看起来终于不像写给机器人的。", [
    o("a", "按新版执行，不再每天推倒重来", "计划第一次连续运行两周。焦虑没有消失，只是失去了随意改表格的权限。", -6, { medical: 6, traits: { examPlanning: 10, stressTolerance: 6 }, routes: { planning: 11 }, experiences: ["考研计划改到第十二版"], proof: "planner" }),
    o("b", "再细化到每天，确保没有空白", "表格更漂亮了，第三天一个临时任务就让整周同时变红。", -8, { traits: { predictorHabit: 10, examPlanning: 5 }, routes: { planning: 6 }, proof: "predictor" }),
    o("c", "删掉低收益任务，给睡眠留位置", "你少刷了一套题，多保住了几天能正常阅读的脑子。", 3, { medical: 3, traits: { boundarySense: 9, lowCostSurvival: 7, realityPlanning: 7 }, routes: { planning: 6, survival: 6 }, proof: "planner" }),
  ], ["planning"]),

  e("clinical_route_humanities_01", "y3s1", "route", "问诊练习超时，对方却刚说到重点", "计时器只剩二十秒，对方终于提到最担心的那件事。你可以按模板收尾，也可以多听一句，再承担记录没写完的代价。", [
    o("a", "多听一句，再归纳给对方确认", "记录晚交了两分钟，你避免把真正的担忧漏在模板外。", -6, { medical: 6, traits: { interviewPatience: 10, emotionalLabor: 6 }, routes: { humanities: 9 }, proof: "buffer" }),
    o("b", "先按时完成，结束后向老师说明", "流程没有失控，你也没有假装那句话没听见。老师让你下次更早留出开放提问。", -4, { medical: 5, traits: { boundarySense: 7, expression: 6 }, routes: { humanities: 7, planning: 2 }, proof: "guideline" }),
    o("c", "按模板打断，考核时间不能超", "任务准时结束，对方最后那句话留在了门外。你拿到流程分，也记下了这种取舍不免费。", -2, { traits: { realityPlanning: 5, interviewPatience: -4 }, routes: { planning: 3, survival: 2 }, proof: "planner" }),
  ], ["humanities"]),
  e("clinical_route_humanities_02", "y4s1", "route", "焦虑家属追问：到底严不严重", "你是见习学生，知道部分流程，却没有权限给出诊断承诺。对方的焦虑是真的，你的边界也必须是真的。", [
    o("a", "说明学生身份，请上级医生进一步解释", "你没有用含糊保证换取暂时平静。上级接过沟通，对方至少知道下一步找谁。", -5, { medical: 5, opportunity: 5, traits: { clinicalCaution: 10, boundarySense: 9, expression: 6 }, flags: ["clinical_family_boundary"], routes: { humanities: 9 }, proof: "guideline" }),
    o("b", "先听清对方担心什么，再解释流程", "你没有回答病情结论，只把等待、检查和沟通顺序说清。焦虑没有归零，但不再四处撞墙。", -7, { medical: 5, traits: { interviewPatience: 9, emotionalLabor: 9, expression: 8 }, flags: ["clinical_family_listen"], routes: { humanities: 10 }, proof: "buffer" }),
    o("c", "给一个模糊安慰，先让现场安静", "现场确实安静了一分钟。老师随后提醒你：不确定时的安慰，也可能被听成承诺。", -3, { traits: { emotionalLabor: 4, clinicalCaution: -7 }, flags: ["clinical_family_overpromise"], routes: { humanities: 3 }, proof: "buffer" }),
  ], ["humanities"]),
  e("clinical_route_humanities_03", "y4s2", "route", "全组默认你来做沟通代表", "患者提问看你，家属追问看你，组员卡壳也看你。你确实能把话说明白，但所有人的情绪正在同一个入口排队。", [
    o("a", "继续接住，但把需要上级回答的分出去", "沟通没有断，你也没有把所有问题都扛成个人责任。", -7, { medical: 4, opportunity: 5, traits: { emotionalLabor: 8, boundarySense: 9, expression: 8 }, flags: ["clinical_emotion_boundary"], routes: { humanities: 9 }, proof: "buffer" }),
    o("b", "全部接下，别让现场再乱", "大家都平静下来了，除了负责让大家平静的你。", -12, { opportunity: 5, traits: { emotionalLabor: 10, overResponsibility: 11 }, flags: ["clinical_emotion_absorb"], routes: { humanities: 9 }, experiences: ["被组员默认成沟通代表"], proof: "buffer" }),
    o("c", "请组员轮流解释，自己只补关键处", "最开始有点生硬，第三次以后大家终于不再把你当全组客服。", -5, { opportunity: 4, traits: { teamBackup: 9, boundarySense: 8 }, routes: { humanities: 7, survival: 3 }, proof: "buffer" }),
  ], ["humanities"]),
  e("clinical_route_humanities_04", "y5s1", "route", "你把别人的难过带回了宿舍", "事情已经交给上级处理，流程也没有出错。晚上关灯后，那段对话仍在脑子里重复。明天还有轮转，你需要决定怎么安放它。", [
    o("a", "找可信的人复盘，也把边界说出来", "难过没有被一句话消除，但它终于不只住在你一个人脑子里。", 1, { traits: { emotionalLabor: 7, boundarySense: 10, activeHelp: 8 }, flags: ["clinical_emotion_support"], routes: { humanities: 8, survival: 5 }, proof: "buffer" }),
    o("b", "继续自己消化，别给别人添麻烦", "你照常完成了第二天的任务，情绪也照常在夜里加班。", -9, { traits: { emotionalLabor: 8, overResponsibility: 9 }, flags: ["clinical_emotion_carry"], routes: { humanities: 7 }, proof: "buffer" }),
    o("c", "暂停一项额外任务，先恢复睡眠", "你错过一次展示，第二天至少能耐心听完别人的话。边界不是冷漠，是不把自己耗成一次性用品。", 5, { opportunity: -2, traits: { boundarySense: 11, lowCostSurvival: 8 }, routes: { survival: 7, humanities: 5 }, proof: "guideline" }),
  ], ["humanities"]),

  e("clinical_route_detour_01", "y3s2", "route", "科普推文里有一句话说得太满", "社团稿件把一项研究写成“已经证实”。你查了原文，结论其实只到“可能相关”。传播效果和准确边界正在抢同一个标题。", [
    o("a", "改回准确说法，标题也一起降温", "阅读量可能少一点，评论区至少不会把相关性继续加工成因果。", -5, { medical: 5, opportunity: 5, traits: { scienceCommunication: 9, guidelineHabit: 8, clinicalCaution: 8 }, flags: ["clinical_science_copy"], routes: { detour: 9, humanities: 3 }, proof: "guideline" }),
    o("b", "保留标题，正文里补限制条件", "限制条件确实写了，只是大部分人没有读到第二段。", -3, { opportunity: 5, traits: { scienceCommunication: 5, clinicalCaution: -2 }, routes: { detour: 5 }, proof: "buffer" }),
    o("c", "退出这次科普，别给自己加活", "风险和机会一起被你关掉。你守住了边界，也没有留下表达证据。", 3, { traits: { boundarySense: 6, lowCostSurvival: 4 }, routes: { survival: 4 }, proof: "guideline" }),
  ], ["detour"]),
  e("clinical_route_detour_02", "y4s2", "route", "一次轮转让你开始查临床之外的岗位", "你并不讨厌医学知识，只是对病房节奏越来越没把握。搜索框里第一次出现公共卫生、医学编辑、医疗科技和健康传播。", [
    o("a", "约学长聊真实工作，不靠岗位名想象", "你问了日常任务、能力要求和最容易后悔的部分。另一扇门没有自动打开，至少有了门把手。", -4, { opportunity: 7, traits: { detourCuriosity: 10, realityPlanning: 8 }, flags: ["clinical_detour_contact"], routes: { detour: 10 }, proof: "planner" }),
    o("b", "先保留信息，临床再完整体验一轮", "你没有立刻转向，也没有删掉收藏。路线仍然开放，但需要下一次主动动作。", -3, { medical: 4, traits: { ambiguityTolerance: 7, detourCuriosity: 5 }, flags: ["clinical_detour_saved"], routes: { detour: 6, diagnosis: 2 }, proof: "idealist" }),
    o("c", "把它当作一时疲惫，不再继续查", "搜索记录被关掉，临床路线重新占满屏幕。这个入口本轮到此为止。", 2, { traits: { idealDrive: 5 }, closes: ["detour"], routes: { diagnosis: 3, survival: 2 }, proof: "idealist" }),
  ], ["detour"]),
  e("clinical_route_detour_03", "y5s1", "route", "医疗科技项目问你愿不愿做内容核对", "工作不是写代码，也不是看诊，而是把医学信息和产品表达对齐。你能用上训练过的谨慎，但要牺牲一部分实习和复习时间。", [
    o("a", "接下小任务，先验证自己是否喜欢", "你改掉三处过度承诺，也第一次发现医学训练可以在病房外继续工作。", -6, { medical: 5, opportunity: 8, traits: { scienceCommunication: 8, clinicalCaution: 8, detourCuriosity: 8 }, flags: ["clinical_detour_project"], routes: { detour: 11 }, proof: "guideline" }),
    o("b", "先问清交付边界，不做全天候顾问", "任务范围缩小了，合作没有消失。临床之外的第一课同样是别假装无限资源。", -4, { opportunity: 6, traits: { boundarySense: 9, realityPlanning: 7 }, flags: ["clinical_detour_project"], routes: { detour: 9, survival: 3 }, proof: "planner" }),
    o("c", "拒绝项目，冲刺当前临床方向", "路线被你主动关闭。不是入口不存在，是这一局你决定不把资源分过去。", 2, { medical: 4, closes: ["detour"], routes: { diagnosis: 4, planning: 3 }, proof: "idealist" }),
  ], ["detour"]),
  e("clinical_route_detour_04", "y5s2", "route", "临床没有走到底，医学训练还在", "去向确认前，你翻到大三做过的科普更正和大四查过的岗位记录。它们不是逃跑证据，而是一条用了三个学期才连起来的路线。", [
    o("a", "选择医学相关转向，保留专业能力", "你没有把五年一键清空。检索、核对、表达和风险边界一起被带进了下一份工作。", -2, { medical: 5, opportunity: 7, traits: { detourCuriosity: 10, realityPlanning: 9 }, flags: ["clinical_detour_complete"], routes: { detour: 14 }, experiences: ["临床之外的医学入口"], proof: "guideline" }),
    o("b", "先继续升学，给临床最后一次验证", "另一扇门没有关，只是暂时没有被你推开。你带着更少滤镜继续往前。", -5, { medical: 6, traits: { idealDrive: 6, ambiguityTolerance: 6 }, routes: { planning: 6, diagnosis: 4 }, proof: "idealist" }),
    o("c", "彻底跨行，不再要求每一步都医学相关", "医学训练没有变成职业，却留在你处理信息和风险的方式里。离开不是把过去判成无效。", 3, { traits: { realityPlanning: 9, boundarySense: 8 }, flags: ["clinical_crossfield"], routes: { detour: 10, survival: 4 }, proof: "planner" }, { obsession: -5 }),
  ], ["detour"]),
];

export const CLINICAL_RANDOM_EVENTS: ClinicalEvent[] = [
  e("clinical_random_01_rollcall", null, "major_random", "老师临时点名：这页谁来讲", "PPT 停在你刚好没看的那张图。全班低头速度高度一致，老师的视线开始沿座位号移动。", [
    o("a", "讲清自己看懂的部分，不补脑", "你只说了两点，第三点承认没看懂。答案不满，错误也没有扩散。", -3, { medical: 4, traits: { clinicalCaution: 6, expression: 4 }, proof: "guideline" }),
    o("b", "用上下文推一遍，先别让空气凝固", "逻辑走通一半，老师在另一半处按下暂停。", -4, { medical: 3, traits: { ambiguityTolerance: 5, stressTolerance: 4 }, proof: "predictor" }),
    o("c", "和同桌一人讲一半", "两个人都没全会，拼起来居然够用。", -2, { medical: 3, traits: { teamBackup: 6 }, proof: "buffer" }),
  ]),
  e("clinical_random_02_rotation", null, "major_random", "轮转安排半夜临时变化", "群通知把明早集合地点从门诊改到病房，还附一句“请大家提前熟悉情况”。你的提前准备刚刚整体过期。", [
    o("a", "只看明早最需要的流程", "你没有重新学习整个科室，只保住了集合后不迷路。", -4, { medical: 3, traits: { realityPlanning: 6, boundarySense: 5 }, routes: { planning: 2 }, proof: "planner" }),
    o("b", "把新科室重点连夜补一遍", "资料看了很多，早上真正有用的是你记住了交班时间。", -9, { medical: 5, traits: { predictorHabit: 7 }, proof: "predictor" }),
    o("c", "问清组员分工，避免四个人重复准备", "群里第一次有人发出明确任务表，所有人少熬了一点。", -3, { opportunity: 3, traits: { teamBackup: 7 }, proof: "buffer" }),
  ]),
  e("clinical_random_03_absent", null, "major_random", "同组同学突然缺席，汇报缺了一段", "离开始只剩二十分钟，群里那个“马上到”已经发了三次。你能补位，但这会吞掉自己准备的最后时间。", [
    o("a", "补关键段，剩下的明确说缺口", "汇报没有完美，至少没有靠你一个人假装完整。", -6, { medical: 4, opportunity: 3, traits: { teamBackup: 7, boundarySense: 6 }, proof: "buffer" }),
    o("b", "全部接过来，先把现场撑住", "现场撑住了，你自己的部分却因为没复习被追问到停机。", -10, { opportunity: 4, traits: { overResponsibility: 9, teamBackup: 8 }, proof: "buffer" }),
    o("c", "不无限兜底，按原分工汇报", "缺口真实出现，责任也没有被“大家一起”平均到你头上。", 1, { traits: { boundarySense: 9, lowCostSurvival: 5 }, proof: "guideline" }),
  ]),
  e("clinical_random_04_conflict", null, "major_random", "病例汇报材料前后对不上", "第一页写症状持续两周，第三页写三天。做 PPT 的人说是复制错了，汇报的人说先别改格式。", [
    o("a", "先修事实，再修版式", "字体暂时不齐，时间线终于不再自相矛盾。", -4, { medical: 5, traits: { timelineSense: 8, clinicalCaution: 6 }, proof: "timeline" }),
    o("b", "保留原稿，口头补充说明", "你记得口头改，下一位同学没记得。错误完成了一次团队传递。", -2, { traits: { lastMinute: 5 }, proof: "predictor" }),
    o("c", "拉原记录和组员一起核对", "十分钟花掉了，责任没有变成互相猜。", -4, { medical: 4, traits: { teamBackup: 6, timelineSense: 5 }, proof: "buffer" }),
  ]),
  e("clinical_random_05_data", null, "major_random", "科研表格突然少了七码数据", "昨天还是完整的，今天筛选后一列少了七码。文件名从 final 到 final3，没有任何一个愿意承认自己是源文件。", [
    o("a", "停分析，先找版本和筛选记录", "七码在一次错误筛选里被藏起来。图晚做了，数据没有被硬补。", -6, { medical: 4, traits: { researchPatience: 8, clinicalCaution: 7 }, routes: { research: 3 }, proof: "guideline" }),
    o("b", "按现有数据先跑结果", "图顺利出来，样本数问题也顺利进入老师第一条批注。", -3, { traits: { lastMinute: 6 }, routes: { research: 1 }, proof: "predictor" }),
    o("c", "向学长报告，确认统一口径", "你少猜了一晚，也留下了这次版本事故的记录。", -4, { opportunity: 3, traits: { activeHelp: 7, researchPatience: 5 }, proof: "buffer" }),
  ]),
  e("clinical_random_06_plan_break", null, "major_random", "复习计划被临时任务整块截胡", "今晚原本属于复习，群里突然要求补交一份病例摘要。计划表没有预留这一格，任务也不会因为你很有规划就消失。", [
    o("a", "摘要做到够用，复习保留半小时", "两边都不完美，两边都没有归零。", -6, { medical: 4, traits: { realityPlanning: 7, boundarySense: 5 }, routes: { planning: 3 }, proof: "planner" }),
    o("b", "先交任务，复习明天加倍", "任务按时交了，明天的计划开始替今天还债。", -7, { traits: { overResponsibility: 6, examPlanning: 4 }, routes: { planning: 2 }, proof: "predictor" }),
    o("c", "删掉今晚复习，先睡够", "进度少了一格，第二天没有靠同一句话读五遍。", 4, { traits: { lowCostSurvival: 7, boundarySense: 7 }, routes: { survival: 4 }, proof: "guideline" }),
  ]),
  e("clinical_random_07_senior", null, "major_random", "学姐发来一份没有滤镜的科室说明", "文档里没有“天花板”和“梦中情科”，只有工作节奏、培养路径、常见落差和她最想提前知道的事。", [
    o("a", "按自己的在意项继续追问", "你没有照抄她的答案，只把路线信息从宣传语变成了条件表。", -2, { opportunity: 5, traits: { realityPlanning: 7, expression: 4 }, routes: { planning: 3, detour: 2 }, proof: "planner" }),
    o("b", "收藏起来，等以后有空再看", "文档进入收藏夹，和另外十九份经验贴和平共处。", 1, { traits: { detourCuriosity: 2 }, proof: "predictor" }),
    o("c", "转给全组，一起补充不同科室", "一份说明变成了多人版本，信息更全，你也不再独自承担路线焦虑。", -3, { opportunity: 4, traits: { teamBackup: 6 }, proof: "buffer" }),
  ]),
  e("clinical_random_08_friend", null, "major_random", "室友发来一句：这个症状严重吗", "消息只有一句话和一张模糊照片。你学过一些知识，但你仍然是医学生，不是隔着聊天框就能完成诊断的人。", [
    o("a", "不下判断，建议正规就医", "室友有点失望，但没有拿你的猜测替代真正的评估。", -1, { medical: 3, traits: { clinicalCaution: 10, boundarySense: 9 }, flags: ["clinical_no_online_diagnosis"], experiences: ["没有乱回答朋友的症状问题"], proof: "guideline" }),
    o("b", "帮忙整理症状和时间，再建议求助", "你没有给病名，只把信息整理成就医时更容易说清的顺序。", -3, { medical: 4, traits: { timelineSense: 8, clinicalCaution: 8, interviewPatience: 5 }, flags: ["clinical_no_online_diagnosis"], proof: "timeline" }),
    o("c", "说个最可能的，让对方别太紧张", "安慰发出去了，你随后开始担心它会被当成结论。", -2, { traits: { clinicalCaution: -8, emotionalLabor: 3 }, proof: "buffer" }),
  ]),
  e("clinical_random_09_exam", null, "major_random", "技能考核顺序从下午改到现在", "你刚打开复习视频，门口已经开始叫下一组。计划中的最后两小时突然只剩两分钟。", [
    o("a", "只核对高风险步骤，不再全量重学", "两分钟没有创造奇迹，至少把最容易错的地方拦住了。", -4, { medical: 4, traits: { clinicalCaution: 7, realityPlanning: 5 }, routes: { surgery: 2 }, proof: "guideline" }),
    o("b", "抓着同学快速演示一遍", "同学指出你一直忽略的一步，代价是他也跟着紧张了起来。", -4, { medical: 4, traits: { activeHelp: 6, operationPractice: 5 }, routes: { surgery: 3 }, proof: "buffer" }),
    o("c", "相信平时练习，直接进去", "心率很高，动作没有全部失联。平时练过的东西终于不是一句安慰。", -3, { medical: 4, traits: { stressTolerance: 6, operationPractice: 4 }, routes: { surgery: 3 }, proof: "idealist" }),
  ]),
  e("clinical_random_10_pocket", null, "major_random", "白大褂口袋少了最需要的那样东西", "笔、便签、手消和一堆不知道何时放进去的纸都在，偏偏今天最需要的那件不在。老师已经往下一床走。", [
    o("a", "向同组借，用完记得补回去", "你没有靠口袋独立生存，团队也没有因为借一支笔崩溃。", -2, { opportunity: 2, traits: { teamBackup: 5 }, experiences: ["白大褂口袋永久超载"], proof: "buffer" }),
    o("b", "以后固定做一张出门清单", "口袋没有变大，缺东西的概率开始下降。", -2, { traits: { realityPlanning: 6, clinicalCaution: 4 }, proof: "planner" }),
    o("c", "先记脑子里，回去再补记录", "回去以后你记得有件事要记，只是不记得具体是哪件。", 0, { traits: { lastMinute: 4 }, proof: "predictor" }),
  ]),
  e("clinical_random_11_science", null, "major_random", "群聊里一条医学科普吵起来了", "有人转发夸张标题，有人要求你“专业人士说句话”。你知道的信息足够指出问题，不足以在群里开一场远程门诊。", [
    o("a", "贴可靠来源，只纠正最关键的一点", "争论没有彻底结束，错误信息至少失去了“医学生认证”。", -3, { medical: 4, traits: { scienceCommunication: 7, guidelineHabit: 8, clinicalCaution: 7 }, flags: ["clinical_science_corrected"], routes: { detour: 4 }, proof: "guideline" }),
    o("b", "把所有概念完整讲一遍", "你发了八段，群聊在第三段后恢复讨论晚饭。", -6, { medical: 4, traits: { scienceCommunication: 6, overResponsibility: 5 }, routes: { humanities: 2 }, proof: "buffer" }),
    o("c", "不接专业人士人设，建议看正规来源", "你没有成为群聊在线门诊，也没有让夸张标题借你的专业背书。", 1, { traits: { boundarySense: 8, clinicalCaution: 6 }, proof: "guideline" }),
  ]),
  e("clinical_random_12_material", null, "major_random", "临考前，老师突然更新了课程资料", "群文件多出一个“补充重点最终版”。距离考试还有三天，你原来的复习顺序刚刚形成一点稳定性。", [
    o("a", "只对照新增部分，不推倒原计划", "更新被塞进旧框架，计划没有因为一个新文件重新做人。", -4, { medical: 5, traits: { studyFramework: 7, realityPlanning: 6 }, proof: "planner" }),
    o("b", "以最新版为准，从头再过一遍", "资料确实更新了，你的睡眠也同步更新成试用版。", -10, { medical: 7, traits: { predictorHabit: 7, memorizationStamina: 6 }, proof: "predictor" }),
    o("c", "和同学分工标变化，再合并", "三个人半小时找完差异，顺便发现老师改了两个页码。", -3, { medical: 4, traits: { teamBackup: 7, timelineSense: 4 }, proof: "buffer" }),
  ]),
];

export const CLINICAL_HIDDEN_EVENTS: ClinicalEvent[] = [
  e("clinical_hidden_study_callback", "y4s1", "hidden", "大一的复习方式在查房前回来找你", "同一套知识从考试题变成了病例。系统没有忘记你当年怎样整理、背诵、组队或临时冲刺，老师今天的追问刚好把那种习惯重新叫了出来。", [
    o("a", "沿用旧习惯，但补上它缺的那一块", "大一留下的方式没有决定命运，却真实影响了你今天从哪里开始补。", -5, { medical: 7, traits: { studyFramework: 5, clinicalCaution: 5 }, flags: ["clinical_callback_study_done"], routes: { diagnosis: 5, planning: 3 }, experiences: ["五年后仍记得第一次病例讨论"], proof: "timeline" }),
  ], ["diagnosis", "planning"], 30),
  e("clinical_hidden_skill_callback", "y5s1", "hidden", "大二失败过的动作又轮到你", "这次仍在老师指导下。你记得当年手忙脚乱的那一步，也记得后来有没有回去练、有没有开口求助。", [
    o("a", "按准备程度行动，不熟就明确说", "你没有把勇敢等同于硬上。前期练习和求助一起决定了老师愿意给你多少空间。", -6, { medical: 7, opportunity: 6, traits: { operationPractice: 7, clinicalCaution: 8 }, flags: ["clinical_callback_skill_done"], routes: { surgery: 9 }, experiences: ["一次失败后的重新练习"], proof: "guideline" }),
  ], ["surgery"], 30),
  e("clinical_hidden_emotion_callback", "y5s1", "hidden", "又一次沟通结束后，所有人都先看你", "大三问诊时的倾听、大四面对家属时的边界，都在这一刻留下痕迹。你可以继续成为缓冲垫，也可以让团队一起承担。", [
    o("a", "解释关键流程，其余问题交回团队", "你仍然可靠，但不再把可靠写成无限接单。", -4, { opportunity: 5, traits: { emotionalLabor: 7, boundarySense: 10 }, flags: ["clinical_callback_emotion_done"], routes: { humanities: 9, survival: 4 }, experiences: ["被组员默认成沟通代表"], proof: "buffer" }),
  ], ["humanities"], 30),
  e("clinical_hidden_research_callback", "y5s1", "hidden", "那组返工数据终于进了升学材料", "材料里最能解释能力的，不是漂亮结果，而是你怎样发现口径不一致、怎样向老师报告、怎样知道什么时候不能继续算。", [
    o("a", "把返工过程写清，不只放项目名称", "成果没有突然变大，经历终于不再只剩一行标题。", -5, { medical: 6, opportunity: 8, traits: { researchPatience: 8, clinicalCaution: 7 }, flags: ["clinical_callback_research_done"], routes: { research: 11 }, proof: "guideline" }),
  ], ["research"], 30),
  e("clinical_hidden_plan_callback", "y5s1", "hidden", "大三做的六周计划救了冲刺期", "计划早就改过很多版，但你已经知道一次只跑多远、哪里必须留缓冲。临时任务仍会来，整条路线不再每天清零。", [
    o("a", "守住主线，允许一天没有全部完成", "倒计时继续走，你没有再把一次偏离解释成整局失败。", -4, { medical: 5, traits: { examPlanning: 9, stressTolerance: 7 }, flags: ["clinical_callback_plan_done"], routes: { planning: 10 }, experiences: ["考研计划改到第十二版"], proof: "planner" }),
  ], ["planning"], 30),
  e("clinical_hidden_filter_callback", "y5s2", "hidden", "入学时那层白大褂滤镜只剩薄薄一片", "你见过课程、病房、沟通和长线培养的真实节奏。理想没有简单归零，它只是不能再靠电视剧光线工作。", [
    o("a", "保留理想，但把边界和代价一起带走", "滤镜碎过，夜也熬过。你不再相信医学只靠热血，仍愿意把重要的事认真做完。", -3, { medical: 6, traits: { idealDrive: 10, realityPlanning: 7, boundarySense: 6 }, flags: ["clinical_callback_filter_done"], routes: { diagnosis: 3, humanities: 3 }, experiences: ["医学滤镜碎过但没退订"], proof: "idealist" }),
  ], ["diagnosis", "humanities", "planning"], 30),
  e("clinical_hidden_teacher_name", "y4s2", "hidden", "老师终于不用看胸牌就叫出你的名字", "不是因为一次高光。你准备过、承认过不知道、也在被指出问题后真的回来补过。今天老师把下一次汇报直接交给了你。", [
    o("a", "接下汇报，先确认范围和时间", "被记住没有变成无限任务。机会和边界第一次同时出现。", -5, { medical: 6, opportunity: 9, traits: { clinicalCaution: 8, responsibility: 7, boundarySense: 6 }, flags: ["clinical_teacher_remembered"], routes: { diagnosis: 5, humanities: 3 }, experiences: ["老师让你下次继续汇报"], proof: "guideline" }),
  ], ["diagnosis", "humanities"], 25),
  e("clinical_hidden_lowcost", "y5s2", "hidden", "你没包揽所有机会，但从来没有失联", "五年里你拒绝过项目、放弃过高光，也没有把基础任务丢给别人。毕业前的互评里，有人写：事情交给你，至少会得到明确回复。", [
    o("a", "收下这句不够卷、但很可靠的评价", "不是满成就截图，却是低耗路线里最难伪造的肯定。", 4, { medical: 4, traits: { lowCostSurvival: 10, boundarySense: 9, responsibility: 6 }, flags: ["clinical_lowcost_recognized"], routes: { survival: 12 }, experiences: ["低耗生存仍准时交付"], proof: "guideline" }),
  ], ["survival"], 28),
];

export const CLINICAL_EVENTS: ClinicalEvent[] = [
  ...CLINICAL_CORE_EVENTS,
  ...ROUTE_EVENTS,
  ...CLINICAL_RANDOM_EVENTS,
  ...CLINICAL_HIDDEN_EVENTS,
];
