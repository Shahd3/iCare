// src/services/NotificationService.js
import * as Notifications from "expo-notifications";
import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// —— constants ——
const CHANNEL_ID = "default";
const RESCHED_TASK = "icare.reschedule.reminders";

// —— utils ——
function parseTimeStringToHM(t) {
  if (!t) return null;
  const m = t.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return null;
  let hh = parseInt(m[1], 10) % 12;
  if (m[3].toUpperCase() === "PM") hh += 12;
  const minute = parseInt(m[2], 10);
  return { hour: hh, minute };
}

async function ensureChannel() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: "Reminders",
      importance: Notifications.AndroidImportance.HIGH,
      sound: "default",
      vibrationPattern: [0, 250, 250, 250],
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });
  }
}

// —— core API ——
export const NotificationService = {
  /**
   * Call once in App bootstrap.
   */
  async init() {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    const { status } = await Notifications.requestPermissionsAsync();
    // even if not granted, continue (UI can prompt user later)
    await ensureChannel();
  },

  /**
   * Schedule ONE daily reminder at hh:mm local time.
   * Returns identifier string; store it on the reminder.
   */
  async scheduleDaily({ title, body, timeStr }) {
    const hm = parseTimeStringToHM(timeStr);
    if (!hm) throw new Error("Invalid time string");
    await ensureChannel();
    return Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: "default",
        priority:
          Platform.OS === "android"
            ? Notifications.AndroidNotificationPriority.HIGH
            : undefined,
      },
      trigger: { hour: hm.hour, minute: hm.minute, repeats: true },
    });
  },

  /**
   * Schedule WEEKDAY reminders (Mon, Tue, ...).
   * days: array like ["Mon","Wed","Fri"]
   * Returns array of identifiers.
   */
  async scheduleWeekly({ title, body, timeStr, days }) {
    const hm = parseTimeStringToHM(timeStr);
    if (!hm) throw new Error("Invalid time string");
    await ensureChannel();
    const MAP = { Sun: 1, Mon: 2, Tue: 3, Wed: 4, Thu: 5, Fri: 6, Sat: 7 };
    const ids = [];
    for (const d of days || []) {
      const weekday = MAP[d];
      if (!weekday) continue;
      const id = await Notifications.scheduleNotificationAsync({
        content: { title, body, sound: "default" },
        trigger: { weekday, hour: hm.hour, minute: hm.minute, repeats: true },
      });
      ids.push(id);
    }
    return ids;
  },

  async cancel(id) {
    if (!id) return;
    try { await Notifications.cancelScheduledNotificationAsync(id); } catch {}
  },

  async cancelMany(ids = []) {
    for (const id of ids) {
      try { await Notifications.cancelScheduledNotificationAsync(id); } catch {}
    }
  },

  /**
   * Ensure every saved reminder has an active schedule.
   * Works for reminders with either `notificationId` (daily) or `notificationIds` (weekly).
   */
  async ensureFromStorage() {
    const raw = await AsyncStorage.getItem("reminders");
    const reminders = raw ? JSON.parse(raw) : [];

    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const existingIds = new Set(scheduled.map(n => n.identifier));

    let changed = false;

    for (const r of reminders) {
      const title = `Time for ${r.medName}`;
      const body = r.dosage ? `${r.dosage} — tap when taken.` : "It's medication time.";

      const hasWeekly = Array.isArray(r.notificationIds);
      const hasDaily = !!r.notificationId;

      // DAILY
      if (!hasWeekly) {
        const ok = r.notificationId && existingIds.has(r.notificationId);
        if (!ok && r.time) {
          const id = await this.scheduleDaily({ title, body, timeStr: r.time });
          if (id) { r.notificationId = id; changed = true; }
        }
      }

      // WEEKLY
      if (hasWeekly && r.time && r.days?.length) {
        const stillActive = (r.notificationIds || []).every(id => existingIds.has(id));
        if (!stillActive) {
          await this.cancelMany(r.notificationIds || []);
          const ids = await this.scheduleWeekly({ title, body, timeStr: r.time, days: r.days });
          r.notificationIds = ids;
          changed = true;
        }
      }
    }

    if (changed) {
      await AsyncStorage.setItem("reminders", JSON.stringify(reminders));
    }
  },

  /**
   * Register a periodic background fetch that re-ensures schedules.
   * (Runs roughly every 15 min on Android in a dev/production build.)
   */
  async registerBackgroundRescheduler() {
    // Define the task (idempotent)
    if (!TaskManager.isTaskDefined(RESCHED_TASK)) {
      TaskManager.defineTask(RESCHED_TASK, async () => {
        try {
          await NotificationService.ensureFromStorage();
          return BackgroundFetch.BackgroundFetchResult.NewData;
        } catch {
          return BackgroundFetch.BackgroundFetchResult.Failed;
        }
      });
    }

    // Register (idempotent)
    await BackgroundFetch.registerTaskAsync(RESCHED_TASK, {
      minimumInterval: 15 * 60, // 15 minutes
      stopOnTerminate: false,
      startOnBoot: true,
    });
  },
};
