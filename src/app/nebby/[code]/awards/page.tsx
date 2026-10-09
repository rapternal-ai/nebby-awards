"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Award,
  Trophy,
  Vote,
  CheckCircle2,
  Clock,
  ChevronRight,
  Star,
  Users,
} from "lucide-react";
import {
  demoAwardSeason,
  demoNominations,
  demoMembers,
} from "@/lib/demo-data";
import { useCategories } from "@/lib/categories-context";
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
              const noms = demoNominations.filter(
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
  const [explanation, setExplanation] = useState("");
  const [selectedNominee, setSelectedNominee] = useState("");

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
          .map((cat) => (
            <Card
              key={cat.id}
              className="cursor-pointer hover:border-emerald-300 transition-colors"
              onClick={() => onSelectCategory(cat.id)}
            >
              <CardBody className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-zinc-900">{cat.name}</p>
                  <p className="text-sm text-zinc-500">{cat.description}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-zinc-400" />
              </CardBody>
            </Card>
          ))}
      </div>
    );
  }

  const noms = demoNominations.filter((n) => n.categoryId === category.id);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-zinc-900">{category.name}</h3>
        <p className="text-sm text-zinc-500">{category.description}</p>
      </div>

      {/* Existing nominations */}
      {noms.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-zinc-700">
            Current nominations
          </h4>
          {noms.map((nom) => (
            <NominationCard key={nom.id} nomination={nom} />
          ))}
        </div>
      )}

      {/* Nominate form */}
      <Card className="border-emerald-200">
        <CardHeader>
          <h4 className="font-medium text-zinc-900">Submit a nomination</h4>
        </CardHeader>
        <CardBody className="space-y-3">
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
              {demoMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.username}
                </option>
              ))}
            </select>
          </div>
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
          <div className="flex justify-end">
            <Button size="sm" disabled={!selectedNominee}>
              <Star className="h-3.5 w-3.5" /> Submit nomination
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

function VoteView() {
  const { categories } = useCategories();
  const [votes, setVotes] = useState<Record<string, string>>({});

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-sm text-blue-800">
        You can cast one vote per category. You may change your vote until
        voting closes.
      </div>

      {categories
        .filter((c) => c.enabled)
        .map((cat) => {
          const noms = demoNominations.filter(
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
                      onClick={() =>
                        setVotes((prev) => ({ ...prev, [cat.id]: nom.id }))
                      }
                      className={`w-full flex items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                        votes[cat.id] === nom.id
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-zinc-200 hover:border-zinc-300"
                      }`}
                    >
                      <Avatar username={nom.nomineeUsername} size="sm" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-zinc-900">
                          {nom.nomineeUsername}
                        </p>
                        {nom.explanation && (
                          <p className="text-xs text-zinc-500 mt-0.5">
                            &ldquo;{nom.explanation}&rdquo;
                          </p>
                        )}
                      </div>
                      {votes[cat.id] === nom.id && (
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                      )}
                    </button>
                  ))
                )}
              </CardBody>
            </Card>
          );
        })}

      <div className="flex justify-end">
        <Button disabled={Object.keys(votes).length === 0}>
          <Vote className="h-4 w-4" /> Submit votes
        </Button>
      </div>
    </div>
  );
}

function ResultsView() {
  const { categories } = useCategories();
  return (
    <div className="space-y-4">
      {categories
        .filter((c) => c.enabled)
        .map((cat) => {
          const noms = demoNominations
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
                          className={`flex items-center gap-3 rounded-lg p-3 ${
                            isWinner
                              ? "bg-amber-50 border border-amber-200"
                              : "bg-zinc-50"
                          }`}
                        >
                          {isWinner && (
                            <Trophy className="h-5 w-5 text-amber-500 shrink-0" />
                          )}
                          <Avatar username={nom.nomineeUsername} size="sm" />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-zinc-900">
                              {nom.nomineeUsername}
                            </p>
                            {isWinner && isTie && (
                              <Badge variant="warning" className="mt-0.5">Tied winner</Badge>
                            )}
                          </div>
                          <span className="text-sm font-medium text-zinc-600">
                            {nom.voteCount} vote{nom.voteCount !== 1 ? "s" : ""}
                          </span>
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
    <div className="flex items-start gap-3 rounded-lg border border-zinc-200 p-3">
      <Avatar username={nomination.nomineeUsername} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-zinc-900">
            {nomination.nomineeUsername}
          </span>
          {nomination.consentStatus === "pending" && (
            <Badge variant="warning">Consent pending</Badge>
          )}
          {nomination.consentStatus === "accepted" && (
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
  );
}
