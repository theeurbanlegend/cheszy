import { ChessPieceColorEnum, ChessPieceTypeEnum } from "@/types/chess";
import Queen from "./pieces/Queen";
import Rook from "./pieces/Rook";
import Bishop from "./pieces/Bishop";
import Knight from "./pieces/Knight";

interface PromoteDropdownProps {
  color: ChessPieceColorEnum;
  onPromote: (pieceType: ChessPieceTypeEnum) => void;
  position: string;
}

const PromoteDropdown = ({
  color,
  onPromote,
  position,
}: PromoteDropdownProps) => {
  const options = [
    { type: ChessPieceTypeEnum.Queen, icon: <Queen color={color} size={45} /> },
    { type: ChessPieceTypeEnum.Rook, icon: <Rook color={color} size={45} /> },
    {
      type: ChessPieceTypeEnum.Bishop,
      icon: <Bishop color={color} size={45} />,
    },
    {
      type: ChessPieceTypeEnum.Knight,
      icon: <Knight color={color} size={45} />,
    },
  ];
  const rank = position[1];
  const isPromotingAtTop = rank === "8";
  return (
    <div
      className={`absolute bg-white border rounded shadow-lg p-0.5 flex flex-col items-center z-50 min-w-25 ${isPromotingAtTop ? "top-0" : "bottom-0"} left-1/2 transform -translate-x-1/2`}
    >
      {options.map((option) => (
        <button
          key={option.type}
          onClick={() => onPromote(option.type)}
          className="p-2 m-1 border rounded hover:bg-gray-200"
        >
          {option.icon}
        </button>
      ))}
    </div>
  );
};

export default PromoteDropdown;
