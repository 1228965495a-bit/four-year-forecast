import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Check, PencilLine, Vote } from "lucide-react";
import { PhoneFrame } from "@/components/game/PhoneFrame";
import {
  getCurrentVote,
  getVoteResults,
  MAJOR_VOTE_OPTIONS,
  submitCustomVote,
  submitVote,
  type MajorVoteSelection,
} from "@/lib/majorVoteStore";

export const Route = createFileRoute("/next-major-vote")({
  component: NextMajorVotePage,
});

function NextMajorVotePage() {
  const navigate = useNavigate();
  const [currentVote, setCurrentVote] = useState<MajorVoteSelection | null>(null);
  const [editing, setEditing] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customError, setCustomError] = useState("");

  useEffect(() => {
    setCurrentVote(getCurrentVote());
  }, []);

  const voteResults = getVoteResults();

  const vote = (majorId: string) => {
    const option = submitVote(majorId);
    setCurrentVote(option);
    setEditing(false);
    setCustomError("");
  };

  const voteCustom = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const option = submitCustomVote(customName);
      setCurrentVote(option);
      setCustomName("");
      setCustomError("");
      setEditing(false);
    } catch (error) {
      setCustomError(error instanceof Error ? error.message : "请填写专业名称");
    }
  };

  const topBar = (
    <header className="v4-topbar">
      <button className="v4-icon-button" aria-label="返回专业选择" onClick={() => navigate({ to: "/major" })}>
        <ArrowLeft size={19} />
      </button>
      <div>
        <div className="v4-title text-[19px]">下一专业，由你决定</div>
        <div className="mt-0.5 text-[11px] text-[var(--v4-muted)]">把想读的本科副本投进下一轮</div>
      </div>
    </header>
  );

  return (
    <PhoneFrame topBar={topBar}>
      <div className="v4-scroll">
        <div className="v4-vote-page">
          <section className="v4-vote-intro">
            <Vote size={24} />
            <div>
              <h1>没有你的专业？</h1>
              <p>选一个你最想重开的人生。这里只有你的选择，不拿来编造热度。</p>
            </div>
          </section>

          {currentVote && !editing ? (
            <section className="v4-vote-confirmed">
              <div className="v4-vote-check">
                <Check size={19} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-bold text-[var(--v4-muted)]">你已投给</div>
                <h2>{currentVote.name}</h2>
                <p>{currentVote.teaser}</p>
              </div>
              <button className="v4-text-button" onClick={() => setEditing(true)}>
                更改选择
              </button>
            </section>
          ) : (
            <>
              <div className="v4-vote-list">
                {MAJOR_VOTE_OPTIONS.filter((option) => option.enabled).map((option) => (
                  <button className="v4-vote-option" key={option.id} onClick={() => vote(option.id)}>
                    <span>
                      <strong>{option.name}</strong>
                      <small>{option.teaser}</small>
                    </span>
                    <Vote size={17} />
                  </button>
                ))}
              </div>

              <form className="v4-vote-custom" onSubmit={voteCustom}>
                <div className="v4-vote-custom-title">
                  <PencilLine size={18} />
                  <div>
                    <strong>名单里没有？自己提名</strong>
                    <small>填写你最想玩的专业名称</small>
                  </div>
                </div>
                <div className="v4-vote-custom-row">
                  <input
                    aria-label="自定义专业名称"
                    maxLength={30}
                    onChange={(event) => {
                      setCustomName(event.target.value);
                      setCustomError("");
                    }}
                    placeholder="例如：社会学"
                    value={customName}
                  />
                  <button className="v4-primary" type="submit" disabled={!customName.trim()}>
                    提名
                  </button>
                </div>
                {customError && <p className="v4-vote-error">{customError}</p>}
              </form>
            </>
          )}

          <p className="v4-vote-note">{voteResults.message}</p>
        </div>
      </div>
    </PhoneFrame>
  );
}
