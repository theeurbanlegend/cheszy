import { ChessPieceColorEnum } from "@/types/chess";
import Image from "next/image";

interface QueenProps {
  color: ChessPieceColorEnum;
  size?: number; // Optional prop to specify the size of the SVG
}

const Queen = ({ color, size = 45 }: QueenProps) => {
  return (
    <Image
      src={`/pieces/Queen-${ChessPieceColorEnum[color]}.svg`}
      alt={`${color} Queen`}
      width={size}
      height={size}
    />
  );
};

export default Queen;
