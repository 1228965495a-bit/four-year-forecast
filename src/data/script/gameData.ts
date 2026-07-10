// Auto-loaded game data. Types are looser than types.ts because the JSON
// actually has more fields than the strict declarations. The engine reads
// via its own typed views (see src/lib/scriptEngine.ts).

import { majors, majorById } from "./majorCatalog";
import eventsJson from "./events.json";
import routesJson from "./routes.json";
import endingsJson from "./endings.json";
import achievementsJson from "./achievements.json";
import transferRulesJson from "./transferRules.json";
import globalStatsJson from "./globalStats.json";

export { majors, majorById } from "./majorCatalog";

export const events = eventsJson as any[];
export const routes = routesJson as any[];
export const endings = endingsJson as any[];
export const achievements = achievementsJson as any[];
export const transferRules = transferRulesJson as any;
export const globalStats = globalStatsJson as any;

export const eventById: Record<string, any> = Object.fromEntries(
  events.map((e) => [e.id, e]),
);
export const eventsByMajorId: Record<string, any[]> = events.reduce(
  (acc: Record<string, any[]>, e: any) => {
    (acc[e.majorId] ||= []).push(e);
    return acc;
  },
  {},
);
export const endingsByMajorId: Record<string, any[]> = endings.reduce(
  (acc: Record<string, any[]>, e: any) => {
    (acc[e.majorId] ||= []).push(e);
    return acc;
  },
  {},
);
export const achievementsByMajorId: Record<string, any[]> = achievements.reduce(
  (acc: Record<string, any[]>, a: any) => {
    (acc[a.majorId] ||= []).push(a);
    return acc;
  },
  {},
);

export function getMajor(majorId: string) {
  return majorById[majorId];
}
