"use server";

import { eq, sql } from "drizzle-orm";
import { db } from "./index";
import * as schema from "./schema";
import type {
  Nebby,
  Membership,
  Post,
  AwardCategory,
  Nomination,
  Comment,
  JoinRequest,
  Report,
  AuditEntry,
} from "@/types";

export async function getNebbys(): Promise<Nebby[]> {
  const rows = await db.select().from(schema.nebbys);
  return rows.map((r) => ({
    id: r.id,
    shortCode: r.shortCode,
    name: r.name,
    description: r.description,
    boundary: r.boundary,
    creatorId: r.creatorId,
    memberCount: r.memberCount,
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function createNebbyInDb(params: {
  id: string;
  shortCode: string;
  name: string;
  description: string;
  boundary: [number, number][];
  creatorId: string;
}): Promise<Nebby> {
  const now = new Date();
  const [row] = await db
    .insert(schema.nebbys)
    .values({
      id: params.id,
      shortCode: params.shortCode,
      name: params.name,
      description: params.description,
      boundary: params.boundary,
      creatorId: params.creatorId,
      memberCount: 1,
      createdAt: now,
    })
    .returning();

  await db.insert(schema.memberships).values({
    id: `mem-${params.shortCode}-1`,
    nebbyId: row.id,
    userId: params.creatorId,
    memberNumber: 1,
    username: `${params.shortCode}-NebbyMember-01`,
    status: "approved",
    role: "moderator",
    approvedAt: now,
  });

  return {
    id: row.id,
    shortCode: row.shortCode,
    name: row.name,
    description: row.description,
    boundary: row.boundary,
    creatorId: row.creatorId,
    memberCount: row.memberCount,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function getMembersForNebby(nebbyId: string): Promise<Membership[]> {
  const rows = await db
    .select()
    .from(schema.memberships)
    .where(eq(schema.memberships.nebbyId, nebbyId));
  return rows.map((m) => ({
    id: m.id,
    nebbyId: m.nebbyId,
    userId: m.userId,
    memberNumber: m.memberNumber,
    username: m.username,
    status: m.status,
    role: m.role,
    approvedAt: m.approvedAt?.toISOString() ?? null,
    approxLocation: m.approxLocation ?? undefined,
  }));
}

export async function getPostsForNebby(nebbyId: string): Promise<Post[]> {
  const rows = await db
    .select()
    .from(schema.posts)
    .where(eq(schema.posts.nebbyId, nebbyId))
    .orderBy(schema.posts.createdAt);
  return rows.map((p) => ({
    id: p.id,
    nebbyId: p.nebbyId,
    authorUsername: p.authorUsername,
    body: p.body,
    status: p.status,
    reactions: p.reactions as unknown as Post["reactions"],
    commentCount: p.commentCount,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));
}

export async function getCategoriesForNebby(
  nebbyId: string,
): Promise<AwardCategory[]> {
  const rows = await db
    .select()
    .from(schema.awardCategories)
    .where(eq(schema.awardCategories.nebbyId, nebbyId))
    .orderBy(schema.awardCategories.displayOrder);
  return rows.map((c) => ({
    id: c.id,
    seasonId: c.seasonId,
    name: c.name,
    description: c.description,
    displayOrder: c.displayOrder,
    enabled: c.enabled,
  }));
}

export async function getNominationsForNebby(
  nebbyId: string,
): Promise<Nomination[]> {
  const rows = await db
    .select()
    .from(schema.nominations)
    .where(eq(schema.nominations.nebbyId, nebbyId))
    .orderBy(schema.nominations.createdAt);
  return rows.map((n) => ({
    id: n.id,
    categoryId: n.categoryId,
    nomineeMembershipId: n.nomineeMembershipId,
    nomineeUsername: n.nomineeUsername,
    nomineeIsNonMember: n.nomineeIsNonMember,
    nominatorUsername: n.nominatorUsername,
    explanation: n.explanation,
    photoUrl: n.photoUrl ?? undefined,
    consentStatus: n.consentStatus,
    moderationStatus: n.moderationStatus as "approved" | "removed" | "pending",
    voteCount: n.voteCount,
    createdAt: n.createdAt.toISOString(),
  }));
}

export async function getCommentsForNebby(
  nebbyId: string,
): Promise<Comment[]> {
  const rows = await db
    .select()
    .from(schema.comments)
    .where(eq(schema.comments.nebbyId, nebbyId))
    .orderBy(schema.comments.createdAt);
  return rows.map((c) => ({
    id: c.id,
    postId: c.postId,
    nebbyId: c.nebbyId,
    authorUsername: c.authorUsername,
    body: c.body,
    status: c.status,
    createdAt: c.createdAt.toISOString(),
  }));
}

// ── Mutations ──

function generateId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function createPostInDb(params: {
  nebbyId: string;
  authorUsername: string;
  body: string;
}): Promise<Post> {
  const now = new Date();
  const id = generateId("post");
  const [row] = await db
    .insert(schema.posts)
    .values({
      id,
      nebbyId: params.nebbyId,
      authorUsername: params.authorUsername,
      body: params.body,
      status: "visible",
      reactions: [],
      commentCount: 0,
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  return {
    id: row.id,
    nebbyId: row.nebbyId,
    authorUsername: row.authorUsername,
    body: row.body,
    status: row.status,
    reactions: row.reactions as unknown as Post["reactions"],
    commentCount: row.commentCount,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function createCategoryInDb(params: {
  nebbyId: string;
  seasonId: string;
  name: string;
  description: string;
  displayOrder: number;
}): Promise<AwardCategory> {
  const id = generateId("cat");
  const [row] = await db
    .insert(schema.awardCategories)
    .values({
      id,
      nebbyId: params.nebbyId,
      seasonId: params.seasonId,
      name: params.name,
      description: params.description,
      displayOrder: params.displayOrder,
      enabled: true,
    })
    .returning();
  return {
    id: row.id,
    seasonId: row.seasonId,
    name: row.name,
    description: row.description,
    displayOrder: row.displayOrder,
    enabled: row.enabled,
  };
}

export async function updateCategoryInDb(
  id: string,
  updates: Partial<{
    name: string;
    description: string;
    enabled: boolean;
    displayOrder: number;
  }>,
): Promise<AwardCategory> {
  const [row] = await db
    .update(schema.awardCategories)
    .set(updates)
    .where(eq(schema.awardCategories.id, id))
    .returning();
  return {
    id: row.id,
    seasonId: row.seasonId,
    name: row.name,
    description: row.description,
    displayOrder: row.displayOrder,
    enabled: row.enabled,
  };
}

export async function deleteCategoryInDb(id: string): Promise<void> {
  await db.delete(schema.awardCategories).where(eq(schema.awardCategories.id, id));
}

export async function createNominationInDb(params: {
  nebbyId: string;
  categoryId: string;
  nomineeMembershipId: string | null;
  nomineeUsername: string;
  nomineeIsNonMember: boolean;
  nominatorUsername: string;
  explanation: string;
  photoUrl?: string;
}): Promise<Nomination> {
  const id = generateId("nom");
  const [row] = await db
    .insert(schema.nominations)
    .values({
      id,
      nebbyId: params.nebbyId,
      categoryId: params.categoryId,
      nomineeMembershipId: params.nomineeMembershipId,
      nomineeUsername: params.nomineeUsername,
      nomineeIsNonMember: params.nomineeIsNonMember,
      nominatorUsername: params.nominatorUsername,
      explanation: params.explanation,
      photoUrl: params.photoUrl ?? null,
      consentStatus: "accepted",
      moderationStatus: "approved",
      voteCount: 0,
      createdAt: new Date(),
    })
    .returning();
  return {
    id: row.id,
    categoryId: row.categoryId,
    nomineeMembershipId: row.nomineeMembershipId,
    nomineeUsername: row.nomineeUsername,
    nomineeIsNonMember: row.nomineeIsNonMember,
    nominatorUsername: row.nominatorUsername,
    explanation: row.explanation,
    photoUrl: row.photoUrl ?? undefined,
    consentStatus: row.consentStatus,
    moderationStatus: row.moderationStatus as "approved" | "removed" | "pending",
    voteCount: row.voteCount,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function createVoteInDb(params: {
  nebbyId: string;
  categoryId: string;
  nominationId: string;
  voterUserId: string;
}): Promise<void> {
  await db.insert(schema.votes).values({
    id: generateId("vote"),
    nebbyId: params.nebbyId,
    categoryId: params.categoryId,
    nominationId: params.nominationId,
    voterUserId: params.voterUserId,
    createdAt: new Date(),
  });
}

export async function incrementNominationVoteCount(
  nominationId: string,
): Promise<void> {
  await db
    .update(schema.nominations)
    .set({ voteCount: sql`${schema.nominations.voteCount} + 1` })
    .where(eq(schema.nominations.id, nominationId));
}

export async function updatePostReactionsInDb(
  postId: string,
  reactions: { type: string; count: number; reacted: boolean }[],
): Promise<void> {
  await db
    .update(schema.posts)
    .set({
      reactions: reactions as { type: string; count: number; reacted: boolean }[],
      updatedAt: new Date(),
    })
    .where(eq(schema.posts.id, postId));
}

export async function getJoinRequestsForNebby(
  nebbyId: string,
): Promise<JoinRequest[]> {
  const rows = await db
    .select()
    .from(schema.joinRequests)
    .where(eq(schema.joinRequests.nebbyId, nebbyId))
    .orderBy(schema.joinRequests.createdAt);
  return rows.map((r) => ({
    id: r.id,
    nebbyId: r.nebbyId,
    applicantId: r.applicantId,
    applicantEmail: r.applicantEmail,
    status: r.status as JoinRequest["status"],
    vouchCount: r.vouchCount,
    createdAt: r.createdAt.toISOString(),
    reviewedAt: r.reviewedAt?.toISOString() ?? null,
  }));
}

export async function createJoinRequestInDb(params: {
  nebbyId: string;
  applicantId: string;
  applicantEmail: string;
}): Promise<JoinRequest> {
  const id = generateId("jr");
  const [row] = await db
    .insert(schema.joinRequests)
    .values({
      id,
      nebbyId: params.nebbyId,
      applicantId: params.applicantId,
      applicantEmail: params.applicantEmail,
      status: "pending",
      vouchCount: 0,
      createdAt: new Date(),
    })
    .returning();
  return {
    id: row.id,
    nebbyId: row.nebbyId,
    applicantId: row.applicantId,
    applicantEmail: row.applicantEmail,
    status: row.status as JoinRequest["status"],
    vouchCount: row.vouchCount,
    createdAt: row.createdAt.toISOString(),
    reviewedAt: row.reviewedAt?.toISOString() ?? null,
  };
}

export async function updateJoinRequestInDb(
  id: string,
  updates: Partial<Pick<JoinRequest, "status" | "vouchCount">>,
): Promise<JoinRequest> {
  const [row] = await db
    .update(schema.joinRequests)
    .set({
      ...updates,
      reviewedAt: updates.status ? new Date() : undefined,
    })
    .where(eq(schema.joinRequests.id, id))
    .returning();
  return {
    id: row.id,
    nebbyId: row.nebbyId,
    applicantId: row.applicantId,
    applicantEmail: row.applicantEmail,
    status: row.status as JoinRequest["status"],
    vouchCount: row.vouchCount,
    createdAt: row.createdAt.toISOString(),
    reviewedAt: row.reviewedAt?.toISOString() ?? null,
  };
}

// ── Comments ──

export async function createCommentInDb(params: {
  postId: string;
  nebbyId: string;
  authorUsername: string;
  body: string;
}): Promise<Comment> {
  const id = generateId("c");
  const [row] = await db
    .insert(schema.comments)
    .values({
      id,
      postId: params.postId,
      nebbyId: params.nebbyId,
      authorUsername: params.authorUsername,
      body: params.body,
      status: "visible",
      createdAt: new Date(),
    })
    .returning();
  return {
    id: row.id,
    postId: row.postId,
    nebbyId: row.nebbyId,
    authorUsername: row.authorUsername,
    body: row.body,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function incrementPostCommentCount(postId: string): Promise<void> {
  await db
    .update(schema.posts)
    .set({ commentCount: sql`${schema.posts.commentCount} + 1` })
    .where(eq(schema.posts.id, postId));
}

// ── Reports ──

export async function getReportsForNebby(nebbyId: string): Promise<Report[]> {
  const rows = await db
    .select()
    .from(schema.reports)
    .where(eq(schema.reports.nebbyId, nebbyId))
    .orderBy(schema.reports.createdAt);
  return rows.map((r) => ({
    id: r.id,
    nebbyId: r.nebbyId,
    reporterUsername: r.reporterUsername,
    targetType: r.targetType as Report["targetType"],
    targetId: r.targetId,
    targetPreview: "",
    reason: r.reason,
    status: r.status as Report["status"],
    moderatorUsername: r.status === "resolved" ? "Moderator" : null,
    createdAt: r.createdAt.toISOString(),
    resolvedAt: r.status === "resolved" ? r.createdAt.toISOString() : null,
  }));
}

export async function createReportInDb(params: {
  nebbyId: string;
  reporterUsername: string;
  targetType: string;
  targetId: string;
  reason: string;
}): Promise<Report> {
  const id = generateId("rpt");
  const [row] = await db
    .insert(schema.reports)
    .values({
      id,
      nebbyId: params.nebbyId,
      reporterUsername: params.reporterUsername,
      targetType: params.targetType,
      targetId: params.targetId,
      reason: params.reason,
      status: "open",
      createdAt: new Date(),
    })
    .returning();
  return {
    id: row.id,
    nebbyId: row.nebbyId,
    reporterUsername: row.reporterUsername,
    targetType: row.targetType as Report["targetType"],
    targetId: row.targetId,
    targetPreview: "",
    reason: row.reason,
    status: row.status as Report["status"],
    moderatorUsername: null,
    createdAt: row.createdAt.toISOString(),
    resolvedAt: null,
  };
}

export async function resolveReportInDb(
  id: string,
  note: string,
): Promise<Report> {
  const [row] = await db
    .update(schema.reports)
    .set({
      status: "resolved",
      moderatorNote: note,
    })
    .where(eq(schema.reports.id, id))
    .returning();
  return {
    id: row.id,
    nebbyId: row.nebbyId,
    reporterUsername: row.reporterUsername,
    targetType: row.targetType as Report["targetType"],
    targetId: row.targetId,
    targetPreview: "",
    reason: row.reason,
    status: row.status as Report["status"],
    moderatorUsername: "Moderator",
    createdAt: row.createdAt.toISOString(),
    resolvedAt: new Date().toISOString(),
  };
}

// ── Audit entries ──

export async function getAuditEntriesForNebby(
  nebbyId: string,
): Promise<AuditEntry[]> {
  const rows = await db
    .select()
    .from(schema.auditEntries)
    .where(eq(schema.auditEntries.nebbyId, nebbyId))
    .orderBy(schema.auditEntries.createdAt);
  return rows.map((a) => ({
    id: a.id,
    nebbyId: a.nebbyId,
    actorUsername: a.actorUsername,
    action: a.action,
    targetType: a.targetType,
    targetId: a.targetId,
    reason: a.reason ?? "",
    timestamp: a.createdAt.toISOString(),
  }));
}

export async function createAuditEntryInDb(params: {
  nebbyId: string;
  actorUsername: string;
  action: string;
  targetType: string;
  targetId: string;
  reason?: string;
}): Promise<AuditEntry> {
  const id = generateId("audit");
  const [row] = await db
    .insert(schema.auditEntries)
    .values({
      id,
      nebbyId: params.nebbyId,
      actorUsername: params.actorUsername,
      action: params.action,
      targetType: params.targetType,
      targetId: params.targetId,
      reason: params.reason ?? null,
      createdAt: new Date(),
    })
    .returning();
  return {
    id: row.id,
    nebbyId: row.nebbyId,
    actorUsername: row.actorUsername,
    action: row.action,
    targetType: row.targetType,
    targetId: row.targetId,
    reason: row.reason ?? "",
    timestamp: row.createdAt.toISOString(),
  };
}
