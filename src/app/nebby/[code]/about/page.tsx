"use client";

import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { demoNebby, demoMembers, demoCategories } from "@/lib/demo-data";
import { formatDate } from "@/lib/utils";
import {
  MapPin,
  Users,
  Calendar,
  Shield,
  Eye,
  MessageCircle,
  UserX,
} from "lucide-react";
import dynamic from "next/dynamic";

const AboutMap = dynamic(() => import("./about-map"), { ssr: false });

export default function AboutPage() {
  return (
    <div className="space-y-6">
      {/* Description */}
      <Card>
        <CardBody>
          <p className="text-zinc-700">{demoNebby.description}</p>
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-zinc-500">
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4" /> {demoNebby.memberCount} members
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" /> Created{" "}
              {formatDate(demoNebby.createdAt)}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" /> {demoNebby.shortCode}
            </span>
          </div>
        </CardBody>
      </Card>

      {/* Map */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-emerald-600" />
            <h2 className="font-semibold text-zinc-900">Neighborhood boundary</h2>
          </div>
        </CardHeader>
        <CardBody>
          <div className="h-[300px] rounded-lg overflow-hidden border border-zinc-200">
            <AboutMap />
          </div>
        </CardBody>
      </Card>

      {/* Members (pseudonyms only) */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-emerald-600" />
            <h2 className="font-semibold text-zinc-900">Members</h2>
          </div>
          <p className="text-sm text-zinc-500 mt-1">
            Only pseudonymous usernames are shown.
          </p>
        </CardHeader>
        <CardBody>
          <div className="grid gap-2 sm:grid-cols-2">
            {demoMembers.map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-3 rounded-lg border border-zinc-100 p-3"
              >
                <Avatar username={m.username} size="sm" />
                <div>
                  <p className="text-sm font-medium text-zinc-900">
                    {m.username}
                  </p>
                  <div className="flex items-center gap-1.5">
                    {m.role === "moderator" && (
                      <Badge variant="info">Moderator</Badge>
                    )}
                    <span className="text-xs text-zinc-400">
                      Member #{m.memberNumber}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Award categories */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-zinc-900">Award categories</h2>
          <p className="text-sm text-zinc-500 mt-1">
            Categories for the annual Nebby Awards
          </p>
        </CardHeader>
        <CardBody>
          <div className="space-y-3">
            {demoCategories
              .filter((c) => c.enabled)
              .map((cat) => (
                <div key={cat.id} className="border-b border-zinc-100 pb-3 last:border-0 last:pb-0">
                  <p className="text-sm font-medium text-zinc-900">
                    {cat.name}
                  </p>
                  <p className="text-sm text-zinc-500">{cat.description}</p>
                </div>
              ))}
          </div>
        </CardBody>
      </Card>

      {/* Community guidelines */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-emerald-600" />
            <h2 className="font-semibold text-zinc-900">
              Community guidelines & privacy
            </h2>
          </div>
        </CardHeader>
        <CardBody className="space-y-4 text-sm text-zinc-600">
          <Guideline
            icon={<Eye className="h-4 w-4 text-emerald-600" />}
            title="What other members can see"
            text="Your pseudonymous username (e.g. spf-NebbyMember-01), your posts, comments, reactions, nominations, and votes."
          />
          <Guideline
            icon={<Shield className="h-4 w-4 text-emerald-600" />}
            title="What stays private"
            text="Your email address, real name, and home address are never shown to other members. Voucher identities are hidden from applicants."
          />
          <Guideline
            icon={<MessageCircle className="h-4 w-4 text-emerald-600" />}
            title="Posting rules"
            text="Be kind and respectful. Do not post anyone's private contact details, home address, or identifying information without consent. No negative award categories or downvotes."
          />
          <Guideline
            icon={<UserX className="h-4 w-4 text-emerald-600" />}
            title="Moderation"
            text="Reports are reviewed by moderators. Content can be hidden or removed. All moderator actions are logged in an audit trail. Serious or repeated violations may result in removal."
          />
        </CardBody>
      </Card>
    </div>
  );
}

function Guideline({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="shrink-0 mt-0.5">{icon}</div>
      <div>
        <p className="font-medium text-zinc-800">{title}</p>
        <p className="text-zinc-500">{text}</p>
      </div>
    </div>
  );
}
