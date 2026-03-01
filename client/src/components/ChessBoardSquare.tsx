import {
  ChessPiece as ChessPieceType,
  ChessPieceTypeEnum,
} from "@/types/chess";
import ChessPiece from "./ChessPiece";
import { useCallback } from "react";
import PromoteDropdown from "./PromoteDropdown";

interface ChessBoardSquareProps {
  index: number;
  position: string; //e.g. "a1", "h8", etc.
  piece: ChessPieceType | null;
  color: "light" | "dark";
  showDot?: boolean; // Optional prop to show a dot for valid moves
  showPromoteMenu?: boolean; // Optional prop to show promotion options when a pawn reaches the last rank
  sourceHighlight?: boolean; // Optional prop to highlight the square as a source of a move
  targetHighlight?: boolean; // Optional prop to highlight the square as a target of a move
  onPieceDragStart?: (pieceId: string, position: string) => void;
  onSquareDragOver?: (targetPosition: string) => void;
  onSquareClick?: (position: string, pieceId?: string) => void;
  className?: string;
  onMovePiece?: (
    pieceId: string,
    fromPosition: string,
    toPosition: string,
  ) => void; // Optional callback for when a piece is moved
  onPromote?: (
    piecePosition: string,
    newType: ChessPieceTypeEnum,
    pieceId?: string,
  ) => void; // Optional callback for when a pawn is promoted
}

const ChessBoardSquare = ({
  index,
  position,
  piece,
  showDot,
  sourceHighlight,
  targetHighlight,
  color,
  className,
  onPieceDragStart,
  showPromoteMenu,
  onMovePiece,
  onSquareDragOver,
  onSquareClick,
  onPromote,
}: ChessBoardSquareProps) => {
  const showLeftCoordinate = index % 8 === 0;
  const showBottomCoordinate = index >= 56;
  const canShowPromoteMenu =
    showPromoteMenu && (position[1] === "8" || position[1] === "1");

  const handleDragOver = useCallback(
    (ev: React.DragEvent<HTMLDivElement>) => {
      ev.preventDefault();
      onSquareDragOver?.(position);
    },
    [onSquareDragOver, position],
  );

  const handleDrop = (ev: React.DragEvent<HTMLDivElement>) => {
    ev.preventDefault();
    const data = ev.dataTransfer.getData("text");
    const { pieceId, fromPosition } = JSON.parse(data) as {
      pieceId: string;
      fromPosition: string;
    };
    if (onMovePiece) {
      onMovePiece(pieceId, fromPosition, position);
    }
  };

  const handleClick = () => {
    onSquareClick?.(position, piece?.id);
  };

  return (
    <div
      id={position}
      data-position={position}
      data-index={index}
      data-color={color}
      style={{
        backgroundColor: color === "light" ? "#f0d9b5" : "#b58863", // light is a light brown, dark is a darker brown
      }}
      className={`relative flex items-center justify-center ${className}`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onMouseUp={handleClick}
    >
      {piece && (
        <ChessPiece
          id={piece.id}
          piece={piece}
          size={100}
          currentPosition={position}
          onDragStart={onPieceDragStart}
        />
      )}
      {showLeftCoordinate && (
        <div className="absolute -left-5 top-1/2 text-xs">{position?.[1]}</div>
      )}
      {showBottomCoordinate && (
        <div className="absolute -bottom-5 right-1/2 text-xs">
          {position?.[0]}
        </div>
      )}

      {showDot && (
        <div className="absolute rounded-full w-6 h-6 bg-gray-400 opacity-80" />
      )}
      {sourceHighlight && piece && (
        <div className="absolute inset-0 bg-green-500 opacity-40 z-0" />
      )}
      {targetHighlight && !piece && (
        <div className="absolute inset-0 bg-green-500 opacity-10 z-0" />
      )}
      {targetHighlight && piece && (
        <div
          className="absolute inset-0 bg-green-500 opacity-30 z-0"
          style={{
            maskImage: "radial-gradient(circle, transparent 75%, black 30%)",
            WebkitMaskImage:
              "radial-gradient(circle, transparent 75%, black 30%)",
          }}
        />
      )}
      {canShowPromoteMenu && piece && (
        <PromoteDropdown
          color={piece.color}
          onPromote={(newType) => {
            onPromote?.(position, newType, piece.id);
          }}
          position={position}
        />
      )}
    </div>
  );
};

export default ChessBoardSquare;
