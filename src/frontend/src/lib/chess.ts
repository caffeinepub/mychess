// MyChess — Chess Engine & PGN Parser

export type PieceColor = "w" | "b";
export type PieceType = "K" | "Q" | "R" | "B" | "N" | "P";
export type Piece = string | null; // 'wK', 'bP', null, etc.
export type Board = Piece[]; // 64 squares, index = rank*8 + file (rank 0 = rank 1)

export interface ChessState {
  board: Board;
  turn: PieceColor;
  castling: { wK: boolean; wQ: boolean; bK: boolean; bQ: boolean };
  enPassant: number | null;
}

export interface MoveRecord {
  san: string;
  from: number;
  to: number;
}

const PIECE_UNICODE: Record<string, string> = {
  wK: "♔",
  wQ: "♕",
  wR: "♖",
  wB: "♗",
  wN: "♘",
  wP: "♙",
  bK: "♚",
  bQ: "♛",
  bR: "♜",
  bB: "♝",
  bN: "♞",
  bP: "♟",
};

export function getPieceUnicode(piece: Piece): string {
  if (!piece) return "";
  return PIECE_UNICODE[piece] || "";
}

function sq(file: number, rank: number): number {
  return rank * 8 + file;
}

export function fileOf(idx: number): number {
  return idx % 8;
}

export function rankOf(idx: number): number {
  return Math.floor(idx / 8);
}

function fileChar(file: number): string {
  return String.fromCharCode(97 + file);
}

export function isLightSquare(idx: number): boolean {
  const f = fileOf(idx);
  const r = rankOf(idx);
  return (f + r) % 2 === 1;
}

export function initialBoard(): ChessState {
  const board: Board = new Array(64).fill(null);
  const backRank: PieceType[] = ["R", "N", "B", "Q", "K", "B", "N", "R"];
  for (let f = 0; f < 8; f++) {
    board[sq(f, 0)] = `w${backRank[f]}`;
    board[sq(f, 1)] = "wP";
    board[sq(f, 7)] = `b${backRank[f]}`;
    board[sq(f, 6)] = "bP";
  }
  return {
    board,
    turn: "w",
    castling: { wK: true, wQ: true, bK: true, bQ: true },
    enPassant: null,
  };
}

function isPathClear(board: Board, from: number, to: number): boolean {
  const df = fileOf(to) - fileOf(from);
  const dr = rankOf(to) - rankOf(from);
  const stepF = df === 0 ? 0 : df > 0 ? 1 : -1;
  const stepR = dr === 0 ? 0 : dr > 0 ? 1 : -1;
  let f = fileOf(from) + stepF;
  let r = rankOf(from) + stepR;
  while (f !== fileOf(to) || r !== rankOf(to)) {
    if (board[sq(f, r)] !== null) return false;
    f += stepF;
    r += stepR;
  }
  return true;
}

function canPieceReach(
  board: Board,
  from: number,
  to: number,
  enPassant: number | null,
): boolean {
  const piece = board[from];
  if (!piece) return false;
  const color = piece[0] as PieceColor;
  const type = piece[1] as PieceType;
  const df = fileOf(to) - fileOf(from);
  const dr = rankOf(to) - rankOf(from);
  const adf = Math.abs(df);
  const adr = Math.abs(dr);
  const target = board[to];
  if (target && target[0] === color) return false;

  switch (type) {
    case "P": {
      const dir = color === "w" ? 1 : -1;
      const startRank = color === "w" ? 1 : 6;
      if (df === 0) {
        if (dr === dir && !target) return true;
        if (
          dr === 2 * dir &&
          rankOf(from) === startRank &&
          !target &&
          !board[sq(fileOf(from), rankOf(from) + dir)]
        )
          return true;
      } else if (adf === 1 && dr === dir) {
        if (target && target[0] !== color) return true;
        if (to === enPassant) return true;
      }
      return false;
    }
    case "N":
      return (adf === 1 && adr === 2) || (adf === 2 && adr === 1);
    case "B":
      return adf === adr && isPathClear(board, from, to);
    case "R":
      return (df === 0 || dr === 0) && isPathClear(board, from, to);
    case "Q":
      return (
        (adf === adr || df === 0 || dr === 0) && isPathClear(board, from, to)
      );
    case "K":
      return adf <= 1 && adr <= 1;
    default:
      return false;
  }
}

function parseSAN(san: string): {
  pieceType: string;
  fromFile: string | null;
  fromRank: string | null;
  toFile: string;
  toRank: string;
  promotion: string | null;
  castleKing: boolean;
  castleQueen: boolean;
} | null {
  const s = san
    .replace(/[+#!?]/g, "")
    .replace(/\?!/g, "")
    .replace(/!\?/g, "");

  if (s === "O-O-O" || s === "0-0-0")
    return {
      pieceType: "K",
      fromFile: null,
      fromRank: null,
      toFile: "c",
      toRank: "1",
      promotion: null,
      castleKing: false,
      castleQueen: true,
    };
  if (s === "O-O" || s === "0-0")
    return {
      pieceType: "K",
      fromFile: null,
      fromRank: null,
      toFile: "g",
      toRank: "1",
      promotion: null,
      castleKing: true,
      castleQueen: false,
    };

  let rest = s;
  let promotion: string | null = null;
  const promMatch = rest.match(/=([QRBN])$/);
  if (promMatch) {
    promotion = promMatch[1];
    rest = rest.slice(0, -2);
  }

  if (rest.length < 2) return null;

  const toFile = rest[rest.length - 2];
  const toRank = rest[rest.length - 1];
  if (!/[a-h]/.test(toFile) || !/[1-8]/.test(toRank)) return null;

  let prefix = rest.slice(0, -2);
  let pieceType = "P";
  if (prefix.length > 0 && /[KQRBN]/.test(prefix[0])) {
    pieceType = prefix[0];
    prefix = prefix.slice(1);
  }
  prefix = prefix.replace("x", "");

  let fromFile: string | null = null;
  let fromRank: string | null = null;
  for (const ch of prefix) {
    if (/[a-h]/.test(ch)) fromFile = ch;
    else if (/[1-8]/.test(ch)) fromRank = ch;
  }

  return {
    pieceType,
    fromFile,
    fromRank,
    toFile,
    toRank,
    promotion,
    castleKing: false,
    castleQueen: false,
  };
}

export function applyMove(
  state: ChessState,
  san: string,
): { state: ChessState; from: number; to: number } {
  const board = [...state.board];
  const { turn, castling } = state;
  const newCastling = { ...castling };
  let enPassant: number | null = null;

  const parsed = parseSAN(san);
  if (!parsed) return { state, from: -1, to: -1 };

  const backRank = turn === "w" ? 0 : 7;

  // Castling
  if (parsed.castleKing) {
    const from = sq(4, backRank);
    const to = sq(6, backRank);
    board[sq(6, backRank)] = `${turn}K`;
    board[sq(5, backRank)] = `${turn}R`;
    board[sq(4, backRank)] = null;
    board[sq(7, backRank)] = null;
    if (turn === "w") {
      newCastling.wK = false;
      newCastling.wQ = false;
    } else {
      newCastling.bK = false;
      newCastling.bQ = false;
    }
    return {
      state: {
        board,
        turn: turn === "w" ? "b" : "w",
        castling: newCastling,
        enPassant: null,
      },
      from,
      to,
    };
  }
  if (parsed.castleQueen) {
    const from = sq(4, backRank);
    const to = sq(2, backRank);
    board[sq(2, backRank)] = `${turn}K`;
    board[sq(3, backRank)] = `${turn}R`;
    board[sq(4, backRank)] = null;
    board[sq(0, backRank)] = null;
    if (turn === "w") {
      newCastling.wK = false;
      newCastling.wQ = false;
    } else {
      newCastling.bK = false;
      newCastling.bQ = false;
    }
    return {
      state: {
        board,
        turn: turn === "w" ? "b" : "w",
        castling: newCastling,
        enPassant: null,
      },
      from,
      to,
    };
  }

  const { pieceType, fromFile, fromRank, toFile, toRank, promotion } = parsed;
  const toFileIdx = toFile.charCodeAt(0) - 97;
  const toRankIdx = Number.parseInt(toRank) - 1;
  const toIdx = sq(toFileIdx, toRankIdx);

  // Find source
  const candidates: number[] = [];
  for (let i = 0; i < 64; i++) {
    if (board[i] !== `${turn}${pieceType}`) continue;
    if (fromFile && fileChar(fileOf(i)) !== fromFile) continue;
    if (fromRank && rankOf(i) !== Number.parseInt(fromRank) - 1) continue;
    if (canPieceReach(board, i, toIdx, state.enPassant)) {
      candidates.push(i);
    }
  }

  if (candidates.length === 0) return { state, from: -1, to: -1 };
  const fromIdx = candidates[0];

  // En passant capture
  if (pieceType === "P" && toIdx === state.enPassant) {
    board[sq(toFileIdx, rankOf(fromIdx))] = null;
  }

  board[toIdx] = board[fromIdx];
  board[fromIdx] = null;

  // Promotion
  if (promotion) {
    board[toIdx] = `${turn}${promotion}`;
  } else if (pieceType === "P" && (toRankIdx === 7 || toRankIdx === 0)) {
    board[toIdx] = `${turn}Q`;
  }

  // Set en passant
  if (pieceType === "P" && Math.abs(toRankIdx - rankOf(fromIdx)) === 2) {
    enPassant = sq(toFileIdx, (rankOf(fromIdx) + toRankIdx) / 2);
  }

  // Update castling rights
  if (pieceType === "K") {
    if (turn === "w") {
      newCastling.wK = false;
      newCastling.wQ = false;
    } else {
      newCastling.bK = false;
      newCastling.bQ = false;
    }
  }
  if (pieceType === "R") {
    if (turn === "w" && rankOf(fromIdx) === 0) {
      if (fileOf(fromIdx) === 0) newCastling.wQ = false;
      if (fileOf(fromIdx) === 7) newCastling.wK = false;
    } else if (turn === "b" && rankOf(fromIdx) === 7) {
      if (fileOf(fromIdx) === 0) newCastling.bQ = false;
      if (fileOf(fromIdx) === 7) newCastling.bK = false;
    }
  }

  return {
    state: {
      board,
      turn: turn === "w" ? "b" : "w",
      castling: newCastling,
      enPassant,
    },
    from: fromIdx,
    to: toIdx,
  };
}

export function parsePGN(pgn: string): {
  moves: string[];
  headers: Record<string, string>;
} {
  const headers: Record<string, string> = {};
  const headerRegex = /\[(\w+)\s+"([^"]*)"/g;
  let m = headerRegex.exec(pgn);
  while (m !== null) {
    headers[m[1]] = m[2];
    m = headerRegex.exec(pgn);
  }

  // Remove headers
  let text = pgn.replace(/\[[^\]]*\]/g, "");
  // Remove comments in {}
  text = text.replace(/\{[^}]*\}/g, "");
  // Remove variations in () — simplified, handles one level
  text = text.replace(/\([^)]*\)/g, "");
  // Remove result markers
  text = text.replace(/1-0|0-1|1\/2-1\/2|\*/g, "");
  // Remove move numbers (1. or 1...)
  text = text.replace(/\d+\.+/g, "");
  // Split and filter
  const moves = text
    .trim()
    .split(/\s+/)
    .filter((s) => s.length > 0 && !/^\d+$/.test(s));

  return { moves, headers };
}

export interface GamePosition {
  state: ChessState;
  lastFrom: number;
  lastTo: number;
  san: string;
}

export function generatePositions(pgn: string): {
  positions: GamePosition[];
  moves: string[];
  headers: Record<string, string>;
} {
  const { moves, headers } = parsePGN(pgn);
  const initial = initialBoard();
  const positions: GamePosition[] = [
    { state: initial, lastFrom: -1, lastTo: -1, san: "" },
  ];

  let current = initial;
  for (const san of moves) {
    const result = applyMove(current, san);
    current = result.state;
    positions.push({
      state: current,
      lastFrom: result.from,
      lastTo: result.to,
      san,
    });
  }

  return { positions, moves, headers };
}
