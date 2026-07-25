// 中途 GG / 提前退场 判定规则。
// 使用引擎内部 stats key（obsession/energy/filter/gpaWill/careerFantasy/escapeImpulse）
// 对应设计文档里的 majorInterest/mentalEnergy/filterThickness/gpaDesire/jobIllusion/escapeImpulse。

import type { EngineState } from "./scriptEngine";
import { SEMESTER_KEYS } from "@/data/script/semesterMeta";

export type MidGgReason =
  | "manual_quit"
  | "energy_depleted"
  | "escape_overflow"
  | "interest_dead"
  | "multi_collapse"
  | "filter_broken_escape"
  | "risk_overflow"
  | "law_final_week"
  | "law_moot_court"
  | "law_internship_v12"
  | "law_exam_accuracy"
  | "law_thesis_versions"
  | "cs_project_offline"
  | "cs_algorithm_lock"
  | "cs_interview_burnout"
  | "cs_thesis_crash"
  | "clinical_energy_shutdown"
  | "clinical_filter_exit"
  | "clinical_overload"
  | "chinese_energy_shutdown"
  | "chinese_expression_overload"
  | "chinese_interest_cooling"
  | "accounting_energy_shutdown"
  | "accounting_overresponsibility"
  | "accounting_plan_collapse"
  | "revive_failed";

export interface MidGgCheckResult {
  type: "revive_offer" | "mid_gg";
  reason: MidGgReason;
  title: string;
  subtitle: string;
  conclusion: string;
  tags: string[];
}

const SEMESTER_PRESSURE: Record<string, number> = {
  y1s1: 0.45, y1s2: 0.6,
  y2s1: 0.75, y2s2: 0.9,
  y3s1: 1.05, y3s2: 1.2,
  y4s1: 1.35, y4s2: 1.2,
  y5s1: 1.35, y5s2: 1.2,
};

function pick(state: EngineState) {
  const s = state.stats ?? {};
  return {
    majorInterest: s.obsession ?? 0,
    mentalEnergy: s.energy ?? 0,
    filterThickness: s.filter ?? 0,
    gpaDesire: s.gpaWill ?? 0,
    jobIllusion: s.careerFantasy ?? 0,
    escapeImpulse: s.escapeImpulse ?? 0,
  };
}

function riskScore(v: ReturnType<typeof pick>) {
  return (
    (100 - v.mentalEnergy) * 0.35 +
    v.escapeImpulse * 0.35 +
    (100 - v.majorInterest) * 0.2 +
    (100 - v.filterThickness) * 0.1
  );
}

const LAW_CRISIS_REASONS = [
  ["law_mid_gg_final_week", "law_final_week"],
  ["law_mid_gg_moot_court", "law_moot_court"],
  ["law_mid_gg_internship_v12", "law_internship_v12"],
  ["law_mid_gg_exam_accuracy", "law_exam_accuracy"],
  ["law_mid_gg_thesis_versions", "law_thesis_versions"],
] as const satisfies ReadonlyArray<readonly [string, MidGgReason]>;

const LAW_GG_THRESHOLDS = {
  energyDepleted: 5,
  escapeOverflow: 97,
  interestDead: 5,
  interestDeadEscape: 78,
  multiEnergy: 12,
  multiEscape: 82,
  multiInterest: 25,
  brokenFilter: 8,
  brokenFilterEscape: 82,
  brokenFilterEnergy: 25,
} as const;

function pickReason(state: EngineState, manual: boolean): MidGgReason | null {
  const v = pick(state);
  const semKey = SEMESTER_KEYS[state.semesterIdx];
  const pressure = SEMESTER_PRESSURE[semKey] ?? 1;
  const adjusted = riskScore(v) * pressure;

  if (manual) return "manual_quit";

  for (const [flag, reason] of LAW_CRISIS_REASONS) {
    if (state.flags.includes(flag)) return reason;
  }

  // 大一上：默认禁用普通中途 GG
  if (semKey === "y1s1") return null;
  // 大四下：优先走终局
  if (semKey === "y4s2" && state.majorId !== "clinical_medicine") return null;
  if (semKey === "y5s2") return null;

  if (state.majorId === "law") {
    // 大一下仅允许真正归零的极端状态触发，避免新手期连续暴毙。
    if (semKey === "y1s2") return v.mentalEnergy <= 0 ? "energy_depleted" : null;

    if (
      v.mentalEnergy <= LAW_GG_THRESHOLDS.multiEnergy
      && v.escapeImpulse >= LAW_GG_THRESHOLDS.multiEscape
      && v.majorInterest <= LAW_GG_THRESHOLDS.multiInterest
    ) return "multi_collapse";
    if (
      v.filterThickness <= LAW_GG_THRESHOLDS.brokenFilter
      && v.escapeImpulse >= LAW_GG_THRESHOLDS.brokenFilterEscape
      && v.mentalEnergy <= LAW_GG_THRESHOLDS.brokenFilterEnergy
    ) return "filter_broken_escape";
    if (v.mentalEnergy <= LAW_GG_THRESHOLDS.energyDepleted) return "energy_depleted";
    if (
      v.majorInterest <= LAW_GG_THRESHOLDS.interestDead
      && v.escapeImpulse >= LAW_GG_THRESHOLDS.interestDeadEscape
    ) return "interest_dead";
    if (v.escapeImpulse >= LAW_GG_THRESHOLDS.escapeOverflow) return "escape_overflow";
  }

  if (state.majorId === "computer_science") {
    if ((state.majorStats.thesisPressure ?? 0) >= 85 && v.mentalEnergy <= 28) return "cs_thesis_crash";
    if ((state.majorStats.internshipAnxiety ?? 0) >= 88 && v.mentalEnergy <= 24) return "cs_interview_burnout";
    if ((state.majorStats.algorithmShadow ?? 0) >= 86 && v.mentalEnergy <= 22) return "cs_algorithm_lock";
    if ((state.majorStats.bugDebt ?? 0) >= 82 && v.mentalEnergy <= 24) return "cs_project_offline";
  }
  if (state.majorId === "clinical_medicine") {
    if (v.mentalEnergy <= 3) return "clinical_energy_shutdown";
    if (v.mentalEnergy <= 14 && v.escapeImpulse >= 78) return "clinical_overload";
    if (v.filterThickness <= 8 && v.escapeImpulse >= 82) return "clinical_filter_exit";
  }
  if (state.majorId === "chinese_language_literature") {
    if (v.mentalEnergy <= 3) return "chinese_energy_shutdown";
    if ((state.hiddenStats.overResponsibility ?? 0) >= 72 && v.mentalEnergy <= 16) return "chinese_expression_overload";
    if ((state.hiddenStats.interestProtection ?? 50) <= 24 && v.mentalEnergy <= 22) return "chinese_interest_cooling";
  }
  if (state.majorId === "accounting") {
    if (v.mentalEnergy <= 3) return "accounting_energy_shutdown";
    if ((state.hiddenStats.overResponsibility ?? 0) >= 74 && v.mentalEnergy <= 17) return "accounting_overresponsibility";
    if ((state.hiddenStats.examPlanning ?? 50) >= 76 && v.mentalEnergy <= 15) return "accounting_plan_collapse";
  }

  const sustainedLawOverwork = state.majorId === "law" && (state.hiddenStats.overworkLoad ?? 0) >= 10;
  if (v.mentalEnergy <= 0 && state.majorId !== "law") return "energy_depleted";
  if (v.escapeImpulse >= 98) return "escape_overflow";
  if (v.majorInterest <= 3 && v.escapeImpulse >= 85) return "interest_dead";
  if (v.mentalEnergy <= 8 && v.escapeImpulse >= 90 && v.majorInterest <= 15) return "multi_collapse";
  if (v.filterThickness <= 5 && v.escapeImpulse >= 92 && v.mentalEnergy <= 20) return "filter_broken_escape";

  // 大一下更保守
  if (semKey === "y1s2" && adjusted < 145) return null;

  if (adjusted >= 130) {
    if (state.majorId === "law" && v.majorInterest >= 45 && v.escapeImpulse < 75 && !sustainedLawOverwork) return null;
    return "risk_overflow";
  }
  return null;
}

function titleFor(state: EngineState, reason: MidGgReason): string {
  const v = pick(state);
  if (reason === "law_final_week") return "四门闭卷同时开庭的人";
  if (reason === "law_moot_court") return "全组唯一活跃诉讼主体";
  if (reason === "law_internship_v12") return "最终版_v12_真的最终本人";
  if (reason === "law_exam_accuracy") return "正确率反向上岸选手";
  if (reason === "law_thesis_versions") return "真的最终版失踪人口";
  if (reason === "cs_project_offline") return "在我电脑上也坏了的人";
  if (reason === "cs_algorithm_lock") return "第一题卡到比赛结束选手";
  if (reason === "cs_interview_burnout") return "秋招任务太多，彻底忙乱";
  if (reason === "cs_thesis_crash") return "毕设最终版恢复失败";
  if (reason === "clinical_energy_shutdown") return "医学生已经撑不住了";
  if (reason === "clinical_filter_exit") return "医学滤镜退订成功";
  if (reason === "clinical_overload") return "课程轮转考研三线停机";
  if (reason === "chinese_energy_shutdown") return "论文仍在加载，人已自动保存退出";
  if (reason === "chinese_expression_overload") return "全组默认文案外包到期";
  if (reason === "chinese_interest_cooling") return "阅读兴趣申请暂停评分";
  if (reason === "accounting_energy_shutdown") return "总表平了，本人停止响应";
  if (reason === "accounting_overresponsibility") return "全组唯一总表责任人";
  if (reason === "accounting_plan_collapse") return "证书计划仍满格，精力只到今晚";
  if (reason === "manual_quit") {
    if (v.escapeImpulse >= 75) return "主动撤离型玩家";
    if (v.mentalEnergy <= 25) return "电量见底自救者";
    if (v.majorInterest <= 30) {
      if (state.majorId === "computer_science") return "计算机已读不回型";
      if (state.majorId === "chinese_language_literature") return "中文系已读暂缓型";
      if (state.majorId === "accounting") return "事情没做完，人先没电了";
      return "法学已读不回型";
    }
    return "知道该先停下来的人";
  }
  if (v.mentalEnergy <= 0) return "卷到自动关机的人";
  if (v.escapeImpulse >= 95) return "逃生指令执行员";
  if (v.mentalEnergy <= 15 && v.escapeImpulse >= 80 && v.majorInterest <= 25) return "全线掉线型玩家";
  if (v.filterThickness <= 10 && v.escapeImpulse >= 85) return "滤镜粉碎体验官";
  if (v.gpaDesire >= 85 && v.mentalEnergy <= 20) return "绩点亮着人已黑屏";
  if (v.majorInterest <= 20) return "法学已读不回型";
  return "知道该先停下来的人";
}

const COPY: Record<MidGgReason, { subtitle: string; conclusion: string }> = {
  manual_quit: {
    subtitle: "你没有继续把自己耗到彻底撑不住，而是决定先停下来。大学生活在这里提前结束，但换专业、休学或重新选择，都不等于人生也结束了。",
    conclusion: "这条路没有走到底，但我终于不再只因为已经走了很久就继续。",
  },
  energy_depleted: {
    subtitle: "课程、截止日期和临时接下的任务一起压了过来，你已经没有精力继续做选择。先停下来恢复，再谈绩点、考试和以后往哪走。",
    conclusion: "法条还没背完，我的精神电量先提交了结课申请。",
  },
  escape_overflow: {
    subtitle: "你对离开的想象已经从偶尔闪现升级为全屏弹窗。系统替你按下撤离键，省得你一边搜转专业条件，一边假装自己还能再坚持一学期。",
    conclusion: "这局没有输，我只是把跑路冲动成功执行了。",
  },
  interest_dead: {
    subtitle: "课程还在更新，你对法学的兴趣已经停止续费。继续靠惯性往前拖只会增加沉没成本，于是系统把这局停在“确实不来电”。",
    conclusion: "我的专业滤镜没碎，它只是彻底停止加载。",
  },
  multi_collapse: {
    subtitle: "你已经很累，对专业也越来越提不起兴趣，每天都在想要不要离开。再靠一句“熬过期末就好”撑下去解决不了问题，这一局先停在这里。",
    conclusion: "不是某一件事打败了我，是太多事情一起压过来，我一直没有停。",
  },
  filter_broken_escape: {
    subtitle: "律政剧滤镜已经碎成粉，精力和跑路冲动也给出了同一结论。你终于停止替这个专业补光，选择从真实体验里撤离。",
    conclusion: "法学无滤镜版本已看完，我决定不续订下一学期。",
  },
  risk_overflow: {
    subtitle: "看起来每件事都还能再做一点，但你已经连续很久没有真正休息。再用一句“还能撑”拖下去，只会让所有事情一起失控，这一局先停下来。",
    conclusion: "我各项看着都还行，合起来已经不建议继续运行。",
  },
  law_final_week: {
    subtitle: "四门闭卷排成一周，你把请求权基础、刑法构成和行政行为背进了同一个脑区。走出最后一场考试时，你已经无法证明自己具备完全民事行为能力。",
    conclusion: "四门都考完了，只有我申请了缺席判决。",
  },
  law_moot_court: {
    subtitle: "开庭前两小时，队友失联、证据目录错页、打印店开始排队。你一人兼任主辩、助理和后勤，最后当庭陈述的是自己的精神状态。",
    conclusion: "模拟法庭赢没赢不知道，反正全组只有我真实出庭。",
  },
  law_internship_v12: {
    subtitle: "带教凌晨一点发来“简单调整”，第七版在天亮前长成第十二版。你第二天还有闭卷考试，电脑保存成功了，人没有。",
    conclusion: "文件最终版有十二个，我的精神状态没有最终版。",
  },
  law_exam_accuracy: {
    subtitle: "你刷了三百道题，正确率从 52% 稳定降到 41%。经验贴收藏夹越来越满，脑子里的知识点开始彼此撤销。",
    conclusion: "我的法考资料已经上岸，正确率决定留在岸边。",
  },
  law_thesis_versions: {
    subtitle: "导师每次都说整体不错，再改一版。你在 final、final2 和真的final 之间寻找最新版，论文有版本管理，人没有。",
    conclusion: "论文通过查重之前，我先没通过版本识别。",
  },
  cs_project_offline: {
    subtitle: "展示前夜，接口、数据库和部署环境同时失联。队友坚持“各自模块都没问题”，系统只好确认：项目没有一个 Bug，项目本身就是 Bug。",
    conclusion: "所有人的代码都能跑，只有合起来以后项目没了。",
  },
  cs_algorithm_lock: {
    subtitle: "你在第一道题上改到比赛结束。本地测试一直没问题，提交以后却一直显示答案错误。排行榜已经更新三轮，你还是没找到到底漏了哪一种情况。",
    conclusion: "别人已经做完三道题，我还在证明第一题不是故意针对我。",
  },
  cs_interview_burnout: {
    subtitle: "秋招、笔试、项目追问和毕设同时占满线程。你能解释缓存穿透，却解释不了自己为什么凌晨三点还在改简历第十四版。",
    conclusion: "面试题背会了，真正轮到我回答时，脑子只剩下一句“稍等”。",
  },
  cs_thesis_crash: {
    subtitle: "演示当天，模型权重找不到、数据库版本不对、导师还问上周说好的创新点。备份文件很多，能完整启动的版本一个都没有。",
    conclusion: "毕设拥有七个最终版，没有一个愿意出席答辩。",
  },
  clinical_energy_shutdown: {
    subtitle: "课程、技能训练和临床任务把你彻底耗空。继续硬撑已经会影响判断和操作，这一局先停下来休息。",
    conclusion: "培养方案还剩很多页，我的精神电量先完成了出院。",
  },
  clinical_filter_exit: {
    subtitle: "白大褂滤镜已经碎完，跑路冲动也从搜索框变成了明确决定。你没有把看清现实等同于失败，而是在沉没成本继续增加前停下。",
    conclusion: "医学滤镜已退订，五年试用期不自动续费。",
  },
  clinical_overload: {
    subtitle: "课程、轮转、科研和升学倒计时同时占满日程。你一直在删减睡眠维持多线运行，系统最终替你承认：有限资源不能完成无限培养任务。",
    conclusion: "计划表每格都有安排，只有本人没有可用时间。",
  },
  chinese_energy_shutdown: {
    subtitle: "文学史、课程论文、试讲和改稿挤在一起，你已经累到同一句话读了几遍也看不进去。这一局先停下来。",
    conclusion: "论文仍在加载，我的精神状态先自动保存退出。",
  },
  chinese_expression_overload: {
    subtitle: "小组展示、朋友圈文案、校刊终稿和实习标题都默认由你收尾。文字还写得出来，负责写字的人先拒绝继续无限续杯。",
    conclusion: "朋友负责经历人生，我负责配文，最后本人没有剩余字数。",
  },
  chinese_interest_cooling: {
    subtitle: "每一本书都要交报告，每一次写作都要看反馈，私人阅读终于申请暂停评分。文字没有离开你，只是暂时不负责证明价值。",
    conclusion: "文学史还没背完，我的阅读兴趣先申请了休学。",
  },
  accounting_energy_shutdown: {
    subtitle: "月结、证书、总表和论文一起压过来，你已经累到连最熟悉的数字也核不清。这一局先停下来休息。",
    conclusion: "总表终于平了，我的精神状态没有。",
  },
  accounting_overresponsibility: {
    subtitle: "每个人都说自己的明细没问题，于是合并、复核和解释全部落到你这里。文件交了，默认接锅的权限也该到期了。",
    conclusion: "大家负责自己的部分，我负责证明这些部分不是不同世界。",
  },
  accounting_plan_collapse: {
    subtitle: "课程、证书和实习都排得很满，计划里却没有留下休息时间。你已经不能继续拿睡眠填空，这一局先停下来。",
    conclusion: "证书计划排到了明年，精力只剩到今晚。",
  },
  revive_failed: {
    subtitle: "嘴硬已经无法覆盖事实。",
    conclusion: "这次先歇一下，再开新号。",
  },
};

const REASON_TAGS: Partial<Record<MidGgReason, string[]>> = {
  manual_quit: ["主动撤离", "及时止损", "换档重开", "路线重算"],
  energy_depleted: ["电量归零", "过载停机", "先睡再说", "暂停续命"],
  escape_overflow: ["跑路值爆表", "战略撤离", "退出机制", "换路重开"],
  interest_dead: ["兴趣掉线", "惯性就读", "滤镜停更", "方向冷却"],
  multi_collapse: ["多项告急", "系统过载", "当场停机", "先救玩家"],
  filter_broken_escape: ["理想破产", "无滤镜实况", "撤离成功", "志愿避雷"],
  risk_overflow: ["多项告急", "长期透支", "先停一下", "恢复优先"],
  law_final_week: ["四门闭卷", "部门法串台", "考完即失忆", "人已离线"],
  law_moot_court: ["全组失联", "唯一主辩", "接锅出庭", "真实开庭"],
  law_internship_v12: ["最终版_v12", "凌晨返工", "电脑已保存", "人未保存"],
  law_exam_accuracy: ["正确率 41%", "经验贴上岸", "错题自由落体", "法考暂退"],
  law_thesis_versions: ["真的最终版", "版本失控", "导师再改一版", "文件考古"],
  cs_project_offline: ["在我电脑上是好的", "合并即消失", "项目急救", "主分支离线"],
  cs_algorithm_lock: ["第一题坐牢", "隐藏测试", "边界失踪", "比赛结束"],
  cs_interview_burnout: ["秋招过载", "八股满载", "简历_v14", "人类停机"],
  cs_thesis_crash: ["毕设失联", "最终版很多", "答辩事故", "备份无效"],
  clinical_energy_shutdown: ["白大褂省电", "电量归零", "先救玩家", "暂停培养"],
  clinical_filter_exit: ["滤镜退订", "路线重算", "及时止损", "医学祛魅"],
  clinical_overload: ["多线过载", "考研倒计时", "轮转并发", "日历爆满"],
  chinese_energy_shutdown: ["论文加载中", "电量归零", "先救作者", "暂停改稿"],
  chinese_expression_overload: ["文案外包到期", "小组救场", "改稿过载", "边界补课"],
  chinese_interest_cooling: ["兴趣暂停评分", "阅读冷却", "文字仍在", "先还给生活"],
  accounting_energy_shutdown: ["账表仍开着", "本人已保存", "电量归零", "先别关人"],
  accounting_overresponsibility: ["总表接锅", "全组善后", "边界到期", "责任重分"],
  accounting_plan_collapse: ["证书排满", "计划改版", "精力不足", "暂停硬撑"],
};

function tagsFor(state: EngineState, reason: MidGgReason): string[] {
  const authored = REASON_TAGS[reason];
  if (authored) return authored;
  const v = pick(state);
  const tags = new Set<string>();
  if (v.escapeImpulse >= 90) ["跑路冲动 MAX", "战略撤离", "保命第一"].forEach((t) => tags.add(t));
  if (v.mentalEnergy <= 10) ["电量归零", "熬夜副作用", "保命第一"].forEach((t) => tags.add(t));
  if (v.filterThickness <= 15) ["专业祛魅", "滤镜碎一地", "梦醒时分"].forEach((t) => tags.add(t));
  if (v.majorInterest <= 20) ["上头值归零", "专业冷却", "强扭不甜"].forEach((t) => tags.add(t));
  if (v.gpaDesire >= 85 && v.mentalEnergy <= 20) ["绩点过载", "卷到断电"].forEach((t) => tags.add(t));
  if (v.jobIllusion <= 20 && v.filterThickness <= 30) ["就业祛魅", "现实入侵"].forEach((t) => tags.add(t));
  if (reason === "manual_quit") tags.add("嘴硬型选手");
  if (tags.size === 0) tags.add("知道该先停下来的人");
  return Array.from(tags).slice(0, 4);
}

/**
 * 中途 GG 判定入口。
 * @param manual 玩家点了顶部结束按钮
 * @param usedRevive 本局是否已经用过一次嘴硬续命
 */
export function checkMidGG(
  state: EngineState,
  opts: { manual?: boolean; usedRevive?: boolean } = {},
): MidGgCheckResult | null {
  const reason = pickReason(state, !!opts.manual);
  if (!reason) return null;

  const isManual = reason === "manual_quit";
  const title = titleFor(state, reason);
  const copy = state.majorId === "computer_science" && reason === "energy_depleted"
    ? {
        subtitle: "课程、项目、面试和报错一起压过来，你已经累到无法继续判断先做什么。这一局先停下来休息。",
        conclusion: "代码还在运行，我先因为电量不足停止响应。",
      }
    : state.majorId === "clinical_medicine" && reason === "energy_depleted"
      ? {
          subtitle: "课程、技能训练和轮转一起压过来，你已经累到会影响判断和操作。继续硬撑并不安全，这一局先停下来。",
          conclusion: "培养方案没有结束，我的精神电量先完成了出院。",
        }
      : COPY[reason];
  const tags = tagsFor(state, reason);

  // 主动结束或已经续过命，直接结算；否则先给一次续命机会
  if (!isManual && !opts.usedRevive) {
    return { type: "revive_offer", reason, title, tags, subtitle: copy.subtitle, conclusion: copy.conclusion };
  }
  return { type: "mid_gg", reason, title, tags, subtitle: copy.subtitle, conclusion: copy.conclusion };
}

/** 嘴硬续命的属性调整 —— 直接 mutate 传入的 stats/hiddenStats。 */
export function applyRevivePenalties(state: EngineState) {
  const s = state.stats;
  const h = state.hiddenStats;
  s.escapeImpulse = Math.max(0, Math.min(100, (s.escapeImpulse ?? 0) - 25));
  s.energy = Math.max(0, Math.min(100, (s.energy ?? 0) + 12));
  s.filter = Math.max(0, Math.min(100, (s.filter ?? 0) - 5));
  h.stubbornness = Math.max(0, Math.min(100, (h.stubbornness ?? 0) + 35));
  const crisisFlags = new Set<string>(LAW_CRISIS_REASONS.map(([flag]) => flag));
  state.flags = state.flags.filter((flag) => !crisisFlags.has(flag));
}
