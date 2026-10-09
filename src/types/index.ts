// ── Core domain types ──

export type UserRole = "visitor" | "pending" | "member" | "moderator" | "admin";

export type MembershipStatus = "pending" | "approved" | "rejected" | "removed";
export type JoinRequestStatus = "pending" | "approved" | "rejected";
export type AwardPhase = "setup" | "nomination" | "voting" | "results";
export type ReportStatus = "open" | "resolved" | "dismissed";
export type ConsentStatus = "pending" | "accepted" | "declined";

export interface Profile {
  id: string;
  email: string;
  createdAt: string;
}

export interface Nebby {
  id: string;
  shortCode: string;
  name: string;
  description: string;
  boundary: [number, number][]; // lat/lng polygon
  creatorId: string;
  memberCount: number;
  createdAt: string;
}

export interface Membership {
  id: string;
  nebbyId: string;
  userId: string;
  memberNumber: number;
  username: string; // e.g. "xyz-NebbyMember-01"
  status: MembershipStatus;
  role: UserRole;
  approvedAt: string | null;
  approxLocation?: { lat: number; lng: number }; // block-level pin, visible to Nebby members only
}

export interface JoinRequest {
  id: string;
  nebbyId: string;
  applicantId: string;
  applicantEmail: string;
  status: JoinRequestStatus;
  vouchCount: number;
  createdAt: string;
  reviewedAt: string | null;
}

export interface Vouch {
  id: string;
  nebbyId: string;
  joinRequestId: string;
  voucherId: string;
  voucherUsername: string;
  createdAt: string;
}

export interface Post {
  id: string;
  nebbyId: string;
  authorUsername: string;
  body: string;
  status: "visible" | "hidden" | "removed";
  reactions: Reaction[];
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  nebbyId: string;
  authorUsername: string;
  body: string;
  status: "visible" | "hidden" | "removed";
  createdAt: string;
}

export interface Reaction {
  type: "heart" | "thumbsUp" | "celebrate" | "laugh";
  count: number;
  reacted: boolean; // whether current user reacted
}

export interface Report {
  id: string;
  nebbyId: string;
  reporterUsername: string;
  targetType: "post" | "comment";
  targetId: string;
  targetPreview: string;
  reason: string;
  status: ReportStatus;
  moderatorUsername: string | null;
  createdAt: string;
  resolvedAt: string | null;
}

export interface AwardSeason {
  id: string;
  nebbyId: string;
  year: number;
  phase: AwardPhase;
  nominationStart: string;
  nominationEnd: string;
  votingStart: string;
  votingEnd: string;
}

export interface AwardCategory {
  id: string;
  seasonId: string;
  name: string;
  description: string;
  displayOrder: number;
  enabled: boolean;
}

export interface Nomination {
  id: string;
  categoryId: string;
  nomineeMembershipId: string;
  nomineeUsername: string;
  nominatorUsername: string;
  explanation: string;
  photoUrl?: string; // nominee-submitted photo (e.g. lawn, garden, decor)
  consentStatus: ConsentStatus;
  moderationStatus: "approved" | "removed" | "pending";
  voteCount?: number; // only shown in results phase
  createdAt: string;
}

export interface Vote {
  id: string;
  categoryId: string;
  nominationId: string;
  voterUserId: string;
}

export interface AuditEntry {
  id: string;
  nebbyId: string | null;
  actorUsername: string;
  action: string;
  targetType: string;
  targetId: string;
  reason: string;
  timestamp: string;
}
