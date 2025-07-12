import { cn } from "@/lib/utils";
import { FibonacciValue } from "@/lib/types";

interface PokerCardProps {
  value: FibonacciValue;
  isSelected?: boolean;
  isRevealed?: boolean;
  isClickable?: boolean;
  onClick?: () => void;
  participantName?: string;
  className?: string;
}

export function PokerCard({
  value,
  isSelected = false,
  isRevealed = false,
  isClickable = true,
  onClick,
  participantName,
  className,
}: PokerCardProps) {
  return (
    <div className="flex flex-col items-center space-y-2">
      <div
        className={cn(
          "poker-card",
          {
            "selected": isSelected,
            "revealed": isRevealed,
            "cursor-not-allowed opacity-50": !isClickable,
          },
          className
        )}
        onClick={isClickable ? onClick : undefined}
      >
        {value}
      </div>
      {participantName && (
        <span className="text-xs text-gray-600 text-center max-w-16 truncate">
          {participantName}
        </span>
      )}
    </div>
  );
}

interface PokerCardBackProps {
  participantName: string;
  className?: string;
}

export function PokerCardBack({ participantName, className }: PokerCardBackProps) {
  return (
    <div className="flex flex-col items-center space-y-2">
      <div
        className={cn(
          "poker-card bg-purple-600 text-white",
          className
        )}
      >
        ?
      </div>
      <span className="text-xs text-gray-600 text-center max-w-16 truncate">
        {participantName}
      </span>
    </div>
  );
} 