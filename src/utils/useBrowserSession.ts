"use client";

import { useEffect, useState } from "react";

const TABS_KEY = "app_active_tabs_v1";
const SESSION_KEY = "app_browser_session_v1";

const HEARTBEAT_MS = 2000;     // ยิง heartbeat ทุก 2 วิ
const TAB_STALE_MS = 8000;     // เกิน 8 วิถือว่าแท็บตาย
const SESSION_GAP_MS = 20000;  // ถ้า lastSeen ห่างเกิน 20 วิ ถือว่า “session จบ” (ปรับได้)

type TabMap = Record<string, number>;
type SessionObj = { id: string; lastSeen: number };

function safeParse<T>(s: string | null, fallback: T): T {
  if (!s) return fallback;
  try {
    return JSON.parse(s) as T;
  } catch {
    return fallback;
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

function getNavType(): "navigate" | "reload" | "back_forward" | "prerender" {
  const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
  if (nav?.type) return nav.type;
  const legacy = (performance as any).navigation?.type;
  return legacy === 1 ? "reload" : "navigate";
}

export function useBrowserSession() {
  const [tabCount, setTabCount] = useState(1);
  const [isFirstTabAfterBrowserRestart, setIsFirstTabAfterBrowserRestart] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const tabId = getOrCreateTabId();

    // กัน dev strict-mode mount ซ้ำ + กัน refresh
    const BOOT_KEY = "tab_booted_v1";
    const isFreshTabOpen = !sessionStorage.getItem(BOOT_KEY);
    if (isFreshTabOpen) sessionStorage.setItem(BOOT_KEY, "1");

    const navType = getNavType();
    const isNotReload = navType !== "reload";

    const now = Date.now();

    const cleanupTabs = (map: TabMap) => {
      const out: TabMap = { ...map };
      for (const [id, ts] of Object.entries(out)) {
        if (typeof ts !== "number" || now - ts > TAB_STALE_MS) delete out[id];
      }
      return out;
    };

    const readTabs = () => cleanupTabs(safeParse<TabMap>(localStorage.getItem(TABS_KEY), {}));
    const readSession = () => safeParse<SessionObj | null>(localStorage.getItem(SESSION_KEY), null);

    const writeAll = (tabs: TabMap, session: SessionObj | null) => {
      localStorage.setItem(TABS_KEY, JSON.stringify(tabs));
      if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      else localStorage.removeItem(SESSION_KEY);
      setTabCount(Math.max(1, Object.keys(tabs).length));
    };

    // --- init ---
    let tabs = readTabs();
    let session = readSession();

    const sessionExpired = !session || now - session.lastSeen > SESSION_GAP_MS;
    const noActiveTabs = Object.keys(tabs).length === 0;

    // “ครั้งแรกหลังปิด browser ทั้งหมดแล้วเปิดใหม่” (สำหรับเว็บเรา)
    const firstOfNewSession = (sessionExpired || noActiveTabs) && isFreshTabOpen && isNotReload;

    // ถ้าเป็น session ใหม่ → สร้าง sessionId ใหม่
    if (sessionExpired || noActiveTabs) {
      session = { id: (crypto?.randomUUID?.() ?? `${now}_${Math.random()}`).toString(), lastSeen: now };
    }

    // register tab
    tabs[tabId] = now;
    session!.lastSeen = now;

    writeAll(tabs, session);
    setIsFirstTabAfterBrowserRestart(firstOfNewSession);
    setReady(true);

    // --- heartbeat ---
    const tick = () => {
      const t = Date.now();
      let tabs2 = cleanupTabs(safeParse<TabMap>(localStorage.getItem(TABS_KEY), {}));
      let session2 = safeParse<SessionObj | null>(localStorage.getItem(SESSION_KEY), null);

      // ถ้า session หายไป (แท็บสุดท้ายเคยล้าง) ให้สร้างใหม่ แต่ไม่ถือว่า “first” แล้ว เพราะไม่ใช่ init
      if (!session2) session2 = { id: (crypto?.randomUUID?.() ?? `${t}_${Math.random()}`).toString(), lastSeen: t };

      tabs2[tabId] = t;
      session2.lastSeen = t;

      writeAll(tabs2, session2);
    };

    const timer = window.setInterval(tick, HEARTBEAT_MS);

    // --- remove tab ---
    const removeMe = () => {
      const t = Date.now();
      let tabs3 = cleanupTabs(safeParse<TabMap>(localStorage.getItem(TABS_KEY), {}));
      delete tabs3[tabId];

      // cleanup อีกรอบ
      const tabsClean = (() => {
        const out: TabMap = { ...tabs3 };
        for (const [id, ts] of Object.entries(out)) {
          if (typeof ts !== "number" || t - ts > TAB_STALE_MS) delete out[id];
        }
        return out;
      })();

      // ถ้าไม่มีแท็บเหลือ → ล้าง session (นี่แหละ “ปิด browser หมดแล้ว” ในมุมเว็บเรา)
      if (Object.keys(tabsClean).length === 0) {
        localStorage.setItem(TABS_KEY, JSON.stringify({}));
        localStorage.removeItem(SESSION_KEY);
      } else {
        localStorage.setItem(TABS_KEY, JSON.stringify(tabsClean));
      }
    };

    const onStorage = (e: StorageEvent) => {
      if (e.key === TABS_KEY && e.newValue) {
        const m = safeParse<TabMap>(e.newValue, {});
        setTabCount(Math.max(1, Object.keys(m).length));
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

  return { tabCount, isFirstTabAfterBrowserRestart, ready };
}
