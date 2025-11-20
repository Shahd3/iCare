import AsyncStorage from "@react-native-async-storage/async-storage";
import { applyTaken as banditApplyTaken } from "../RL/bandit";

// generate date in a format
export const todayKey = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export function hasTakenToday(reminder) {
  const key = todayKey();
  return Array.isArray(reminder.history) &&
         reminder.history.some((h) => h?.date === key);
}

// main function
export async function markReminderTakenById(reminderIdOrName) {
  const stored = await AsyncStorage.getItem("reminders");
  const list = stored ? JSON.parse(stored) : [];

  const idx = list.findIndex(
    (x) => (x.id ?? x.medName) === reminderIdOrName
  );
  if (idx === -1) {
    return { reminders: list, changed: false };
  }

  const reminder = list[idx];
  if (!Array.isArray(reminder.history)) reminder.history = [];

  const key = todayKey();
  const already = reminder.history.some((h) => h?.date === key);

  
  if (already) {
    reminder.history = reminder.history.filter((h) => h?.date !== key);
    list[idx] = reminder;
    await AsyncStorage.setItem("reminders", JSON.stringify(list));
    return { reminders: list, changed: true, toggledOff: true };
  }

  
  reminder.history.push({
    date: key,
    ts: Date.now(),
    scheduled: reminder.time || "--:--",
    offset: reminder.currentOffsetMin ?? 0,
    reward: null,
  });

  // call RL bandit
  const { reward, suggested, offset } = await banditApplyTaken(reminder);

  // update today's record with RL info
  const rec = reminder.history.find((e) => e?.date === key);
  if (rec) {
    rec.scheduled = suggested ?? (reminder.time || "--:--");
    rec.offset = offset ?? 0;
    rec.reward = reward ?? 0;
  }

  list[idx] = reminder;
  await AsyncStorage.setItem("reminders", JSON.stringify(list));

  return {
    reminders: list,
    changed: true,
    toggledOff: false,
    reward,
    suggested,
    offset,
  };
}
