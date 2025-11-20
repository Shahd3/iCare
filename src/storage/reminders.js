import AsyncStorage from "@react-native-async-storage/async-storage";

const REMINDERS_KEY = "reminders";

export async function loadReminders() {
  const json = await AsyncStorage.getItem(REMINDERS_KEY);
  if (!json) return [];
  try {
    return JSON.parse(json);
  } catch {
    return [];
  }
}

export async function saveReminders(reminders) {
  await AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
}

export async function upsertReminder(reminder) {
  const reminders = await loadReminders();
  const idx = reminders.findIndex((r) => r.id === reminder.id);

  if (idx === -1) reminders.push(reminder);
  else reminders[idx] = reminder;

  await saveReminders(reminders);
}

