import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { type Palette } from "@/lib/palette-utils";

// 저장된 팔레트 목록 컴포넌트 속성 정의
interface SavedPalettesSectionProps {
  palettes: Palette[];
  onLoad: (palette: Palette) => void;
  onDelete: (index: number, e: React.MouseEvent) => void;
}

// 저장된 팔레트 목록을 보여주는 컴포넌트
export function SavedPalettesSection({
  palettes,
  onLoad,
  onDelete,
}: SavedPalettesSectionProps) {
  // 저장된 팔레트가 없으면 섹션을 렌더링하지 않습니다.
  if (palettes.length === 0) return null;

  return (
    <section className="w-full max-w-4xl mx-auto p-6 border-t mt-8">
      <h2 className="text-xl font-bold mb-6">저장된 팔레트</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {/* 저장된 팔레트 목록 */}
        {palettes.map((savedPalette, index) => {
          const paletteKey = `saved-${index}-${savedPalette.join("-")}`;
          return (
            <div key={paletteKey} className="group relative">
              {/* 팔레트 프리뷰 버튼 */}
              <button
                onClick={() => onLoad(savedPalette)}
                className="w-full h-20 flex rounded-lg overflow-hidden border border-border shadow-sm hover:border-primary/40 hover:brightness-110 active:brightness-95 transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
                aria-label={`팔레트 불러오기: ${savedPalette.join(", ")}`}
              >
                {savedPalette.map((color, i) => (
                  <div
                    title={color}
                    key={`${paletteKey}-${i}`}
                    className="flex-1 h-full"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </button>

              {/* 삭제 버튼 */}
              <Button
                size="icon"
                variant="destructive"
                onClick={(e) => onDelete(index, e)}
                className="absolute -top-2 -right-2 h-7 w-7 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                aria-label="팔레트 삭제"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
