"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Award,
  Trophy,
  Camera,
  UserPlus,
  Users as UsersIcon,
  Vote,
  CheckCircle2,
  Clock,
  ChevronRight,
  Star,
  Users,
} from "lucide-react";
import { demoAwardSeason } from "@/lib/demo-data";
import { useCategories } from "@/lib/categories-context";
import { useAwards } from "@/lib/awards-context";
import { useNebbys } from "@/lib/nebby-context";
import { formatDate } from "@/lib/utils";
import type { AwardPhase, Nomination } from "@/types";

const phaseConfig: Record<
  AwardPhase,
  { label: string; variant: "info" | "warning" | "success" | "default"; icon: React.ReactNode }
> = {
  setup: { label: "Setting up", variant: "default", icon: <Clock className="h-3 w-3" /> },
  nomination: { label: "Nominations open", variant: "info", icon: <Star className="h-3 w-3" /> },
  voting: { label: "Voting open", variant: "warning", icon: <Vote className="h-3 w-3" /> },
  results: { label: "Results announced", variant: "success", icon: <Trophy className="h-3 w-3" /> },
};

export default function AwardsPage() {
  const season = demoAwardSeason;
  const phase = phaseConfig[season.phase];
  const { categories } = useCategories();
  const { nominations } = useAwards();
  const [activeView, setActiveView] = useState<"overview" | "nominate" | "vote" | "results">("overview");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Season header */}
      <Card>
        <CardBody className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-100 p-2">
              <Award className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h2 className="font-bold text-zinc-900">
                {season.year} Nebby Awards
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant={phase.variant}>
                  {phase.icon}
                  <span className="ml-1">{phase.label}</span>
                </Badge>
              </div>
            </div>
          </div>
          <div className="text-sm text-zinc-500 space-y-0.5">
            <p>
              Nominations: {formatDate(season.nominationStart)} &ndash;{" "}
              {formatDate(season.nominationEnd)}
            </p>
            <p>
              Voting: {formatDate(season.votingStart)} &ndash;{" "}
              {formatDate(season.votingEnd)}
            </p>
          </div>
        </CardBody>
      </Card>

      {/* Phase navigation */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={activeView === "overview" ? "primary" : "secondary"}
          size="sm"
          onClick={() => {
            setActiveView("overview");
            setSelectedCategory(null);
          }}
        >
          Categories
        </Button>
        <Button
          variant={activeView === "nominate" ? "primary" : "secondary"}
          size="sm"
          onClick={() => setActiveView("nominate")}
        >
          <Star className="h-3.5 w-3.5" /> Nominate
        </Button>
        <Button
          variant={activeView === "vote" ? "primary" : "secondary"}
          size="sm"
          onClick={() => setActiveView("vote")}
        >
          <Vote className="h-3.5 w-3.5" /> Vote
        </Button>
        <Button
          variant={activeView === "results" ? "primary" : "secondary"}
          size="sm"
          onClick={() => setActiveView("results")}
        >
          <Trophy className="h-3.5 w-3.5" /> Results
        </Button>
      </div>

      {/* Category overview */}
      {activeView === "overview" && (
        <div className="grid gap-4 sm:grid-cols-2">
          {categories
            .filter((c) => c.enabled)
            .map((cat) => {
              const noms = nominations.filter(
                (n) => n.categoryId === cat.id,
              );
              return (
                <Card key={cat.id} className="hover:border-emerald-300 transition-colors">
                  <CardBody>
                    <h3 className="font-semibold text-zinc-900">{cat.name}</h3>
                    <p className="mt-1 text-sm text-zinc-500">
                      {cat.description}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-zinc-400">
                        {noms.length} nomination{noms.length !== 1 ? "s" : ""}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedCategory(cat.id);
                          setActiveView("nominate");
                        }}
                      >
                        View <ChevronRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              );
            })}
        </div>
      )}

      {/* Nominate view */}
      {activeView === "nominate" && (
        <NominateView
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      )}

      {/* Vote view */}
      {activeView === "vote" && <VoteView />}

      {/* Results view */}
      {activeView === "results" && <ResultsView />}
    </div>
  );
}

function NominateView({
  selectedCategory,
  onSelectCategory,
}: {
  selectedCategory: string | null;
  onSelectCategory: (id: string) => void;
}) {
  const { categories } = useCategories();
  const { nominations, addNomination } = useAwards();
  const { activeMembers } = useNebbys();
  const [explanation, setExplanation] = useState("");
  const [selectedNominee, setSelectedNominee] = useState("");
  const [nomineeType, setNomineeType] = useState<"member" | "non-member">("member");
  const [nonMemberName, setNonMemberName] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [justSubmitted, setJustSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPhotoPreview(url);
  }

  const category = selectedCategory
    ? categories.find((c) => c.id === selectedCategory)
    : null;

  if (!category) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-zinc-500">
          Choose a category to nominate a neighbor:
        </p>
        {categories
          .filter((c) => c.enabled)
          .map((cat) => {
            const catNoms = nominations.filter((n) => n.categoryId === cat.id);
            return (
              <Card
                key={cat.id}
                className="cursor-pointer hover:border-emerald-300 transition-colors"
                onClick={() => onSelectCategory(cat.id)}
              >
                <CardBody className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-zinc-900">{cat.name}</p>
                    <p className="text-sm text-zinc-500">{cat.description}</p>
                    <p className="text-xs text-zinc-400 mt-1">
                      {catNoms.length} nomination{catNoms.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-zinc-400" />
                </CardBody>
              </Card>
            );
          })}
      </div>
    );
  }

  const noms = nominations.filter((n) => n.categoryId === category.id);

  const canSubmit =
    nomineeType === "member"
      ? !!selectedNominee && !!photoPreview
      : !!nonMemberName.trim() && !!photoPreview;

  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      if (nomineeType === "member") {
        const member = activeMembers.find((m) => m.id === selectedNominee);
        if (!member) return;
        await addNomination({
          categoryId: category!.id,
          nomineeMembershipId: member.id,
          nomineeUsername: member.username,
          explanation,
          photoUrl: photoPreview ?? undefined,
        });
      } else {
        await addNomination({
          categoryId: category!.id,
          nomineeMembershipId: null,
          nomineeUsername: nonMemberName.trim(),
          nomineeIsNonMember: true,
          explanation,
          photoUrl: photoPreview ?? undefined,
        });
      }
      setSelectedNominee("");
      setNonMemberName("");
      setExplanation("");
      setPhotoPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setJustSubmitted(true);
      setTimeout(() => setJustSubmitted(false), 3000);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <button
          onClick={() => onSelectCategory("")}
          className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
        >
          &larr; All categories
        </button>
        <span className="text-sm text-zinc-300">/</span>
        <h3 className="font-semibold text-zinc-900">{category.name}</h3>
      </div>
      <p className="text-sm text-zinc-500">{category.description}</p>

      {/* Existing nominations */}
      {noms.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-zinc-700">
            Current nominations ({noms.length})
          </h4>
          {noms.map((nom) => (
            <NominationCard key={nom.id} nomination={nom} />
          ))}
        </div>
      )}

      {/* Success banner */}
      {justSubmitted && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          Nomination submitted!
        </div>
      )}

      {/* Nominate form */}
      <Card className="border-emerald-200">
        <CardHeader>
          <h4 className="font-medium text-zinc-900">Submit a nomination</h4>
        </CardHeader>
        <CardBody className="space-y-3">
          {/* Member / Non-member toggle */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Who are you nominating?
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setNomineeType("member");
                  setNonMemberName("");
                }}
                className={`flex-1 flex items-center justify-center gap-2 rounded-lg border p-2.5 text-sm font-medium transition-colors ${
                  nomineeType === "member"
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-zinc-200 text-zinc-600 hover:border-zinc-300"
                }`}
              >
                <UsersIcon className="h-4 w-4" />
                A Nebby member
              </button>
              <button
                type="button"
                onClick={() => {
                  setNomineeType("non-member");
                  setSelectedNominee("");
                }}
                className={`flex-1 flex items-center justify-center gap-2 rounded-lg border p-2.5 text-sm font-medium transition-colors ${
                  nomineeType === "non-member"
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-zinc-200 text-zinc-600 hover:border-zinc-300"
                }`}
              >
                <UserPlus className="h-4 w-4" />
                A neighbor (not on Nebby)
              </button>
            </div>
          </div>

          {/* Nominee selection */}
          {nomineeType === "member" ? (
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Nominee
              </label>
              <select
                value={selectedNominee}
                onChange={(e) => setSelectedNominee(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="">Select a neighbor...</option>
                {activeMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.username}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                How is this person known in the neighborhood?
              </label>
              <Input
                value={nonMemberName}
                onChange={(e) => setNonMemberName(e.target.value)}
                placeholder='e.g. "The lady on Elm St who always waves"'
              />
              <p className="text-xs text-zinc-400 mt-1">
                Use a friendly description — no real names or addresses needed.
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Why do they deserve this award?{" "}
              <span className="text-zinc-400">(optional)</span>
            </label>
            <Textarea
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Tell us what makes this neighbor great..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Photo{" "}
              <span className="text-zinc-400">(required — no house numbers)</span>
            </label>
            <p className="text-xs text-zinc-500 mb-2">
              Upload a photo of their lawn, garden, decor, etc. to be considered.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoSelect}
              className="hidden"
              id="nom-photo"
            />
            {photoPreview ? (
              <div className="relative">
                <img
                  src={photoPreview}
                  alt="Nomination photo preview"
                  className="w-full h-48 object-cover rounded-lg border border-zinc-200"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPhotoPreview(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="absolute top-2 right-2 rounded-full bg-black/50 text-white p-1 hover:bg-black/70"
                >
                  <span className="sr-only">Remove photo</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex flex-col items-center gap-2 rounded-lg border-2 border-dashed border-zinc-300 p-6 text-zinc-400 hover:border-emerald-400 hover:text-emerald-500 transition-colors"
              >
                <Camera className="h-8 w-8" />
                <span className="text-sm font-medium">Upload a photo</span>
              </button>
            )}
          </div>
          <div className="flex justify-end">
            <Button size="sm" disabled={!canSubmit || submitting} onClick={handleSubmit}>
              <Star className="h-3.5 w-3.5" /> {submitting ? "Submitting..." : "Submit nomination"}
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

function VoteView() {
  const { categories } = useCategories();
  const { nominations, votes, castVote, submitVotes, votesSubmitted } = useAwards();

  const enabledCategories = categories.filter((c) => c.enabled);
  const categoriesWithNominees = enabledCategories.filter((cat) =>
    nominations.some(
      (n) =>
        n.categoryId === cat.id &&
        n.consentStatus === "accepted" &&
        n.moderationStatus === "approved",
    ),
  );

  return (
    <div className="space-y-6">
      {votesSubmitted ? (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          <div>
            <p className="font-semibold">Votes submitted!</p>
            <p className="text-emerald-600 mt-0.5">
              Your votes have been recorded. Check the Results tab to see standings.
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-sm text-blue-800">
          You can cast one vote per category. Select a nominee in each category below, then submit.
        </div>
      )}

      {enabledCategories.map((cat) => {
        const noms = nominations.filter(
          (n) =>
            n.categoryId === cat.id &&
            n.consentStatus === "accepted" &&
            n.moderationStatus === "approved",
        );

        return (
          <Card key={cat.id}>
            <CardHeader>
              <h3 className="font-semibold text-zinc-900">{cat.name}</h3>
              <p className="text-sm text-zinc-500">{cat.description}</p>
            </CardHeader>
            <CardBody className="space-y-2">
              {noms.length === 0 ? (
                <p className="text-sm text-zinc-400">No eligible nominees yet.</p>
              ) : (
                noms.map((nom) => (
                  <button
                    key={nom.id}
                    onClick={() => !votesSubmitted && castVote(cat.id, nom.id).catch(() => {})}
                    disabled={votesSubmitted}
                    className={`w-full rounded-lg border overflow-hidden text-left transition-colors ${
                      votes[cat.id] === nom.id
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-zinc-200 hover:border-zinc-300"
                    } ${votesSubmitted ? "cursor-default" : ""}`}
                  >
                    {nom.photoUrl && (
                      <img
                        src={nom.photoUrl}
                        alt={`Photo for ${nom.nomineeUsername}`}
                        className="w-full h-32 object-cover"
                      />
                    )}
                    <div className="flex items-center gap-3 p-3">
                      <Avatar username={nom.nomineeUsername} size="sm" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-zinc-900">
                            {nom.nomineeUsername}
                          </p>
                          {nom.nomineeIsNonMember && (
                            <Badge variant="default">Neighbor</Badge>
                          )}
                        </div>
                        {nom.explanation && (
                          <p className="text-xs text-zinc-500 mt-0.5">
                            &ldquo;{nom.explanation}&rdquo;
                          </p>
                        )}
                      </div>
                      {votes[cat.id] === nom.id && (
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                      )}
                    </div>
                  </button>
                ))
              )}
            </CardBody>
          </Card>
        );
      })}

      {!votesSubmitted && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-zinc-500">
            {Object.keys(votes).length} of {categoriesWithNominees.length} categories voted
          </p>
          <Button
            disabled={Object.keys(votes).length === 0}
            onClick={() => submitVotes().catch(() => {})}
          >
            <Vote className="h-4 w-4" /> Submit votes
          </Button>
        </div>
      )}
    </div>
  );
}

function ResultsView() {
  const { categories } = useCategories();
  const { nominations } = useAwards();
  return (
    <div className="space-y-4">
      {categories
        .filter((c) => c.enabled)
        .map((cat) => {
          const noms = nominations
            .filter(
              (n) =>
                n.categoryId === cat.id &&
                n.consentStatus === "accepted" &&
                n.moderationStatus === "approved" &&
                n.voteCount !== undefined,
            )
            .sort((a, b) => (b.voteCount ?? 0) - (a.voteCount ?? 0));

          const winner = noms[0];
          const isTie =
            noms.length > 1 && noms[1]?.voteCount === winner?.voteCount;

          return (
            <Card key={cat.id}>
              <CardHeader>
                <h3 className="font-semibold text-zinc-900">{cat.name}</h3>
              </CardHeader>
              <CardBody>
                {!winner ? (
                  <p className="text-sm text-zinc-400">No results yet.</p>
                ) : (
                  <div className="space-y-2">
                    {noms.map((nom, i) => {
                      const isWinner = i === 0 || (isTie && nom.voteCount === winner.voteCount);
                      return (
                        <div
                          key={nom.id}
                          className={`rounded-lg overflow-hidden ${
                            isWinner
                              ? "bg-amber-50 border border-amber-200"
                              : "bg-zinc-50"
                          }`}
                        >
                          {nom.photoUrl && isWinner && (
                            <img
                              src={nom.photoUrl}
                              alt={`Winning photo for ${nom.nomineeUsername}`}
                              className="w-full h-40 object-cover"
                            />
                          )}
                          <div className="flex items-center gap-3 p-3">
                            {isWinner && (
                              <Trophy className="h-5 w-5 text-amber-500 shrink-0" />
                            )}
                            <Avatar username={nom.nomineeUsername} size="sm" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-zinc-900">
                                  {nom.nomineeUsername}
                                </p>
                                {nom.nomineeIsNonMember && (
                                  <Badge variant="default">Neighbor</Badge>
                                )}
                              </div>
                              {isWinner && isTie && (
                                <Badge variant="warning" className="mt-0.5">Tied winner</Badge>
                              )}
                            </div>
                            <span className="text-sm font-medium text-zinc-600">
                              {nom.voteCount} vote{nom.voteCount !== 1 ? "s" : ""}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardBody>
            </Card>
          );
        })}
    </div>
  );
}

function NominationCard({ nomination }: { nomination: Nomination }) {
  return (
    <div className="rounded-lg border border-zinc-200 overflow-hidden">
      {nomination.photoUrl && (
        <img
          src={nomination.photoUrl}
          alt={`Nomination photo for ${nomination.nomineeUsername}`}
          className="w-full h-40 object-cover"
        />
      )}
      <div className="flex items-start gap-3 p-3">
        <Avatar username={nomination.nomineeUsername} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-zinc-900">
              {nomination.nomineeUsername}
            </span>
            {nomination.nomineeIsNonMember && (
              <Badge variant="default">Neighbor</Badge>
            )}
            {nomination.consentStatus === "pending" && !nomination.nomineeIsNonMember && (
              <Badge variant="warning">Consent pending</Badge>
            )}
            {nomination.consentStatus === "accepted" && !nomination.nomineeIsNonMember && (
              <Badge variant="success">Accepted</Badge>
            )}
          </div>
          {nomination.explanation && (
            <p className="text-sm text-zinc-500 mt-0.5">
              &ldquo;{nomination.explanation}&rdquo;
            </p>
          )}
          <p className="text-xs text-zinc-400 mt-1">
            Nominated by {nomination.nominatorUsername}
          </p>
        </div>
      </div>
    </div>
  );
}
