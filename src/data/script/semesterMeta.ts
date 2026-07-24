import { getMajorExperienceConfig } from "@/data/majorExperienceConfig";

export const SEMESTER_KEYS = [
  "y1s1",
  "y1s2",
  "y2s1",
  "y2s2",
  "y3s1",
  "y3s2",
  "y4s1",
  "y4s2",
  "y5s1",
  "y5s2",
] as const;

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
  y5s1: "大五上",
  y5s2: "大五下",
};

export function semesterKeysForMajor(majorId?: string | null) {
  const total = getMajorExperienceConfig(majorId)?.totalSemesters ?? 8;
  return SEMESTER_KEYS.slice(0, total);
}

export function currentSemesterLabelFromIndex(semesterIdx: number, majorId?: string | null) {
  const keys = semesterKeysForMajor(majorId);
  return SEMESTER_LABEL[keys[semesterIdx] ?? keys[0] ?? "y1s1"];
}

export function totalSemesters(majorId?: string | null) {
  return semesterKeysForMajor(majorId).length;
}
