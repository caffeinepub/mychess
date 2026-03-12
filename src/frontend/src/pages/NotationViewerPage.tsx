import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { Textarea } from "@/components/ui/textarea";
import {
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
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import ChessBoard from "../components/ChessBoard";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useDeleteNotation,
  useListNotations,
  useSaveNotation,
} from "../hooks/useQueries";
import { generatePositions } from "../lib/chess";
import type { GamePosition } from "../lib/chess";

const DEFAULT_PGN = `[Event "Opera Game"]
[Site "Paris"]
[Date "1858.??.??"]
[White "Paul Morphy"]
[Black "Duke of Brunswick and Count Isouard"]
[Result "1-0"]

1. e4 e5 2. Nf3 d6 3. d4 Bg4 4. dxe5 Bxf3 5. Qxf3 dxe5 6. Bc4 Nf6 7. Qb3 Qe7
8. Nc3 c6 9. Bg5 b5 10. Nxb5 cxb5 11. Bxb5+ Nbd7 12. O-O-O Rd8 13. Rxd7 Rxd7
14. Rd1 Qe6 15. Bxd7+ Nxd7 16. Qb8+ Nxb8 17. Rd8# 1-0`;

export default function NotationViewerPage() {
  // Load PGN from session storage if navigated from Notable Games
  const initialPgn = sessionStorage.getItem("notation_pgn") || DEFAULT_PGN;
  useEffect(() => {
    sessionStorage.removeItem("notation_pgn");
  }, []);

  const [pgn, setPgn] = useState(initialPgn);
  const [positions, setPositions] = useState<GamePosition[]>(
    () => generatePositions(initialPgn).positions,
  );
  const [moves, setMoves] = useState<string[]>(
    () => generatePositions(initialPgn).moves,
  );
  const [headers, setHeaders] = useState<Record<string, string>>(
    () => generatePositions(initialPgn).headers,
  );
  const [currentIdx, setCurrentIdx] = useState(0);
  const [parseError, setParseError] = useState("");
  const [saveTitle, setSaveTitle] = useState("");
  const [saveDescription, setSaveDescription] = useState("");
  const [showSaveForm, setShowSaveForm] = useState(false);

  // Photo upload state
  // photo file stored for future upload use
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [photoScale, setPhotoScale] = useState(1.0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: savedNotations, isLoading: savedLoading } = useListNotations();
  const saveNotation = useSaveNotation();
  const deleteNotation = useDeleteNotation();
  const { loginStatus, identity } = useInternetIdentity();
  const isLoggedIn = loginStatus === "success" && !!identity;

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
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      goTo(currentIdx + 1);
    }
  }

  function handleFileUpload(file: File) {
    if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
    // file stored in photoPreviewUrl for display
    setPhotoPreviewUrl(URL.createObjectURL(file));
    setPhotoScale(1.0);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) handleFileUpload(file);
  }

  async function handleSave() {
    if (!saveTitle.trim()) {
      toast.error("Please enter a title");
      return;
    }
    try {
      await saveNotation.mutateAsync({
        title: saveTitle.trim(),
        pgn,
        description: saveDescription.trim(),
        photoBlobId: null,
      });
      toast.success("Notation saved!");
      setShowSaveForm(false);
      setSaveTitle("");
      setSaveDescription("");
    } catch {
      toast.error("Failed to save notation");
    }
  }

  async function handleDelete(id: bigint) {
    try {
      await deleteNotation.mutateAsync(id);
      toast.success("Notation deleted");
    } catch {
      toast.error("Failed to delete notation");
    }
  }

  const currentPos = positions[currentIdx];
  const gameTitle =
    headers.White && headers.Black
      ? `${headers.White} vs ${headers.Black}`
      : headers.Event || "Chess Game";

  return (
    <div
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      onKeyDown={handleKeyDown}
      // biome-ignore lint/a11y/noNoninteractiveTabindex: keyboard navigation for chess moves
    >
      <Toaster />
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold text-foreground">
          {gameTitle}
        </h1>
        {headers.Event && headers.White && (
          <p className="text-muted-foreground font-sans text-sm mt-1">
            {headers.Event} · {headers.Date || ""} · {headers.Result || ""}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_280px] gap-6">
        {/* Left: PGN Input */}
        <div className="space-y-4">
          <div>
            <Label className="font-sans text-xs tracking-widest uppercase text-muted-foreground mb-2 block">
              PGN Notation
            </Label>
            <Textarea
              value={pgn}
              onChange={(e) => loadPGN(e.target.value)}
              data-ocid="notation.textarea"
              className="font-mono text-xs h-64 bg-card border-border text-foreground resize-none"
              placeholder="Paste PGN here..."
              spellCheck={false}
            />
            {parseError && (
              <p
                className="text-destructive text-xs mt-1 font-sans"
                data-ocid="notation.error_state"
              >
                {parseError}
              </p>
            )}
          </div>

          {/* Move list */}
          <div>
            <Label className="font-sans text-xs tracking-widest uppercase text-muted-foreground mb-2 block">
              Moves ({moves.length})
            </Label>
            <ScrollArea className="h-48 border border-border bg-card p-2">
              <div ref={moveListRef} className="flex flex-wrap gap-1">
                {moves.map((san, i) => {
                  const isWhiteMove = i % 2 === 0;
                  const moveNum = Math.floor(i / 2) + 1;
                  return (
                    <span
                      key={`${i}-${san}`}
                      className="flex items-center gap-0.5"
                    >
                      {isWhiteMove && (
                        <span className="text-muted-foreground font-mono text-xs">
                          {moveNum}.
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => goTo(i + 1)}
                        data-ocid={`notation.item.${i + 1}`}
                        className={`px-1.5 py-0.5 font-mono text-xs transition-colors ${
                          currentIdx === i + 1
                            ? "bg-foreground text-background"
                            : "text-foreground hover:bg-secondary"
                        }`}
                      >
                        {san}
                      </button>
                    </span>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Save form */}
          {isLoggedIn && (
            <div className="space-y-2">
              {showSaveForm ? (
                <div className="space-y-2 border border-border p-3 bg-card">
                  <Input
                    value={saveTitle}
                    onChange={(e) => setSaveTitle(e.target.value)}
                    placeholder="Game title"
                    data-ocid="notation.input"
                    className="font-sans text-sm bg-background"
                  />
                  <Textarea
                    value={saveDescription}
                    onChange={(e) => setSaveDescription(e.target.value)}
                    placeholder="Description (optional)"
                    data-ocid="notation.textarea"
                    className="font-sans text-sm bg-background h-20 resize-none"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSave}
                      disabled={saveNotation.isPending}
                      size="sm"
                      data-ocid="notation.save_button"
                      className="flex-1 bg-foreground text-background hover:bg-muted-foreground font-sans text-xs tracking-widest uppercase"
                    >
                      {saveNotation.isPending ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Save className="h-3 w-3" />
                      )}
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowSaveForm(false)}
                      data-ocid="notation.cancel_button"
                      className="font-sans text-xs"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSaveForm(true)}
                  data-ocid="notation.secondary_button"
                  className="w-full font-sans text-xs tracking-widest uppercase border-border"
                >
                  <Save className="h-3.5 w-3.5 mr-1.5" /> Save Notation
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Center: Board */}
        <div className="flex flex-col items-center gap-4">
          {currentPos && (
            <ChessBoard
              board={currentPos.state.board}
              lastFrom={currentPos.lastFrom}
              lastTo={currentPos.lastTo}
            />
          )}

          {/* Navigation controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goTo(0)}
              data-ocid="notation.button"
              className="border-border"
              aria-label="Go to start"
            >
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goTo(currentIdx - 1)}
              data-ocid="notation.button"
              className="border-border"
              aria-label="Previous move"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-mono text-sm text-muted-foreground px-3">
              {currentIdx} / {positions.length - 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goTo(currentIdx + 1)}
              data-ocid="notation.button"
              className="border-border"
              aria-label="Next move"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goTo(positions.length - 1)}
              data-ocid="notation.button"
              className="border-border"
              aria-label="Go to end"
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-muted-foreground font-sans text-xs">
            Use ← → arrow keys to navigate moves
          </p>
        </div>

        {/* Right: Photo Upload */}
        <div className="space-y-4">
          <Label className="font-sans text-xs tracking-widest uppercase text-muted-foreground mb-2 block">
            Scoresheet Photo
          </Label>

          {photoPreviewUrl ? (
            <div className="space-y-2">
              <div
                className="border border-border overflow-auto bg-card"
                style={{ height: 280 }}
              >
                <img
                  src={photoPreviewUrl}
                  alt="Scoresheet"
                  style={{
                    transform: `scale(${photoScale})`,
                    transformOrigin: "top left",
                    width: "100%",
                    display: "block",
                  }}
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPhotoScale((s) => Math.max(0.5, s - 0.25))}
                  data-ocid="notation.button"
                  className="p-1.5 border border-border hover:bg-secondary transition-colors"
                  aria-label="Zoom out"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="font-mono text-xs text-muted-foreground flex-1 text-center">
                  {Math.round(photoScale * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setPhotoScale((s) => Math.min(3, s + 0.25))}
                  data-ocid="notation.button"
                  className="p-1.5 border border-border hover:bg-secondary transition-colors"
                  aria-label="Zoom in"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
                    // photo cleared
                    setPhotoPreviewUrl(null);
                  }}
                  data-ocid="notation.delete_button"
                  className="p-1.5 border border-border hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                  aria-label="Remove photo"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ")
                  fileInputRef.current?.click();
              }}
              data-ocid="notation.dropzone"
              className={`border-2 border-dashed cursor-pointer flex flex-col items-center justify-center gap-3 transition-colors ${
                isDragging
                  ? "border-foreground bg-secondary"
                  : "border-border hover:border-muted-foreground"
              }`}
              style={{ height: 280 }}
            >
              <Upload className="h-8 w-8 text-muted-foreground" />
              <div className="text-center">
                <p className="text-foreground font-sans text-sm">
                  Drop scoresheet here
                </p>
                <p className="text-muted-foreground font-sans text-xs mt-1">
                  or click to browse
                </p>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            data-ocid="notation.upload_button"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file);
            }}
          />
        </div>
      </div>

      {/* Saved Notations */}
      <div className="mt-12 border-t border-border pt-8">
        <h2 className="font-serif text-xl font-bold text-foreground mb-4">
          Saved Notations
        </h2>
        {!isLoggedIn && (
          <p className="text-muted-foreground font-sans text-sm">
            Sign in to save and view your notations.
          </p>
        )}
        {isLoggedIn && savedLoading && (
          <div className="space-y-2" data-ocid="notation.loading_state">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        )}
        {isLoggedIn && !savedLoading && savedNotations?.length === 0 && (
          <p
            className="text-muted-foreground font-sans text-sm"
            data-ocid="notation.empty_state"
          >
            No saved notations yet. Save a game above.
          </p>
        )}
        {isLoggedIn &&
          !savedLoading &&
          savedNotations &&
          savedNotations.length > 0 && (
            <div className="space-y-2">
              {savedNotations.map((n, i) => (
                <div
                  key={n.id.toString()}
                  data-ocid={`notation.item.${i + 1}`}
                  className="flex items-center justify-between border border-border p-3 hover:bg-secondary transition-colors"
                >
                  <div>
                    <button
                      type="button"
                      onClick={() => loadPGN(n.pgn)}
                      className="text-foreground font-sans text-sm font-medium hover:underline text-left"
                    >
                      {n.title}
                    </button>
                    {n.description && (
                      <p className="text-muted-foreground font-sans text-xs mt-0.5">
                        {n.description}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(n.id)}
                    data-ocid={`notation.delete_button.${i + 1}`}
                    className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Delete notation"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
      </div>
    </div>
  );
}
