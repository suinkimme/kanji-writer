// Lazy import: Only load SVG files when needed
const modules = import.meta.glob('./kanji/*.svg', { as: 'raw', eager: false });

// Cache for already loaded SVGs
const kanjiSVGCache: Record<string, string> = {};

// Convert Unicode character to hex filename
const charToHex = (char: string): string => {
  const codepoint = char.codePointAt(0);
  if (!codepoint) return '';
  return codepoint.toString(16).padStart(5, '0');
};

// Get SVG for a kanji character (lazy load)
export const getKanjiSVG = async (char: string): Promise<string | undefined> => {
  // Return from cache if already loaded
  if (kanjiSVGCache[char]) {
    return kanjiSVGCache[char];
  }

  // Convert character to hex filename
  const hex = charToHex(char);
  const path = `./kanji/${hex}.svg`;

  // Check if the file exists in the glob pattern
  if (!(path in modules)) {
    return undefined;
  }

  try {
    // Dynamically import the SVG file
    const svg = (await modules[path]()) as string;
    kanjiSVGCache[char] = svg;
    return svg;
  } catch (err) {
    console.warn(`Failed to load SVG for ${char} (${hex})`, err);
    return undefined;
  }
};
