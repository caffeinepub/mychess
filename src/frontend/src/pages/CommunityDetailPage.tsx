import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { Textarea } from "@/components/ui/textarea";
import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, Loader2, MessageSquare } from "lucide-react";
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

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [showForm, setShowForm] = useState(false);

  async function handleCreatePost() {
    if (!title.trim() || !content.trim()) return;
    try {
      await createPost.mutateAsync({
        communityId: id,
        title: title.trim(),
        content: content.trim(),
      });
      toast.success("Post created!");
      setTitle("");
      setContent("");
      setShowForm(false);
    } catch {
      toast.error("Failed to create post");
    }
  }

  async function handleJoin() {
    try {
      await joinCommunity.mutateAsync(id);
      toast.success("Joined community!");
    } catch {
      toast.error("Failed to join community");
    }
  }

  async function handleLeave() {
    try {
      await leaveCommunity.mutateAsync(id);
      toast.success("Left community");
    } catch {
      toast.error("Failed to leave community");
    }
  }

  if (communityLoading) {
    return (
      <div
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
        data-ocid="community.loading_state"
      >
        <Skeleton className="h-10 w-64 mb-3" />
        <Skeleton className="h-5 w-full max-w-md mb-8" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!community) {
    return (
      <div
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
        data-ocid="community.error_state"
      >
        <p className="text-muted-foreground font-sans">Community not found.</p>
        <Link
          to="/communities"
          className="text-foreground font-sans text-sm underline mt-4 inline-block"
        >
          ← Back to Communities
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Toaster />
      <Link
        to="/communities"
        data-ocid="community.link"
        className="inline-flex items-center gap-1 text-muted-foreground font-sans text-sm hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Communities
      </Link>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">
            {community.name}
          </h1>
          {community.description && (
            <p className="text-muted-foreground font-sans text-sm mt-2 max-w-xl">
              {community.description}
            </p>
          )}
        </div>
        {isLoggedIn && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleJoin}
              disabled={joinCommunity.isPending}
              data-ocid="community.primary_button"
              className="font-sans text-xs tracking-widest uppercase"
            >
              {joinCommunity.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : null}
              Join
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLeave}
              disabled={leaveCommunity.isPending}
              data-ocid="community.secondary_button"
              className="font-sans text-xs tracking-widest uppercase"
            >
              {leaveCommunity.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : null}
              Leave
            </Button>
          </div>
        )}
      </div>

      {/* Create post */}
      {isLoggedIn && (
        <div className="mb-8">
          {showForm ? (
            <div className="border border-border bg-card p-4 space-y-3">
              <h3 className="font-serif text-base font-bold text-foreground">
                New Post
              </h3>
              <div>
                <Label className="font-sans text-xs uppercase tracking-widest text-muted-foreground mb-1 block">
                  Title
                </Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Post title"
                  data-ocid="community.input"
                  className="bg-background font-sans"
                />
              </div>
              <div>
                <Label className="font-sans text-xs uppercase tracking-widest text-muted-foreground mb-1 block">
                  Content
                </Label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share your thoughts..."
                  data-ocid="community.textarea"
                  className="bg-background font-sans resize-none h-28"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleCreatePost}
                  disabled={
                    createPost.isPending || !title.trim() || !content.trim()
                  }
                  data-ocid="community.submit_button"
                  size="sm"
                  className="bg-foreground text-background hover:bg-muted-foreground font-sans text-xs tracking-widest uppercase"
                >
                  {createPost.isPending && (
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                  )}
                  Post
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowForm(false)}
                  data-ocid="community.cancel_button"
                  className="font-sans text-xs"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={() => setShowForm(true)}
              data-ocid="community.open_modal_button"
              className="font-sans text-xs tracking-widest uppercase border-border"
            >
              <MessageSquare className="h-4 w-4 mr-2" /> New Post
            </Button>
          )}
        </div>
      )}

      {/* Posts */}
      <div>
        <h2 className="font-serif text-xl font-bold text-foreground mb-4">
          Discussions
          {posts && (
            <span className="text-muted-foreground font-sans text-sm font-normal ml-2">
              ({posts.length})
            </span>
          )}
        </h2>

        {postsLoading && (
          <div className="space-y-3" data-ocid="community.loading_state">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        )}

        {!postsLoading && (!posts || posts.length === 0) && (
          <div
            data-ocid="community.empty_state"
            className="text-center py-12 border border-dashed border-border"
          >
            <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground font-sans text-sm">
              No discussions yet. Start the conversation!
            </p>
          </div>
        )}

        {!postsLoading && posts && posts.length > 0 && (
          <div className="space-y-3">
            {posts.map((post, i) => (
              <motion.div
                key={post.id.toString()}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                data-ocid={`community.item.${i + 1}`}
                className="border border-border bg-card p-4"
              >
                <h3 className="font-serif text-base font-bold text-foreground mb-1">
                  {post.title}
                </h3>
                <p className="text-muted-foreground font-sans text-sm leading-relaxed">
                  {post.content}
                </p>
                <p className="text-muted-foreground font-sans text-xs mt-3">
                  {new Date(
                    Number(post.createdAt) / 1_000_000,
                  ).toLocaleDateString()}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
