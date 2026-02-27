"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import { Share2, Save } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ColorCard } from "@/app/components/color-card";
import { SavedPalettesSection } from "@/app/components/saved-palettes-section";
import {
  PALETTE_SIZE,
  type Palette,
  type LockState,
  generateRandomColor,
  generatePalette,
  parsePaletteFromURL,
  paletteToURLParam,
  loadSavedPalettes,
  savePalettesToStorage,
  isPaletteDuplicate,
} from "@/lib/palette-utils";

// 클립보드 복사 기능을 제공하는 커스텀 훅
function useClipboard() {
  const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error("클립보드 복사 실패:", error);
      return false;
    }
  };

  return { copyToClipboard };
}

// 저장된 팔레트 관리를 위한 커스텀 훅
function useSavedPalettes() {
  const [savedPalettes, setSavedPalettes] = useState<Palette[]>([]);

  // 초기 렌더링 시 로컬 스토리지에서 불러오기
  useEffect(() => {
    setSavedPalettes(loadSavedPalettes());
  }, []);

  // 팔레트 저장하는 함수
  const savePalette = (
    palette: Palette,
    onComplete: (success: boolean) => void,
  ) => {
    setSavedPalettes((prev) => {
      if (isPaletteDuplicate(palette, prev)) {
        onComplete(false);
        return prev;
      }
      const updated = [...prev, palette];
      savePalettesToStorage(updated);
      onComplete(true);
      return updated;
    });
  };

  // 팔레트 삭제하는 함수
  const deletePalette = (index: number) => {
    setSavedPalettes((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      savePalettesToStorage(updated);
      return updated;
    });
  };

  return { savedPalettes, savePalette, deletePalette };
}

// 메인 콘텐츠 컴포넌트
function PaletteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { copyToClipboard } = useClipboard();
  const { savedPalettes, savePalette, deletePalette } = useSavedPalettes();

  const isInitialized = useRef(false);
  const [palette, setPalette] = useState<Palette>([]);
  const [lockedColors, setLockedColors] = useState<LockState>(
    Array(PALETTE_SIZE).fill(false),
  );

  // 초기 팔레트 설정
  useEffect(() => {
    if (isInitialized.current) return;

    const colorsParam = searchParams.get("colors");
    const urlPalette = parsePaletteFromURL(colorsParam);

    // URL에 유효한 팔레트가 있으면 해당 팔레트를 사용
    if (urlPalette) {
      setPalette(urlPalette);
    } else {
      setPalette(
        Array.from({ length: PALETTE_SIZE }, () => generateRandomColor()),
      );
    }

    isInitialized.current = true;
    router.replace("/", { scroll: false });
  }, [searchParams, router]);

  // 팔레트 생성 핸들러
  const handleGenerate = () => {
    setPalette((prev) => generatePalette(lockedColors, prev));
  };

  // 색상 코드 복사 핸들러
  const handleCopyColor = async (color: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await copyToClipboard(color);
    if (success) toast.success(`${color} 코드가 복사되었습니다!`);
    else toast.error("색상 복사에 실패했습니다.");
  };

  // 공유 URL 생성 및 복사 핸들러
  const handleShareURL = async () => {
    const colorsParam = paletteToURLParam(palette);
    const shareURL = `${window.location.origin}/?colors=${colorsParam}`;
    const success = await copyToClipboard(shareURL);

    if (success) toast.success("팔레트 공유 링크가 복사되었습니다!");
    else toast.error("URL 복사에 실패했습니다.");
  };

  // 팔레트 저장 핸들러
  const handleSavePalette = () => {
    savePalette(palette, (success) => {
      if (success) toast.success("팔레트가 저장되었습니다!");
      else toast.error("이미 저장된 팔레트입니다!");
    });
  };

  // 팔레트 삭제 핸들러
  const handleDeletePalette = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    deletePalette(index);
    toast.success("팔레트가 삭제되었습니다.");
  };

  // 저장된 팔레트 불러오기 핸들러
  const handleLoadPalette = (savedPalette: Palette) => {
    setPalette(savedPalette);
    setLockedColors(Array(PALETTE_SIZE).fill(false));
    toast.success("팔레트를 불러왔습니다!");
  };

  // 색상 잠금 토글 핸들러
  const toggleLock = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setLockedColors((prev) => {
      const updated = [...prev];
      updated[index] = !updated[index];
      toast.success(
        updated[index] ? "색상이 잠겼습니다" : "잠금이 해제되었습니다",
      );
      return updated;
    });
  };

  // 스페이스바 이벤트 바인딩
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === "Space" && e.target === document.body) {
        e.preventDefault();
        handleGenerate();
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleGenerate]);

  return (
    <>
      <header className="h-26 p-6 border-b">
        <h1 className="text-2xl font-bold">컬러 팔레트</h1>
        <p className="text-sm text-muted-foreground mt-1 sm:flex hidden">
          스페이스바를 누르거나 생성 버튼을 클릭하여 새로운 색상 조합을 만드세요
        </p>
      </header>

      <main className="flex-1 flex flex-col">
        <section className="flex flex-col min-h-[calc(100dvh-104px)]">
          <div className="flex-1 flex flex-col md:flex-row min-h-0">
            {palette.map((color, index) => (
              <ColorCard
                key={`${index}-${color}`}
                color={color}
                isLocked={lockedColors[index]}
                onCopy={(e) => handleCopyColor(color, e)}
                onToggleLock={(e) => toggleLock(index, e)}
              />
            ))}
          </div>

          <div className="flex justify-center gap-4 flex-wrap p-6">
            <Button size="lg" onClick={handleGenerate}>
              새 팔레트 생성
            </Button>
            <Button size="lg" variant="outline" onClick={handleShareURL}>
              <Share2 className="w-4 h-4" /> 링크 공유
            </Button>
            <Button size="lg" variant="secondary" onClick={handleSavePalette}>
              <Save className="w-4 h-4" /> 팔레트 저장
            </Button>
          </div>
        </section>

        <SavedPalettesSection
          palettes={savedPalettes}
          onLoad={handleLoadPalette}
          onDelete={handleDeletePalette}
        />
      </main>
    </>
  );
}

// 메인 페이지 컴포넌트
export default function Main() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-screen">
          <p className="text-lg animate-pulse">
            팔레트 생성기를 불러오는 중...
          </p>
        </div>
      }
    >
      <PaletteContent />
    </Suspense>
  );
}
