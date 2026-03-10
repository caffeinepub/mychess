import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/sonner";
import { Textarea } from "@/components/ui/textarea";
import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, CalendarDays, Loader2, Plus, Users } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCreatePost,
  useGetCommunity,
  useJoinCommunity,
  useLeaveCommunity,
  useListPosts,
} from "../hooks/useQueries";

export default function CommunityDetailPage() {
  const { communityId } = useParams({ from: "/communities/$communityId" });
  const id = BigInt(communityId);

  const { data: community, isLoading: communityLoading } = useGetCommunity(id);
  const { data: posts, isLoading: postsLoading } = useListPosts(id);
  const createPost = useCreatePost();
  const joinCommunity = useJoinCommunity();
  const leaveCommunity = useLeaveCommunity();

  const { loginStatus, identity } = useInternetIdentity();
  const isLoggedIn = loginStatus === "success" && !!identity;
  const principal = identity?.getPrincipal().toString();

  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [showPostForm, setShowPostForm] = useState(false);

  const isMember = community?.members.some((m) => m.toString() === principal);

  async function handleCreatePost() {
    if (!postTitle.trim() || !postContent.trim()) return;
    try {
      await createPost.mutateAsync({
        communityId: id,
        title: postTitle.trim(),
        content: postContent.trim(),
      });
      toast.success("Post created!");
      setPostTitle("");
      setPostContent("");
      setShowPostForm(false);
    } catch {
      toast.error("Failed to create post");
    }
  }

  async function handleJoinLeave() {
    if (!isLoggedIn) return;
    try {
      if (isMember) {
        await leaveCommunity.mutateAsync(id);
        toast.success("Left community");
      } else {
        await joinCommunity.mutateAsync(id);
        toast.success("Joined community!");
      }
    } catch {
      toast.error("Action failed");
    }
  }

  const SAMPLE_POSTS = [
    {
      title: "Best response to 1.e4 as Black?",
      content:
        "I've been struggling against 1.e4 lately. Should I go for the Sicilian or the French? Looking for recommendations for club-level play around 1400 ELO.",
      author: { toString: () => "anon1" },
      createdAt: BigInt(Date.now() - 86400000),
      communityId: id,
    },
    {
      title: "The Power of Prophylaxis",
      content:
        "Just finished studying Petrosian's games — his prophylactic thinking is remarkable. Preventing the opponent's plans before they materialize. Anyone else studying this concept?",
      author: { toString: () => "anon2" },
      createdAt: BigInt(Date.now() - 172800000),
      communityId: id,
    },
    {
      title: "Favorite chess book recommendations?",
      content:
        "Looking for recommendations for intermediate players (1200-1600). I've read My System by Nimzowitsch, but want to go deeper into strategy and calculation.",
      author: { toString: () => "anon3" },
      createdAt: BigInt(Date.now() - 259200000),
      communityId: id,
    },
  ];

  const displayPosts = posts && posts.length > 0 ? posts : SAMPLE_POSTS;

  if (communityLoading) {
    return (
      <div
        data-ocid="community.loading_state"
        className="flex items-center justify-center min-h-[60vh]"
      >
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const displayName = community?.name ?? "Community";
  const displayDesc =
    community?.description ??
    "A chess community for players to connect and share.";
  const memberCount = community?.members.length ?? 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Toaster />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Link
          to="/communities"
          data-ocid="community.link"
          className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground font-sans text-sm mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Communities
        </Link>

        {/* Community header */}
        <div className="border border-border bg-card p-6 mb-8">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex-1">
              <p className="text-muted-foreground font-sans text-xs tracking-widest uppercase mb-1">
                Community
              </p>
              <h1 className="font-serif text-3xl font-bold text-foreground mb-2">
                {displayName}
              </h1>
              <p className="text-muted-foreground font-sans text-sm leading-relaxed">
                {displayDesc}
              </p>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span className="font-sans text-sm">
                    {memberCount} members
                  </span>
                </div>
              </div>
            </div>
            {isLoggedIn && (
              <Button
                onClick={handleJoinLeave}
                disabled={joinCommunity.isPending || leaveCommunity.isPending}
                data-ocid="community.toggle"
                variant={isMember ? "outline" : "default"}
                className={
                  isMember
                    ? "border-border text-foreground hover:bg-secondary font-sans"
                    : "bg-foreground text-background hover:bg-muted-foreground font-sans"
                }
              >
                {joinCommunity.isPending || leaveCommunity.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                {isMember ? "Leave Community" : "Join Community"}
              </Button>
            )}
          </div>
        </div>

        {/* Posts section */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-xl font-bold text-foreground">
            Discussions
          </h2>
          {isLoggedIn && (
            <Button
              size="sm"
              onClick={() => setShowPostForm(!showPostForm)}
              data-ocid="community.open_modal_button"
              className="bg-foreground text-background hover:bg-muted-foreground font-sans text-xs tracking-widest uppercase"
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" /> New Post
            </Button>
          )}
        </div>

        {/* Post form */}
        {showPostForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            data-ocid="community.panel"
            className="border border-border bg-card p-5 mb-6 space-y-4"
          >
            <h3 className="font-serif text-lg text-foreground">
              New Discussion
            </h3>
            <div className="space-y-1.5">
              <Label className="font-sans text-xs tracking-widest uppercase text-muted-foreground">
                Title
              </Label>
              <Input
                data-ocid="community.input"
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                placeholder="Discussion title..."
                className="bg-secondary border-border text-foreground font-sans"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="font-sans text-xs tracking-widest uppercase text-muted-foreground">
                Content
              </Label>
              <Textarea
                data-ocid="community.textarea"
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="Share your thoughts..."
                rows={4}
                className="bg-secondary border-border text-foreground font-sans"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleCreatePost}
                disabled={
                  createPost.isPending ||
                  !postTitle.trim() ||
                  !postContent.trim()
                }
                data-ocid="community.submit_button"
                className="bg-foreground text-background hover:bg-muted-foreground font-sans"
              >
                {createPost.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Posting...
                  </>
                ) : (
                  "Post"
                )}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowPostForm(false)}
                data-ocid="community.cancel_button"
                className="font-sans text-muted-foreground"
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        )}

        {/* Posts list */}
        {postsLoading ? (
          <div
            data-ocid="community.loading_state"
            className="flex items-center justify-center py-12"
          >
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : displayPosts.length === 0 ? (
          <div
            data-ocid="community.empty_state"
            className="text-center py-16 border border-border"
          >
            <p className="text-3xl mb-3">♟</p>
            <p className="text-muted-foreground font-sans">
              No discussions yet. Start one!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayPosts.map((post, i) => (
              <motion.div
                key={post.title + String(i)}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                data-ocid={`community.item.${i + 1}`}
                className="border border-border bg-card p-5 hover:border-foreground/30 transition-colors"
              >
                <h3 className="font-serif text-base font-semibold text-foreground mb-1.5">
                  {post.title}
                </h3>
                <p className="text-muted-foreground font-sans text-sm leading-relaxed line-clamp-2 mb-3">
                  {post.content}
                </p>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <CalendarDays className="h-3 w-3" />
                    <span className="font-sans text-xs">
                      {new Date(
                        Number(post.createdAt) / 1_000_000,
                      ).toLocaleDateString()}
                    </span>
                  </div>
                  <span className="font-mono text-xs">
                    {post.author.toString().slice(0, 8)}...
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
