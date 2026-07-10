import majorsJson from "./majors.json";

export const majors = majorsJson as any[];

export const majorById: Record<string, any> = Object.fromEntries(
  majors.map((m) => [m.id, m]),
);

export function getMajor(majorId: string | null | undefined) {
  return majorId ? majorById[majorId] : null;
}