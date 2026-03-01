import { ChessPieceColorEnum } from "@/types/chess";
import Image from "next/image";

interface KnightProps {
  color: ChessPieceColorEnum;
  size?: number; // Optional prop to specify the size of the SVG
}

const Knight = ({ color, size = 45 }: KnightProps) => {
  return (
    <Image
      src={`/pieces/Knight-${ChessPieceColorEnum[color]}.svg`}
      alt={`${color} Knight`}
      width={size}
      height={size}
    />
  );
};

export default Knight;
