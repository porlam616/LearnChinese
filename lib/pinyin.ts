// Strips tone marks and normalizes spacing/case so typed pinyin can be
// checked "toneless" against the stored (toned) pinyin, per the agreed
// behavior: auto-accept toneless input, then show the correct tone after.

const TONE_MAP: Record<string, string> = {
  ā: 'a', á: 'a', ǎ: 'a', à: 'a',
  ē: 'e', é: 'e', ě: 'e', è: 'e',
  ī: 'i', í: 'i', ǐ: 'i', ì: 'i',
  ō: 'o', ó: 'o', ǒ: 'o', ò: 'o',
  ū: 'u', ú: 'u', ǔ: 'u', ù: 'u',
  ǖ: 'v', ǘ: 'v', ǚ: 'v', ǜ: 'v', ü: 'v',
};

export function stripTones(input: string): string {
  return input
    .toLowerCase()
    .split('')
    .map((ch) => TONE_MAP[ch] ?? ch)
    .join('')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Compares a typed pinyin answer against the stored toned pinyin,
 * ignoring tone marks entirely. Returns true if the toneless forms match.
 */
export function isToneMatchIgnoringTones(typed: string, storedPinyin: string): boolean {
  return stripTones(typed) === stripTones(storedPinyin);
}
