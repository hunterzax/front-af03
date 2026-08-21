"use client";

import { useEffect, useState } from "react";

const KEY = "app_active_tabs_v1";
const KEY_HAS_OPENED = "app_has_opened_before_v1";

const HEARTBEAT_MS = 2000;
const STALE_MS = 8000;

type TabMap = Record<string, number>;

function safeParse(s: string | null): TabMap {
  if (!s) return {};
  try {
    const obj = JSON.parse(s);
    return obj && typeof obj === "object" ? (obj as TabMap) : {};
  } catch {
    return {};
  }
}

function getOrCreateTabId() {
  const k = "tab_id_v1";
  let id = sessionStorage.getItem(k);
  if (!id) {
    id = (crypto?.randomUUID?.() ?? `${Date.now()}_${Math.random()}`).toString();
    sessionStorage.setItem(k, id);
  }
  return id;
}

export function useTabCount() {
  const [tabCount, setTabCount] = useState(1);
  const [ready, setReady] = useState(false);

  // (1) เคยเปิดเว็บนี้มาก่อนมั้ย (persist ข้ามปิด browser)
  const [isFirstEverInThisBrowser, setIsFirstEverInThisBrowser] = useState(false);

  // (2) ตอนนี้เป็น “แท็บแรก” ของเว็บเราที่เปิดอยู่มั้ย (ไม่มี tab อื่นค้าง)
  const [isFirstActiveTabNow, setIsFirstActiveTabNow] = useState(false);

  useEffect(() => {
    const tabId = getOrCreateTabId();

    // เช็ค "เคยเปิดเว็บนี้มาก่อนไหม"
    const ever = localStorage.getItem(KEY_HAS_OPENED);
    if (!ever) {
      setIsFirstEverInThisBrowser(true);
      localStorage.setItem(KEY_HAS_OPENED, "1");
    }

    const writeHeartbeat = () => {
      const now = Date.now();
      const map = safeParse(localStorage.getItem(KEY));

      // cleanup stale
      for (const [id, ts] of Object.entries(map)) {
        if (typeof ts !== "number" || now - ts > STALE_MS) delete map[id];
      }

      // ถ้าหลัง cleanup แล้วว่าง => เราคือแท็บแรก “ตอนนี้”
      const emptyBeforeJoin = Object.keys(map).length === 0;
      setIsFirstActiveTabNow(emptyBeforeJoin);

      map[tabId] = now;
      localStorage.setItem(KEY, JSON.stringify(map));

      setTabCount(Object.keys(map).length || 1);
      setReady(true);
    };

    const removeMe = () => {
      const map = safeParse(localStorage.getItem(KEY));
      delete map[tabId];
      localStorage.setItem(KEY, JSON.stringify(map));
    };

    writeHeartbeat();
    const timer = window.setInterval(writeHeartbeat, HEARTBEAT_MS);

    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) {
        const now = Date.now();
        const map = safeParse(e.newValue);

        for (const [id, ts] of Object.entries(map)) {
          if (typeof ts !== "number" || now - ts > STALE_MS) delete map[id];
        }
        setTabCount(Object.keys(map).length || 1);
      }
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("beforeunload", removeMe);
    window.addEventListener("pagehide", removeMe);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("beforeunload", removeMe);
      window.removeEventListener("pagehide", removeMe);
      removeMe();
    };
  }, []);

  return { tabCount, ready, isFirstActiveTabNow, isFirstEverInThisBrowser };
}
