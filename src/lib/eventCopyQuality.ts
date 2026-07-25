export type HumorType =
  | "professional_pain"
  | "absurd_contrast"
  | "specific_detail"
  | "dialogue"
  | "callback"
  | "self_mockery"
  | "system_message";

export type HumorIntensity = "A" | "B" | "C";

export interface EventCopyNotes {
  painPoint: string;
  humorBeat: string;
  sceneDetail: string;
  humorType: HumorType;
  screenshotLine: string;
  humorIntensity: HumorIntensity;
  quality: {
    professionalSpecificity: number;
    concreteness: number;
    humorImpact: number;
    choiceTension: number;
    futureValue: number;
  };
  eventQualityScore: number;
  aiTraceFlags: string[];
}

type CopyOption = {
  text?: string;
  feedback?: string;
  effects?: Record<string, unknown>;
  [key: string]: unknown;
};

type CopyEvent = {
  id?: string;
  majorId?: string;
  type?: string;
  title?: string;
  description?: string;
  options?: CopyOption[];
  choices?: CopyOption[];
  conditions?: unknown;
  triggerCondition?: unknown;
  copyNotes?: EventCopyNotes;
  [key: string]: unknown;
};

const PROFESSIONAL_TERMS: Record<string, RegExp> = {
  law: /法学|法律|法理|民法|刑法|宪法|法考|法条|请求权|举证|证据|模拟法庭|主辩|律所|判例|规范|管辖|诉讼|法院|律师|法官|庭审|裁判文书|开卷|合同|岗位表|专业代码/,
  computer_science: /计算机|代码|程序|编程|技术|项目|编译|环境|依赖|报错|Git|PR|分支|仓库|合并|部署|接口|数据库|算法|动态规划|题解|框架|README|需求|Demo|测试|本地|维护者/,
  clinical_medicine: /医学生|学医|医生|患者|查房|病历|病史|问诊|鉴别诊断|带教|轮转|技能|白大褂|医学|临床|病例|指南|考研|科研|操作|医嘱|手术|缝合|无菌|科室|OSCE|交感神经|影像科|检验科/,
  chinese_language_literature: /中文|文学|古代汉语|现代汉语|虚词|文本|论文|选题|脚注|校对|编辑|投稿|试讲|教资|教案|开题|作品|作家|阅读|写作|课程论文|文章/,
  accounting: /会计|核算|借贷|分录|凭证|试算|合计|差额|审计|底稿|发票|合同|入账|月结|关账|Excel|公式|财务|报表|税|CPA|盘点|原件|成本表|图表/,
};

const AI_TRACE_PATTERNS: Array<[string, RegExp]> = [
  ["逐渐意识到", /你逐渐意识到/],
  ["过程式总结", /在这个过程中/],
  ["意义拔高", /这不仅是一次|真正重要的是/],
  ["顿悟式总结", /你开始明白|你找到了自己的方向/],
  ["模板反转", /你原本以为.{0,28}(但|却)/],
  ["流行梗", /谁懂啊|家人们|尊嘟假嘟|栓Q|我哭死|CPU烧了|破防了|狠狠拿捏|小丑竟是我自己/],
  ["空泛灾难形容", /史诗级|地狱级|毁灭级/],
  ["抽象游戏黑话", /本局(最强倾向|资源|路线)|副本(淘汰|结果|保存)|路线权重|资源投入|综合风险|系统判定/],
  ["过度拟人", /长出(身份|偏好|路线|答案)|获得合法身份|正式获得续集|从统计学意义上失踪/],
  ["术语代替事实", /完成显影|多线程崩溃|人类进程|状态机|路径依赖|方法论闭环/],
];

const DETAIL_PATTERN = /\d|[一二三四五六七八九十百]+(页|次|份|门|天|周|分钟|小时|块|行|床|版)|“[^”]{1,24}”|「[^」]{1,24}」|\.xlsx|\.zip|README|final|最终版|群里|批注|倒计时|文件夹|共享盘|表格|通知栏/i;
const CONTRAST_PATTERN = /都说|同时|仍然|只有|结果|偏偏|明明|合起来|各自|最后|却|还没|已经|不等于|没有发表意见/;
const CALLBACK_PATTERN = /大一|大二|大三|大四|上一|当年|后来|终于|回来|收取利息|还债|留级/;
const SYSTEM_PATTERN = /系统|报错|找不到|无法|截止|窗口|通知|状态|已提交|撤回|加载|404|通过|失败/i;

export function annotateEventCopy<T extends CopyEvent>(event: T, majorId = String(event.majorId ?? "")): T & { copyNotes: EventCopyNotes } {
  if (event.copyNotes) return event as T & { copyNotes: EventCopyNotes };
  const options = event.options ?? event.choices ?? [];
  const description = clean(event.description);
  const title = clean(event.title);
  const feedbacks = options.map((option) => clean(option.feedback)).filter(Boolean);
  const allText = [title, description, ...options.flatMap((option) => [clean(option.text), clean(option.feedback)])].join(" ");
  const sentences = [title, ...splitSentences(description), ...feedbacks.flatMap(splitSentences)].filter(Boolean);
  const professionalSpecificity = scoreProfessional(majorId, allText);
  const concreteness = DETAIL_PATTERN.test(allText) ? 2 : description.length >= 36 ? 1 : 0;
  const humorType = detectHumorType(allText);
  const screenshotLine = pickScreenshotLine(sentences, majorId);
  const humorImpact = scoreHumor(allText, screenshotLine);
  const choiceTension = scoreChoiceTension(event, options);
  const futureValue = scoreFutureValue(event, options);
  const eventQualityScore = professionalSpecificity + concreteness + humorImpact + choiceTension + futureValue;
  const painPoint = splitSentences(description)[0] || title;
  const sceneDetail = sentences.find((sentence) => DETAIL_PATTERN.test(sentence)) ?? title;
  const humorBeat = screenshotLine || sentences[1] || title;
  return {
    ...event,
    copyNotes: {
      painPoint,
      humorBeat,
      sceneDetail,
      humorType,
      screenshotLine,
      humorIntensity: humorImpact >= 2 && concreteness >= 2 && CONTRAST_PATTERN.test(allText)
        ? "A"
        : CALLBACK_PATTERN.test(allText) || /边界|放弃|退出|兴趣|热爱|毕业/.test(allText)
          ? "C"
          : "B",
      quality: {
        professionalSpecificity,
        concreteness,
        humorImpact,
        choiceTension,
        futureValue,
      },
      eventQualityScore,
      aiTraceFlags: AI_TRACE_PATTERNS.filter(([, pattern]) => pattern.test(allText)).map(([label]) => label),
    },
  };
}

export function annotateEventPool<T extends CopyEvent>(events: T[], majorId: string) {
  return events.map((event) => annotateEventCopy(event, majorId));
}

export function humorTypeRepeatPenalty(
  events: CopyEvent[],
  seenEventIds: string[],
  candidate: CopyEvent,
) {
  const candidateType = candidate.copyNotes?.humorType;
  if (!candidateType) return 1;
  const byId = new Map(events.map((event) => [event.id, event]));
  const recentTypes = seenEventIds
    .slice(-2)
    .map((id) => byId.get(id)?.copyNotes?.humorType)
    .filter(Boolean);
  const repeatCount = recentTypes.filter((type) => type === candidateType).length;
  return repeatCount >= 2 ? 0.3 : repeatCount === 1 ? 0.68 : 1;
}

function scoreProfessional(majorId: string, text: string) {
  const pattern = PROFESSIONAL_TERMS[majorId];
  if (!pattern) return 1;
  const matches = text.match(new RegExp(pattern.source, "g")) ?? [];
  return matches.length >= 1 ? 2 : 0;
}

function scoreHumor(text: string, screenshotLine: string) {
  const hasBeat = CONTRAST_PATTERN.test(text)
    || CALLBACK_PATTERN.test(text)
    || /：“|：\s*“|群里|文件名|最终版|失联|沉默|自己没问题|本地能跑|显然|只需要小改/.test(text);
  if (hasBeat && screenshotLine.length >= 12) return 2;
  return screenshotLine.length >= 10 ? 1 : 0;
}

function scoreChoiceTension(event: CopyEvent, options: CopyOption[]) {
  if (/hidden|callback/.test(String(event.type ?? event.id ?? "")) && options.length >= 1) return 2;
  if (/fallback|transition/.test(String(event.id ?? "")) && options.length >= 1) return 2;
  if (options.length < 2) return 0;
  const concreteFeedbacks = options.filter((option) => clean(option.feedback).length >= 14).length;
  return options.length >= 3 && concreteFeedbacks >= Math.min(3, options.length) ? 2 : 1;
}

function scoreFutureValue(event: CopyEvent, options: CopyOption[]) {
  const serialized = JSON.stringify({ type: event.type, conditions: event.conditions, triggerCondition: event.triggerCondition, options });
  if (/hidden|callback|flags|routes|closes|nextEvent|experiences|conditions|accounting|clinical|chinese/.test(serialized)) return 2;
  if (/effects|routeAdd|flagsAdd|majorStats|hiddenStats/.test(serialized)) return 1;
  return 0;
}

function detectHumorType(text: string): HumorType {
  if (CALLBACK_PATTERN.test(text)) return "callback";
  if (SYSTEM_PATTERN.test(text)) return "system_message";
  if (/：“|：\s*“|老师说|问：“|回了句|发来一句|群里.*说/.test(text)) return "dialogue";
  if (CONTRAST_PATTERN.test(text)) return "absurd_contrast";
  if (DETAIL_PATTERN.test(text)) return "specific_detail";
  if (/你|本人|自己|灵魂|人生/.test(text)) return "self_mockery";
  return "professional_pain";
}

function pickScreenshotLine(sentences: string[], majorId: string) {
  return [...sentences]
    .map((sentence, index) => ({
      sentence,
      score: (index === 0 ? 2 : 0)
        + (DETAIL_PATTERN.test(sentence) ? 4 : 0)
        + (CONTRAST_PATTERN.test(sentence) ? 4 : 0)
        + (CALLBACK_PATTERN.test(sentence) ? 3 : 0)
        + (PROFESSIONAL_TERMS[majorId]?.test(sentence) ? 3 : 0)
        + (sentence.length >= 14 && sentence.length <= 54 ? 2 : 0),
    }))
    .sort((a, b) => b.score - a.score)[0]?.sentence ?? "";
}

function splitSentences(value: string) {
  return value.split(/(?<=[。！？!?])/).map(clean).filter(Boolean);
}

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}
