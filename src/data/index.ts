// Import all .svg files in the folder as raw strings
const modules = import.meta.glob('./kanji/*.svg', { as: 'raw', eager: true });

// Object to map "日" → "<svg>...</svg>" format
export const kanjiSVGs: Record<string, string> = {};

// Convert "./kanji/065e5.svg" → "065e5" → "日"
for (const path in modules) {
  const filename = path.split('/').pop()?.replace('.svg', '');
  if (!filename) continue;

  try {
    // Convert filename (hexadecimal) → Unicode character
    const codepoint = parseInt(filename, 16);
    const char = String.fromCodePoint(codepoint);
    kanjiSVGs[char] = modules[path] as string;
  } catch (err) {
    console.warn(`Failed to parse ${filename}`, err);
  }
}

export const getKanjiSVG = (char: string): string | undefined => kanjiSVGs[char];
