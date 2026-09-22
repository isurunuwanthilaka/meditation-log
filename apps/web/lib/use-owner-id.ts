"use client";

import { useState } from "react";

const OWNER_STORAGE_KEY = "meditation-log-owner-id";

export function useOwnerId(): string | null {
  const [ownerId] = useState<string | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    const existing = window.localStorage.getItem(OWNER_STORAGE_KEY);
    if (existing) {
      return existing;
    }

    const created = crypto.randomUUID();
    window.localStorage.setItem(OWNER_STORAGE_KEY, created);
    return created;
  });

  return ownerId;
}
