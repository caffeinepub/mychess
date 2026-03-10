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
  const { loginStatus } = useInternetIdentity();
  const isLoggedIn = loginStatus === "success";

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

  const SAMPLE_COMMUNITIES = [
    {
      id: BigInt(1),
      name: "Opening Theory",
      description:
        "Deep dives into chess openings: Sicilian, French, Ruy Lopez and more.",
      members: ["p1", "p2", "p3", "p4", "p5", "p6"],
    },
    {
      id: BigInt(2),
      name: "Endgame Study",
      description:
        "Perfect your endgame technique. King and pawn endings, rook endgames, and more.",
      members: ["p1", "p2", "p3"],
    },
    {
      id: BigInt(3),
      name: "Tactics Training",
      description:
        "Daily puzzles and tactical motifs: forks, pins, skewers, discovered attacks.",
      members: ["p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8"],
    },
    {
      id: BigInt(4),
      name: "Chess History",
      description:
        "Exploring the rich history of chess: legendary players, famous games, and evolution of theory.",
      members: ["p1", "p2"],
    },
    {
      id: BigInt(5),
      name: "Blitz & Bullet",
      description:
        "Fast-paced chess discussion and game analysis. Time is everything!",
      members: ["p1", "p2", "p3", "p4"],
    },
    {
      id: BigInt(6),
      name: "Junior Players",
      description:
        "A welcoming community for beginner and intermediate players to learn and grow.",
      members: ["p1", "p2", "p3", "p4", "p5"],
    },
  ];

  const displayCommunities =
    communities && communities.length > 0 ? communities : SAMPLE_COMMUNITIES;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Toaster />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-10"
      >
        <div>
          <p className="text-muted-foreground font-sans text-xs tracking-[0.3em] uppercase mb-1">
            Explore &amp; Connect
          </p>
          <h1 className="font-serif text-4xl font-bold text-foreground">
            Communities
          </h1>
        </div>
        {isLoggedIn ? (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                data-ocid="communities.open_modal_button"
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
                <DialogTitle className="font-serif text-xl">
                  Create Community
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <Label className="font-sans text-xs tracking-widest uppercase text-muted-foreground">
                    Name
                  </Label>
                  <Input
                    data-ocid="communities.input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Opening Theory"
                    className="bg-secondary border-border text-foreground font-sans"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="font-sans text-xs tracking-widest uppercase text-muted-foreground">
                    Description
                  </Label>
                  <Textarea
                    data-ocid="communities.textarea"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What is this community about?"
                    rows={3}
                    className="bg-secondary border-border text-foreground font-sans"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="ghost"
                  onClick={() => setOpen(false)}
                  data-ocid="communities.cancel_button"
                  className="font-sans text-muted-foreground"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={createCommunity.isPending || !name.trim()}
                  data-ocid="communities.submit_button"
                  className="bg-foreground text-background hover:bg-muted-foreground font-sans"
                >
                  {createCommunity.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />{" "}
                      Creating...
                    </>
                  ) : (
                    "Create"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ) : (
          <Button
            disabled
            data-ocid="communities.open_modal_button"
            className="font-sans text-xs tracking-widest uppercase opacity-40 cursor-not-allowed"
            title="Sign in to create communities"
          >
            <Plus className="h-4 w-4 mr-2" /> New Community
          </Button>
        )}
      </motion.div>

      {isLoading ? (
        <div
          data-ocid="communities.loading_state"
          className="flex items-center justify-center py-24"
        >
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : displayCommunities.length === 0 ? (
        <div
          data-ocid="communities.empty_state"
          className="text-center py-24 border border-border"
        >
          <p className="text-5xl mb-4">♟</p>
          <p className="text-muted-foreground font-sans">No communities yet.</p>
          {isLoggedIn && (
            <p className="text-muted-foreground font-sans text-sm mt-2">
              Be the first to create one!
            </p>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayCommunities.map((c, i) => (
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
                data-ocid="communities.link"
                className="group block border border-border bg-card p-5 hover:border-foreground/50 transition-all duration-200 h-full"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-serif text-lg font-bold text-foreground group-hover:text-foreground">
                    {c.name}
                  </h3>
                  <span className="text-muted-foreground text-2xl">♟</span>
                </div>
                <p className="text-muted-foreground font-sans text-sm leading-relaxed mb-4 line-clamp-2">
                  {c.description}
                </p>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  <span className="font-sans text-xs">
                    {c.members.length} members
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
