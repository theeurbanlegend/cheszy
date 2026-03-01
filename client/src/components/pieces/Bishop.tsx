import { ChessPieceColorEnum } from "@/types/chess";
import Image from "next/image";

interface BishopProps {
  color: ChessPieceColorEnum;
  size?: number; // Optional prop to specify the size of the SVG
}

const Bishop = ({ color, size = 45 }: BishopProps) => {
  return (
    <Image
      src={`/pieces/Bishop-${ChessPieceColorEnum[color]}.svg`}
      alt={`${color} Bishop`}
      width={size}
      height={size}
    />
  );
};

export default Bishop;
