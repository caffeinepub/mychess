import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "@tanstack/react-router";
import { Loader2, Plus, Users } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCreateCommunity, useListCommunities } from "../hooks/useQueries";

export default function CommunitiesPage() {
  const { data: communities, isLoading } = useListCommunities();
  const createCommunity = useCreateCommunity();
  const { loginStatus, identity } = useInternetIdentity();
  const isLoggedIn = loginStatus === "success" && !!identity;

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  async function handleCreate() {
    if (!name.trim()) return;
    try {
      await createCommunity.mutateAsync({
        name: name.trim(),
        description: description.trim(),
      });
      toast.success("Community created!");
      setOpen(false);
      setName("");
      setDescription("");
    } catch {
      toast.error("Failed to create community");
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Toaster />
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">
            Communities
          </h1>
          <p className="text-muted-foreground font-sans text-sm mt-1">
            Discuss openings, share games, and connect with other players.
          </p>
        </div>
        {isLoggedIn ? (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                data-ocid="communities.primary_button"
                className="bg-foreground text-background hover:bg-muted-foreground font-sans text-xs tracking-widest uppercase"
              >
                <Plus className="h-4 w-4 mr-2" /> New Community
              </Button>
            </DialogTrigger>
            <DialogContent
              data-ocid="communities.dialog"
              className="bg-card border-border text-foreground"
            >
              <DialogHeader>
                <DialogTitle className="font-serif">
                  Create Community
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div>
                  <Label className="font-sans text-xs uppercase tracking-widest text-muted-foreground mb-2 block">
                    Name
                  </Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Opening Theory"
                    data-ocid="communities.input"
                    className="bg-background font-sans"
                  />
                </div>
                <div>
                  <Label className="font-sans text-xs uppercase tracking-widest text-muted-foreground mb-2 block">
                    Description
                  </Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What is this community about?"
                    data-ocid="communities.textarea"
                    className="bg-background font-sans resize-none h-24"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                  data-ocid="communities.cancel_button"
                  className="font-sans text-xs"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={createCommunity.isPending || !name.trim()}
                  data-ocid="communities.confirm_button"
                  className="bg-foreground text-background hover:bg-muted-foreground font-sans text-xs tracking-widest uppercase"
                >
                  {createCommunity.isPending && (
                    <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                  )}
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ) : (
          <Button
            onClick={() => toast.info("Please sign in to create a community")}
            data-ocid="communities.primary_button"
            className="bg-foreground text-background hover:bg-muted-foreground font-sans text-xs tracking-widest uppercase"
          >
            <Plus className="h-4 w-4 mr-2" /> New Community
          </Button>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
          data-ocid="communities.loading_state"
        >
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && (!communities || communities.length === 0) && (
        <div
          data-ocid="communities.empty_state"
          className="text-center py-20 border border-dashed border-border"
        >
          <Users className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-serif text-lg font-bold text-foreground mb-2">
            No communities yet
          </h3>
          <p className="text-muted-foreground font-sans text-sm">
            Be the first to create a community.
          </p>
        </div>
      )}

      {/* List */}
      {!isLoading && communities && communities.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {communities.map((c, i) => (
            <motion.div
              key={c.id.toString()}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              data-ocid={`communities.item.${i + 1}`}
            >
              <Link
                to="/communities/$communityId"
                params={{ communityId: c.id.toString() }}
                className="block border border-border bg-card p-5 hover:border-foreground/50 transition-all group"
              >
                <h3 className="font-serif text-lg font-bold text-foreground mb-1 group-hover:text-foreground">
                  {c.name}
                </h3>
                <p className="text-muted-foreground font-sans text-sm line-clamp-2 leading-relaxed">
                  {c.description || "No description provided."}
                </p>
                <p className="text-muted-foreground font-sans text-xs mt-3 uppercase tracking-widest">
                  View Community →
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
