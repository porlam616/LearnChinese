'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { ItemCategory, ShopItem } from '@/lib/types';
import { getItemIcon } from '@/lib/itemIcons';

const CATEGORIES: ItemCategory[] = ['武器', '工具', '防具', '裝飾'];

export default function ShopPage() {
  const [items, setItems] = useState<ShopItem[]>([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [busyId, setBusyId] = useState<number | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch('/api/shop');
    const data = await res.json();
    setItems(data.items ?? []);
    setBalance(data.balance ?? 0);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-mount
    void load();
  }, []);

  async function buy(item: ShopItem) {
    setBusyId(item.id);
    setMessage('');
    const res = await fetch('/api/shop/buy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item_id: item.id }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error === '金幣不足' ? '金幣不足，再多練習賺取金幣吧！' : data.error);
    }
    setBusyId(null);
    await load();
  }

  async function toggleEquip(item: ShopItem) {
    setBusyId(item.id);
    await fetch('/api/shop/equip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item_id: item.id, equip: !item.equipped }),
    });
    setBusyId(null);
    await load();
  }

  return (
    <main className="min-h-screen bg-neutral-50 py-10 px-4">
      <div className="max-w-md mx-auto flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">商店</h1>
          <Link href="/dashboard" className="text-sm text-neutral-500 underline">
            ← 回到進度總覽
          </Link>
        </div>

        <div className="bg-white rounded-xl border p-4 flex justify-between items-center">
          <span className="text-sm text-neutral-500">目前金幣</span>
          <span className="text-lg font-semibold">🪙 {balance}</span>
        </div>

        {message && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{message}</p>
        )}

        {loading && <p className="text-neutral-400 text-sm">載入中…</p>}

        {!loading &&
          CATEGORIES.map((category) => {
            const categoryItems = items.filter((i) => i.category === category);
            if (categoryItems.length === 0) return null;
            return (
              <section key={category} className="flex flex-col gap-2">
                <h2 className="text-sm font-medium text-neutral-500">{category}</h2>
                <div className="flex flex-col gap-2">
                  {categoryItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-lg border p-3 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getItemIcon(item.name_zh, item.category)}</span>
                        <div>
                          <p className="font-medium text-sm">{item.name_zh}</p>
                          <p className="text-xs text-neutral-400">
                            {item.name_en} · 🪙 {item.price}
                          </p>
                        </div>
                      </div>
                      {!item.owned && (
                        <button
                          onClick={() => buy(item)}
                          disabled={busyId === item.id || balance < item.price}
                          className="text-xs bg-black text-white rounded-lg px-3 py-1.5 disabled:opacity-40 whitespace-nowrap"
                        >
                          購買
                        </button>
                      )}
                      {item.owned && (
                        <button
                          onClick={() => toggleEquip(item)}
                          disabled={busyId === item.id}
                          className={`text-xs rounded-lg px-3 py-1.5 whitespace-nowrap ${
                            item.equipped
                              ? 'bg-green-600 text-white'
                              : 'border text-neutral-600'
                          }`}
                        >
                          {item.equipped ? '已裝備' : '裝備'}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
      </div>
    </main>
  );
}
