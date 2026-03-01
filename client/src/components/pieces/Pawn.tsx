import { ChessPieceColorEnum } from "@/types/chess";
import Image from "next/image";

interface PawnProps {
  color: ChessPieceColorEnum;
  size?: number; // Optional prop to specify the size of the SVG
}

const Pawn = ({ color, size = 45 }: PawnProps) => {
  return (
    <Image
      src={`/pieces/Pawn-${ChessPieceColorEnum[color]}.svg`}
      alt={`${color} Pawn`}
      width={size}
      height={size}
    />
  );
};

export default Pawn;
