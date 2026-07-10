export const SEMESTER_KEYS = ["y1s1", "y1s2", "y2s1", "y2s2", "y3s1", "y3s2", "y4s1", "y4s2"] as const;

export type SemesterKey = (typeof SEMESTER_KEYS)[number];

export const SEMESTER_LABEL: Record<SemesterKey, string> = {
  y1s1: "大一上",
  y1s2: "大一下",
  y2s1: "大二上",
  y2s2: "大二下",
  y3s1: "大三上",
  y3s2: "大三下",
  y4s1: "大四上",
  y4s2: "大四下",
};

export function currentSemesterLabelFromIndex(semesterIdx: number) {
  return SEMESTER_LABEL[SEMESTER_KEYS[semesterIdx] ?? SEMESTER_KEYS[0]];
}

export function totalSemesters() {
  return SEMESTER_KEYS.length;
}