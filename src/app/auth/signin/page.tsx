"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Shield } from "lucide-react";
import { useDemoAuth } from "@/lib/demo-auth";
import { useNebbys } from "@/lib/nebby-context";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const { signIn } = useDemoAuth();
  const { activeNebbyCode } = useNebbys();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    signIn(email || "member@demo.com");
    router.push(`/nebby/${activeNebbyCode}/feed`);
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <Shield className="mx-auto h-8 w-8 text-emerald-600 mb-2" />
          <h1 className="text-xl font-bold text-zinc-900">Welcome back</h1>
          <p className="text-sm text-zinc-500">Sign in to your Nebby</p>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-700 mb-1">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-zinc-700 mb-1">
                Password
              </label>
              <Input id="password" type="password" placeholder="Your password" />
            </div>

            {/* Demo hint */}
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
              <strong>Demo mode:</strong> Enter any email and click sign in. Use{" "}
              <code className="bg-amber-100 px-1 rounded">member@demo.com</code> for a
              verified member or{" "}
              <code className="bg-amber-100 px-1 rounded">visitor@demo.com</code> for a
              visitor.
            </div>

            <Button type="submit" className="w-full">
              Sign in
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-zinc-500">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="font-medium text-emerald-600 hover:text-emerald-700">
              Sign up
            </Link>
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
