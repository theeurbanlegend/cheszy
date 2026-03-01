"use client";
import { ChessBoardState } from "@/types/chess";
import { useEffect, useState } from "react";
import ChessBoardSquare from "./ChessBoardSquare";
import {
  getValidMovesForPiece,
  initializeChessBoard,
  validateCapture,
  validateMove,
} from "@/lib/chess";

const ChessBoard = () => {
  const [validMoves, setValidMoves] = useState<string[]>([]);
  const [activeSquare, setActiveSquare] = useState<{
    position: string;
    pieceId?: string;
  } | null>(null);
  const [hoveredSquare, setHoveredSquare] = useState<string | null>(null);
  const [boardState, setBoardState] = useState<ChessBoardState>({
    squares: [], // Initialize with an empty array or a default board setup
    moveHistory: [],
  });

  useEffect(() => {
    const initialBoardState: ChessBoardState = initializeChessBoard();
    setBoardState(initialBoardState);
  }, []);

  const playAudio = (type: "move" | "capture") => {
    switch (type) {
      case "move":
        new Audio("/sounds/move_piece.mp3").play();
        break;
      case "capture":
        new Audio("/sounds/capture_piece.mp3").play();
        break;
      default:
        break;
    }
  };

  const handleMovePiece = (
    pieceId: string,
    fromPosition: string,
    toPosition: string,
  ) => {
    setValidMoves([]);
    setActiveSquare(null);
    setHoveredSquare(null);
    if (fromPosition === toPosition) return;
    const piece = boardState.squares.find(
      (sq) => sq.position === fromPosition,
    )?.piece;
    const sourceSquare = boardState.squares.find(
      (sq) => sq.position === fromPosition,
    );
    const targetSquare = boardState.squares.find(
      (sq) => sq.position === toPosition,
    );
    if (!piece || !sourceSquare || !targetSquare) return;
    let isCapture = targetSquare && !!targetSquare.piece;

    const isMoveValid = validateMove(
      piece,
      sourceSquare,
      targetSquare,
      boardState,
    );
    if (!isMoveValid) return; // If the move is not valid, exit early
    if (isCapture) {
      const isCaptureValid = validateCapture(piece, targetSquare);
      if (!isCaptureValid) return; // If the capture is not valid, exit early
    }

    setBoardState((prevState) => {
      const newSquares = prevState.squares.map((square) => {
        if (square.position === fromPosition) {
          return { ...square, piece: null };
        } else if (square.position === toPosition) {
          const movingPiece = prevState.squares.find(
            (sq) => sq.position === fromPosition,
          )?.piece;
          return {
            ...square,
            piece: movingPiece
              ? {
                  ...movingPiece,
                  position: toPosition,
                }
              : null,
          };
        }
        return square;
      });
      return {
        squares: newSquares,
        moveHistory: [
          ...prevState.moveHistory,
          { pieceId, move: `${fromPosition}-${toPosition}` },
        ],
      };
    });
    if (isCapture) {
      playAudio("capture");
    } else {
      playAudio("move");
    }
  };

  const handlePieceDragStart = (pieceId: string, position: string) => {
    const parentSquare = boardState.squares.find(
      (sq) => sq.position === position,
    );
    if (
      !parentSquare ||
      !parentSquare.piece ||
      parentSquare.piece.id !== pieceId
    )
      return;
    const validMoveResult = getValidMovesForPiece(
      parentSquare.piece,
      parentSquare,
      boardState,
    );
    setValidMoves(validMoveResult);
    setActiveSquare({ position, pieceId });
  };

  const handleSquareDragOver = (targetPosition: string) => {
    if (targetPosition === activeSquare?.position) {
      setHoveredSquare(null);
      return;
    }
    if (!validMoves.includes(targetPosition)) return;
    setHoveredSquare(targetPosition);
  };

  const handleSquareClick = (position: string, pieceId?: string) => {
    if (activeSquare && activeSquare.pieceId) {
      handleMovePiece(activeSquare.pieceId, activeSquare.position, position);
    } else if (pieceId) {
      setActiveSquare({ position, pieceId });
      const parentSquare = boardState.squares.find(
        (sq) => sq.position === position,
      );
      if (
        !parentSquare ||
        !parentSquare.piece ||
        parentSquare.piece.id !== pieceId
      )
        return;
      const validMoveResult = getValidMovesForPiece(
        parentSquare.piece,
        parentSquare,
        boardState,
      );
      setValidMoves(validMoveResult);
    }
  };

  return (
    <div className="border-2 border-black grid grid-cols-8 grid-rows-8 gap-0 w-fit h-fit">
      {boardState.squares.map((square, index) => (
        <ChessBoardSquare
          key={index}
          index={index}
          position={square.position}
          piece={square.piece}
          color={square.color}
          className="col-span-1 row-span-1 w-28 h-28"
          onMovePiece={handleMovePiece}
          onPieceDragStart={handlePieceDragStart}
          onSquareDragOver={handleSquareDragOver}
          onSquareClick={handleSquareClick}
          showDot={validMoves.includes(square.position)}
          sourceHighlight={activeSquare?.position === square.position}
          targetHighlight={hoveredSquare === square.position}
        />
      ))}
    </div>
  );
};

export default ChessBoard;
