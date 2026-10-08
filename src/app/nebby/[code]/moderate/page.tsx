"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/ui/avatar";
import {
  UserPlus,
  Flag,
  CheckCircle2,
  XCircle,
  Shield,
  Clock,
  Eye,
  Trash2,
  ChevronDown,
  ChevronUp,
  ScrollText,
} from "lucide-react";
import {
  demoJoinRequests,
  demoReports,
  demoAuditLog,
} from "@/lib/demo-data";
import { timeAgo, formatDate } from "@/lib/utils";
import type { JoinRequest, Report, AuditEntry } from "@/types";

type ModTab = "membership" | "reports" | "audit";

export default function ModeratePage() {
  const [activeTab, setActiveTab] = useState<ModTab>("membership");

  const pendingJoins = demoJoinRequests.filter((r) => r.status === "pending");
  const openReports = demoReports.filter((r) => r.status === "open");

  return (
    <div className="space-y-6">
      {/* Moderator header */}
      <div className="flex items-center gap-2 rounded-lg bg-blue-50 border border-blue-200 p-3">
        <Shield className="h-5 w-5 text-blue-600" />
        <p className="text-sm text-blue-800">
          <strong>Moderator panel.</strong> Actions here are logged in the audit
          trail.
        </p>
      </div>

      {/* Tab buttons */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={activeTab === "membership" ? "primary" : "secondary"}
          size="sm"
          onClick={() => setActiveTab("membership")}
        >
          <UserPlus className="h-3.5 w-3.5" />
          Membership
          {pendingJoins.length > 0 && (
            <Badge variant="warning" className="ml-1">
              {pendingJoins.length}
            </Badge>
          )}
        </Button>
        <Button
          variant={activeTab === "reports" ? "primary" : "secondary"}
          size="sm"
          onClick={() => setActiveTab("reports")}
        >
          <Flag className="h-3.5 w-3.5" />
          Reports
          {openReports.length > 0 && (
            <Badge variant="danger" className="ml-1">
              {openReports.length}
            </Badge>
          )}
        </Button>
        <Button
          variant={activeTab === "audit" ? "primary" : "secondary"}
          size="sm"
          onClick={() => setActiveTab("audit")}
        >
          <ScrollText className="h-3.5 w-3.5" />
          Audit log
        </Button>
      </div>

      {activeTab === "membership" && <MembershipQueue />}
      {activeTab === "reports" && <ReportsQueue />}
      {activeTab === "audit" && <AuditLog />}
    </div>
  );
}

// ── Membership Queue ──

function MembershipQueue() {
  const [requests, setRequests] = useState<JoinRequest[]>(demoJoinRequests);

  function handleApprove(id: string) {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: "approved" as const, reviewedAt: new Date().toISOString() }
          : r,
      ),
    );
  }

  function handleReject(id: string) {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: "rejected" as const, reviewedAt: new Date().toISOString() }
          : r,
      ),
    );
  }

  const pending = requests.filter((r) => r.status === "pending");
  const resolved = requests.filter((r) => r.status !== "pending");

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-zinc-900">
        Pending join requests ({pending.length})
      </h3>

      {pending.length === 0 ? (
        <Card>
          <CardBody className="text-center py-8">
            <CheckCircle2 className="mx-auto h-8 w-8 text-zinc-300 mb-2" />
            <p className="text-sm text-zinc-500">No pending requests.</p>
          </CardBody>
        </Card>
      ) : (
        pending.map((req) => (
          <JoinRequestCard
            key={req.id}
            request={req}
            onApprove={() => handleApprove(req.id)}
            onReject={() => handleReject(req.id)}
          />
        ))
      )}

      {/* Past requests */}
      {resolved.length > 0 && (
        <>
          <h3 className="font-semibold text-zinc-900 mt-6">
            Past requests ({resolved.length})
          </h3>
          {resolved.map((req) => (
            <JoinRequestCard key={req.id} request={req} />
          ))}
        </>
      )}
    </div>
  );
}

function JoinRequestCard({
  request,
  onApprove,
  onReject,
}: {
  request: JoinRequest;
  onApprove?: () => void;
  onReject?: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const statusBadge = {
    pending: <Badge variant="warning">Pending</Badge>,
    approved: <Badge variant="success">Approved</Badge>,
    rejected: <Badge variant="danger">Rejected</Badge>,
  };

  return (
    <Card>
      <CardBody>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-zinc-900">
                {request.applicantEmail}
              </p>
              {statusBadge[request.status]}
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Requested {timeAgo(request.createdAt)}
            </p>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-zinc-400 hover:text-zinc-600"
          >
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Vouch progress */}
        <div className="mt-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-zinc-500">Vouches:</span>
            <div className="flex gap-1">
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className={`h-2.5 w-8 rounded-full ${
                    i < request.vouchCount
                      ? "bg-emerald-500"
                      : "bg-zinc-200"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-zinc-400">
              {request.vouchCount}/2
            </span>
          </div>
        </div>

        {expanded && (
          <div className="mt-3 rounded-lg bg-zinc-50 p-3 text-sm text-zinc-600 space-y-1">
            <p>
              <strong>Applicant ID:</strong> {request.applicantId}
            </p>
            <p>
              <strong>Request date:</strong>{" "}
              {formatDate(request.createdAt)}
            </p>
            {request.reviewedAt && (
              <p>
                <strong>Reviewed:</strong>{" "}
                {formatDate(request.reviewedAt)}
              </p>
            )}
          </div>
        )}

        {/* Actions for pending requests */}
        {request.status === "pending" && onApprove && onReject && (
          <div className="mt-3 flex gap-2 border-t border-zinc-100 pt-3">
            <Button size="sm" onClick={onApprove}>
              <CheckCircle2 className="h-3.5 w-3.5" /> Approve
            </Button>
            <Button variant="danger" size="sm" onClick={onReject}>
              <XCircle className="h-3.5 w-3.5" /> Reject
            </Button>
            {request.vouchCount < 2 && (
              <p className="flex items-center text-xs text-amber-600 ml-2">
                <Clock className="h-3 w-3 mr-1" />
                Needs {2 - request.vouchCount} more vouch
                {2 - request.vouchCount > 1 ? "es" : ""}
                {" "}(moderator override)
              </p>
            )}
          </div>
        )}
      </CardBody>
    </Card>
  );
}

// ── Reports Queue ──

function ReportsQueue() {
  const [reports, setReports] = useState<Report[]>(demoReports);
  const [resolutionReason, setResolutionReason] = useState<Record<string, string>>({});

  function handleResolve(id: string, action: "remove" | "dismiss") {
    setReports((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: (action === "remove" ? "resolved" : "dismissed") as Report["status"],
              resolvedAt: new Date().toISOString(),
              moderatorUsername: "spf-NebbyMember-01",
            }
          : r,
      ),
    );
  }

  const open = reports.filter((r) => r.status === "open");
  const resolved = reports.filter((r) => r.status !== "open");

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-zinc-900">
        Open reports ({open.length})
      </h3>

      {open.length === 0 ? (
        <Card>
          <CardBody className="text-center py-8">
            <CheckCircle2 className="mx-auto h-8 w-8 text-zinc-300 mb-2" />
            <p className="text-sm text-zinc-500">No open reports.</p>
          </CardBody>
        </Card>
      ) : (
        open.map((report) => (
          <Card key={report.id}>
            <CardBody className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="danger">
                      {report.targetType === "post" ? "Post" : "Comment"}
                    </Badge>
                    <span className="text-xs text-zinc-400">
                      {timeAgo(report.createdAt)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-zinc-700">
                    {report.reason}
                  </p>
                </div>
              </div>

              {/* Content preview */}
              <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-3">
                <p className="text-xs text-zinc-400 mb-1">Reported content:</p>
                <p className="text-sm text-zinc-600 italic">
                  &ldquo;{report.targetPreview}&rdquo;
                </p>
              </div>

              <p className="text-xs text-zinc-400">
                Reported by {report.reporterUsername}
              </p>

              {/* Resolution */}
              <div className="space-y-2">
                <Textarea
                  placeholder="Resolution reason (logged in audit trail)..."
                  rows={2}
                  value={resolutionReason[report.id] ?? ""}
                  onChange={(e) =>
                    setResolutionReason((prev) => ({
                      ...prev,
                      [report.id]: e.target.value,
                    }))
                  }
                  className="text-sm"
                />
                <div className="flex gap-2">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleResolve(report.id, "remove")}
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Remove content
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleResolve(report.id, "dismiss")}
                  >
                    <Eye className="h-3.5 w-3.5" /> Dismiss
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        ))
      )}

      {/* Resolved reports */}
      {resolved.length > 0 && (
        <>
          <h3 className="font-semibold text-zinc-900 mt-6">
            Resolved ({resolved.length})
          </h3>
          {resolved.map((report) => (
            <Card key={report.id} className="opacity-75">
              <CardBody>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      report.status === "resolved" ? "success" : "default"
                    }
                  >
                    {report.status === "resolved" ? "Removed" : "Dismissed"}
                  </Badge>
                  <span className="text-sm text-zinc-600">
                    {report.targetType}: &ldquo;{report.targetPreview.slice(0, 60)}...&rdquo;
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  Handled by {report.moderatorUsername} &middot;{" "}
                  {report.resolvedAt && timeAgo(report.resolvedAt)}
                </p>
              </CardBody>
            </Card>
          ))}
        </>
      )}
    </div>
  );
}

// ── Audit Log ──

function AuditLog() {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-zinc-900">Audit trail</h3>
      <p className="text-sm text-zinc-500">
        All moderator and admin actions are recorded here for transparency.
      </p>

      <div className="space-y-2">
        {demoAuditLog.map((entry) => (
          <Card key={entry.id}>
            <CardBody className="flex items-start gap-3">
              <div className="rounded-full bg-zinc-100 p-1.5 mt-0.5">
                <ScrollText className="h-4 w-4 text-zinc-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-zinc-900">
                    {entry.actorUsername}
                  </span>
                  <Badge>
                    {entry.action.replace(/_/g, " ")}
                  </Badge>
                </div>
                <p className="text-sm text-zinc-600 mt-0.5">
                  {entry.reason}
                </p>
                <p className="text-xs text-zinc-400 mt-1">
                  {entry.targetType} &middot; {formatDate(entry.timestamp)}
                </p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
