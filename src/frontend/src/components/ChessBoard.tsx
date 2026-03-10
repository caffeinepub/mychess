import { fileOf, getPieceUnicode, isLightSquare, rankOf } from "../lib/chess";
import type { Board } from "../lib/chess";

interface ChessBoardProps {
  board: Board;
  lastFrom?: number;
  lastTo?: number;
  flipped?: boolean;
}

const LIGHT_SQ = "#f0d9b5";
const DARK_SQ = "#b58863";
const HIGHLIGHT_LIGHT = "#f6f669";
const HIGHLIGHT_DARK = "#baca44";

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const RANKS = ["1", "2", "3", "4", "5", "6", "7", "8"];

export default function ChessBoard({
  board,
  lastFrom = -1,
  lastTo = -1,
  flipped = false,
}: ChessBoardProps) {
  const ranks = flipped ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0];
  const files = flipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];

  return (
    <div
      className="inline-block"
      style={{ maxWidth: "min(100%, 480px)", width: "100%" }}
    >
      {/* Board with rank labels */}
      <div className="flex">
        {/* Rank labels */}
        <div className="flex flex-col" style={{ width: 20 }}>
          {ranks.map((r) => (
            <div
              key={r}
              className="flex items-center justify-center text-muted-foreground font-mono"
              style={{
                height: "calc(min(100%, 480px) / 8)",
                aspectRatio: "1",
                fontSize: 10,
              }}
            >
              {RANKS[r]}
            </div>
          ))}
        </div>
        {/* Board squares */}
        <div
          className="chess-board flex-1"
          role="img"
          aria-label="Chess board"
          data-ocid="notation.canvas_target"
        >
          {ranks.map((r) =>
            files.map((f) => {
              const idx = r * 8 + f;
              const piece = board[idx];
              const light = isLightSquare(idx);
              const isHighlighted = idx === lastFrom || idx === lastTo;

              let bg = light ? LIGHT_SQ : DARK_SQ;
              if (isHighlighted) bg = light ? HIGHLIGHT_LIGHT : HIGHLIGHT_DARK;

              return (
                <div
                  key={idx}
                  className="chess-square"
                  style={{ backgroundColor: bg }}
                  title={`${FILES[f]}${RANKS[r]}`}
                >
                  {piece && (
                    <span
                      className="chess-piece"
                      style={{
                        color: piece[0] === "w" ? "#fff" : "#1a1a1a",
                        textShadow:
                          piece[0] === "w"
                            ? "0 0 3px rgba(0,0,0,0.8), 0 1px 2px rgba(0,0,0,0.6)"
                            : "0 0 3px rgba(255,255,255,0.3)",
                      }}
                    >
                      {getPieceUnicode(piece)}
                    </span>
                  )}
                  {/* Rank label on edge (first file) */}
                  {f === (flipped ? 7 : 0) && (
                    <span
                      className="absolute top-0.5 left-0.5 font-mono leading-none"
                      style={{
                        fontSize: 9,
                        color: light ? DARK_SQ : LIGHT_SQ,
                        opacity: 0.8,
                      }}
                    />
                  )}
                  {/* File label on edge (last rank) */}
                  {r === (flipped ? 7 : 0) && (
                    <span
                      className="absolute bottom-0.5 right-0.5 font-mono leading-none"
                      style={{
                        fontSize: 9,
                        color: light ? DARK_SQ : LIGHT_SQ,
                        opacity: 0.8,
                      }}
                    >
                      {FILES[f]}
                    </span>
                  )}
                </div>
              );
            }),
          )}
        </div>
      </div>
    </div>
  );
}
