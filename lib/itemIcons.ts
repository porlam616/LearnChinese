import type { ItemCategory } from './types';

// Emoji icons for the 50-item starter catalog, keyed by name_zh.
// Falls back to a generic per-category icon for any item added later.
const ITEM_ICONS: Record<string, string> = {
  // 武器 Weapons
  木劍: '🗡️', 石劍: '🗡️', 鐵劍: '⚔️', 金劍: '⚔️', 鑽石劍: '⚔️',
  木斧: '🪓', 石斧: '🪓', 鐵斧: '🪓',
  短弓: '🏹', 長弓: '🏹',
  // 工具 Tools
  木鎬: '⛏️', 石鎬: '⛏️', 鐵鎬: '⛏️', 金鎬: '⛏️', 鑽石鎬: '⛏️',
  木鏟: '🥄', 鐵鏟: '🥄',
  釣魚竿: '🎣', 剪刀: '✂️', 打火石: '🔥',
  // 防具 Armor
  皮革頭盔: '🪖', 鐵頭盔: '⛑️', 金頭盔: '⛑️', 鑽石頭盔: '💠',
  皮革胸甲: '🦺', 鐵胸甲: '🦺', 金胸甲: '🦺', 鑽石胸甲: '🦺',
  皮革護腿: '👖', 鐵護腿: '👖',
  皮革靴子: '👢', 鐵靴子: '👢',
  // 裝飾 Decoration
  紅色披風: '🧣', 藍色披風: '🧣', 金色披風: '🧣',
  牛仔帽: '🤠', 巫師帽: '🧙', 皇冠: '👑',
  太陽眼鏡: '🕶️', 圍巾: '🧣', 背包裝飾: '🎒',
  火把: '🔦', 燈籠: '🏮', 盆栽: '🪴',
  旗幟: '🚩', 徽章: '🎖️', 氣球: '🎈', 風箏: '🪁',
  '寵物蛋（小狼）': '🐺', '寵物蛋（小貓）': '🐱',
};

const CATEGORY_FALLBACK: Record<ItemCategory, string> = {
  武器: '⚔️',
  工具: '🛠️',
  防具: '🛡️',
  裝飾: '✨',
};

export function getItemIcon(nameZh: string, category: ItemCategory): string {
  return ITEM_ICONS[nameZh] ?? CATEGORY_FALLBACK[category];
}
