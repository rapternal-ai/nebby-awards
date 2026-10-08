"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Shield, Users, Award, Eye, MessageCircle, Lock, Trophy } from "lucide-react";
import { useDemoAuth } from "@/lib/demo-auth";

export default function LandingPage() {
  const { user } = useDemoAuth();

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyem0wLTR2Mkg0VjMwaDMyem0tMjAtNHYySDR2LTJoMTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        <div className="relative mx-auto max-w-5xl px-4 py-16 sm:py-24">
          <div className="flex flex-col items-center gap-10 lg:flex-row lg:items-center lg:gap-12">
            {/* Left: text */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium backdrop-blur mb-6">
                <Shield className="h-4 w-4" />
                Private. Pseudonymous. Local.
              </div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                The Nebby Awards
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-emerald-100 sm:text-xl lg:mx-0">
                A private neighborhood platform where you connect with your
                community, share updates, and celebrate your neighbors — all under
                a friendly pseudonym.
              </p>
              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
                {user ? (
                  <Link href="/nebby/spf/feed">
                    <Button size="lg" className="bg-white text-emerald-700 hover:bg-emerald-50">
                      Go to your Nebby
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/auth/signup">
                      <Button size="lg" className="bg-white text-emerald-700 hover:bg-emerald-50">
                        Join your neighborhood
                      </Button>
                    </Link>
                    <Link href="/auth/signin">
                      <Button variant="ghost" size="lg" className="text-white hover:bg-white/10">
                        Sign in
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Right: hero image with award badge */}
            <div className="relative flex-shrink-0 w-full max-w-md lg:max-w-lg">
              <div className="relative overflow-hidden rounded-2xl shadow-2xl border-4 border-white/20">
                <Image
                  src="/hero-lawn.jpg"
                  alt="Neighbors tending to a pristine lawn on a sunny day"
                  width={600}
                  height={400}
                  className="w-full h-auto object-cover"
                  priority
                />
                {/* Dark gradient overlay at bottom for readability */}
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />
              </div>

              {/* Award badge overlay */}
              <div className="absolute -bottom-4 -right-4 sm:-bottom-5 sm:-right-5 flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-3 shadow-lg transform rotate-3 border-2 border-amber-300">
                <Trophy className="h-6 w-6 text-amber-900" />
                <div>
                  <p className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                    2025 Winner
                  </p>
                  <p className="text-sm font-bold text-amber-950">
                    Best Lawn Care
                  </p>
                </div>
              </div>

              {/* Small pseudonym tag */}
              <div className="absolute top-3 left-3 rounded-full bg-white/90 backdrop-blur px-3 py-1 text-xs font-semibold text-emerald-700 shadow">
                spf-NebbyMember-04
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What is a Nebby? */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-zinc-900 sm:text-3xl">
            What is a Nebby?
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-zinc-600">
            A Nebby is your neighborhood community. Join through
            community vouching, post under a system-assigned pseudonym, and
            participate in annual awards that celebrate the best of your block.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={<Lock className="h-6 w-6" />}
            title="Private by default"
            description="Your real name and email are never shown. You interact as a friendly pseudonym like spf-NebbyMember-03."
          />
          <FeatureCard
            icon={<Users className="h-6 w-6" />}
            title="Community vouching"
            description="Two verified neighbors vouch for you to join. This keeps your Nebby safe and real."
          />
          <FeatureCard
            icon={<MessageCircle className="h-6 w-6" />}
            title="Local feed"
            description="Share updates, ask for help, give shout-outs. Only your neighbors can see and respond."
          />
          <FeatureCard
            icon={<Award className="h-6 w-6" />}
            title="Annual awards"
            description="Nominate and vote for neighbors who make the community great. Fun categories, real recognition."
          />
          <FeatureCard
            icon={<Eye className="h-6 w-6" />}
            title="Transparent moderation"
            description="Community guidelines with audited moderation. Reports are handled fairly and logged."
          />
          <FeatureCard
            icon={<Shield className="h-6 w-6" />}
            title="Your data, your control"
            description="Leave anytime. Delete your account. We never collect addresses or sensitive personal info."
          />
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white border-y border-zinc-200">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:py-20">
          <h2 className="text-center text-2xl font-bold text-zinc-900 sm:text-3xl mb-12">
            How it works
          </h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <Step num={1} title="Sign up" desc="Create an account with just an email. No address or ID required." />
            <Step num={2} title="Get vouched" desc="Two verified neighbors confirm you belong. No strangers in your community." />
            <Step num={3} title="Join the conversation" desc="Post, comment, and react in your private neighborhood feed." />
            <Step num={4} title="Celebrate" desc="Nominate and vote for your favorite neighbors in the annual awards." />
          </div>
        </div>
      </section>

      {/* Privacy callout */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:py-20">
        <Card className="border-emerald-200 bg-emerald-50/50">
          <CardBody className="text-center py-10">
            <Lock className="mx-auto h-8 w-8 text-emerald-600 mb-3" />
            <h3 className="text-xl font-bold text-zinc-900">
              Privacy is not optional
            </h3>
            <p className="mx-auto mt-2 max-w-xl text-zinc-600">
              Other members see your pseudonym only. Your email, name, and
              address are never displayed. Every read and write is authorized
              against your verified membership. Moderation actions are logged
              for transparency.
            </p>
          </CardBody>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-8 text-center text-sm text-zinc-500">
          <p>&copy; 2025 The Nebby Awards. Built for neighbors, by neighbors.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="p-5">
      <div className="mb-3 inline-flex items-center justify-center rounded-lg bg-emerald-100 p-2 text-emerald-600">
        {icon}
      </div>
      <h3 className="font-semibold text-zinc-900">{title}</h3>
      <p className="mt-1 text-sm text-zinc-600">{description}</p>
    </Card>
  );
}

function Step({
  num,
  title,
  desc,
}: {
  num: number;
  title: string;
  desc: string;
}) {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white font-bold text-sm">
        {num}
      </div>
      <h3 className="mt-3 font-semibold text-zinc-900">{title}</h3>
      <p className="mt-1 text-sm text-zinc-500">{desc}</p>
    </div>
  );
}
