// 색상 팔레트 관련 유틸리티 함수 및 상수 정의
export const PALETTE_SIZE = 5;
export const STORAGE_KEY = "savedPalettes";
export type Palette = string[];
export type LockState = boolean[];

// 랜덤한 HEX 색상 코드를 생성 함수
export function generateRandomColor(): string {
  const hex = Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, "0");
  return `#${hex}`;
}

// 팔레트 생성 함수
export function generatePalette(
  lockedColors: LockState,
  currentPalette: Palette,
): Palette {
  // 각 색상에 대해 잠금 상태를 확인하여 새 팔레트를 생성
  return Array.from({ length: PALETTE_SIZE }, (_, index) =>
    lockedColors[index] ? currentPalette[index] : generateRandomColor(),
  );
}

// URL 팔레트 파싱 함수
export function parsePaletteFromURL(
  colorsParam: string | null,
): Palette | null {
  if (!colorsParam) return null;
  //URL의 colors 파라미터 문자열을 팔레트 배열로 변환
  const colors = colorsParam.split(",").map((c) => `#${c}`);
  return colors.length === PALETTE_SIZE ? colors : null;
}

// 팔레트 URL 변환 함수
export function paletteToURLParam(palette: Palette): string {
  return palette.map((c) => c.replace("#", "")).join(",");
}

// 로컬 스토리지에 저장된 팔레트 목록을 불러오는 함수
export function loadSavedPalettes(): Palette[] {
  if (typeof window === "undefined") return [];
  // 저장된 팔레트를 불러와 JSON으로 파싱하여 반환
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("저장된 팔레트를 불러오는 데 실패했습니다.", error);
    return [];
  }
}

// 로컬 스토리지에 팔레트를 저장하는 함수
export function savePalettesToStorage(palettes: Palette[]): void {
  if (typeof window === "undefined") return;
  // 팔레트 배열을 JSON 문자열로 저장
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(palettes));
  } catch (error) {
    console.error("팔레트를 저장하는 데 실패했습니다.", error);
  }
}

// 팔레트 중복 체크 함수
export function isPaletteDuplicate(
  palette: Palette,
  savedPalettes: Palette[],
): boolean {
  if (savedPalettes.length === 0) return false;
  // 현재 팔레트를 JSON 문자열로 변환하여 저장된 팔레트들과 비교
  const paletteString = JSON.stringify(palette);
  return savedPalettes.some((saved) => JSON.stringify(saved) === paletteString);
}
