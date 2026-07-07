import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export type TagTone =
  | "default"
  | "hot"
  | "hard"
  | "stable"
  | "job"
  | "fun"
  | "rare"
  | "warn";

const TAG_TONE_MAP: Record<string, TagTone> = {
  热门: "hot",
  卷度高: "hard",
  慎选: "warn",
  就业向: "job",
  烧脑: "hard",
  兴趣向: "fun",
  稳定: "stable",
  冷门: "rare",
  情怀: "rare",
};

export function inferTagTone(text: string): TagTone {
  return TAG_TONE_MAP[text] ?? "default";
}

export interface TagBadgeProps {
  tone?: TagTone;
  children: ReactNode;
  className?: string;
}

const toneClass: Record<TagTone, string> = {
  default: "",
  hot: "tag-hot",
  hard: "tag-hard",
  stable: "tag-stable",
  job: "tag-job",
  fun: "tag-fun",
  rare: "tag-rare",
  warn: "tag-warn",
};

export function TagBadge({ tone = "default", children, className }: TagBadgeProps) {
  return <span className={cn("tag-badge", toneClass[tone], className)}>{children}</span>;
}
