
import { openDB } from "idb";

const DB_NAME = "notify-db";
const DB_VERSION = 1;
const STORE_NAME = "notifications";

const getDb = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: "id",
        });

        store.createIndex("createdAt", "createdAt");
      }
    },
  });
};

export const getStoredNotifications = async () => {
  const db = await getDb();
  const notis = await db.getAll(STORE_NAME);

  return notis.sort((a: any, b: any) => {
    const aTime = new Date(a.createdAt || a.date || a.timestamp || 0).getTime();
    const bTime = new Date(b.createdAt || b.date || b.timestamp || 0).getTime();

    return bTime - aTime;
  });
};

export const getStoredNotificationsPage = async (page = 1, limit = 10) => {
  const db = await getDb();

  const total = await db.count(STORE_NAME);
  const offset = (page - 1) * limit;

  const rows: any[] = [];
  let skipped = 0;

  const tx = db.transaction(STORE_NAME, "readonly");
  const store = tx.objectStore(STORE_NAME);

  let cursor = await store.openCursor();

  while (cursor) {
    if (skipped < offset) {
      skipped++;
      cursor = await cursor.continue();
      continue;
    }

    if (rows.length < limit) {
      rows.push(cursor.value);
      cursor = await cursor.continue();
    } else {
      break;
    }
  }

  await tx.done;

  return {
    data: rows,
    total,
    page,
    limit,
    totalPage: Math.ceil(total / limit),
  };
};

export const storeNotification = async (notification: any) => {
  const db = await getDb();

  const alreadyExist = await db.get(STORE_NAME, notification.id);

  if (!alreadyExist) {
    await db.put(STORE_NAME, {
      ...notification,
      isRead: false,
      createdAt: notification.createdAt || notification.date || new Date().toISOString(),
    });
  }
};

export const storeNotificationList = async (notifications: any[]) => {
  const db = await getDb();

  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);

  for (const notification of notifications) {
    const alreadyExist = await store.get(notification.id);

    if (!alreadyExist) {
      await store.put({
        ...notification,
        isRead: false,
        createdAt: notification.createdAt || notification.date || new Date().toISOString(),
      });
    }
  }

  await tx.done;
};

export const markAsRead = async (notificationIds: any[]) => {
  const db = await getDb();

  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);

  for (const id of notificationIds) {
    const noti = await store.get(id);

    if (noti) {
      await store.put({
        ...noti,
        isRead: true,
      });
    }
  }

  await tx.done;
};

export const markAllAsRead = async () => {
  const db = await getDb();

  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);

  let cursor = await store.openCursor();

  while (cursor) {
    await cursor.update({
      ...cursor.value,
      isRead: true,
    });

    cursor = await cursor.continue();
  }

  await tx.done;
};

export const clearNotifications = async () => {
  const db = await getDb();
  await db.clear(STORE_NAME);
};