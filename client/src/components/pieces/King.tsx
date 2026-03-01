import { ChessPieceColorEnum } from "@/types/chess";
import Image from "next/image";

interface KingProps {
  color: ChessPieceColorEnum;
  size?: number; // Optional prop to specify the size of the SVG
}

const King = ({ color, size = 45 }: KingProps) => {
  return (
    <Image
      src={`/pieces/King-${ChessPieceColorEnum[color]}.svg`}
      alt={`${color} King`}
      width={size}
      height={size}
    />
  );
};

export default King;
