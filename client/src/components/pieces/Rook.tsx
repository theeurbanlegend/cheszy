import { ChessPieceColorEnum } from "@/types/chess";
import Image from "next/image";

interface RookProps {
  color: ChessPieceColorEnum;
  size?: number; // Optional prop to specify the size of the SVG
}

const Rook = ({ color, size = 45 }: RookProps) => {
  return (
    <Image
      src={`/pieces/Rook-${ChessPieceColorEnum[color]}.svg`}
      alt={`${color} Rook`}
      width={size}
      height={size}
    />
  );
};

export default Rook;
