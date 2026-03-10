import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/sonner";
import { Textarea } from "@/components/ui/textarea";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Minus,
  Plus,
  Save,
  SkipBack,
  SkipForward,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import ChessBoard from "../components/ChessBoard";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useDeleteNotationGame,
  useListNotationGames,
  useSaveNotationGame,
} from "../hooks/useQueries";
import { generatePositions } from "../lib/chess";
import type { GamePosition } from "../lib/chess";

const OPERA_GAME_PGN = `[Event "A Night at the Opera"]
[Site "Paris"]
[Date "1858.??.??"]
[White "Morphy, Paul"]
[Black "Consultants"]
[Result "1-0"]

1. e4 e5 2. Nf3 d6 3. d4 Bg4 4. dxe5 Bxf3 5. Qxf3 dxe5 6. Bc4 Nf6
7. Qb3 Qe7 8. Nc3 c6 9. Bg5 b5 10. Nxb5 cxb5 11. Bxb5+ Nbd7
12. O-O-O Rd8 13. Rxd7 Rxd7 14. Rd1 Qe6 15. Bxd7+ Nxd7
16. Qb8+ Nxb8 17. Rd8# 1-0`;

export default function NotationViewerPage() {
  const [pgn, setPgn] = useState(OPERA_GAME_PGN);
  const [positions, setPositions] = useState<GamePosition[]>(
    () => generatePositions(OPERA_GAME_PGN).positions,
  );
  const [moves, setMoves] = useState<string[]>(
    () => generatePositions(OPERA_GAME_PGN).moves,
  );
  const [headers, setHeaders] = useState<Record<string, string>>(
    () => generatePositions(OPERA_GAME_PGN).headers,
  );
  const [currentIdx, setCurrentIdx] = useState(0);
  const [parseError, setParseError] = useState("");
  const [saveTitle, setSaveTitle] = useState("");
  const [showSaveForm, setShowSaveForm] = useState(false);

  // Photo upload state
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoScale, setPhotoScale] = useState(1.0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  const { data: savedGames, isLoading: savedLoading } = useListNotationGames();
  const saveGame = useSaveNotationGame();
  const deleteGame = useDeleteNotationGame();
  const { loginStatus } = useInternetIdentity();
  const isLoggedIn = loginStatus === "success";

  const moveListRef = useRef<HTMLDivElement>(null);

  const loadPGN = useCallback((text: string) => {
    setPgn(text);
    try {
      const result = generatePositions(text);
      setPositions(result.positions);
      setMoves(result.moves);
      setHeaders(result.headers);
      setCurrentIdx(0);
      setParseError("");
    } catch {
      setParseError("Failed to parse PGN. Please check the notation.");
    }
  }, []);

  function goTo(idx: number) {
    const clamped = Math.max(0, Math.min(positions.length - 1, idx));
    setCurrentIdx(clamped);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      goTo(currentIdx - 1);
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      goTo(currentIdx + 1);
    }
  }

  async function handleSave() {
    if (!saveTitle.trim()) return;
    try {
      await saveGame.mutateAsync({ title: saveTitle.trim(), pgn });
      toast.success("Game saved!");
      setShowSaveForm(false);
      setSaveTitle("");
    } catch {
      toast.error("Failed to save game");
    }
  }

  async function handleDelete(id: bigint) {
    try {
      await deleteGame.mutateAsync(id);
      toast.success("Game deleted");
    } catch {
      toast.error("Failed to delete");
    }
  }

  function handleFileChange(file: File | null | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (JPG, PNG, or WEBP)");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setPhotoUrl(e.target?.result as string);
      setPhotoScale(1.0);
    };
    reader.readAsDataURL(file);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileChange(file);
  }

  function clearPhoto() {
    setPhotoUrl(null);
    setPhotoScale(1.0);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (replaceInputRef.current) replaceInputRef.current.value = "";
  }

  function zoomIn() {
    setPhotoScale((prev) =>
      Math.min(3.0, Math.round((prev + 0.25) * 100) / 100),
    );
  }

  function zoomOut() {
    setPhotoScale((prev) =>
      Math.max(0.5, Math.round((prev - 0.25) * 100) / 100),
    );
  }

  const current = positions[currentIdx];
  const totalMoves = positions.length - 1;

  // Group moves into pairs for display
  const movePairs: {
    num: number;
    white: string;
    whiteIdx: number;
    black?: string;
    blackIdx?: number;
  }[] = [];
  for (let i = 0; i < moves.length; i += 2) {
    movePairs.push({
      num: Math.floor(i / 2) + 1,
      white: moves[i],
      whiteIdx: i + 1,
      black: moves[i + 1],
      blackIdx: moves[i + 1] ? i + 2 : undefined,
    });
  }

  return (
    <div
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
      onKeyDown={handleKeyDown}
      style={{ outline: "none" }}
    >
      <Toaster />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="mb-8">
          <p className="text-muted-foreground font-sans text-xs tracking-[0.3em] uppercase mb-1">
            Interactive
          </p>
          <h1 className="font-serif text-4xl font-bold text-foreground">
            Notation Viewer
          </h1>
          <p className="text-muted-foreground font-sans text-sm mt-1">
            Paste a PGN game below and navigate move by move.
          </p>
        </div>

        {/* Photo Upload Dropzone — shown when no photo loaded */}
        {!photoUrl && (
          <div className="mb-8">
            <label
              data-ocid="notation.dropzone"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-none transition-colors duration-200 flex flex-col items-center justify-center py-10 px-6 cursor-pointer select-none ${
                isDragging
                  ? "border-foreground bg-secondary"
                  : "border-border bg-card hover:border-foreground hover:bg-secondary/50"
              }`}
            >
              <Upload
                className={`h-8 w-8 mb-3 transition-colors ${
                  isDragging ? "text-foreground" : "text-muted-foreground"
                }`}
              />
              <p className="font-sans text-sm font-semibold text-foreground mb-1">
                Upload scoresheet photo
              </p>
              <p className="font-sans text-xs text-muted-foreground">
                JPG, PNG or WEBP
              </p>
              <p className="font-sans text-xs text-muted-foreground mt-1">
                Drag & drop or{" "}
                <span className="underline text-foreground">
                  click to browse
                </span>
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                data-ocid="notation.upload_button"
                onChange={(e) => handleFileChange(e.target.files?.[0])}
              />
            </label>
          </div>
        )}

        <div className="grid xl:grid-cols-[1fr_340px] gap-8">
          {/* Left: Board + controls */}
          <div className="space-y-6">
            {/* Scoresheet Photo Panel */}
            <AnimatePresence>
              {photoUrl && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border border-border bg-card overflow-hidden"
                >
                  {/* Panel header */}
                  <div className="px-4 py-2 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-sans text-xs tracking-widest uppercase text-muted-foreground">
                        Scoresheet
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={zoomOut}
                          disabled={photoScale <= 0.5}
                          className="flex items-center justify-center w-6 h-6 border border-border bg-background text-foreground hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          title="Zoom out"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="font-mono text-xs text-muted-foreground w-10 text-center">
                          {Math.round(photoScale * 100)}%
                        </span>
                        <button
                          type="button"
                          onClick={zoomIn}
                          disabled={photoScale >= 3.0}
                          className="flex items-center justify-center w-6 h-6 border border-border bg-background text-foreground hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          title="Zoom in"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={clearPhoto}
                      data-ocid="notation.close_button"
                      className="flex items-center justify-center w-6 h-6 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                      title="Clear photo"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Scrollable image area */}
                  <div className="max-h-72 overflow-auto bg-card/50 p-2">
                    <img
                      src={photoUrl}
                      alt="Chess scoresheet"
                      style={{
                        transform: `scale(${photoScale})`,
                        transformOrigin: "top left",
                        display: "block",
                        width:
                          photoScale > 1
                            ? `${(1 / photoScale) * 100}%`
                            : "100%",
                        maxWidth: "none",
                      }}
                      className="transition-transform duration-150"
                    />
                  </div>

                  {/* Re-upload option */}
                  <label className="px-4 py-2 border-t border-border flex items-center gap-2 cursor-pointer hover:bg-secondary transition-colors">
                    <Upload className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-sans text-xs text-muted-foreground">
                      Replace photo
                    </span>
                    <input
                      ref={replaceInputRef}
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => handleFileChange(e.target.files?.[0])}
                    />
                  </label>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Game info */}
            {(headers.White || headers.Black || headers.Event) && (
              <div className="border border-border bg-card px-5 py-3 flex flex-wrap gap-4 items-center">
                {headers.White && headers.Black && (
                  <div className="font-sans text-sm">
                    <span className="text-foreground font-semibold">
                      {headers.White}
                    </span>
                    <span className="text-muted-foreground mx-2">vs</span>
                    <span className="text-foreground font-semibold">
                      {headers.Black}
                    </span>
                  </div>
                )}
                {headers.Event && (
                  <div className="text-muted-foreground font-sans text-xs">
                    {headers.Event}
                  </div>
                )}
                {headers.Result && (
                  <div className="ml-auto font-mono text-sm text-foreground">
                    {headers.Result}
                  </div>
                )}
              </div>
            )}

            {/* Chess board */}
            <div className="flex justify-center">
              <div style={{ width: "100%", maxWidth: 480 }}>
                <ChessBoard
                  board={current.state.board}
                  lastFrom={current.lastFrom}
                  lastTo={current.lastTo}
                />
              </div>
            </div>

            {/* Move indicator */}
            <div className="text-center">
              <span className="font-sans text-sm text-muted-foreground">
                {currentIdx === 0 ? (
                  "Starting position"
                ) : (
                  <>
                    Move {Math.ceil(currentIdx / 2)} —{" "}
                    <span className="text-foreground font-mono font-bold">
                      {positions[currentIdx].san}
                    </span>
                  </>
                )}
                <span className="text-muted-foreground ml-3">
                  ({currentIdx}/{totalMoves})
                </span>
              </span>
            </div>

            {/* Navigation controls */}
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => goTo(0)}
                disabled={currentIdx === 0}
                data-ocid="notation.button"
                className="border-border text-foreground hover:bg-secondary"
                title="First move"
              >
                <SkipBack className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => goTo(currentIdx - 1)}
                disabled={currentIdx === 0}
                data-ocid="notation.button"
                className="border-border text-foreground hover:bg-secondary w-12 h-12"
                title="Previous move"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => goTo(currentIdx + 1)}
                disabled={currentIdx === totalMoves}
                data-ocid="notation.button"
                className="border-border text-foreground hover:bg-secondary w-12 h-12"
                title="Next move"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => goTo(totalMoves)}
                disabled={currentIdx === totalMoves}
                data-ocid="notation.button"
                className="border-border text-foreground hover:bg-secondary"
                title="Last move"
              >
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>

            {/* PGN Input */}
            <div className="space-y-2">
              <Label className="font-sans text-xs tracking-widest uppercase text-muted-foreground">
                PGN Notation
              </Label>
              <Textarea
                data-ocid="notation.textarea"
                value={pgn}
                onChange={(e) => loadPGN(e.target.value)}
                placeholder="Paste your PGN here..."
                rows={8}
                className="bg-secondary border-border text-foreground font-mono text-xs leading-relaxed"
              />
              {parseError && (
                <p
                  data-ocid="notation.error_state"
                  className="text-red-400 font-sans text-xs"
                >
                  {parseError}
                </p>
              )}
            </div>

            {/* Save section */}
            {isLoggedIn && (
              <div className="space-y-3">
                {!showSaveForm ? (
                  <Button
                    variant="outline"
                    onClick={() => setShowSaveForm(true)}
                    data-ocid="notation.open_modal_button"
                    className="border-border text-foreground hover:bg-secondary font-sans text-xs tracking-widest uppercase w-full"
                  >
                    <Save className="h-4 w-4 mr-2" /> Save This Game
                  </Button>
                ) : (
                  <AnimatePresence>
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="border border-border bg-card p-4 space-y-3"
                      data-ocid="notation.panel"
                    >
                      <Label className="font-sans text-xs tracking-widest uppercase text-muted-foreground">
                        Game Title
                      </Label>
                      <Input
                        data-ocid="notation.input"
                        value={saveTitle}
                        onChange={(e) => setSaveTitle(e.target.value)}
                        placeholder="e.g. Opera Game, Paris 1858"
                        className="bg-secondary border-border text-foreground font-sans"
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={handleSave}
                          disabled={saveGame.isPending || !saveTitle.trim()}
                          data-ocid="notation.submit_button"
                          className="bg-foreground text-background hover:bg-muted-foreground font-sans"
                        >
                          {saveGame.isPending ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />{" "}
                              Saving...
                            </>
                          ) : (
                            "Save"
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => setShowSaveForm(false)}
                          data-ocid="notation.cancel_button"
                          className="font-sans text-muted-foreground"
                        >
                          Cancel
                        </Button>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>
            )}
          </div>

          {/* Right sidebar: moves + saved games */}
          <div className="space-y-6">
            {/* Move list */}
            <div className="border border-border bg-card">
              <div className="px-4 py-3 border-b border-border">
                <h3 className="font-serif text-sm font-bold text-foreground">
                  Moves
                </h3>
              </div>
              <ScrollArea className="h-64" ref={moveListRef}>
                <div className="p-2">
                  {movePairs.length === 0 ? (
                    <p className="text-muted-foreground font-sans text-xs text-center py-4">
                      No moves loaded
                    </p>
                  ) : (
                    movePairs.map((pair) => (
                      <div key={pair.num} className="move-row">
                        <span className="flex items-center text-muted-foreground font-mono text-xs">
                          {pair.num}.
                        </span>
                        <button
                          type="button"
                          onClick={() => goTo(pair.whiteIdx)}
                          data-ocid="notation.button"
                          className={`move-item text-left ${
                            currentIdx === pair.whiteIdx
                              ? "active"
                              : "text-foreground hover:bg-secondary"
                          }`}
                        >
                          {pair.white}
                        </button>
                        {pair.black && pair.blackIdx !== undefined ? (
                          <button
                            type="button"
                            onClick={() => goTo(pair.blackIdx!)}
                            data-ocid="notation.button"
                            className={`move-item text-left ${
                              currentIdx === pair.blackIdx
                                ? "active"
                                : "text-foreground hover:bg-secondary"
                            }`}
                          >
                            {pair.black}
                          </button>
                        ) : (
                          <span />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>

            <Separator className="bg-border" />

            {/* Saved games */}
            <div className="border border-border bg-card">
              <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-serif text-sm font-bold text-foreground">
                  Saved Games
                </h3>
              </div>
              {!isLoggedIn ? (
                <div className="px-4 py-6 text-center">
                  <p className="text-muted-foreground font-sans text-xs">
                    Sign in to save games
                  </p>
                </div>
              ) : savedLoading ? (
                <div
                  data-ocid="notation.loading_state"
                  className="flex justify-center py-6"
                >
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : !savedGames || savedGames.length === 0 ? (
                <div
                  data-ocid="notation.empty_state"
                  className="px-4 py-6 text-center"
                >
                  <p className="text-muted-foreground font-sans text-xs">
                    No saved games yet
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-48">
                  <div className="p-2 space-y-1">
                    {savedGames.map((game, i) => (
                      <div
                        key={game.id.toString()}
                        data-ocid={`notation.item.${i + 1}`}
                        className="flex items-center justify-between gap-2 px-2 py-2 hover:bg-secondary group"
                      >
                        <button
                          type="button"
                          onClick={() => loadPGN(game.pgn)}
                          data-ocid="notation.button"
                          className="text-left flex-1 min-w-0"
                        >
                          <p className="text-foreground font-sans text-xs truncate">
                            {game.title}
                          </p>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(game.id)}
                          data-ocid={`notation.delete_button.${i + 1}`}
                          className="text-muted-foreground hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                          title="Delete game"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>

            {/* Quick tip */}
            <div className="border border-border bg-card p-4">
              <p className="text-muted-foreground font-sans text-xs leading-relaxed">
                <span className="text-foreground font-semibold">Tip:</span> Use
                ← → arrow keys to navigate moves when focused on the viewer.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
