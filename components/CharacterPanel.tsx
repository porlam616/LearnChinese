'use client';

import Link from 'next/link';
import type { ShopItem } from '@/lib/types';
import { getItemIcon } from '@/lib/itemIcons';

const ARMOR_TIER_COLOR: Array<[string, string]> = [
  ['鑽石', 'bg-cyan-100 border-cyan-400'],
  ['金', 'bg-yellow-100 border-yellow-400'],
  ['鐵', 'bg-neutral-200 border-neutral-400'],
  ['皮革', 'bg-amber-100 border-amber-400'],
];

function armorColor(item?: ShopItem) {
  if (!item) return 'bg-blue-100 border-blue-300';
  const match = ARMOR_TIER_COLOR.find(([prefix]) => item.name_zh.startsWith(prefix));
  return match ? match[1] : 'bg-blue-100 border-blue-300';
}

export default function CharacterPanel({
  balance,
  equipped,
}: {
  balance: number;
  equipped: ShopItem[];
}) {
  const bySlot = new Map(equipped.map((item) => [item.category, item]));
  const weapon = bySlot.get('武器');
  const tool = bySlot.get('工具');
  const armor = bySlot.get('防具');
  const deco = bySlot.get('裝飾');

  return (
    <section className="bg-white rounded-xl border p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-neutral-500">我的角色</h2>
        <span className="text-sm font-semibold">🪙 {balance} 金幣</span>
      </div>

      {/* Blocky/voxel-style character silhouette (original design, not any
          specific copyrighted character) with equipped items shown as icons
          in their body position. */}
      <div className="relative flex flex-col items-center py-6">
        {deco && (
          <span className="absolute -top-1 text-2xl" title={deco.name_zh}>
            {getItemIcon(deco.name_zh, '裝飾')}
          </span>
        )}

        <div className="w-10 h-10 bg-amber-200 border-2 border-amber-400 rounded-sm mt-6" />

        <div className="flex items-center gap-1">
          <div className="w-8 h-16 flex items-center justify-center text-xl">
            {weapon ? getItemIcon(weapon.name_zh, '武器') : ''}
          </div>
          <div
            className={`w-14 h-16 border-2 rounded-sm flex items-center justify-center text-2xl ${armorColor(
              armor
            )}`}
          >
            {armor ? getItemIcon(armor.name_zh, '防具') : ''}
          </div>
          <div className="w-8 h-16 flex items-center justify-center text-xl">
            {tool ? getItemIcon(tool.name_zh, '工具') : ''}
          </div>
        </div>

        <div className="flex gap-2">
          <div className="w-5 h-14 bg-blue-100 border-2 border-blue-300 rounded-sm" />
          <div className="w-5 h-14 bg-blue-100 border-2 border-blue-300 rounded-sm" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        {([
          ['武器', weapon],
          ['防具', armor],
          ['工具', tool],
          ['裝飾', deco],
        ] as const).map(([slot, item]) => (
          <div key={slot} className="border rounded-lg px-2 py-1.5 flex items-center gap-1.5">
            <span className="text-base">
              {item ? getItemIcon(item.name_zh, slot) : '·'}
            </span>
            <div>
              <p className="text-neutral-400">{slot}</p>
              <p className="font-medium">{item ? item.name_zh : '（無）'}</p>
            </div>
          </div>
        ))}
      </div>

      <Link
        href="/shop"
        className="text-sm text-center border rounded-lg py-2 font-medium"
      >
        🛒 前往商店
      </Link>
    </section>
  );
}
