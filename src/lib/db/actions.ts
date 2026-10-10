"use server";

import { eq } from "drizzle-orm";
import { db } from "./index";
import * as schema from "./schema";
import type {
  Nebby,
  Membership,
  Post,
  AwardCategory,
  Nomination,
  Comment,
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
