import type {
  Nebby,
  Membership,
  JoinRequest,
  Post,
  Comment,
  Report,
  AwardSeason,
  AwardCategory,
  Nomination,
  AuditEntry,
} from "@/types";

// ── Nebby ──

export const demoNebby: Nebby = {
  id: "nebby-sprucefield",
  shortCode: "spf",
  name: "Spruce Field",
  description:
    "A friendly neighborhood of tree-lined streets, block parties, and borrowed lawn mowers. We look out for each other.",
  boundary: [
    [40.4406, -79.9959],
    [40.4416, -79.9959],
    [40.4416, -79.9939],
    [40.4406, -79.9939],
  ],
  creatorId: "user-1",
  memberCount: 12,
  createdAt: "2025-03-15T10:00:00Z",
};

// ── Members ──

export const demoMembers: Membership[] = [
  {
    id: "mem-1",
    nebbyId: "nebby-sprucefield",
    userId: "user-1",
    memberNumber: 1,
    username: "spf-NebbyMember-01",
    status: "approved",
    role: "moderator",
    approvedAt: "2025-03-15T10:00:00Z",
  },
  {
    id: "mem-2",
    nebbyId: "nebby-sprucefield",
    userId: "user-2",
    memberNumber: 2,
    username: "spf-NebbyMember-02",
    status: "approved",
    role: "member",
    approvedAt: "2025-03-16T14:00:00Z",
  },
  {
    id: "mem-3",
    nebbyId: "nebby-sprucefield",
    userId: "user-3",
    memberNumber: 3,
    username: "spf-NebbyMember-03",
    status: "approved",
    role: "member",
    approvedAt: "2025-03-17T09:00:00Z",
  },
  {
    id: "mem-4",
    nebbyId: "nebby-sprucefield",
    userId: "user-4",
    memberNumber: 4,
    username: "spf-NebbyMember-04",
    status: "approved",
    role: "member",
    approvedAt: "2025-03-18T11:30:00Z",
  },
  {
    id: "mem-5",
    nebbyId: "nebby-sprucefield",
    userId: "user-5",
    memberNumber: 5,
    username: "spf-NebbyMember-05",
    status: "approved",
    role: "member",
    approvedAt: "2025-04-01T08:00:00Z",
  },
];

// Current demo user is member-01 (the moderator)
export const currentDemoUser = demoMembers[0];

// ── Join requests ──

export const demoJoinRequests: JoinRequest[] = [
  {
    id: "jr-1",
    nebbyId: "nebby-sprucefield",
    applicantId: "user-10",
    applicantEmail: "j***@example.com",
    status: "pending",
    vouchCount: 1,
    createdAt: "2025-09-20T12:00:00Z",
    reviewedAt: null,
  },
  {
    id: "jr-2",
    nebbyId: "nebby-sprucefield",
    applicantId: "user-11",
    applicantEmail: "m***@example.com",
    status: "pending",
    vouchCount: 0,
    createdAt: "2025-09-22T16:00:00Z",
    reviewedAt: null,
  },
  {
    id: "jr-3",
    nebbyId: "nebby-sprucefield",
    applicantId: "user-12",
    applicantEmail: "r***@example.com",
    status: "approved",
    vouchCount: 2,
    createdAt: "2025-08-01T10:00:00Z",
    reviewedAt: "2025-08-03T14:00:00Z",
  },
];

// ── Posts ──

export const demoPosts: Post[] = [
  {
    id: "post-1",
    nebbyId: "nebby-sprucefield",
    authorUsername: "spf-NebbyMember-03",
    body: "Does anyone know when the new playground equipment is being installed at the park? My kids are so excited!",
    status: "visible",
    reactions: [
      { type: "heart", count: 4, reacted: false },
      { type: "thumbsUp", count: 2, reacted: true },
    ],
    commentCount: 3,
    createdAt: "2025-09-28T14:30:00Z",
    updatedAt: "2025-09-28T14:30:00Z",
  },
  {
    id: "post-2",
    nebbyId: "nebby-sprucefield",
    authorUsername: "spf-NebbyMember-01",
    body: "Heads up, the city is doing water main work on Elm Street Tuesday through Thursday. They said there could be low pressure for a few hours each morning.",
    status: "visible",
    reactions: [
      { type: "thumbsUp", count: 8, reacted: false },
      { type: "heart", count: 1, reacted: false },
    ],
    commentCount: 5,
    createdAt: "2025-09-25T09:15:00Z",
    updatedAt: "2025-09-25T09:15:00Z",
  },
  {
    id: "post-3",
    nebbyId: "nebby-sprucefield",
    authorUsername: "spf-NebbyMember-05",
    body: "Lost cat alert! Orange tabby, answers to \"Biscuit.\" Last seen near the corner of Oak and 3rd. Very friendly. Please DM me if you spot him. Offering a reward of freshly baked cookies. 🍪",
    status: "visible",
    reactions: [
      { type: "heart", count: 6, reacted: true },
      { type: "celebrate", count: 0, reacted: false },
    ],
    commentCount: 7,
    createdAt: "2025-09-24T18:45:00Z",
    updatedAt: "2025-09-24T18:45:00Z",
  },
  {
    id: "post-4",
    nebbyId: "nebby-sprucefield",
    authorUsername: "spf-NebbyMember-02",
    body: "Just want to say thanks to whoever shoveled the sidewalk on Maple Ave after the last snow. That kind of thing is what makes this neighborhood great.",
    status: "visible",
    reactions: [
      { type: "heart", count: 11, reacted: true },
      { type: "celebrate", count: 3, reacted: false },
      { type: "thumbsUp", count: 5, reacted: false },
    ],
    commentCount: 2,
    createdAt: "2025-09-20T07:00:00Z",
    updatedAt: "2025-09-20T07:00:00Z",
  },
];

// ── Comments ──

export const demoComments: Record<string, Comment[]> = {
  "post-1": [
    {
      id: "c-1",
      postId: "post-1",
      nebbyId: "nebby-sprucefield",
      authorUsername: "spf-NebbyMember-01",
      body: "I heard it's supposed to start next Monday! They posted a notice on the park bulletin board.",
      status: "visible",
      createdAt: "2025-09-28T15:00:00Z",
    },
    {
      id: "c-2",
      postId: "post-1",
      nebbyId: "nebby-sprucefield",
      authorUsername: "spf-NebbyMember-04",
      body: "That's great news. The old swings were definitely past their prime.",
      status: "visible",
      createdAt: "2025-09-28T15:30:00Z",
    },
    {
      id: "c-3",
      postId: "post-1",
      nebbyId: "nebby-sprucefield",
      authorUsername: "spf-NebbyMember-02",
      body: "My kids can't wait either! Let's organize a little welcome party when it opens?",
      status: "visible",
      createdAt: "2025-09-28T16:00:00Z",
    },
  ],
  "post-3": [
    {
      id: "c-4",
      postId: "post-3",
      nebbyId: "nebby-sprucefield",
      authorUsername: "spf-NebbyMember-02",
      body: "I think I saw an orange cat near the community garden this morning. I'll keep an eye out!",
      status: "visible",
      createdAt: "2025-09-25T08:00:00Z",
    },
  ],
};

// ── Reports ──

export const demoReports: Report[] = [
  {
    id: "rpt-1",
    nebbyId: "nebby-sprucefield",
    reporterUsername: "spf-NebbyMember-04",
    targetType: "post",
    targetId: "post-flagged",
    targetPreview: "Someone posted what looks like a home address...",
    reason: "Contains private information (home address)",
    status: "open",
    moderatorUsername: null,
    createdAt: "2025-09-27T10:00:00Z",
    resolvedAt: null,
  },
  {
    id: "rpt-2",
    nebbyId: "nebby-sprucefield",
    reporterUsername: "spf-NebbyMember-02",
    targetType: "comment",
    targetId: "c-flagged",
    targetPreview: "This comment was rude and not constructive...",
    reason: "Inappropriate language",
    status: "resolved",
    moderatorUsername: "spf-NebbyMember-01",
    createdAt: "2025-09-15T14:00:00Z",
    resolvedAt: "2025-09-15T16:00:00Z",
  },
];

// ── Awards ──

export const demoAwardSeason: AwardSeason = {
  id: "season-2025",
  nebbyId: "nebby-sprucefield",
  year: 2025,
  phase: "nomination",
  nominationStart: "2025-10-01T00:00:00Z",
  nominationEnd: "2025-10-15T23:59:59Z",
  votingStart: "2025-10-16T00:00:00Z",
  votingEnd: "2025-10-31T23:59:59Z",
};

export const demoCategories: AwardCategory[] = [
  {
    id: "cat-1",
    seasonId: "season-2025",
    name: "Neighborhood MVP",
    description: "The neighbor who goes above and beyond for everyone.",
    displayOrder: 1,
    enabled: true,
  },
  {
    id: "cat-2",
    seasonId: "season-2025",
    name: "Best Block Decor",
    description: "The home or yard that brightens up the whole street.",
    displayOrder: 2,
    enabled: true,
  },
  {
    id: "cat-3",
    seasonId: "season-2025",
    name: "Always Has the Right Tool",
    description: "Need a ladder, drill, or obscure wrench? They've got it.",
    displayOrder: 3,
    enabled: true,
  },
  {
    id: "cat-4",
    seasonId: "season-2025",
    name: "Most Likely to Turn a Quick Chat into a 30-Minute Visit",
    description: "You stopped to say hi and somehow an hour passed.",
    displayOrder: 4,
    enabled: true,
  },
];

export const demoNominations: Nomination[] = [
  {
    id: "nom-1",
    categoryId: "cat-1",
    nomineeMembershipId: "mem-2",
    nomineeUsername: "spf-NebbyMember-02",
    nominatorUsername: "spf-NebbyMember-03",
    explanation: "Always organizing block cleanups and checking in on neighbors after storms.",
    consentStatus: "accepted",
    moderationStatus: "approved",
    voteCount: 5,
    createdAt: "2025-10-02T10:00:00Z",
  },
  {
    id: "nom-2",
    categoryId: "cat-1",
    nomineeMembershipId: "mem-5",
    nomineeUsername: "spf-NebbyMember-05",
    nominatorUsername: "spf-NebbyMember-04",
    explanation: "Brought soup to every sick neighbor this winter.",
    consentStatus: "accepted",
    moderationStatus: "approved",
    voteCount: 3,
    createdAt: "2025-10-03T14:00:00Z",
  },
  {
    id: "nom-3",
    categoryId: "cat-2",
    nomineeMembershipId: "mem-4",
    nomineeUsername: "spf-NebbyMember-04",
    nominatorUsername: "spf-NebbyMember-01",
    explanation: "Their Halloween and holiday decorations are legendary. People drive from other neighborhoods to see them.",
    consentStatus: "accepted",
    moderationStatus: "approved",
    voteCount: 8,
    createdAt: "2025-10-02T16:00:00Z",
  },
  {
    id: "nom-4",
    categoryId: "cat-3",
    nomineeMembershipId: "mem-3",
    nomineeUsername: "spf-NebbyMember-03",
    nominatorUsername: "spf-NebbyMember-02",
    explanation: "Has a garage full of every tool imaginable and always happy to lend them out.",
    consentStatus: "pending",
    moderationStatus: "approved",
    createdAt: "2025-10-04T09:00:00Z",
  },
  {
    id: "nom-5",
    categoryId: "cat-4",
    nomineeMembershipId: "mem-1",
    nomineeUsername: "spf-NebbyMember-01",
    nominatorUsername: "spf-NebbyMember-05",
    explanation: "You go to check the mail and somehow end up hearing three amazing stories.",
    consentStatus: "accepted",
    moderationStatus: "approved",
    voteCount: 6,
    createdAt: "2025-10-03T11:00:00Z",
  },
];

// ── Audit log ──

export const demoAuditLog: AuditEntry[] = [
  {
    id: "audit-1",
    nebbyId: "nebby-sprucefield",
    actorUsername: "platform-admin",
    action: "bootstrap_approve",
    targetType: "membership",
    targetId: "mem-1",
    reason: "Founding member bootstrap",
    timestamp: "2025-03-15T10:00:00Z",
  },
  {
    id: "audit-2",
    nebbyId: "nebby-sprucefield",
    actorUsername: "spf-NebbyMember-01",
    action: "resolve_report",
    targetType: "comment",
    targetId: "c-flagged",
    reason: "Removed comment with inappropriate language",
    timestamp: "2025-09-15T16:00:00Z",
  },
];
