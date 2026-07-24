import {
  canEnterMajorGame,
  MAJOR_EXPERIENCES,
} from "../src/data/majorExperienceConfig";
import { semesterKeysForMajor, totalSemesters } from "../src/data/script/semesterMeta";
import {
  getCurrentVote,
  getVoteResults,
  MAJOR_VOTE_OPTIONS,
  submitVote,
} from "../src/lib/majorVoteStore";

const expectedIds = [
  "law",
  "computer_science",
  "clinical_medicine",
  "chinese_language_literature",
  "accounting",
  "community_next_major",
];

const actualIds = MAJOR_EXPERIENCES.map((major) => major.id);
if (JSON.stringify(actualIds) !== JSON.stringify(expectedIds)) {
  throw new Error(`Unexpected 5+1 order: ${actualIds.join(", ")}`);
}
if (MAJOR_EXPERIENCES.length !== 6) throw new Error("The launch lineup must contain exactly six entries");
if (!canEnterMajorGame("law") || !canEnterMajorGame("computer_science")) {
  throw new Error("Law and computer science must enter their own game runtimes");
}
for (const majorId of ["clinical_medicine", "chinese_language_literature", "accounting"]) {
  if (canEnterMajorGame(majorId)) throw new Error(`${majorId} must route to its immersive preview`);
}
if (totalSemesters("law") !== 8 || totalSemesters("computer_science") !== 8) {
  throw new Error("Four-year launch majors must keep eight semesters");
}
if (totalSemesters("clinical_medicine") !== 10) {
  throw new Error("Clinical medicine must support ten semesters");
}
if (semesterKeysForMajor("clinical_medicine").at(-1) !== "y5s2") {
  throw new Error("Clinical medicine must end at y5s2");
}
if (MAJOR_VOTE_OPTIONS.filter((option) => option.enabled).length !== 6) {
  throw new Error("The first community vote must contain six enabled candidates");
}

const localVoteStore = new Map<string, string>();
Object.defineProperty(globalThis, "window", {
  configurable: true,
  value: {
    localStorage: {
      getItem: (key: string) => localVoteStore.get(key) ?? null,
      setItem: (key: string, value: string) => localVoteStore.set(key, value),
    },
  },
});
submitVote("psychology");
if (getCurrentVote() !== "psychology") throw new Error("A saved vote must survive a later read");
submitVote("finance");
if (getCurrentVote() !== "finance") throw new Error("A later vote must overwrite the previous choice");
if (getVoteResults().status !== "not_public") throw new Error("Vote results must not expose invented rankings");

const forbidden = ["已开放", "开发中", "正在施工", "即将开放", "敬请期待", "Coming Soon", "锁定中"];
const publicCopy = MAJOR_EXPERIENCES.flatMap((major) => [
  major.name,
  major.subtitle,
  major.previewTitle ?? "",
  major.previewBody ?? "",
]);
for (const term of forbidden) {
  if (publicCopy.some((copy) => copy.includes(term))) {
    throw new Error(`Public major copy exposes internal status: ${term}`);
  }
}

console.log({
  lineup: actualIds,
  availableGames: MAJOR_EXPERIENCES.filter(canEnterConfig).map((major) => major.id),
  clinicalSemesters: semesterKeysForMajor("clinical_medicine"),
  voteOptions: MAJOR_VOTE_OPTIONS.map((option) => option.name),
});

function canEnterConfig(major: (typeof MAJOR_EXPERIENCES)[number]) {
  return major.entryType === "game" && canEnterMajorGame(major.id);
}
