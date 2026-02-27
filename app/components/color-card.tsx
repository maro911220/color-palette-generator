import { Lock, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";

// 색상 카드 컴포넌트 속성 정의
interface ColorCardProps {
  color: string;
  isLocked: boolean;
  onCopy: (e: React.MouseEvent) => void;
  onToggleLock: (e: React.MouseEvent) => void;
}

// 색상 카드 컴포넌트
export function ColorCard({
  color,
  isLocked,
  onCopy,
  onToggleLock,
}: ColorCardProps) {
  return (
    <div className="flex-1 relative group flex flex-col">
      {/* 색상 카드 버튼 */}
      <button
        onClick={onCopy}
        className="flex-1 w-full flex flex-col items-center justify-center p-8 transition-all hover:brightness-105 active:brightness-95 focus:outline-none focus:ring-inset focus:ring-2 focus:ring-white/50 cursor-pointer"
        aria-label={`${color} 색상 복사`}
        style={{ backgroundColor: color }}
      >
        <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-md group-hover:shadow-lg transition-all">
          <p className="text-sm font-mono font-bold text-gray-900 tracking-wider">
            {color.toUpperCase()}
          </p>
        </div>
      </button>

      {/* 잠금 토글 버튼 */}
      <Button
        size="icon"
        variant="secondary"
        onClick={onToggleLock}
        className={`absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:bg-white hover:scale-110 active:scale-95 transition-all z-10 ${
          isLocked
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0"
        }`}
        aria-label={isLocked ? "색상 잠금 해제" : "색상 잠금"}
      >
        {isLocked ? (
          <Lock className="w-5 h-5 text-gray-900" strokeWidth={2.5} />
        ) : (
          <Unlock className="w-5 h-5 text-gray-900" strokeWidth={2.5} />
        )}
      </Button>
    </div>
  );
}
