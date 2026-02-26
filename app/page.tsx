"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { Share2, Save } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { ColorCard } from "@/app/components/color-card";
import { SavedPalettesSection } from "@/app/components/saved-palettes-section";

/* Constants & Types */
const PALETTE_SIZE = 5;
const STORAGE_KEY = "savedPalettes";
type Palette = string[];
type LockState = boolean[];

/* Utility Functions */
// 랜덤 색상 생성
function generateRandomColor(): string {
  const hex = Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, "0");
  return `#${hex}`;
}

// 잠긴 색상은 유지하고 나머지는 새로 생성
function generatePalette(
  lockedColors: LockState,
  currentPalette: Palette,
): Palette {
  return Array.from({ length: PALETTE_SIZE }, (_, index) =>
    lockedColors[index] ? currentPalette[index] : generateRandomColor(),
  );
}

// URL에서 팔레트 파싱
function parsePaletteFromURL(colorsParam: string | null): Palette | null {
  if (!colorsParam) return null;
  const colors = colorsParam.split(",").map((c) => `#${c}`);
  return colors.length === PALETTE_SIZE ? colors : null;
}

// 팔레트를 URL 파라미터로 변환
function paletteToURLParam(palette: Palette): string {
  return palette.map((c) => c.replace("#", "")).join(",");
}

// 로컬 스토리지에서 팔레트 불러오기
function loadSavedPalettes(): Palette[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("Failed to parse saved palettes", error);
    return [];
  }
}

// 로컬 스토리지에 팔레트 저장
function savePalettesToStorage(palettes: Palette[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(palettes));
  } catch (error) {
    console.error("Failed to save palettes", error);
  }
}

/* Custom Hooks */
// 클립보드 복사 훅
function useClipboard() {
  const copyToClipboard = useCallback(
    async (text: string): Promise<boolean> => {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (error) {
        console.error("Failed to copy to clipboard", error);
        return false;
      }
    },
    [],
  );

  return { copyToClipboard };
}

// 저장된 팔레트 관리 훅
function useSavedPalettes() {
  const [savedPalettes, setSavedPalettes] = useState<Palette[]>([]);

  useEffect(() => {
    setSavedPalettes(loadSavedPalettes());
  }, []);

  const savePalette = useCallback((palette: Palette) => {
    setSavedPalettes((prev) => {
      const updated = [...prev, palette];
      savePalettesToStorage(updated);
      return updated;
    });
  }, []);

  const deletePalette = useCallback((index: number) => {
    setSavedPalettes((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      savePalettesToStorage(updated);
      return updated;
    });
  }, []);

  return { savedPalettes, savePalette, deletePalette };
}

// Main Component
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

    // URL에서 팔레트 정보가 있는지 확인
    const colorsParam = searchParams.get("colors");
    const urlPalette = parsePaletteFromURL(colorsParam);

    // URL에 유효한 팔레트가 있으면 설정, 없으면 새로 생성
    if (urlPalette) {
      setPalette(urlPalette);
      isInitialized.current = true;
      router.replace("/", { scroll: false });
      return;
    }

    setPalette(
      Array.from({ length: PALETTE_SIZE }, () => generateRandomColor()),
    );
    isInitialized.current = true;
  }, [searchParams, router]);

  // Event Handlers
  // 새 팔레트 생성 (잠긴 색상 유지)
  const handleGenerate = useCallback(() => {
    setPalette((prev) => generatePalette(lockedColors, prev));
  }, [lockedColors]);

  // 색상 카드 클릭 시 색상 복사
  const handleCopyColor = useCallback(
    async (color: string, e: React.MouseEvent) => {
      e.stopPropagation();
      const success = await copyToClipboard(color);
      if (success) {
        toast.success(`Copied ${color}`);
      } else {
        toast.error("Failed to copy");
      }
    },
    [copyToClipboard],
  );

  // 팔레트 공유 URL 생성 및 복사
  const handleShareURL = useCallback(async () => {
    const colorsParam = paletteToURLParam(palette);
    const shareURL = `${window.location.origin}/?colors=${colorsParam}`;

    const success = await copyToClipboard(shareURL);
    if (success) {
      toast.success("Palette URL copied!");
      router.replace("/", { scroll: false });
    } else {
      toast.error("Failed to copy URL");
    }
  }, [palette, copyToClipboard, router]);

  // 현재 팔레트 저장
  const handleSavePalette = useCallback(() => {
    savePalette(palette);
    toast.success("Palette saved!");
  }, [palette, savePalette]);

  // 저장된 팔레트 삭제
  const handleDeletePalette = useCallback(
    (index: number, e: React.MouseEvent) => {
      e.stopPropagation();
      deletePalette(index);
      toast.success("Palette deleted");
    },
    [deletePalette],
  );

  // 저장된 팔레트 불러오기
  const handleLoadPalette = useCallback((savedPalette: Palette) => {
    setPalette(savedPalette);
    setLockedColors(Array(PALETTE_SIZE).fill(false));
    toast.success("Palette loaded!");
  }, []);

  // 색상 잠금 토글
  const toggleLock = useCallback((index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setLockedColors((prev) => {
      const updated = [...prev];
      updated[index] = !updated[index];
      toast.success(updated[index] ? "Color locked" : "Color unlocked");
      return updated;
    });
  }, []);

  // 스페이스바 단축키
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
      {/* header */}
      <header className="h-26 p-6 border-b">
        <h1 className="text-2xl font-bold">Color Palette Generator</h1>
        <p className="text-sm text-muted-foreground mt-1 sm:flex hidden">
          스페이스바를 누르거나 생성 버튼을 클릭하여 새 팔레트 만들기
        </p>
      </header>
      {/* main content */}
      <main className="h-auto flex flex-col">
        <h1 className="sr-only">Main Content</h1>
        <section className="h-auto min-h-[calc(100vh-6.5rem)] flex flex-col">
          <h2 className="sr-only">Color Palette Section</h2>
          <div className="flex-1 flex flex-col md:flex-row">
            {palette.map((color, index) => (
              <ColorCard
                key={index}
                color={color}
                isLocked={lockedColors[index]}
                onCopy={(e) => handleCopyColor(color, e)}
                onToggleLock={(e) => toggleLock(index, e)}
              />
            ))}
          </div>

          <div className="flex justify-center gap-4 flex-wrap p-6">
            <Button size="lg" onClick={handleGenerate}>
              Generate
            </Button>
            <Button size="lg" variant="outline" onClick={handleShareURL}>
              <Share2 className="w-4 h-4" />
              Share URL
            </Button>
            <Button size="lg" variant="secondary" onClick={handleSavePalette}>
              <Save className="w-4 h-4" />
              Save Palette
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

export default function Main() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-screen">
          <p className="text-lg animate-pulse">Loading Palette Generator...</p>
        </div>
      }
    >
      <PaletteContent />
    </Suspense>
  );
}
