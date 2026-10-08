"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { MapPin, Copy, Check } from "lucide-react";
import dynamic from "next/dynamic";

const BoundaryMap = dynamic(() => import("./boundary-map"), { ssr: false });

export default function CreateNebbyPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [shortCode, setShortCode] = useState("");
  const [copied, setCopied] = useState(false);

  // Auto-generate short code from name
  function handleNameChange(value: string) {
    setName(value);
    const code = value
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 6);
    setShortCode(code || "");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Demo: just redirect to the demo nebby
    router.push("/nebby/spf/feed");
  }

  function copyInviteLink() {
    const link = `${window.location.origin}/nebby/${shortCode || "spf"}/join`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold text-zinc-900 mb-1">Create a Nebby</h1>
      <p className="text-zinc-500 mb-8">
        Set up your neighborhood community. You&apos;ll be the founding organizer.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name & Code */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-zinc-900">Neighborhood details</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-zinc-700 mb-1">
                Neighborhood name
              </label>
              <Input
                id="name"
                placeholder="e.g. Spruce Field"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-zinc-700 mb-1">
                Short code
              </label>
              <div className="flex gap-2">
                <Input
                  id="code"
                  placeholder="spf"
                  value={shortCode}
                  onChange={(e) => setShortCode(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 6))}
                  maxLength={6}
                  required
                  className="max-w-[120px]"
                />
                <span className="flex items-center text-sm text-zinc-400">
                  Members will be <strong className="text-zinc-600 ml-1">{shortCode || "xxx"}-NebbyMember-01</strong>
                </span>
              </div>
            </div>
            <div>
              <label htmlFor="desc" className="block text-sm font-medium text-zinc-700 mb-1">
                Description <span className="text-zinc-400">(optional)</span>
              </label>
              <Textarea
                id="desc"
                placeholder="What makes your neighborhood special?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </CardBody>
        </Card>

        {/* Map */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-emerald-600" />
              <h2 className="font-semibold text-zinc-900">Boundary</h2>
            </div>
            <p className="text-sm text-zinc-500 mt-1">
              Draw or adjust a polygon to define your neighborhood boundary.
            </p>
          </CardHeader>
          <CardBody>
            <div className="h-[350px] rounded-lg overflow-hidden border border-zinc-200">
              <BoundaryMap />
            </div>
          </CardBody>
        </Card>

        {/* Invite link */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-zinc-900">Invite neighbors</h2>
          </CardHeader>
          <CardBody>
            <p className="text-sm text-zinc-500 mb-3">
              After creating your Nebby, share this link so neighbors can request to join.
            </p>
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={`${typeof window !== "undefined" ? window.location.origin : ""}/nebby/${shortCode || "spf"}/join`}
                className="font-mono text-xs"
              />
              <Button type="button" variant="secondary" size="sm" onClick={copyInviteLink}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit">Create Nebby</Button>
        </div>
      </form>
    </div>
  );
}
