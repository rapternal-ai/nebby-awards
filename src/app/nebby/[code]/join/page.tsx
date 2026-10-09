"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Shield,
  Users,
  CheckCircle2,
  Clock,
  UserPlus,
  Send,
} from "lucide-react";
import { useNebbys } from "@/lib/nebby-context";

type JoinState = "not-requested" | "pending" | "approved";

export default function JoinPage() {
  const params = useParams();
  const code = params.code as string;
  const { activeNebby } = useNebbys();
  const [state, setState] = useState<JoinState>("not-requested");
  const [vouchCount, setVouchCount] = useState(0);

  function handleRequestJoin() {
    setState("pending");
    // Simulate getting vouches
    setTimeout(() => setVouchCount(1), 1500);
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center rounded-full bg-emerald-100 p-3 mb-4">
          <Shield className="h-8 w-8 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold text-zinc-900">
          Join {activeNebby?.name ?? code}
        </h1>
        <p className="mt-2 text-zinc-500">
          This is a private neighborhood community. Joining requires
          verification from two existing members.
        </p>
      </div>

      {state === "not-requested" && (
        <Card>
          <CardBody className="space-y-4 text-center">
            <div className="space-y-3 text-sm text-zinc-600">
              <div className="flex items-start gap-3 text-left">
                <div className="rounded-full bg-emerald-100 p-1.5 mt-0.5">
                  <UserPlus className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <p className="font-medium text-zinc-800">Request to join</p>
                  <p>Submit a request and we&apos;ll notify the community.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-left">
                <div className="rounded-full bg-emerald-100 p-1.5 mt-0.5">
                  <Users className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <p className="font-medium text-zinc-800">Get two vouches</p>
                  <p>Two verified members who know you will confirm your request.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-left">
                <div className="rounded-full bg-emerald-100 p-1.5 mt-0.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <p className="font-medium text-zinc-800">You&apos;re in!</p>
                  <p>
                    You&apos;ll get a unique pseudonym and full access to the community.
                  </p>
                </div>
              </div>
            </div>

            <Button onClick={handleRequestJoin} className="w-full">
              Request to join
            </Button>

            <p className="text-xs text-zinc-400">
              Don&apos;t know two members?{" "}
              <button className="text-emerald-600 hover:underline">
                Request organizer review
              </button>
            </p>
          </CardBody>
        </Card>
      )}

      {state === "pending" && (
        <div className="space-y-4">
          <Card>
            <CardBody className="text-center space-y-4">
              <div className="inline-flex items-center justify-center rounded-full bg-amber-100 p-3">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
              <h2 className="font-semibold text-zinc-900">
                Request submitted
              </h2>
              <p className="text-sm text-zinc-500">
                Your join request is being reviewed. You need two vouches from
                verified members.
              </p>

              {/* Vouch progress */}
              <div className="mx-auto max-w-xs">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-zinc-500">Vouch progress</span>
                  <span className="font-medium text-zinc-700">
                    {vouchCount}/2
                  </span>
                </div>
                <div className="h-3 rounded-full bg-zinc-200 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${(vouchCount / 2) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-zinc-400">0 vouches</span>
                  <span className="text-xs text-zinc-400">2 vouches</span>
                </div>
              </div>

              {vouchCount >= 1 && (
                <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-700">
                  <CheckCircle2 className="inline h-4 w-4 mr-1" />
                  You&apos;ve received {vouchCount} vouch{vouchCount > 1 ? "es" : ""} so
                  far!
                </div>
              )}
            </CardBody>
          </Card>

          {/* Ask a neighbor */}
          <Card>
            <CardHeader>
              <h3 className="font-medium text-zinc-900">
                Know a member? Send them a vouch request
              </h3>
            </CardHeader>
            <CardBody>
              <div className="flex gap-2">
                <Input
                  placeholder="Their pseudonym (e.g. spf-NebbyMember-02)"
                  className="text-sm"
                />
                <Button size="sm">
                  <Send className="h-3.5 w-3.5" /> Ask
                </Button>
              </div>
              <p className="mt-2 text-xs text-zinc-400">
                They will receive a request to vouch for you. Their identity
                will not be shown to other applicants.
              </p>
            </CardBody>
          </Card>

          {/* Simulate approval */}
          <div className="text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setVouchCount(2);
                setTimeout(() => setState("approved"), 800);
              }}
            >
              (Demo: simulate 2nd vouch & approval)
            </Button>
          </div>
        </div>
      )}

      {state === "approved" && (
        <Card className="border-emerald-300">
          <CardBody className="text-center space-y-4">
            <div className="inline-flex items-center justify-center rounded-full bg-emerald-100 p-3">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            </div>
            <h2 className="font-semibold text-zinc-900">
              Welcome to {activeNebby?.name ?? code}!
            </h2>
            <p className="text-sm text-zinc-500">
              You&apos;ve been approved! Your pseudonym is:
            </p>
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4">
              <p className="text-lg font-bold text-emerald-700">
                {code}-NebbyMember-13
              </p>
              <p className="text-xs text-emerald-600 mt-1">
                This is how you&apos;ll appear to your neighbors.
              </p>
            </div>
            <Button
              onClick={() => (window.location.href = `/nebby/${code}/feed`)}
              className="w-full"
            >
              Enter your Nebby
            </Button>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
