type MajorDataBundle = {
  events: any[];
  endings: any[];
  achievements: any[];
};

export const majorDataLoaders: Record<string, () => Promise<MajorDataBundle>> = {
  law: async () => ({
    events: (await import("./byMajor/law.events.json")).default,
    endings: (await import("./byMajor/law.endings.json")).default,
    achievements: (await import("./byMajor/law.achievements.json")).default,
  }),
  computer_science: async () => ({
    events: (await import("./byMajor/computer_science.events.json")).default,
    endings: (await import("./byMajor/computer_science.endings.json")).default,
    achievements: (await import("./byMajor/computer_science.achievements.json")).default,
  }),
  artificial_intelligence: async () => ({
    events: (await import("./byMajor/artificial_intelligence.events.json")).default,
    endings: (await import("./byMajor/artificial_intelligence.endings.json")).default,
    achievements: (await import("./byMajor/artificial_intelligence.achievements.json")).default,
  }),
  clinical_medicine: async () => ({
    events: (await import("./byMajor/clinical_medicine.events.json")).default,
    endings: (await import("./byMajor/clinical_medicine.endings.json")).default,
    achievements: (await import("./byMajor/clinical_medicine.achievements.json")).default,
  }),
  finance: async () => ({
    events: (await import("./byMajor/finance.events.json")).default,
    endings: (await import("./byMajor/finance.endings.json")).default,
    achievements: (await import("./byMajor/finance.achievements.json")).default,
  }),
  accounting: async () => ({
    events: (await import("./byMajor/accounting.events.json")).default,
    endings: (await import("./byMajor/accounting.endings.json")).default,
    achievements: (await import("./byMajor/accounting.achievements.json")).default,
  }),
  journalism_communication: async () => ({
    events: (await import("./byMajor/journalism_communication.events.json")).default,
    endings: (await import("./byMajor/journalism_communication.endings.json")).default,
    achievements: (await import("./byMajor/journalism_communication.achievements.json")).default,
  }),
  electrical_engineering: async () => ({
    events: (await import("./byMajor/electrical_engineering.events.json")).default,
    endings: (await import("./byMajor/electrical_engineering.endings.json")).default,
    achievements: (await import("./byMajor/electrical_engineering.achievements.json")).default,
  }),
  english: async () => ({
    events: (await import("./byMajor/english.events.json")).default,
    endings: (await import("./byMajor/english.endings.json")).default,
    achievements: (await import("./byMajor/english.achievements.json")).default,
  }),
  teacher_education: async () => ({
    events: (await import("./byMajor/teacher_education.events.json")).default,
    endings: (await import("./byMajor/teacher_education.endings.json")).default,
    achievements: (await import("./byMajor/teacher_education.achievements.json")).default,
  }),
  chinese_language_literature: async () => ({
    events: (await import("./byMajor/chinese_language_literature.events.json")).default,
    endings: (await import("./byMajor/chinese_language_literature.endings.json")).default,
    achievements: (await import("./byMajor/chinese_language_literature.achievements.json")).default,
  }),
  stomatology: async () => ({
    events: (await import("./byMajor/stomatology.events.json")).default,
    endings: (await import("./byMajor/stomatology.endings.json")).default,
    achievements: (await import("./byMajor/stomatology.achievements.json")).default,
  }),
  psychology: async () => ({
    events: (await import("./byMajor/psychology.events.json")).default,
    endings: (await import("./byMajor/psychology.endings.json")).default,
    achievements: (await import("./byMajor/psychology.achievements.json")).default,
  }),
  electronic_information: async () => ({
    events: (await import("./byMajor/electronic_information.events.json")).default,
    endings: (await import("./byMajor/electronic_information.endings.json")).default,
    achievements: (await import("./byMajor/electronic_information.achievements.json")).default,
  }),
  mechanical_engineering: async () => ({
    events: (await import("./byMajor/mechanical_engineering.events.json")).default,
    endings: (await import("./byMajor/mechanical_engineering.endings.json")).default,
    achievements: (await import("./byMajor/mechanical_engineering.achievements.json")).default,
  }),
  business_administration: async () => ({
    events: (await import("./byMajor/business_administration.events.json")).default,
    endings: (await import("./byMajor/business_administration.endings.json")).default,
    achievements: (await import("./byMajor/business_administration.achievements.json")).default,
  }),
};
