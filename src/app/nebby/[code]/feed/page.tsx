"use client";

import { useState } from "react";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  ThumbsUp,
  PartyPopper,
  Laugh,
  MessageCircle,
  Flag,
  MoreHorizontal,
  Send,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { demoComments } from "@/lib/demo-data";
import { useNebbys } from "@/lib/nebby-context";
import { updatePostReactionsInDb } from "@/lib/db/actions";
import { timeAgo } from "@/lib/utils";
import type { Post, Comment as CommentType, Reaction } from "@/types";

const REACTION_ICONS: Record<string, React.ReactNode> = {
  heart: <Heart className="h-3.5 w-3.5" />,
  thumbsUp: <ThumbsUp className="h-3.5 w-3.5" />,
  celebrate: <PartyPopper className="h-3.5 w-3.5" />,
  laugh: <Laugh className="h-3.5 w-3.5" />,
};

export default function FeedPage() {
  const { activeNebbyCode, activeMembers, activePosts, createPost } = useNebbys();
  const [newPost, setNewPost] = useState("");
  const [showComposer, setShowComposer] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const currentUsername = activeMembers[0]?.username ?? `${activeNebbyCode}-NebbyMember-01`;
  const posts = activePosts;

  async function handleCreatePost(e: React.FormEvent) {
    e.preventDefault();
    if (!newPost.trim()) return;
    setSubmitting(true);
    try {
      await createPost(newPost.trim());
      setNewPost("");
      setShowComposer(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Community guideline banner */}
      <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-800">
        <strong>Community guideline:</strong> Be kind and respectful. Do not
        post anyone&apos;s private contact details, home address, or identifying
        information without consent.
      </div>

      {/* Post composer */}
      {!showComposer ? (
        <Card
          className="cursor-pointer hover:border-emerald-300 transition-colors"
          onClick={() => setShowComposer(true)}
        >
          <CardBody className="flex items-center gap-3">
            <Avatar username={currentUsername} size="sm" />
            <span className="text-sm text-zinc-400">
              What&apos;s happening in the neighborhood?
            </span>
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardBody>
            <form onSubmit={handleCreatePost}>
              <div className="flex gap-3">
                <Avatar username={currentUsername} size="sm" />
                <div className="flex-1">
                  <Textarea
                    placeholder="Share an update with your neighbors..."
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    autoFocus
                    rows={3}
                  />
                  <div className="mt-2 flex justify-between items-center">
                    <p className="text-xs text-zinc-400">
                      Posting as {currentUsername}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowComposer(false);
                          setNewPost("");
                        }}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" size="sm" disabled={!newPost.trim() || submitting}>
                        <Send className="h-3.5 w-3.5" /> {submitting ? "Posting..." : "Post"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      {/* Posts */}
      {posts.length === 0 ? (
        <Card>
          <CardBody className="text-center py-12">
            <p className="text-zinc-400 text-sm">No posts yet. Be the first to share something with your neighborhood!</p>
          </CardBody>
        </Card>
      ) : (
        posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))
      )}
    </div>
  );
}

function PostCard({ post }: { post: Post }) {
  const { activeNebbyCode, activeMembers } = useNebbys();
  const currentUsername = activeMembers[0]?.username ?? `${activeNebbyCode}-NebbyMember-01`;
  const [showComments, setShowComments] = useState(false);
  const [reactions, setReactions] = useState<Reaction[]>(post.reactions);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [newComment, setNewComment] = useState("");
  const comments: CommentType[] = demoComments[post.id] ?? [];

  async function toggleReaction(type: string) {
    const updated = (() => {
      const existing = reactions.find((r) => r.type === type);
      if (existing) {
        return reactions.map((r) =>
          r.type === type
            ? {
                ...r,
                count: r.reacted ? r.count - 1 : r.count + 1,
                reacted: !r.reacted,
              }
            : r,
        );
      }
      return [...reactions, { type: type as Reaction["type"], count: 1, reacted: true }];
    })();
    setReactions(updated);
    await updatePostReactionsInDb(post.id, updated);
  }

  return (
    <Card>
      <CardBody>
        {/* Author row */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar username={post.authorUsername} />
            <div>
              <p className="text-sm font-semibold text-zinc-900">
                {post.authorUsername}
              </p>
              <p className="text-xs text-zinc-400">{timeAgo(post.createdAt)}</p>
            </div>
          </div>
          <button
            className="text-zinc-400 hover:text-zinc-600 p-1"
            aria-label="More options"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <p className="mt-3 text-sm text-zinc-700 whitespace-pre-wrap leading-relaxed">
          {post.body}
        </p>

        {/* Reactions */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {reactions.map((r) => (
            <button
              key={r.type}
              onClick={() => toggleReaction(r.type)}
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                r.reacted
                  ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              {REACTION_ICONS[r.type]} {r.count}
            </button>
          ))}

          {/* Add reaction */}
          <div className="flex gap-0.5">
            {(["heart", "thumbsUp", "celebrate", "laugh"] as const)
              .filter((t) => !reactions.some((r) => r.type === t))
              .map((type) => (
                <button
                  key={type}
                  onClick={() => toggleReaction(type)}
                  className="rounded-full p-1.5 text-zinc-300 hover:bg-zinc-100 hover:text-zinc-500"
                  aria-label={`React with ${type}`}
                >
                  {REACTION_ICONS[type]}
                </button>
              ))}
          </div>
        </div>

        {/* Actions bar */}
        <div className="mt-3 flex items-center gap-4 border-t border-zinc-100 pt-3">
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-700"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            {post.commentCount} {post.commentCount === 1 ? "comment" : "comments"}
            {showComments ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </button>
          <button
            onClick={() => setShowReportDialog(!showReportDialog)}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-red-500"
          >
            <Flag className="h-3.5 w-3.5" /> Report
          </button>
        </div>

        {/* Report dialog */}
        {showReportDialog && (
          <div className="mt-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3 space-y-2">
            <p className="text-sm font-medium text-zinc-700">Report this post</p>
            <Textarea
              placeholder="Why are you reporting this?"
              rows={2}
              className="text-sm"
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowReportDialog(false)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={() => setShowReportDialog(false)}>
                Submit report
              </Button>
            </div>
          </div>
        )}

        {/* Comments */}
        {showComments && (
          <div className="mt-3 space-y-3 border-t border-zinc-100 pt-3">
            {comments.map((c) => (
              <div key={c.id} className="flex items-start gap-2">
                <Avatar username={c.authorUsername} size="sm" />
                <div className="flex-1 rounded-lg bg-zinc-50 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-zinc-700">
                      {c.authorUsername}
                    </span>
                    <span className="text-xs text-zinc-400">
                      {timeAgo(c.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-600 mt-0.5">{c.body}</p>
                </div>
              </div>
            ))}

            {/* New comment input */}
            <div className="flex items-start gap-2">
              <Avatar username={currentUsername} size="sm" />
              <div className="flex-1 flex gap-2">
                <Textarea
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={1}
                  className="text-sm"
                />
                <Button size="sm" disabled={!newComment.trim()}>
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
