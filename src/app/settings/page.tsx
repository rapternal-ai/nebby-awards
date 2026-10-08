"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import {
  User,
  Shield,
  Eye,
  LogOut as LogOutIcon,
  Trash2,
  AlertTriangle,
  ChevronRight,
  Lock,
  Mail,
  Hash,
} from "lucide-react";
import { useDemoAuth } from "@/lib/demo-auth";
import { demoNebby } from "@/lib/demo-data";

export default function SettingsPage() {
  const { user, signOut } = useDemoAuth();
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  if (!user) {
    router.push("/auth/signin");
    return null;
  }

  const membership = user.membership;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold text-zinc-900 mb-1">Settings</h1>
      <p className="text-zinc-500 mb-8">Manage your account and privacy.</p>

      <div className="space-y-6">
        {/* Profile card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-emerald-600" />
              <h2 className="font-semibold text-zinc-900">Your profile</h2>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            {membership && (
              <div className="flex items-center gap-4">
                <Avatar username={membership.username} size="lg" />
                <div>
                  <p className="font-bold text-zinc-900 text-lg">
                    {membership.username}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="success">Verified member</Badge>
                    {membership.role === "moderator" && (
                      <Badge variant="info">Moderator</Badge>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="divide-y divide-zinc-100">
              <SettingRow
                icon={<Hash className="h-4 w-4" />}
                label="Member number"
                value={membership ? `#${membership.memberNumber}` : "N/A"}
              />
              <SettingRow
                icon={<Mail className="h-4 w-4" />}
                label="Email"
                value={user.email}
                note="Only visible to you. Never shown to other members."
              />
              <SettingRow
                icon={<Shield className="h-4 w-4" />}
                label="Nebby"
                value={demoNebby.name}
                note={`Short code: ${demoNebby.shortCode}`}
              />
            </div>
          </CardBody>
        </Card>

        {/* Privacy explanation */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-emerald-600" />
              <h2 className="font-semibold text-zinc-900">
                What other members can see
              </h2>
            </div>
          </CardHeader>
          <CardBody>
            <div className="space-y-3 text-sm">
              <PrivacyItem
                visible
                text="Your pseudonymous username"
                example={membership?.username ?? "xxx-NebbyMember-01"}
              />
              <PrivacyItem visible text="Your posts, comments, and reactions" />
              <PrivacyItem visible text="Your nominations and award votes (anonymous)" />
              <PrivacyItem
                visible={false}
                text="Your email address"
                example={user.email}
              />
              <PrivacyItem visible={false} text="Your real name" />
              <PrivacyItem visible={false} text="Your home address" />
              <PrivacyItem visible={false} text="Who you vouched for" />
            </div>
          </CardBody>
        </Card>

        {/* Leave Nebby */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <LogOutIcon className="h-4 w-4 text-amber-600" />
              <h2 className="font-semibold text-zinc-900">Leave Nebby</h2>
            </div>
          </CardHeader>
          <CardBody>
            <p className="text-sm text-zinc-600 mb-4">
              Leaving <strong>{demoNebby.name}</strong> will immediately revoke
              your access. Your member number will never be reassigned. You can
              rejoin later through the normal vouching process.
            </p>
            {!showLeaveConfirm ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowLeaveConfirm(true)}
              >
                Leave {demoNebby.name}
              </Button>
            ) : (
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">
                      Are you sure?
                    </p>
                    <p className="text-sm text-amber-700">
                      You will lose access to the feed, awards, and all
                      community content immediately.
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      signOut();
                      router.push("/");
                    }}
                  >
                    Yes, leave
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowLeaveConfirm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Delete account */}
        <Card className="border-red-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trash2 className="h-4 w-4 text-red-600" />
              <h2 className="font-semibold text-red-700">Delete account</h2>
            </div>
          </CardHeader>
          <CardBody>
            <p className="text-sm text-zinc-600 mb-4">
              Permanently delete your account and all associated data. This
              removes your personal information while keeping non-identifying
              award totals and moderation records for integrity. This action
              cannot be undone.
            </p>
            {!showDeleteConfirm ? (
              <Button
                variant="danger"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
              >
                Delete my account
              </Button>
            ) : (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800">
                      This is permanent
                    </p>
                    <p className="text-sm text-red-700">
                      Your account, posts, and personal data will be deleted.
                      Non-identifying records (award totals, moderation entries)
                      are kept for community integrity.
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      signOut();
                      router.push("/");
                    }}
                  >
                    Yes, delete permanently
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function SettingRow({
  icon,
  label,
  value,
  note,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <div className="flex items-start gap-3 py-3">
      <div className="text-zinc-400 mt-0.5">{icon}</div>
      <div className="flex-1">
        <p className="text-sm text-zinc-500">{label}</p>
        <p className="text-sm font-medium text-zinc-900">{value}</p>
        {note && <p className="text-xs text-zinc-400 mt-0.5">{note}</p>}
      </div>
    </div>
  );
}

function PrivacyItem({
  visible,
  text,
  example,
}: {
  visible: boolean;
  text: string;
  example?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`rounded-full p-1 ${
          visible ? "bg-emerald-100" : "bg-red-100"
        }`}
      >
        {visible ? (
          <Eye className="h-3.5 w-3.5 text-emerald-600" />
        ) : (
          <Lock className="h-3.5 w-3.5 text-red-600" />
        )}
      </div>
      <div>
        <span className="text-zinc-700">{text}</span>
        {example && (
          <span className="ml-2 text-xs text-zinc-400">({example})</span>
        )}
      </div>
    </div>
  );
}
