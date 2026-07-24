type MajorDataBundle = {
  events: any[];
  endings: any[];
  achievements: any[];
};

import { annotateEventPool } from "@/lib/eventCopyQuality";

export const majorDataLoaders: Record<string, () => Promise<MajorDataBundle>> = {
  law: async () => {
    const { applyLawCopy } = await import("./byMajor/law.copy");
    return {
      events: annotateEventPool(applyLawCopy([
      ...(await import("./byMajor/law.events.json")).default,
      ...(await import("./byMajor/law.roguelite.events")).LAW_ROGUELITE_EVENTS,
      ...(await import("./byMajor/law.roguelite.events")).LAW_ROGUELITE_RANDOM_EVENTS,
      ...(await import("@/lib/lawReplay")).LAW_REPLAY_OPENING_EVENTS,
      ]), "law"),
      endings: (await import("./byMajor/law.endings.json")).default,
      achievements: (await import("./byMajor/law.achievements.json")).default,
    };
  },
  computer_science: async () => {
    const { applyCSCopy } = await import("./byMajor/computerScience.copy");
    return {
      events: annotateEventPool(applyCSCopy((await import("./byMajor/computer_science.events.json")).default), "computer_science"),
      endings: (await import("./byMajor/computer_science.endings.json")).default,
      achievements: (await import("./byMajor/computer_science.achievements.json")).default,
    };
  },
  clinical_medicine: async () => ({
    events: annotateEventPool((await import("./byMajor/clinicalMedicine.copy")).applyClinicalMedicineCopy(
      (await import("./byMajor/clinicalMedicine.events")).CLINICAL_EVENTS,
    ), "clinical_medicine"),
    endings: [{
      id: "clinical_medicine_five_year_complete",
      title: "五年培养副本已归档",
      summary: "你带着本局形成的路线、习惯和边界走出了本科阶段。",
      priority: 1,
      conditions: {},
    }],
    achievements: [],
  }),
  accounting: async () => ({
    events: annotateEventPool((await import("./byMajor/accounting.roguelite.events")).ACCOUNTING_EVENTS, "accounting"),
    endings: [{
      id: "accounting_four_year_complete",
      title: "会计学四年副本已归档",
      summary: "你带着本局形成的核对习惯、责任边界和职业出口走出了本科阶段。",
      priority: 1,
      conditions: {},
    }],
    achievements: [],
  }),
  chinese_language_literature: async () => ({
    events: annotateEventPool((await import("./byMajor/chineseLiterature.events")).CHINESE_EVENTS, "chinese_language_literature"),
    endings: [{
      id: "chinese_language_literature_four_year_complete",
      title: "中文系四年副本已归档",
      summary: "你带着本局形成的文本路径、表达习惯和现实出口走出了本科阶段。",
      priority: 1,
      conditions: {},
    }],
    achievements: [],
  }),
};
