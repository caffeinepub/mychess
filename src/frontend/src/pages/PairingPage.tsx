import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Clock, Loader2, Plus, Swords, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAcceptChallenge,
  useCancelChallenge,
  useCreateChallenge,
  useListOpenChallenges,
} from "../hooks/useQueries";

type TimeMode = "bullet" | "blitz" | "rapid" | "classical";

interface TCOption {
  label: string;
  mode: TimeMode;
  initialTime: bigint;
  increment: bigint;
}

const TIME_CONTROLS: TCOption[] = [
  {
    label: "1+0",
    mode: "bullet",
    initialTime: BigInt(60),
    increment: BigInt(0),
  },
  {
    label: "2+1",
    mode: "bullet",
    initialTime: BigInt(120),
    increment: BigInt(1),
  },
  {
    label: "3+0",
    mode: "bullet",
    initialTime: BigInt(180),
    increment: BigInt(0),
  },
  {
    label: "3+2",
    mode: "blitz",
    initialTime: BigInt(180),
    increment: BigInt(2),
  },
  {
    label: "5+0",
    mode: "blitz",
    initialTime: BigInt(300),
    increment: BigInt(0),
  },
  {
    label: "5+3",
    mode: "blitz",
    initialTime: BigInt(300),
    increment: BigInt(3),
  },
  {
    label: "10+0",
    mode: "rapid",
    initialTime: BigInt(600),
    increment: BigInt(0),
  },
  {
    label: "10+5",
    mode: "rapid",
    initialTime: BigInt(600),
    increment: BigInt(5),
  },
  {
    label: "15+10",
    mode: "rapid",
    initialTime: BigInt(900),
    increment: BigInt(10),
  },
  {
    label: "30+0",
    mode: "classical",
    initialTime: BigInt(1800),
    increment: BigInt(0),
  },
  {
    label: "30+20",
    mode: "classical",
    initialTime: BigInt(1800),
    increment: BigInt(20),
  },
];

const MODE_GROUPS: { mode: TimeMode; label: string }[] = [
  { mode: "bullet", label: "Bullet" },
  { mode: "blitz", label: "Blitz" },
  { mode: "rapid", label: "Rapid" },
  { mode: "classical", label: "Classical" },
];

const COLOR_PREFS = ["random", "white", "black"] as const;
type ColorPref = (typeof COLOR_PREFS)[number];

function formatTC(tc: { initialTime: bigint; increment: bigint }): string {
  return `${Number(tc.initialTime) / 60}+${tc.increment}`;
}

function shortPrincipal(p: string): string {
  return `${p.slice(0, 6)}...${p.slice(-4)}`;
}

export default function PairingPage() {
  const { loginStatus, identity } = useInternetIdentity();
  const isLoggedIn = loginStatus === "success" && !!identity;
  const myPrincipal = identity?.getPrincipal().toString();

  const { data: challenges, isLoading } = useListOpenChallenges();
  const createChallenge = useCreateChallenge();
  const acceptChallenge = useAcceptChallenge();
  const cancelChallenge = useCancelChallenge();

  const [selectedTC, setSelectedTC] = useState<TCOption>(TIME_CONTROLS[4]); // 5+0
  const [colorPref, setColorPref] = useState<ColorPref>("random");
  const [dialogOpen, setDialogOpen] = useState(false);

  async function handleCreate() {
    try {
      await createChallenge.mutateAsync({
        initialTime: selectedTC.initialTime,
        increment: selectedTC.increment,
        colorPref,
      });
      toast.success("Challenge created!");
      setDialogOpen(false);
    } catch {
      toast.error("Failed to create challenge");
    }
  }

  async function handleAccept(id: bigint) {
    try {
      await acceptChallenge.mutateAsync(id);
      toast.success("Challenge accepted!");
    } catch {
      toast.error("Failed to accept challenge");
    }
  }

  async function handleCancel(id: bigint) {
    try {
      await cancelChallenge.mutateAsync(id);
      toast.success("Challenge cancelled");
    } catch {
      toast.error("Failed to cancel challenge");
    }
  }

  const openChallenges = challenges?.filter((c) => !c.acceptedBy) || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Toaster />
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">
            Pairing Lobby
          </h1>
          <p className="text-muted-foreground font-sans text-sm mt-1">
            Find a game across all time controls.
          </p>
        </div>
        {isLoggedIn ? (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                data-ocid="pairing.primary_button"
                className="bg-foreground text-background hover:bg-muted-foreground font-sans text-xs tracking-widest uppercase"
              >
                <Plus className="h-4 w-4 mr-2" /> Create Challenge
              </Button>
            </DialogTrigger>
            <DialogContent
              data-ocid="pairing.dialog"
              className="bg-card border-border text-foreground max-w-md"
            >
              <DialogHeader>
                <DialogTitle className="font-serif">
                  Create a Challenge
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-5 py-2">
                {MODE_GROUPS.map((group) => (
                  <div key={group.mode}>
                    <Label className="font-sans text-xs uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1">
                      {group.mode === "bullet" || group.mode === "blitz" ? (
                        <Zap className="h-3 w-3" />
                      ) : (
                        <Clock className="h-3 w-3" />
                      )}
                      {group.label}
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {TIME_CONTROLS.filter((tc) => tc.mode === group.mode).map(
                        (tc) => (
                          <button
                            key={tc.label}
                            type="button"
                            onClick={() => setSelectedTC(tc)}
                            data-ocid="pairing.toggle"
                            className={`px-3 py-1.5 font-mono text-sm border transition-colors ${
                              selectedTC.label === tc.label
                                ? "border-foreground bg-foreground text-background"
                                : "border-border text-foreground hover:border-muted-foreground"
                            }`}
                          >
                            {tc.label}
                          </button>
                        ),
                      )}
                    </div>
                  </div>
                ))}

                <div>
                  <Label className="font-sans text-xs uppercase tracking-widest text-muted-foreground mb-2 block">
                    Color Preference
                  </Label>
                  <div className="flex gap-2">
                    {COLOR_PREFS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColorPref(c)}
                        data-ocid="pairing.toggle"
                        className={`px-4 py-1.5 font-sans text-sm capitalize border transition-colors ${
                          colorPref === c
                            ? "border-foreground bg-foreground text-background"
                            : "border-border text-foreground hover:border-muted-foreground"
                        }`}
                      >
                        {c === "white"
                          ? "♔ White"
                          : c === "black"
                            ? "♚ Black"
                            : "⚄ Random"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  data-ocid="pairing.cancel_button"
                  className="font-sans text-xs"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={createChallenge.isPending}
                  data-ocid="pairing.confirm_button"
                  className="bg-foreground text-background hover:bg-muted-foreground font-sans text-xs tracking-widest uppercase"
                >
                  {createChallenge.isPending && (
                    <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                  )}
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ) : (
          <Button
            onClick={() => toast.info("Please sign in to create a challenge")}
            data-ocid="pairing.primary_button"
            className="bg-foreground text-background hover:bg-muted-foreground font-sans text-xs tracking-widest uppercase"
          >
            <Plus className="h-4 w-4 mr-2" /> Create Challenge
          </Button>
        )}
      </div>

      {/* Time control grid (display only) */}
      <div className="mb-10 grid grid-cols-1 md:grid-cols-4 gap-4">
        {MODE_GROUPS.map((group) => (
          <motion.div
            key={group.mode}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-border bg-card p-4"
          >
            <div className="flex items-center gap-1.5 mb-3">
              {group.mode === "bullet" || group.mode === "blitz" ? (
                <Zap className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Clock className="h-4 w-4 text-muted-foreground" />
              )}
              <h3 className="font-serif font-bold text-foreground">
                {group.label}
              </h3>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {TIME_CONTROLS.filter((tc) => tc.mode === group.mode).map(
                (tc) => (
                  <span
                    key={tc.label}
                    className="font-mono text-xs px-2 py-1 border border-border text-muted-foreground"
                  >
                    {tc.label}
                  </span>
                ),
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Open Challenges */}
      <div className="mb-10">
        <h2 className="font-serif text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <Swords className="h-5 w-5" /> Open Challenges
        </h2>

        {isLoading && (
          <div className="space-y-2" data-ocid="pairing.loading_state">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        )}

        {!isLoading && openChallenges.length === 0 && (
          <div
            data-ocid="pairing.empty_state"
            className="text-center py-10 border border-dashed border-border"
          >
            <Swords className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground font-sans text-sm">
              No open challenges. Create one!
            </p>
          </div>
        )}

        {!isLoading && openChallenges.length > 0 && (
          <div
            className="border border-border overflow-hidden"
            data-ocid="pairing.table"
          >
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="font-sans text-xs uppercase tracking-widest text-muted-foreground">
                    Player
                  </TableHead>
                  <TableHead className="font-sans text-xs uppercase tracking-widest text-muted-foreground">
                    Time Control
                  </TableHead>
                  <TableHead className="font-sans text-xs uppercase tracking-widest text-muted-foreground">
                    Color
                  </TableHead>
                  <TableHead className="font-sans text-xs uppercase tracking-widest text-muted-foreground text-right">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {openChallenges.map((c, i) => {
                  const isOwn = myPrincipal === c.creator.toString();
                  return (
                    <TableRow
                      key={c.id.toString()}
                      data-ocid={`pairing.row.${i + 1}`}
                      className="border-border hover:bg-secondary"
                    >
                      <TableCell className="font-mono text-sm text-foreground">
                        {shortPrincipal(c.creator.toString())}
                        {isOwn && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            You
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-sm text-foreground">
                        {formatTC(c.timeControl)}
                      </TableCell>
                      <TableCell className="font-sans text-sm text-foreground capitalize">
                        {c.colorPref}
                      </TableCell>
                      <TableCell className="text-right">
                        {isOwn ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancel(c.id)}
                            disabled={cancelChallenge.isPending}
                            data-ocid={`pairing.delete_button.${i + 1}`}
                            className="font-sans text-xs"
                          >
                            Cancel
                          </Button>
                        ) : isLoggedIn ? (
                          <Button
                            size="sm"
                            onClick={() => handleAccept(c.id)}
                            disabled={acceptChallenge.isPending}
                            data-ocid={`pairing.primary_button.${i + 1}`}
                            className="bg-foreground text-background hover:bg-muted-foreground font-sans text-xs tracking-widest uppercase"
                          >
                            {acceptChallenge.isPending ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              "Accept"
                            )}
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              toast.info("Sign in to accept challenges")
                            }
                            data-ocid={`pairing.secondary_button.${i + 1}`}
                            className="font-sans text-xs"
                          >
                            Sign in
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Live Games */}
      <div>
        <h2 className="font-serif text-xl font-bold text-foreground mb-4">
          Live Games
        </h2>
        <div
          data-ocid="pairing.empty_state"
          className="text-center py-10 border border-dashed border-border"
        >
          <p className="text-muted-foreground font-sans text-sm">
            No live games in progress.
          </p>
        </div>
      </div>
    </div>
  );
}
