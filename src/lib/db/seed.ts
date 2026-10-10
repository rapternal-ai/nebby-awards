import { config } from "dotenv";
config({ path: ".env.local" });
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";
import {
  demoNebby,
  demoMembers,
  demoPosts,
  demoComments,
  demoJoinRequests,
  demoCategories,
  demoNominations,
  demoReports,
  demoAuditLog,
} from "@/lib/demo-data";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not defined");
  process.exit(1);
}

const client = postgres(connectionString);
const db = drizzle(client);

async function seed() {
  console.log("Seeding database...");

  // Nebby
  await db.insert(schema.nebbys).values({
    id: demoNebby.id,
    shortCode: demoNebby.shortCode,
    name: demoNebby.name,
    description: demoNebby.description,
    boundary: demoNebby.boundary,
    creatorId: demoNebby.creatorId,
    memberCount: demoNebby.memberCount,
    createdAt: new Date(demoNebby.createdAt),
  });

  // Members
  await db.insert(schema.memberships).values(
    demoMembers.map((m) => ({
      id: m.id,
      nebbyId: m.nebbyId,
      userId: m.userId,
      memberNumber: m.memberNumber,
      username: m.username,
      status: m.status,
      role: m.role,
      approvedAt: m.approvedAt ? new Date(m.approvedAt) : null,
      approxLocation: m.approxLocation ?? null,
    })),
  );

  // Posts
  await db.insert(schema.posts).values(
    demoPosts.map((p) => ({
      id: p.id,
      nebbyId: p.nebbyId,
      authorUsername: p.authorUsername,
      body: p.body,
      status: p.status,
      reactions: p.reactions,
      commentCount: p.commentCount,
      createdAt: new Date(p.createdAt),
      updatedAt: new Date(p.updatedAt),
    })),
  );

  // Comments
  const allComments = Object.values(demoComments).flat();
  if (allComments.length > 0) {
    await db.insert(schema.comments).values(
      allComments.map((c) => ({
        id: c.id,
        postId: c.postId,
        nebbyId: c.nebbyId,
        authorUsername: c.authorUsername,
        body: c.body,
        status: c.status,
        createdAt: new Date(c.createdAt),
      })),
    );
  }

  // Join requests
  await db.insert(schema.joinRequests).values(
    demoJoinRequests.map((jr) => ({
      id: jr.id,
      nebbyId: jr.nebbyId,
      applicantId: jr.applicantId,
      applicantEmail: jr.applicantEmail,
      status: jr.status,
      vouchCount: jr.vouchCount,
      createdAt: new Date(jr.createdAt),
      reviewedAt: jr.reviewedAt ? new Date(jr.reviewedAt) : null,
    })),
  );

  // Award categories
  await db.insert(schema.awardCategories).values(
    demoCategories.map((cat) => ({
      id: cat.id,
      nebbyId: "nebby-sprucefield",
      seasonId: cat.seasonId,
      name: cat.name,
      description: cat.description,
      displayOrder: cat.displayOrder,
      enabled: cat.enabled,
    })),
  );

  // Nominations
  await db.insert(schema.nominations).values(
    demoNominations.map((n) => ({
      id: n.id,
      nebbyId: "nebby-sprucefield",
      categoryId: n.categoryId,
      nomineeMembershipId: n.nomineeMembershipId,
      nomineeUsername: n.nomineeUsername,
      nomineeIsNonMember: n.nomineeIsNonMember ?? false,
      nominatorUsername: n.nominatorUsername,
      explanation: n.explanation,
      photoUrl: n.photoUrl ?? null,
      consentStatus: n.consentStatus,
      moderationStatus: n.moderationStatus,
      voteCount: n.voteCount ?? 0,
      createdAt: new Date(n.createdAt),
    })),
  );

  // Reports
  await db.insert(schema.reports).values(
    demoReports.map((r) => ({
      id: r.id,
      nebbyId: r.nebbyId,
      reporterUsername: r.reporterUsername,
      targetType: r.targetType,
      targetId: r.targetId,
      reason: r.reason,
      status: r.status,
      moderatorNote: r.moderatorUsername
        ? `Resolved by ${r.moderatorUsername}`
        : null,
      createdAt: new Date(r.createdAt),
    })),
  );

  // Audit log
  await db.insert(schema.auditEntries).values(
    demoAuditLog
      .filter((a): a is typeof a & { nebbyId: string } => a.nebbyId !== null)
      .map((a) => ({
        id: a.id,
        nebbyId: a.nebbyId,
        actorUsername: a.actorUsername,
        action: a.action,
        targetType: a.targetType,
        targetId: a.targetId,
        reason: a.reason,
        createdAt: new Date(a.timestamp),
      })),
  );

  console.log("Seeding complete.");
  await client.end();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
