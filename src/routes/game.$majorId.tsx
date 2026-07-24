import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { MajorPreview } from "./major-preview.$majorId";
import { getMajorExperienceConfig } from "@/data/majorExperienceConfig";
import { gameStore } from "@/lib/gameStore";

export const Route = createFileRoute("/game/$majorId")({
  component: DirectMajorEntry,
});

function DirectMajorEntry() {
  const { majorId } = Route.useParams();
  const navigate = useNavigate();
  const config = getMajorExperienceConfig(majorId);

  useEffect(() => {
    if (!config) return;
    if (config.entryType === "community_vote") {
      navigate({ to: "/next-major-vote", replace: true });
      return;
    }
    if (config.availability === "available") {
      gameStore.selectMajor(config.id);
      navigate({ to: "/intro", replace: true });
    }
  }, [config, navigate]);

  if (!config || config.availability === "unavailable") {
    return <MajorPreview majorId={majorId} />;
  }
  return null;
}
