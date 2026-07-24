import majorsJson from "./majors.json";

export const LAUNCH_MAJOR_IDS = new Set([
  "law",
  "computer_science",
  "clinical_medicine",
  "chinese_language_literature",
  "accounting",
]);

export const majors = (majorsJson as any[]).filter((major) => LAUNCH_MAJOR_IDS.has(major.id));

export const majorById: Record<string, any> = Object.fromEntries(
  majors.map((m) => [m.id, m]),
);

export function getMajor(majorId: string | null | undefined) {
  return majorId ? majorById[majorId] : null;
}
