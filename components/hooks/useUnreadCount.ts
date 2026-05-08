"use client";

import { useState } from "react";

// 🔴 Hook ahora completamente estático
export function useUnreadCount(_user: any) {
  const [unreadCount] = useState<number>(0);
  const [loading] = useState<boolean>(false);

  return { unreadCount, refreshCount: () => {}, loading };
}