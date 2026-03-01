import {
  INITIAL_BISHOP_POSITIONS,
  INITIAL_KING_POSITIONS,
  INITIAL_KNIGHT_POSITIONS,
  INITIAL_PAWN_POSITIONS,
  INITIAL_QUEEN_POSITIONS,
  INITIAL_ROOK_POSITIONS,
} from "@/constants/chess";
import {
  ChessBoardSquare,
  ChessBoardState,
  ChessPiece,
  ChessPieceColorEnum,
  ChessPieceTypeEnum,
  ChessSquareColorEnum,
} from "@/types/chess";

export function initializeChessBoard() {
  const boardState = {
    squares: Array.from({ length: 64 }, (_, index) => {
      const file = String.fromCharCode(97 + (index % 8)); // 'a' to 'h'
      const rank = 8 - Math.floor(index / 8); // 8 to 1
      const position = `${file}${rank}`;
      const color =
        (Math.floor(index / 8) + (index % 8)) % 2 === 0
          ? ChessSquareColorEnum.Light
          : ChessSquareColorEnum.Dark;
      const initialPiece = getInitialPieceForPosition(position);
      return {
        position,
        piece: initialPiece && {
          ...initialPiece,
          position,
          id: `${initialPiece.color}-${initialPiece.type}-${index}`,
        },
        color,
      };
    }),
    moveHistory: [],
  };
  return boardState;
}

function getInitialPieceForPosition(position: string) {
  const pieceMap = [
    { positions: INITIAL_PAWN_POSITIONS, type: ChessPieceTypeEnum.Pawn },
    { positions: INITIAL_BISHOP_POSITIONS, type: ChessPieceTypeEnum.Bishop },
    { positions: INITIAL_KING_POSITIONS, type: ChessPieceTypeEnum.King },
    { positions: INITIAL_QUEEN_POSITIONS, type: ChessPieceTypeEnum.Queen },
    { positions: INITIAL_KNIGHT_POSITIONS, type: ChessPieceTypeEnum.Knight },
    { positions: INITIAL_ROOK_POSITIONS, type: ChessPieceTypeEnum.Rook },
  ];

  for (const { positions, type } of pieceMap) {
    if (positions.includes(position)) {
      const rank = position[1]; //position has format like "a1", "e4", etc. so rank(row) is the second character, and file(column) is the first character
      return {
        type,
        color:
          rank === "1" || rank === "2"
            ? ChessPieceColorEnum.White
            : ChessPieceColorEnum.Black,
      };
    }
  }

  return null;
}

function getTopAdjacentSquare(
  square: ChessBoardSquare,
  boardState: ChessBoardState,
  direction: "up" | "down",
): ChessBoardSquare | null {
  const file = square.position[0];
  const rank = parseInt(square.position[1]);
  const targetRank = direction === "up" ? rank + 1 : rank - 1;
  if (targetRank < 1 || targetRank > 8) return null; // Out of bounds
  const targetPosition = `${file}${targetRank}`;
  return (
    boardState.squares.find((sq) => sq.position === targetPosition) || null
  );
}

export function getValidMovesForPiece(
  piece: ChessPiece,
  sourceSquare: ChessBoardSquare,
  boardState: ChessBoardState,
): string[] {
  const validMoves: string[] = [];
  for (const targetSquare of boardState.squares) {
    if (validateMove(piece, sourceSquare, targetSquare, boardState)) {
      validMoves.push(targetSquare.position);
    }
  }
  return validMoves;
}

export function validateMove(
  piece: ChessPiece,
  sourceSquare: ChessBoardSquare,
  targetSquare: ChessBoardSquare,
  boardState: ChessBoardState,
): boolean {
  if (!piece) return false; // No piece to move
  if (targetSquare.piece && targetSquare.piece.color === piece.color) {
    return false; // Cannot capture own piece
  }
  switch (piece.type) {
    case ChessPieceTypeEnum.Pawn:
      return validatePawnMove(piece, sourceSquare, targetSquare, boardState);
    case ChessPieceTypeEnum.Rook:
      return validateRookMove(sourceSquare, targetSquare, boardState);
    case ChessPieceTypeEnum.Knight:
      return validateKnightMove(sourceSquare, targetSquare);
    case ChessPieceTypeEnum.Bishop:
      return validateBishopMove(sourceSquare, targetSquare, boardState);
    case ChessPieceTypeEnum.Queen:
      return validateQueenMove(sourceSquare, targetSquare, boardState);
    case ChessPieceTypeEnum.King:
      return validateKingMove(sourceSquare, targetSquare);
    default:
      return false; // Invalid piece type
  }
}

function validatePawnMove(
  piece: ChessPiece,
  sourceSquare: ChessBoardSquare,
  targetSquare: ChessBoardSquare,
  boardState: ChessBoardState,
): boolean {
  // Pawns can move forward one square, or two squares from their starting position
  const direction = piece.color === ChessPieceColorEnum.White ? 1 : -1;
  const startRank = piece.color === ChessPieceColorEnum.White ? "2" : "7";
  const targetFile = targetSquare.position[0];
  const sourceFile = sourceSquare.position[0];
  const sourceRank = sourceSquare.position[1];
  const targetRank = targetSquare.position[1];
  const rankDiff = parseInt(targetRank) - parseInt(sourceRank);
  const adjacentSquare = getTopAdjacentSquare(
    sourceSquare,
    boardState,
    direction === 1 ? "up" : "down",
  );

  if (adjacentSquare && adjacentSquare.piece) {
    if (adjacentSquare.position === targetSquare.position) {
      return false; // Cannot move forward into an occupied square
    }
    //cant jump an occupied square
    if (rankDiff === 2 * direction && sourceRank === startRank) {
      return false; // Cannot jump over an occupied square
    }
    if (
      rankDiff === direction &&
      Math.abs(targetFile.charCodeAt(0) - sourceFile.charCodeAt(0)) > 1
    ) {
      return false; // cant move more than one step diagonally, even if capturing
    }
  }
  if (targetFile !== sourceFile) {
    // Pawns can only move diagonally when capturing
    if (rankDiff === direction) {
      return (
        !!targetSquare.piece ||
        canEnpassant(piece, sourceSquare, targetSquare, boardState).isValid
      );
    }
    return false; // Invalid move
  }
  if (rankDiff === direction) {
    return true; // Move forward one square
  }
  if (rankDiff === 2 * direction && sourceRank === startRank) {
    return true; // Move forward two squares from starting position
  }
  return false; // Invalid move
}

export function canEnpassant(
  piece: ChessPiece,
  sourceSquare: ChessBoardSquare,
  targetSquare: ChessBoardSquare,
  boardState: ChessBoardState,
): { isValid: boolean; capturedPawnPosition?: string } {
  // Check if the move is a valid en passant capture
  const lastMove = boardState.moveHistory[boardState.moveHistory.length - 1];
  if (!lastMove) return { isValid: false }; // No previous move, so en passant is not possible
  const lastMovedPiece = boardState.squares
    .flatMap((sq) => (sq.piece ? [sq.piece] : []))
    .find((p) => p.id === lastMove.pieceId);
  if (
    lastMovedPiece &&
    lastMovedPiece.type === ChessPieceTypeEnum.Pawn &&
    Math.abs(
      parseInt(lastMove.move.split("-")[0][1]) -
        parseInt(lastMove.move.split("-")[1][1]),
    ) === 2 // The opponent's pawn moved two squares forward
  ) {
    const targetFile = targetSquare.position[0];
    const sourceFile = sourceSquare.position[0];
    const sourceRank = sourceSquare.position[1];
    const targetRank = targetSquare.position[1];
    const direction = piece.color === ChessPieceColorEnum.White ? 1 : -1;
    const rankDiff = parseInt(targetRank) - parseInt(sourceRank);
    const fileDiff = targetFile.charCodeAt(0) - sourceFile.charCodeAt(0);
    const expectedTargetPosition = `${String.fromCharCode(
      lastMovedPiece.position[0].charCodeAt(0),
    )}${lastMovedPiece.position[1]}`; //current position of last moved piece
    const isMovingAboveLastPiece =
      parseInt(targetRank) - parseInt(expectedTargetPosition[1]);
    const captureRouteDiff =
      targetFile.charCodeAt(0) - expectedTargetPosition[0].charCodeAt(0);
    if (
      rankDiff === direction &&
      Math.abs(fileDiff) === 1 &&
      isMovingAboveLastPiece === direction &&
      captureRouteDiff === 0
    ) {
      return { isValid: true, capturedPawnPosition: expectedTargetPosition }; // Valid en passant capture
    }
  }
  return { isValid: false };
}

export function canPromotePawn(
  piece: ChessPiece,
  targetSquare: ChessBoardSquare,
): boolean {
  const targetRank = targetSquare.position[1];
  if (piece.type === ChessPieceTypeEnum.Pawn) {
    if (
      (piece.color === ChessPieceColorEnum.White && targetRank === "8") ||
      (piece.color === ChessPieceColorEnum.Black && targetRank === "1")
    ) {
      return true; // Pawn can be promoted
    }
  }
  return false;
}

export function promotePawn(
  originalPiece: ChessPiece,
  targetSquare: ChessBoardSquare,
  newType: ChessPieceTypeEnum,
): ChessPiece {
  return {
    ...originalPiece,
    type: newType,
    position: targetSquare.position
  };
}

function validateRookMove(
  sourceSquare: ChessBoardSquare,
  targetSquare: ChessBoardSquare,
  boardState: ChessBoardState,
): boolean {
  const sourceFile = sourceSquare.position[0];
  const sourceRank = sourceSquare.position[1];
  const targetFile = targetSquare.position[0];
  const targetRank = targetSquare.position[1];

  // Rooks move in straight lines along files or ranks
  if (sourceFile === targetFile) {
    // Moving along the same file, check for pieces in between
    const rankDiff = parseInt(targetRank) - parseInt(sourceRank);
    const step = rankDiff > 0 ? 1 : -1;
    for (
      let rank = parseInt(sourceRank) + step;
      rank !== parseInt(targetRank);
      rank += step
    ) {
      const intermediateSquare = boardState.squares.find(
        (sq) => sq.position === `${sourceFile}${rank}`,
      );
      if (intermediateSquare && intermediateSquare.piece) {
        return false; // There is a piece blocking the path
      }
    }
    return true; // Valid move along the file
  } else if (sourceRank === targetRank) {
    // Moving along the same rank, check for pieces in between
    const fileDiff = targetFile.charCodeAt(0) - sourceFile.charCodeAt(0);
    const step = fileDiff > 0 ? 1 : -1;
    for (
      let file = sourceFile.charCodeAt(0) + step;
      file !== targetFile.charCodeAt(0);
      file += step
    ) {
      const intermediateSquare = boardState.squares.find(
        (sq) => sq.position === `${String.fromCharCode(file)}${sourceRank}`,
      );
      if (intermediateSquare && intermediateSquare.piece) {
        return false; // There is a piece blocking the path
      }
    }
    return true; // Valid move along the rank
  }
  return false;
}

function validateKnightMove(
  sourceSquare: ChessBoardSquare,
  targetSquare: ChessBoardSquare,
): boolean {
  const sourceFile = sourceSquare.position[0];
  const sourceRank = sourceSquare.position[1];
  const targetFile = targetSquare.position[0];
  const targetRank = targetSquare.position[1];

  // Knights move in an L-shape: 2 squares in one direction and then 1 square perpendicularly
  const fileDiff = Math.abs(
    targetFile.charCodeAt(0) - sourceFile.charCodeAt(0),
  );
  const rankDiff = Math.abs(parseInt(targetRank) - parseInt(sourceRank));
  return (
    (fileDiff === 2 && rankDiff === 1) || (fileDiff === 1 && rankDiff === 2)
  );
}

function validateBishopMove(
  sourceSquare: ChessBoardSquare,
  targetSquare: ChessBoardSquare,
  boardState: ChessBoardState,
): boolean {
  const sourceFile = sourceSquare.position[0];
  const sourceRank = sourceSquare.position[1];
  const targetFile = targetSquare.position[0];
  const targetRank = targetSquare.position[1];

  // Bishops move diagonally, so the absolute difference between files and ranks must be the same
  const fileDiff = Math.abs(
    targetFile.charCodeAt(0) - sourceFile.charCodeAt(0),
  );
  const rankDiff = Math.abs(parseInt(targetRank) - parseInt(sourceRank));
  if (fileDiff !== rankDiff) {
    return false; // Not a diagonal move
  }

  // Check for pieces in between
  const fileStep = targetFile > sourceFile ? 1 : -1;
  const rankStep = targetRank > sourceRank ? 1 : -1;
  for (
    let i = 1;
    i < fileDiff; // fileDiff and rankDiff are the same, so we can use either
    i++
  ) {
    const intermediateSquare = boardState.squares.find(
      (sq) =>
        sq.position ===
        `${String.fromCharCode(sourceFile.charCodeAt(0) + i * fileStep)}${
          parseInt(sourceRank) + i * rankStep
        }`,
    );
    if (intermediateSquare && intermediateSquare.piece) {
      return false; // There is a piece blocking the path
    }
  }
  return true; // Valid diagonal move
}

export function validateQueenMove(
  sourceSquare: ChessBoardSquare,
  targetSquare: ChessBoardSquare,
  boardState: ChessBoardState,
): boolean {
  // A queen's move is valid if it's valid as a rook move or a bishop move
  return (
    validateRookMove(sourceSquare, targetSquare, boardState) ||
    validateBishopMove(sourceSquare, targetSquare, boardState)
  );
}

export function validateKingMove(
  sourceSquare: ChessBoardSquare,
  targetSquare: ChessBoardSquare,
): boolean {
  const sourceFile = sourceSquare.position[0];
  const sourceRank = sourceSquare.position[1];
  const targetFile = targetSquare.position[0];
  const targetRank = targetSquare.position[1];

  // Kings move one square in any direction
  const fileDiff = Math.abs(
    targetFile.charCodeAt(0) - sourceFile.charCodeAt(0),
  );
  const rankDiff = Math.abs(parseInt(targetRank) - parseInt(sourceRank));
  return fileDiff <= 1 && rankDiff <= 1;
}

export function validateCapture(
  piece: ChessPiece,
  targetSquare: ChessBoardSquare,
  isEnPassantCapture = false,
): boolean {
  if (targetSquare.piece && targetSquare.piece.color !== piece.color) {
    return true;
  }
  if (isEnPassantCapture) {
    return true;
  }
  return false;
}
