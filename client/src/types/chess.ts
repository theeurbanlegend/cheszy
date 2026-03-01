export enum ChessPieceTypeEnum {
  Pawn = "Pawn",
  Rook = "Rook",
  Knight = "Knight",
  Bishop = "Bishop",
  Queen = "Queen",
  King = "King",
}

export enum ChessPieceColorEnum {
  White = "White",
  Black = "Black",
}

export enum ChessSquareColorEnum {
  Light = "light",
  Dark = "dark",
}

export interface ChessPiece {
  id: string; //eg "white-pawn-1", "black-king-1", etc.
  type: ChessPieceTypeEnum;
  color: ChessPieceColorEnum;
  position: string; //e.g. "a1", "h8", etc.
}

export interface ChessBoardSquare {
  position: string; //e.g. "a1", "h8", etc.
  piece: ChessPiece | null;
  color: "light" | "dark";
}

export interface ChessBoardState {
  squares: ChessBoardSquare[];
  moveHistory: { pieceId: string; move: MoveType }[]; // Add move history to track moves for en passant and other rules eg castling 0-0, 0-0-0
}

export enum ChessBoardTypeEnum {
  TWO_PLAYER = "TWO_PLAYER",
  THREE_PLAYER = "THREE_PLAYER",
  FOUR_PLAYER = "FOUR_PLAYER",
}

export type MoveType = string | "0-0" | "0-0-0";
