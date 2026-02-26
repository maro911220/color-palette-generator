import { Trash2 } from "lucide-react";

// Types
type Palette = string[];
interface SavedPalettesSectionProps {
  palettes: Palette[];
  onLoad: (palette: Palette) => void;
  onDelete: (index: number, e: React.MouseEvent) => void;
}

// SavedPalettesSection Component
export function SavedPalettesSection({
  palettes,
  onLoad,
  onDelete,
}: SavedPalettesSectionProps) {
  if (palettes.length === 0) return null;

  return (
    <article className="w-full max-w-4xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Saved Palettes</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {palettes.map((savedPalette, index) => (
          <div
            key={index}
            className="border rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow relative group"
            onClick={() => onLoad(savedPalette)}
          >
            <div className="flex h-16">
              {savedPalette.map((color, i) => (
                <div
                  key={i}
                  className="flex-1 h-full"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <button
              onClick={(e) => onDelete(index, e)}
              className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 text-red-500 shadow-sm"
              aria-label="Delete palette"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </article>
  );
}
