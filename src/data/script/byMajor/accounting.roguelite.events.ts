export type AccountingRouteKey = "audit" | "enterprise" | "cpa" | "tax" | "analysis" | "civil" | "survival";

export type AccountingImpact = {
  knowledge?: number;
  opportunity?: number;
  traits?: Record<string, number>;
  routes?: Partial<Record<AccountingRouteKey, number>>;
  flags?: string[];
  closes?: AccountingRouteKey[];
  experiences?: string[];
  proof?: string;
};

type AccountingOption = {
  id: string;
  text: string;
  feedback: string;
  effects: { stats: Record<string, number> };
  accounting: AccountingImpact;
};

export type AccountingEvent = {
  id: string;
  eventId: string;
  majorId: "accounting";
  semester: string | null;
  type: "main" | "route" | "major_random" | "hidden";
  title: string;
  description: string;
  routeIds: AccountingRouteKey[];
  weight: number;
  options: AccountingOption[];
  choices: AccountingOption[];
};

function o(id: string, text: string, feedback: string, energy: number, accounting: AccountingImpact): AccountingOption {
  return { id, text, feedback, effects: { stats: { energy } }, accounting };
}

function e(
  id: string,
  semester: string | null,
  type: AccountingEvent["type"],
  title: string,
  description: string,
  options: AccountingOption[],
  routeIds: AccountingRouteKey[] = [],
  weight = 10,
): AccountingEvent {
  return { id, eventId: id, majorId: "accounting", semester, type, title, description, routeIds, weight, options, choices: options };
}

export const ACCOUNTING_CORE_EVENTS: AccountingEvent[] = [
  e("accounting_core_01_entry", "y1s1", "main", "老师说借不是借钱的借", "黑板上写着“有借必有贷”，每个字都认识。老师换了一笔赊购业务，你刚记住的“借是进、贷是出”活了不到十分钟。", [
    o("a", "先画清谁拿货、谁欠钱", "箭头画得像案发现场，分录倒是第一次没靠猜。下一题把公司名换了，你还能认出是谁欠谁。", -6, { knowledge: 8, traits: { businessSense: 9, debitInstinct: 6 }, flags: ["accounting_entry_understand"], routes: { enterprise: 3, audit: 2 }, proof: "timeline" }),
    o("b", "把六类科目的方向先背熟", "口诀救下今晚的作业。老师下一题加了备抵账户，口诀开始要求售后服务。", -3, { knowledge: 5, traits: { memorization: 8, lastMinute: 3 }, flags: ["accounting_entry_memorize"], routes: { cpa: 3 }, proof: "closer" }),
    o("c", "找一道长得最像的例题套", "科目和金额都抄得很顺，直到答案告诉你：例题是现购，这题是赊购。你输给了一个“赊”字。", -2, { knowledge: 3, traits: { templateReliance: 9 }, flags: ["accounting_entry_template"], routes: { survival: 3 }, proof: "closer" }),
    o("d", "和同桌把钱货关系说一遍", "两个人争了十分钟谁欠谁，争完以后借贷方向反而对了。", -4, { knowledge: 6, opportunity: 2, traits: { activeHelp: 6, businessSense: 6 }, flags: ["accounting_entry_pair"], routes: { analysis: 2, enterprise: 2 }, proof: "team" }),
  ]),
  e("accounting_core_02_difference", "y1s2", "main", "试算表差了两块钱", "晚自习只剩二十分钟，借方合计和贷方合计差两块。老师看了一眼：“两块也得有来处。”你的晚饭和差额同时进入倒计时。", [
    o("a", "从第一张凭证重新往下追", "翻到第十七笔，你找到一张金额录成两遍的凭证。表平了，食堂关了。", -9, { knowledge: 8, traits: { reviewPatience: 11, sourceTracing: 10 }, flags: ["accounting_diff_trace"], routes: { audit: 5, tax: 2 }, experiences: ["两块钱差额查了整个晚自习"], proof: "balance" }),
    o("b", "先检查公式和引用范围", "最后一行没被 SUM 进去。你十分钟解决问题，并从此不再完全相信蓝色选区。", -4, { knowledge: 6, traits: { excelSkill: 10, formulaReview: 9 }, flags: ["accounting_diff_formula"], routes: { analysis: 4, enterprise: 3 }, experiences: ["第一次让试算表真正平衡"], proof: "excel" }),
    o("c", "让组员各查自己的明细", "三个人都回复“我的没问题”，第四个人失联。你省下一半检查，也收获一份群聊悬案。", -3, { opportunity: 3, traits: { teamBackup: 7, communication: 6 }, flags: ["accounting_diff_team"], routes: { enterprise: 3 }, proof: "team" }),
    o("d", "先交，把两块差额写进备注", "作业准时提交，备注也没消失。第二天老师只问了一句：“所以你查到哪了？”", 1, { knowledge: 2, traits: { deliveryFirst: 9, riskNote: 6, boundarySense: 4 }, flags: ["accounting_diff_note"], routes: { survival: 5 }, proof: "note" }),
  ]),
  e("accounting_core_03_judgment", "y2s1", "main", "题干开始故意少说一句", "中财题目写着“商品已发出”，却没告诉你控制权是否转移。大一只问借还是贷，大二开始问你凭什么现在确认。", [
    o("a", "把题干每句话挨个对条件", "你在卷面写下“若控制权已转移”。老师没说对错，只在旁边补了五个字：“那你怎么证明？”", -7, { knowledge: 9, traits: { riskSensitivity: 10, ruleResearch: 8 }, flags: ["accounting_judgment_basis"], routes: { audit: 4, tax: 3, cpa: 3 }, proof: "note" }),
    o("b", "按课堂最常见处理直接做", "答案和例题一样，题目藏起来的那句条件不同。分录很整齐，分数没有。", -3, { knowledge: 4, traits: { templateReliance: 8, deliveryFirst: 4 }, flags: ["accounting_judgment_template"], routes: { survival: 3 }, proof: "closer" }),
    o("c", "先问老师缺的条件怎么算", "老师反问：“如果你是经办人，会补什么材料？”一道题突然变成了一份资料清单。", -5, { knowledge: 7, opportunity: 4, traits: { activeHelp: 7, sourceTracing: 6 }, flags: ["accounting_judgment_ask"], routes: { tax: 4, enterprise: 3 }, proof: "timeline" }),
    o("d", "两种分录都写，分别注明条件", "答案多了半页，老师的批注也很直接：“考试有字数，工作有截止时间。”", -6, { knowledge: 8, traits: { ambiguityTolerance: 8, riskNote: 7 }, flags: ["accounting_judgment_cases"], routes: { cpa: 4, audit: 3 }, proof: "note" }),
  ]),
  e("accounting_core_04_fork", "y2s2", "main", "四门课同时发来课程项目", "成本会计要分摊，税法要查口径，审计要做底稿，财管要算方案。四个群都说“这个项目不难”，期末周没有发表意见。", [
    o("a", "接审计底稿，去追材料来处", "组员把数字填完，你负责问每一列从哪来。群聊里第一次有人发：“你查得也太细了吧。”", -8, { knowledge: 7, opportunity: 6, traits: { reviewPatience: 8, sourceTracing: 9 }, flags: ["accounting_audit_entry"], closes: ["analysis"], routes: { audit: 10 }, proof: "timeline" }),
    o("b", "接成本分析，把数字讲明白", "表格做完后，老师问成本为什么涨。你第一次不能只回答“因为合计行变大了”。", -7, { knowledge: 8, opportunity: 6, traits: { dataAnalysis: 9, businessSense: 8 }, flags: ["accounting_analysis_entry"], closes: ["audit"], routes: { analysis: 10 }, proof: "excel" }),
    o("c", "接税务题，先问合同发票在哪", "案例只有三行，你列出的缺件有七项。组员搜到五个答案，你先发现大家连交易日期都没问。", -7, { knowledge: 8, opportunity: 5, traits: { riskSensitivity: 9, ruleResearch: 9 }, flags: ["accounting_tax_entry"], routes: { tax: 10 }, proof: "note" }),
    o("d", "只保两门，别把期末一起做崩", "你退出两个项目群，剩下两份作业都能打开、能解释，也没叫“最终版7”。", 4, { knowledge: 4, traits: { boundarySense: 10, lowCostSurvival: 9 }, flags: ["accounting_survival_entry"], routes: { survival: 10 }, proof: "closer" }),
  ]),
  e("accounting_core_05_route", "y3s1", "main", "证书和实习一起问你哪天有空", "CPA网课更新了六节，事务所招寒假实习，企业财务岗要Excel测试，考公群提醒岗位表快出。课程表仍假装这是普通一周。", [
    o("a", "去事务所，把底稿做一次真的", "网课暂停在第十二节。你换来一份客户资料包，里面有三个最终版和一张拍歪的发票。", -8, { opportunity: 10, knowledge: 5, traits: { stressTolerance: 7, sourceTracing: 7 }, flags: ["accounting_route_audit"], closes: ["civil"], routes: { audit: 12 }, proof: "timeline" }),
    o("b", "去企业，选月结或分析岗试一次", "你第一天整理报销，月底突然所有人都问“这笔能不能今天入”；分析组同时问你为什么本月费用涨了。", -7, { opportunity: 10, knowledge: 5, traits: { businessSense: 8, deliveryFirst: 6 }, flags: ["accounting_route_enterprise"], closes: ["cpa"], routes: { enterprise: 10, analysis: 5 }, proof: "team" }),
    o("c", "按计划备考，把实习推迟一轮", "你关掉招聘页，重新打开网课。别人积累工位照片，你积累错题截图。", -7, { knowledge: 10, traits: { examPlanning: 11, realityPlanning: 8 }, flags: ["accounting_route_cpa"], closes: ["enterprise"], routes: { cpa: 12 }, proof: "closer" }),
    o("d", "先筛岗位，考公和企业岗都留着", "收藏夹从“经验分享”变成专业代码、报名日期和两个不那么热门的备选。", -5, { opportunity: 5, traits: { civilPlanning: 10, stablePreference: 9 }, flags: ["accounting_route_civil"], closes: ["audit"], routes: { civil: 12, survival: 2 }, proof: "note" }),
  ]),
  e("accounting_core_06_materials", "y3s2", "main", "课本条件散在六个文件夹里", "带教说“资料都在共享盘”。合同在文件夹A，发票在群聊，付款截图在语音后面，最新表格叫“最终版_新”。你得先决定从哪查。", [
    o("a", "按合同、发票、付款排时间线", "你按日期排开合同、发票和付款，发现发票比入账晚了一个月。带教没问你“为什么这么细”，只让你把原件位置也补上。", -8, { knowledge: 9, opportunity: 8, traits: { sourceTracing: 11, riskSensitivity: 8 }, flags: ["accounting_real_trace"], routes: { audit: 9, tax: 5 }, experiences: ["第一次从凭证找到问题来源"], proof: "timeline" }),
    o("b", "先检查总表公式和版本", "你发现“最终版_新”少了最后四百行。差异先消失一半，剩下一半确认不是Excel的锅。", -6, { knowledge: 7, opportunity: 7, traits: { excelSkill: 10, formulaReview: 9 }, flags: ["accounting_real_excel"], routes: { analysis: 8, enterprise: 5 }, experiences: ["Excel公式拖错四百行"], proof: "excel" }),
    o("c", "列缺失清单，请经办人补齐", "经办人回了句“应该都给了”。你把七项材料逐条贴回去，十分钟后对方撤回了那句话。", -5, { opportunity: 8, traits: { communication: 9, riskNote: 9, boundarySense: 7 }, flags: ["accounting_real_request"], routes: { tax: 8, audit: 5 }, proof: "note" }),
    o("d", "能做的先做，没原件的全部标黄", "表先交了一版，黄色格子一个没少。带教点开后不用猜你懒得填，还是资料压根没来。", -3, { knowledge: 5, opportunity: 5, traits: { deliveryFirst: 8, riskNote: 8, boundarySense: 8 }, flags: ["accounting_real_note"], routes: { enterprise: 7, survival: 5 }, proof: "closer" }),
  ]),
  e("accounting_core_07_conflict", "y4s1", "main", "秋招提前了，备考没有顺延", "事务所终面、企业月结实习、考试冲刺和毕业论文挤在同一周。四件事都能影响未来，精力只够两件半。", [
    o("a", "保事务所终面和实习交付", "错过两节冲刺课，换来一次盘点和一轮终面。简历多了一行，错题本也多了两页空白。", -9, { opportunity: 10, knowledge: 4, traits: { stressTolerance: 9 }, flags: ["accounting_lock_audit"], routes: { audit: 12 }, proof: "timeline" }),
    o("b", "保企业转正，先把月结关掉", "你连续三晚盯着应收明细，论文只改了标题。月结关了，导师的微信还开着。", -8, { opportunity: 10, knowledge: 5, traits: { deliveryFirst: 10, businessSense: 7 }, flags: ["accounting_lock_enterprise"], routes: { enterprise: 12 }, proof: "closer" }),
    o("c", "停实习，保考试和论文", "工位提前交接，图书馆座位续到闭馆。冲刺课没落下，简历上的实习月份也停在这里。", -7, { knowledge: 11, opportunity: -2, traits: { examPlanning: 10, boundarySense: 7 }, flags: ["accounting_lock_cpa"], routes: { cpa: 12 }, proof: "balance" }),
    o("d", "砍掉最耗电的一项，先别关自己", "你发出一封拒绝邮件。履历少了一格，剩下的文件都按时交了，人也还能打开。", 5, { knowledge: 3, traits: { lowCostSurvival: 12, boundarySense: 11 }, flags: ["accounting_lock_survival"], routes: { survival: 12 }, proof: "team" }),
  ]),
  e("accounting_core_08_finish", "y4s2", "main", "最后一张交接表等你签字", "毕业论文已提交，实习文件夹准备移交。表格最下面有一栏“未完成事项”，它比任何毕业寄语都更诚实。", [
    o("a", "把差异金额和原件位置写全", "交接人点开第一条就找到合同，不用从三百条群消息里搜索“最终版”。你毕业了，聊天记录终于不用留级。", -5, { knowledge: 8, opportunity: 8, traits: { riskNote: 10, responsibility: 8 }, flags: ["accounting_final_risk"], routes: { audit: 5, tax: 5 }, proof: "note" }),
    o("b", "把月结流程和模板一起交出去", "公式旁边第一次有说明，“最终版”也第一次只有一个。接手人问的第一句不再是“这个数哪来的”。", -5, { knowledge: 7, opportunity: 8, traits: { excelSkill: 8, communication: 8 }, flags: ["accounting_final_process"], routes: { enterprise: 6, analysis: 5 }, proof: "excel" }),
    o("c", "带着证书计划去下一阶段", "计划表仍有没完成的科目，但每一项都写着时间和代价，不再靠一句“今年全过”维持气势。", -4, { knowledge: 9, traits: { examPlanning: 9, realityPlanning: 8 }, flags: ["accounting_final_exam"], routes: { cpa: 8, civil: 4 }, proof: "closer" }),
    o("d", "把对账习惯带去别的岗位", "面试官给你一张运营表，你先看合计行，再问数据口径。会计没成为岗位名，倒成了你的默认检查动作。", 4, { opportunity: 7, traits: { lowCostSurvival: 9, businessSense: 7 }, flags: ["accounting_final_cross"], routes: { survival: 12, analysis: 3 }, proof: "balance" }),
  ]),
];

function paired(
  id: string, semester: string, route: AccountingRouteKey, title: string, description: string,
  yes: [string, string, AccountingImpact], no: [string, string, AccountingImpact], weight = 10,
) {
  return e(id, semester, "route", title, description, [
    o("a", yes[0], yes[1], -6, yes[2]),
    o("b", no[0], no[1], -2, no[2]),
  ], [route], weight);
}

export const ACCOUNTING_ROUTE_EVENTS: AccountingEvent[] = [
  paired("accounting_audit_01", "y2s2", "audit", "底稿数字都对，来源栏全空", "组员把金额填得整整齐齐，证据索引一列却只写了“见附件”。附件有二十七个。", ["逐项补上凭证和文件位置", "底稿慢了一小时，但抽到哪一笔都能找到原件。", { knowledge: 7, traits: { sourceTracing: 9, reviewPatience: 7 }, routes: { audit: 9 }, flags: ["accounting_audit_index"], proof: "timeline" }], ["先交数字，索引以后补", "数字按时到了老师手里，第二天你们全组一起寻找“附件到底是哪个附件”。", { traits: { deliveryFirst: 7 }, routes: { audit: 3, survival: 2 }, proof: "closer" }]),
  paired("accounting_audit_02", "y3s1", "audit", "客户说资料已经全部发齐", "共享盘里有三个最终版、一张拍歪的照片和一个打不开的压缩包。项目群已经在催第一版底稿。", ["发缺失清单，不替文件夹脑补", "客户先回复“都有”，看完清单后又补了四份。", { opportunity: 8, traits: { communication: 8, riskNote: 8 }, routes: { audit: 9 }, flags: ["accounting_audit_request"], proof: "note" }], ["先用现有资料把框架搭完", "进度条动了，缺口也被你全部标黄。至少没人把黄色当成已经确认。", { knowledge: 5, traits: { deliveryFirst: 7, boundarySense: 6 }, routes: { audit: 6 }, proof: "closer" }]),
  paired("accounting_audit_03", "y3s2", "audit", "盘点表和仓库差了十二箱", "仓库说刚出库，系统说还没过账，负责人说先别耽误进度。十二箱货物在三种说法里同时存在。", ["把现场数、系统数和出库时间都记上", "盘点表多了一行差异说明。回程路上系统补来昨晚的出库单，正好对上那十二箱。", { knowledge: 7, opportunity: 9, traits: { riskSensitivity: 10, boundarySense: 8 }, routes: { audit: 10 }, experiences: ["盘点数量和记录第一次对不上"], proof: "note" }], ["先按现场数量填，回头再改", "盘点按时结束，回程路上你收到消息：系统刚补了一张昨晚的出库单。", { traits: { deliveryFirst: 8, stressTolerance: 5 }, routes: { audit: 4 }, proof: "closer" }]),
  paired("accounting_audit_04", "y4s1", "audit", "抽样没抽到问题，问题在隔壁行", "规定样本都核完了，旁边一笔金额不大，日期却早了整整一个月。项目群问你几点能下班，外卖软件也在问。", ["多查三笔，再发给带教看", "带教看完只回：“范围扩大到十笔。”晚饭延期，那行奇怪日期也不再假装路过。", { opportunity: 10, knowledge: 8, traits: { riskSensitivity: 11, reviewPatience: 8 }, routes: { audit: 11 }, flags: ["accounting_audit_anomaly"], proof: "timeline" }], ["按抽样范围收工，把那笔单列", "底稿按时交，那笔早一个月的记录被你单独挂在最后。你没查成无底洞，也没装作没看见。", { traits: { boundarySense: 10, riskNote: 7 }, routes: { audit: 6, survival: 3 }, proof: "note" }]),

  paired("accounting_enterprise_01", "y2s2", "enterprise", "报销单只差领导一句同意", "业务同事把单子推来：“先帮我过，签字下午补。”系统今天关账，但下午没有具体时间，领导头像也已经灰了。", ["退回去，签完今天还能录", "对方先发了一个问号，二十分钟后签字照片还是来了。问号不能报销，签字可以。", { traits: { riskSensitivity: 8, communication: 8 }, routes: { enterprise: 9 }, flags: ["accounting_expense_boundary"], proof: "note" }], ["先录系统，备注签字待补", "关账快了一步。第二天这张单被抽出来时，“待补”两个字准确找回了你。", { traits: { deliveryFirst: 8, riskNote: 6 }, routes: { enterprise: 7 }, proof: "closer" }]),
  paired("accounting_enterprise_02", "y3s1", "enterprise", "月末提前了，计划没有收到通知", "财务群下午四点通知今晚关账，应付明细还有两页没核，业务部门刚又补来三张单。", ["先关确定项，未到资料单列", "系统按时关了，三张晚到单据没有混进已经确认的数字。", { opportunity: 7, traits: { deliveryFirst: 8, riskNote: 8, businessSense: 6 }, routes: { enterprise: 9 }, flags: ["accounting_month_end"], experiences: ["月末结账体验卡"], proof: "closer" }], ["全部接下，今晚一张不少", "账关了，你凌晨一点发现一张单据重复。今晚结束得很完整，明早返工也很完整。", { traits: { overResponsibility: 10, stressTolerance: 7 }, routes: { enterprise: 6 }, proof: "team" }]),
  paired("accounting_enterprise_03", "y3s2", "enterprise", "应收对上了，客户就是没付款", "销售说订单完成，报表也确认了收入。你看着逾期名单，第一次发现利润和到账不是一回事。", ["把逾期客户和原因单独列出", "总数没变，但销售终于看见哪几笔钱只存在于报表里。", { knowledge: 8, opportunity: 8, traits: { businessSense: 10, communication: 7 }, routes: { enterprise: 9, analysis: 4 }, experiences: ["第一次解释利润和现金不是同一回事"], proof: "timeline" }], ["确认账没错，按原表提交", "报表准时，业务会议五分钟后又问：“那为什么账户上没钱？”", { traits: { deliveryFirst: 7 }, routes: { enterprise: 5 }, proof: "closer" }]),
  paired("accounting_enterprise_04", "y4s1", "enterprise", "昨天说补签的人今天又来了", "实习快结束，经办人把另一张缺附件的单子放下：“和昨天一样先过呗。”昨天那张的签字，此刻仍在路上。", ["把两张缺件一起发群里问", "经办人终于补齐昨天那张，今天这张也没再进入“以后再说”专区。", { opportunity: 9, traits: { boundarySense: 10, communication: 8 }, routes: { enterprise: 10 }, flags: ["accounting_enterprise_trust"], proof: "note" }], ["最后帮一次，别卡交接", "单据过去了。交接表第一条写着：持续跟进经办人补充附件。最后一次正式获得续集。", { traits: { overResponsibility: 8, deliveryFirst: 7 }, routes: { enterprise: 5 }, proof: "team" }]),

  paired("accounting_cpa_01", "y2s2", "cpa", "证书计划第一版想一年全过", "你把课程、网课、题库和实习都排进同一张表。Excel显示没有冲突，因为Excel不需要睡觉。", ["先砍科目，留出返工周", "你删掉两科，把期末周整块空出来。计划表终于不再默认你每天只睡五小时。", { knowledge: 6, traits: { examPlanning: 10, realityPlanning: 8 }, routes: { cpa: 9 }, flags: ["accounting_exam_plan_1"], proof: "closer" }], ["先全部报名，压力会创造时间", "报名成功那一刻你很有气势。两个月后，四门网课都停在“上次观看”。", { traits: { ambition: 9, overResponsibility: 6 }, routes: { cpa: 5 }, proof: "balance" }]),
  paired("accounting_cpa_02", "y3s1", "cpa", "期末周撞上网课更新高峰", "学校考中财，证书课讲审计，实习群还在发招募。你不能靠把三个标签都涂成红色来制造时间。", ["保两门主科，实习下一轮再投", "你错过一份简历经历，换来两门真的复习完的课。", { knowledge: 10, opportunity: -2, traits: { examPlanning: 9, boundarySense: 7 }, routes: { cpa: 10 }, flags: ["accounting_exam_continued"], proof: "closer" }], ["课程及格优先，证书暂停更新", "计划表改到第四版，这次延期写在日期里，不再写在心里。", { knowledge: 5, traits: { realityPlanning: 8, lowCostSurvival: 5 }, routes: { cpa: 5, survival: 3 }, proof: "note" }]),
  paired("accounting_cpa_03", "y4s1", "cpa", "CPA模考分数没有尊重你的计划表", "连续两学期备考后，最有把握的一科仍差八分。秋招宣讲就在隔壁教室，门都开着。", ["复盘错题，只保这一科", "错题本只留这一科。第七版计划第一次没有“其他科目同步推进”这一栏。", { knowledge: 10, traits: { examPlanning: 11, reviewPatience: 7 }, routes: { cpa: 11 }, flags: ["accounting_exam_final"], experiences: ["证书计划改到第七版"], proof: "balance" }], ["先去秋招，考试留到下一阶段", "你走进隔壁宣讲会，模考卷留在桌上。考试不会替你等，但秋招也不会。", { opportunity: 9, traits: { realityPlanning: 9 }, routes: { enterprise: 5, survival: 4 }, proof: "closer" }]),

  paired("accounting_tax_01", "y2s2", "tax", "业务只问能不能，资料一项没给", "案例里只有一句“公司准备这么处理”。合同、发票和付款安排都不在场，组员已经开始搜索答案。", ["先列资料清单，再查对应口径", "你搜得比别人慢，答案里却没有凭空长出一张发票。", { knowledge: 8, traits: { ruleResearch: 10, sourceTracing: 8 }, routes: { tax: 9 }, flags: ["accounting_tax_materials"], proof: "timeline" }], ["按最常见情形先给结论", "展示很顺，老师追问“如果合同条款不同呢”，你们的结论开始现场加前提。", { traits: { templateReliance: 8 }, routes: { tax: 4 }, proof: "closer" }]),
  paired("accounting_tax_02", "y3s2", "tax", "发票日期和业务月份隔着一张表", "经办人说事情上月就做完了，发票本月才到，系统里又是第三个日期。带教问你准备按哪个时间说。", ["把三条时间线列清楚后上报", "你没替业务拍板，只把合同、履约、开票和入账分别写明。", { knowledge: 9, opportunity: 8, traits: { riskSensitivity: 10, sourceTracing: 9 }, routes: { tax: 10 }, flags: ["accounting_tax_timeline"], proof: "timeline" }], ["按发票日期处理，至少最清楚", "表格很快填完，带教下一句问的是：“那业务到底什么时候发生？”", { traits: { deliveryFirst: 7, templateReliance: 5 }, routes: { tax: 5 }, proof: "closer" }]),
  paired("accounting_tax_03", "y4s1", "tax", "政策更新把旧模板变成了旧模板", "你照去年的表做到一半，群里转来一条新口径。文件没坏，依据已经过期。", ["停下来核新口径并标出改动", "进度晚了四十分钟，模板名称终于诚实地加上了年份。", { knowledge: 9, opportunity: 8, traits: { ruleResearch: 10, riskNote: 8 }, routes: { tax: 11 }, flags: ["accounting_tax_compliance"], proof: "note" }], ["先交旧版，等审核意见再改", "审核意见很快来了：请全部按新口径重做。你省下的四十分钟以三小时形式归还。", { traits: { deliveryFirst: 8 }, routes: { tax: 4 }, proof: "closer" }]),

  paired("accounting_analysis_01", "y2s2", "analysis", "成本表很漂亮，答案栏还是空的", "你做了三张图、五种颜色和一条趋势线。老师看完只问一句：“到底哪笔钱花多了？”全组突然开始研究图例。", ["翻明细，找涨得最多的那一项", "你删掉一张环形图，圈出包装费上涨。老师终于没再问“然后呢”。", { knowledge: 8, traits: { dataAnalysis: 9, businessSense: 9 }, routes: { analysis: 9 }, flags: ["accounting_analysis_reason"], proof: "excel" }], ["把配色和图例再统一一遍", "蓝色更统一了，包装费为什么涨仍然保持原色。", { traits: { excelSkill: 7, businessSense: -2 }, routes: { analysis: 4 }, proof: "excel" }]),
  paired("accounting_analysis_02", "y3s2", "analysis", "预算超了，业务说是市场变了", "报表显示推广费超预算三成，业务负责人说这是临时机会。你手里只有总数，没有活动明细。", ["要明细，再区分一次性和持续投入", "你没直接宣布超支有罪，而是找出其中一笔下月不会再发生。", { knowledge: 8, opportunity: 8, traits: { businessSense: 10, communication: 8 }, routes: { analysis: 10 }, flags: ["accounting_analysis_business"], proof: "timeline" }], ["按预算差额做红黄绿预警", "图一眼能看懂，会上第一个问题仍是：“为什么超？”", { traits: { excelSkill: 8, deliveryFirst: 6 }, routes: { analysis: 5 }, proof: "excel" }]),
  paired("accounting_analysis_03", "y4s1", "analysis", "利润涨了，银行卡没有一起涨", "报表上的利润比上月好看，账户余额却更紧。负责人给你三分钟：“别背利润和现金的区别，直接说钱去哪了。”", ["把应收、存货和回款拆开讲", "你指出两笔大客户还没回款、一批货还压在仓库。三分钟刚好，定义一句没背。", { knowledge: 10, opportunity: 10, traits: { dataAnalysis: 10, businessSense: 11, communication: 8 }, routes: { analysis: 11 }, flags: ["accounting_analysis_transition"], experiences: ["一张分析表终于回答了业务问题"], proof: "timeline" }], ["先保证报表没错，原因让主管判断", "数字确实没错。会开到第五分钟，主管又把同一个问题问了你一遍。", { traits: { reviewPatience: 7, boundarySense: 6 }, routes: { enterprise: 6, analysis: 3 }, proof: "balance" }]),

  paired("accounting_civil_01", "y3s1", "civil", "岗位表先审你的专业代码", "财务岗、审计岗和税务岗排在一起，“会计学类”和“工商管理类”却不总是同一扇门。", ["逐条核目录，主报备选都记日期", "收藏夹少了，真正能点报名的岗位多了。", { traits: { civilPlanning: 10, realityPlanning: 8 }, routes: { civil: 9 }, flags: ["accounting_civil_codes"], experiences: ["岗位表专业代码检索熟练"], proof: "note" }], ["先收藏热门岗，报名时再确认", "收藏夹看着很有希望，报名日当天一半按钮直接变灰。", { traits: { lastMinute: 8 }, routes: { civil: 4 }, proof: "closer" }]),
  paired("accounting_civil_02", "y3s2", "civil", "行测刷题撞上企业实习面试", "面试能换一段经历，模考能告诉你离进面还差多少。两个通知都写着不可补。", ["保模考，按长期计划走", "简历少了一段实习，模考报告圈出资料分析和判断推理。下周该刷哪两块，终于不用靠感觉。", { knowledge: 4, traits: { civilPlanning: 10, examPlanning: 8 }, routes: { civil: 10 }, flags: ["accounting_civil_continued"], proof: "closer" }], ["去面试，体制路线留作备选", "你拿到企业实习，行测表整整空了一周。第二周回来时，正确率也很诚实地空了一截。", { opportunity: 9, traits: { realityPlanning: 7 }, routes: { enterprise: 5, civil: 4 }, proof: "team" }]),
  paired("accounting_civil_03", "y4s1", "civil", "报名剩四十分钟，照片还在审核", "主报岗位已选，备选岗位要求不同材料，系统坚持认为你的证件照背景不够白。", ["先保主报，再提交一个稳妥备选", "主报提交成功，备选也赶在系统关闭前亮了绿灯。最热门那个仍然只有一席。", { opportunity: 7, traits: { civilPlanning: 11, stablePreference: 8 }, routes: { civil: 11 }, flags: ["accounting_civil_submitted"], proof: "note" }], ["只冲最想去的，不分散复习", "报名成功，备选栏空着。系统关闭后，你再也不能用“到时候再选一个”安慰自己。", { traits: { ambition: 8, stressTolerance: 7 }, routes: { civil: 7 }, proof: "closer" }]),

  paired("accounting_survival_01", "y3s1", "survival", "四个人发来四种日期格式", "一个写2026/7/1，一个写7月1日，还有人把日期存成文本。群里没人说谁收总表，却都把文件单独发给了你。", ["只合并，错格式的退回本人改", "群里多了三条“怎么改”，你没替他们重做。总表不够丝滑，今晚至少不用通宵。", { traits: { boundarySense: 10, teamBackup: 6 }, routes: { survival: 9 }, flags: ["accounting_team_boundary"], proof: "team" }], ["全接过来，统一到能直接交", "凌晨一点，四种日期终于像同一年的。第二天老师问公式怎么设，全组同时看向你。", { knowledge: 5, traits: { overResponsibility: 11, excelSkill: 7 }, routes: { enterprise: 4, survival: 5 }, experiences: ["成为小组默认总表负责人"], proof: "team" }]),
  paired("accounting_survival_02", "y4s1", "survival", "跨行面试递来一张混乱运营表", "岗位不叫财务，面试题却有重复订单、缺失口径和一个明显不对的合计行。", ["先删取消订单，再把退款单单列", "合计行少了两次虚假增长。面试官指着剩下那笔异常，让你继续讲。", { opportunity: 10, traits: { excelSkill: 8, riskSensitivity: 8, businessSense: 8 }, routes: { survival: 11, analysis: 4 }, flags: ["accounting_cross_skill"], experiences: ["运营面试先发现取消订单没剔除"], proof: "excel" }], ["只修公式，让结果先对上", "合计行恢复正常，重复订单仍在里面安静领双份功劳。", { traits: { excelSkill: 7, deliveryFirst: 6 }, routes: { survival: 6 }, proof: "closer" }]),
];

const randomRows: Array<[string, string, string, string, string, string, string]> = [
  ["01", "老师随机抽中你的分录上黑板", "借贷方向刚好全反，字写得还特别大。", "当场按业务重讲一遍", "你把四行擦掉重写，至少全班只笑到第二行。", "照着同桌口型把方向换过来", "分录平了。下课后同桌问你为什么借方有两个应付账款，你决定先请他喝奶茶。"],
  ["02", "Excel自动把科目代码变成日期", "你输入03-01，表格热心地替你安排了三月一日。", "统一格式再重新导入", "代码回来了，日期格式从此进入你的重点监控名单。", "在前面加单引号，先让它闭嘴", "这一列恢复成代码，下一列又把长数字显示成了科学计数法。Excel表示本次沟通尚未结束。"],
  ["03", "组员发来“最终版2真的最终”", "文件修改时间比群里的“最终”晚了十分钟。", "先锁底稿再合并", "这次总表只吸收了一个世界的最终版。", "两个版本都打开，肉眼找不同", "你在第七行发现一个金额改过，第八行开始怀疑自己漏了更多。最终版成功变成双胞胎。"],
  ["04", "亲戚问你能不能顺手报个税", "你刚学到税法第一章，饭桌已经把你当作全天候咨询窗口。", "先问合同发票和具体日期", "亲戚嫌你问题多，至少没有拿一句饭桌回答去申报。", "说学校还没教到，先吃饭", "饭桌安静了三秒，亲戚转而问你会不会看股票。会计专业的售后范围继续扩大。"],
  ["05", "打印店把两页凭证顺序装反", "数字没变，时间线却从付款穿越回了合同签订。", "拆开重排并重新编号", "十分钟后材料恢复正常，装订费没有。", "用铅笔标页码，展示时口头解释", "展示顺利混过去，老师翻到反页时停了两秒。那两秒比扣分更长。"],
  ["06", "比赛队友想给图表再加五种颜色", "经营问题还没找到，配色方案已经进入第三轮。", "先写一句结论再决定画什么", "最终只留两张图，评委第一次不用猜重点。", "让他配色，你继续翻明细", "他把图做成企业蓝，你找到运费涨了四成。最后PPT第一次同时拥有颜色和答案。"],
  ["07", "实习群晚上十点发来一个“急”", "任务说明只有截图和一句“明早要”。", "先问要哪张表、截止到几点", "五分钟问清的事，替你省下半夜做错方向。", "按截图先做，显得响应很快", "十一点半对方回复：“不是这张，是上个月那个模板。”你的响应速度成功用于返工。"],
  ["08", "计算器答案和Excel差一分钱", "两边都很自信，舍入规则没有加入群聊。", "逐列检查小数位和舍入", "差额找到时只有0.01，背后的计算过程写了三行。", "手动把最后一格减掉一分钱", "合计行平了，公式栏多出一个孤独的“-0.01”。老师一点就点中了它。"],
  ["09", "学长发来一份CPA备考神表", "每天学习六小时、实习八小时、睡眠七小时，可能使用了另一套二十四小时。", "按自己的课表删掉一半", "计划不再像成功学海报，反而第一次能执行。", "完整收藏，等下周状态好再开始", "神表在收藏夹里稳定运行，你的学习时长保持零报错。"],
  ["10", "群里有人说总表应该没问题", "“应该”两个字出现后，合计行正好差三百二十七块六。", "请每个人附上明细来源", "三个人说没问题，第四个人重新发了文件。差额也跟着撤回。", "直接在群里问谁差了327.6", "四个人同时回复“不是我”。差额没有认领人，只好继续由你抚养。"],
];

export const ACCOUNTING_RANDOM_EVENTS = randomRows.map(([n, title, description, action, feedback, fallbackAction, fallbackFeedback], index) =>
  e(`accounting_random_${n}`, null, "major_random", title, description, [
    o("a", action, feedback, -3, {
      knowledge: 4,
      traits: index % 3 === 0 ? { riskSensitivity: 6 } : index % 3 === 1 ? { excelSkill: 6 } : { teamBackup: 6 },
      routes: index % 2 === 0 ? { survival: 3 } : { enterprise: 3 },
      proof: index % 3 === 0 ? "note" : index % 3 === 1 ? "excel" : "team",
    }),
    o("b", fallbackAction, fallbackFeedback, 1, {
      traits: { deliveryFirst: 5, lowCostSurvival: 3 },
      routes: { survival: 2 },
      proof: "closer",
    }),
  ], [], 7 + (index % 4)),
);

export const ACCOUNTING_HIDDEN_EVENTS: AccountingEvent[] = [
  e("accounting_hidden_entry_callback", "y3s2", "hidden", "大一口诀被一张预付款打败", "经办人只说“先付钱，下月到货”。题目没有关键词，旁边也没有答案。你得重新判断现在有钱、有货，还是只有一张对方答应发货的合同。", [
    o("a", "把钱、货和欠款重新画一遍", "大一画得像案发现场的箭头又回来了。你没背出答案，却能说清为什么现在不能直接进存货。", -5, { knowledge: 9, opportunity: 7, traits: { businessSense: 9 }, flags: ["accounting_callback_entry"], routes: { enterprise: 7, audit: 4 }, experiences: ["预付款没有关键词，分录还是写对了"], proof: "timeline" }),
  ]),
  e("accounting_hidden_difference_callback", "y4s1", "hidden", "两块钱教你的办法救了四百行", "实习总表突然差了五位数。你先点开公式蓝框，发现最后四百行根本没被选中。", [
    o("a", "修公式并把检查步骤写进模板", "差额十分钟消失。更重要的是，下一位不用再靠运气发现同一个坑。", -4, { knowledge: 8, opportunity: 9, traits: { excelSkill: 10, formulaReview: 9 }, flags: ["accounting_callback_difference"], routes: { analysis: 8, enterprise: 5 }, experiences: ["Excel模板被整个小组继续使用"], proof: "excel" }),
  ]),
  e("accounting_hidden_audit_anomaly", "y4s1", "hidden", "那笔早一个月的记录又回来了", "上次你把日期差挂在底稿最后。今天客户补来合同，签署日正好证明那笔收入确实早记了一个月。带教把你叫过去：“把前后十笔也拉出来。”", [
    o("a", "把前后十笔和合同日期排开", "你没当场宣布抓到大问题，只把十笔里另外两笔同类情况圈给带教。底稿上的黄色终于有了后文。", -6, { knowledge: 9, opportunity: 10, traits: { riskSensitivity: 10 }, flags: ["accounting_callback_anomaly"], routes: { audit: 10 }, experiences: ["实习中发现被忽略的数据异常"], proof: "timeline" }),
  ]),
  e("accounting_hidden_excel_template", "y4s1", "hidden", "你修过的模板还在整个组里流通", "大二那次少算最后一行后，你给公式加了检查列和说明。两年后，新组员仍在用这份模板。", [
    o("a", "再补一页使用说明后交接", "模板没有因为你毕业变成无人敢动的祖传文件。", -4, { opportunity: 9, traits: { excelSkill: 10, communication: 7 }, flags: ["accounting_callback_template"], routes: { analysis: 8, survival: 5 }, experiences: ["表格模板被整个小组继续使用"], proof: "excel" }),
  ]),
  e("accounting_hidden_analysis_turn", "y4s1", "hidden", "核算岗面试追问数字为什么变", "你把账做平以后多问过几次“为什么”。现在面试官给出一张费用表，要你找出最值得继续查的一项。", [
    o("a", "先追那项突然翻倍的运费", "你翻出订单区域，发现不是销售暴涨，而是仓库换了发货地。面试官终于没再问“所以呢”。", -5, { knowledge: 9, opportunity: 10, traits: { dataAnalysis: 10, businessSense: 10 }, flags: ["accounting_callback_analysis"], routes: { analysis: 11 }, experiences: ["从核算转向财务分析"], proof: "timeline" }),
  ]),
  e("accounting_hidden_tax_entry", "y4s1", "hidden", "老师把你的缺件清单转给了项目组", "你几次都不肯在合同和发票没到时回答“能不能”。这次老师发来一包真实资料：“先看看还缺什么，别急着给结论。”", [
    o("a", "逐张核日期，把缺的继续列出来", "合同和发票差了两个月，付款截图又少了对方名称。你把三处圈出来，没替项目负责人说“可以”。", -6, { knowledge: 9, opportunity: 10, traits: { ruleResearch: 10, boundarySense: 9 }, flags: ["accounting_callback_tax"], routes: { tax: 11 }, experiences: ["税务与合规隐藏入口"], proof: "note" }),
  ]),
  e("accounting_hidden_cross_skill", "y4s2", "hidden", "运营岗记住了你先查合计行", "岗位不叫财务，面试官却记得你拿到表后第一句是：“订单数包含取消的吗？”其他人已经画到第三张图。", [
    o("a", "收下offer，继续先问这句话", "入职第一周，同事发来一张增长表。你没急着夸增长，先发现退款订单也被算进去了。", -3, { opportunity: 10, traits: { lowCostSurvival: 10, businessSense: 8 }, flags: ["accounting_callback_cross"], routes: { survival: 11 }, experiences: ["运营周报里的退款订单又被你抓到"], proof: "balance" }),
  ]),
  e("accounting_hidden_lowcost", "y4s2", "hidden", "交接人说你的文件最好接", "你没包揽总表，也没熬最多的夜。但你的公式旁边有说明，原始数据放在同一个文件夹，“最终版”也真的只有一个。", [
    o("a", "收下这句不卷但好接手", "组里最能熬的人没记住你几点下班，接手的人记住了你的文件不用考古。", 5, { opportunity: 7, traits: { boundarySense: 10, lowCostSurvival: 10 }, flags: ["accounting_callback_lowcost"], routes: { survival: 10 }, experiences: ["唯一一个不用翻聊天记录的最终版"], proof: "team" }),
  ]),
];

export const ACCOUNTING_EVENTS = [
  ...ACCOUNTING_CORE_EVENTS,
  ...ACCOUNTING_ROUTE_EVENTS,
  ...ACCOUNTING_RANDOM_EVENTS,
  ...ACCOUNTING_HIDDEN_EVENTS,
];
