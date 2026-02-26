import { Lock, Unlock } from "lucide-react";

// Types
interface ColorCardProps {
  color: string;
  isLocked: boolean;
  onCopy: (e: React.MouseEvent) => void;
  onToggleLock: (e: React.MouseEvent) => void;
}

// ColorCard Component
export function ColorCard({
  color,
  isLocked,
  onCopy,
  onToggleLock,
}: ColorCardProps) {
  return (
    <div
      className="flex-1 flex flex-col items-center justify-center p-8 cursor-pointer hover:opacity-90 transition-opacity relative group"
      style={{ backgroundColor: color }}
      onClick={onCopy}
    >
      {/* 잠금 버튼 */}
      <button
        onClick={onToggleLock}
        className={`absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg hover:bg-white transition-all ${
          isLocked ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
        aria-label={isLocked ? "Unlock color" : "Lock color"}
      >
        {isLocked ? (
          <Lock className="w-5 h-5 text-gray-900" />
        ) : (
          <Unlock className="w-5 h-5 text-gray-900" />
        )}
      </button>

      {/* 색상 코드 */}
      <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg">
        <p className="text-sm font-mono font-semibold text-gray-900">
          {color.toUpperCase()}
        </p>
      </div>
    </div>
  );
}
