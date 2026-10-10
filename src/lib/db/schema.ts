import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", [
  "visitor",
  "pending",
  "member",
  "moderator",
  "admin",
]);

export const membershipStatusEnum = pgEnum("membership_status", [
  "pending",
  "approved",
  "rejected",
  "removed",
]);

export const postStatusEnum = pgEnum("post_status", [
  "visible",
  "hidden",
  "removed",
]);

export const awardPhaseEnum = pgEnum("award_phase", [
  "setup",
  "nomination",
  "voting",
  "results",
]);

export const consentStatusEnum = pgEnum("consent_status", [
  "pending",
  "accepted",
  "declined",
]);

export const nebbys = pgTable("nebbys", {
  id: text("id").primaryKey(),
  shortCode: text("short_code").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  boundary: jsonb("boundary").$type<[number, number][]>().notNull(),
  creatorId: text("creator_id").notNull(),
  memberCount: integer("member_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const memberships = pgTable("memberships", {
  id: text("id").primaryKey(),
  nebbyId: text("nebby_id")
    .notNull()
    .references(() => nebbys.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  memberNumber: integer("member_number").notNull(),
  username: text("username").notNull(),
  status: membershipStatusEnum("status").notNull().default("pending"),
  role: userRoleEnum("role").notNull().default("member"),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
  approxLocation: jsonb("approx_location").$type<{ lat: number; lng: number } | null>(),
});

export const posts = pgTable("posts", {
  id: text("id").primaryKey(),
  nebbyId: text("nebby_id")
    .notNull()
    .references(() => nebbys.id, { onDelete: "cascade" }),
  authorUsername: text("author_username").notNull(),
  body: text("body").notNull(),
  status: postStatusEnum("status").notNull().default("visible"),
  reactions: jsonb("reactions").$type<{ type: string; count: number; reacted: boolean }[]>().notNull().default([]),
  commentCount: integer("comment_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const comments = pgTable("comments", {
  id: text("id").primaryKey(),
  postId: text("post_id")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),
  nebbyId: text("nebby_id")
    .notNull()
    .references(() => nebbys.id, { onDelete: "cascade" }),
  authorUsername: text("author_username").notNull(),
  body: text("body").notNull(),
  status: postStatusEnum("status").notNull().default("visible"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const awardCategories = pgTable("award_categories", {
  id: text("id").primaryKey(),
  nebbyId: text("nebby_id")
    .notNull()
    .references(() => nebbys.id, { onDelete: "cascade" }),
  seasonId: text("season_id").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  displayOrder: integer("display_order").notNull().default(0),
  enabled: boolean("enabled").notNull().default(true),
});

export const nominations = pgTable("nominations", {
  id: text("id").primaryKey(),
  nebbyId: text("nebby_id")
    .notNull()
    .references(() => nebbys.id, { onDelete: "cascade" }),
  categoryId: text("category_id")
    .notNull()
    .references(() => awardCategories.id, { onDelete: "cascade" }),
  nomineeMembershipId: text("nominee_membership_id"),
  nomineeUsername: text("nominee_username").notNull(),
  nomineeIsNonMember: boolean("nominee_is_non_member").notNull().default(false),
  nominatorUsername: text("nominator_username").notNull(),
  explanation: text("explanation").notNull(),
  photoUrl: text("photo_url"),
  consentStatus: consentStatusEnum("consent_status").notNull().default("accepted"),
  moderationStatus: text("moderation_status").notNull().default("approved"),
  voteCount: integer("vote_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const votes = pgTable("votes", {
  id: text("id").primaryKey(),
  nebbyId: text("nebby_id")
    .notNull()
    .references(() => nebbys.id, { onDelete: "cascade" }),
  categoryId: text("category_id")
    .notNull()
    .references(() => awardCategories.id, { onDelete: "cascade" }),
  nominationId: text("nomination_id")
    .notNull()
    .references(() => nominations.id, { onDelete: "cascade" }),
  voterUserId: text("voter_user_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const joinRequests = pgTable("join_requests", {
  id: text("id").primaryKey(),
  nebbyId: text("nebby_id")
    .notNull()
    .references(() => nebbys.id, { onDelete: "cascade" }),
  applicantId: text("applicant_id").notNull(),
  applicantEmail: text("applicant_email").notNull(),
  status: text("status").notNull().default("pending"),
  vouchCount: integer("vouch_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
});

export const auditEntries = pgTable("audit_entries", {
  id: text("id").primaryKey(),
  nebbyId: text("nebby_id")
    .notNull()
    .references(() => nebbys.id, { onDelete: "cascade" }),
  actorUsername: text("actor_username").notNull(),
  action: text("action").notNull(),
  targetType: text("target_type").notNull(),
  targetId: text("target_id").notNull(),
  reason: text("reason"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const reports = pgTable("reports", {
  id: text("id").primaryKey(),
  nebbyId: text("nebby_id")
    .notNull()
    .references(() => nebbys.id, { onDelete: "cascade" }),
  reporterUsername: text("reporter_username").notNull(),
  targetType: text("target_type").notNull(),
  targetId: text("target_id").notNull(),
  reason: text("reason").notNull(),
  status: text("status").notNull().default("open"),
  moderatorNote: text("moderator_note"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
