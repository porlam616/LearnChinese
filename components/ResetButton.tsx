'use client';

import { useState } from 'react';

export default function ResetButton({ onReset }: { onReset: () => void }) {
  const [confirming, setConfirming] = useState(false);
  const [resetting, setResetting] = useState(false);

  async function handleConfirm() {
    setResetting(true);
    await fetch('/api/reset-progress', { method: 'POST' });
    setResetting(false);
    setConfirming(false);
    onReset();
  }

  if (confirming) {
    return (
      <div className="border border-red-200 bg-red-50 rounded-lg p-4 flex flex-col gap-3">
        <p className="text-sm text-red-700">
          確定要重設所有進度嗎？這會將全部詞語的閱讀和拼寫進度歸零，並清空商店中已購買的裝備和金幣，無法復原。
        </p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setConfirming(false)}
            className="border rounded-lg py-2 text-sm"
            disabled={resetting}
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            className="bg-red-600 text-white rounded-lg py-2 text-sm"
            disabled={resetting}
          >
            {resetting ? '重設中…' : '確定重設'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-sm text-red-600 underline self-start"
    >
      重設所有進度
    </button>
  );
}
