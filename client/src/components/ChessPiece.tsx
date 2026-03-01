import {
  ChessPiece as ChessPieceType,
  ChessPieceTypeEnum,
} from "@/types/chess";
import Pawn from "./pieces/Pawn";
import Rook from "./pieces/Rook";
import Knight from "./pieces/Knight";
import Bishop from "./pieces/Bishop";
import Queen from "./pieces/Queen";
import King from "./pieces/King";

interface ChessPieceProps {
  id: string;
  piece: ChessPieceType;
  currentPosition: string;
  size?: number;
  onDragStart?: (pieceId: string, position: string) => void;
}

const ChessPiece = ({
  piece,
  size,
  id,
  currentPosition,
  onDragStart,
}: ChessPieceProps) => {
  const renderPiece = () => {
    switch (piece.type) {
      case ChessPieceTypeEnum.Pawn:
        return <Pawn color={piece.color} size={size} />;
      case ChessPieceTypeEnum.Rook:
        return <Rook color={piece.color} size={size} />;
      case ChessPieceTypeEnum.Knight:
        return <Knight color={piece.color} size={size} />;
      case ChessPieceTypeEnum.Bishop:
        return <Bishop color={piece.color} size={size} />;
      case ChessPieceTypeEnum.Queen:
        return <Queen color={piece.color} size={size} />;
      case ChessPieceTypeEnum.King:
        return <King color={piece.color} size={size} />;
      default:
        return null;
    }
  };

  const handleDragStart = (ev: React.DragEvent<HTMLDivElement>) => {
    ev.dataTransfer.effectAllowed = "move";
    ev.dataTransfer.setData(
      "text",
      JSON.stringify({
        pieceId: ev.currentTarget.id,
        fromPosition: currentPosition,
      }),
    );

    const img = ev.currentTarget.querySelector("img");
    if (img) {
      const clone = img.cloneNode(true) as HTMLImageElement;
      const wrapper = document.createElement("div");
      wrapper.style.position = "absolute";
      wrapper.style.top = "-9999px";
      wrapper.style.width = `${size}px`;
      wrapper.style.height = `${size}px`;
      wrapper.appendChild(clone);
      document.body.appendChild(wrapper);

      ev.dataTransfer.setDragImage(
        wrapper,
        size ? size / 2 : 50,
        size ? size / 2 : 50,
      );

      setTimeout(() => document.body.removeChild(wrapper), 0);
    }
    onDragStart?.(ev.currentTarget.id, currentPosition);
  };

  return (
    <div
      id={id}
      draggable={"true"}
      onDragStart={handleDragStart}
      className="z-10"
    >
      {renderPiece()}
    </div>
  );
};

export default ChessPiece;
