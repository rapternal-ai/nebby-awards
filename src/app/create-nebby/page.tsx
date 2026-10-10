"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Copy, Check, AlertCircle } from "lucide-react";
import { useNebbys } from "@/lib/nebby-context";
import dynamic from "next/dynamic";

const BoundaryMap = dynamic(() => import("./boundary-map"), { ssr: false });

export default function CreateNebbyPage() {
  const router = useRouter();
  const { nebbys, createNebby } = useNebbys();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [shortCode, setShortCode] = useState("");
  const [boundary, setBoundary] = useState<[number, number][]>([]);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  // Auto-generate short code from name
  function handleNameChange(value: string) {
    setName(value);
    const code = value
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 6);
    setShortCode(code || "");
    setError("");
  }

  const codeExists = nebbys.some((n) => n.shortCode === shortCode);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Neighborhood name is required.");
      return;
    }
    if (!shortCode.trim()) {
      setError("Short code is required.");
      return;
    }
    if (codeExists) {
      setError(`The code "${shortCode}" is already taken. Pick another.`);
      return;
    }
    if (boundary.length < 3) {
      setError("Draw a boundary on the map (at least 3 points).");
      return;
    }

    setCreating(true);
    try {
      const nebby = await createNebby({
        name: name.trim(),
        shortCode: shortCode.trim(),
        description: description.trim(),
        boundary,
      });
      router.push(`/nebby/${nebby.shortCode}/feed`);
    } catch {
      setError("Failed to create Nebby. Please try again.");
      setCreating(false);
    }
  }

  function copyInviteLink() {
    const link = `${window.location.origin}/nebby/${shortCode || "xxx"}/join`;
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

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-800 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
          {error}
        </div>
      )}

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
              <div className="flex gap-2 items-center">
                <Input
                  id="code"
                  placeholder="spf"
                  value={shortCode}
                  onChange={(e) => {
                    setShortCode(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 6));
                    setError("");
                  }}
                  maxLength={6}
                  required
                  className="max-w-[120px]"
                />
                <span className="flex items-center text-sm text-zinc-400">
                  Members will be <strong className="text-zinc-600 ml-1">{shortCode || "xxx"}-NebbyMember-01</strong>
                </span>
                {codeExists && (
                  <Badge variant="danger">Taken</Badge>
                )}
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
              Use the drawing tools to outline your neighborhood. Click the polygon or rectangle tool on the left side of the map.
            </p>
          </CardHeader>
          <CardBody>
            <div className="h-[350px] rounded-lg overflow-hidden border border-zinc-200">
              <BoundaryMap onBoundaryChange={setBoundary} />
            </div>
            {boundary.length >= 3 && (
              <p className="text-xs text-emerald-600 mt-2">
                Boundary set ({boundary.length} points)
              </p>
            )}
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
                value={`${typeof window !== "undefined" ? window.location.origin : ""}/nebby/${shortCode || "xxx"}/join`}
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
          <Button type="submit" disabled={creating}>
            {creating ? "Creating..." : "Create Nebby"}
          </Button>
        </div>
      </form>
    </div>
  );
}
