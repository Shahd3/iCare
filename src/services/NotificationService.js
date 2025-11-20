import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { markReminderTakenById } from "./ReminderService";

Notifications.setNotificationHandler({
 handleNotification: async () => ({
    shouldShowAlert: true,   
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

//initialize the notification 
export async function initNotifications() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("reminders", {
      name: "Medication reminders",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FFFFFF",
    });
  }

  //getting premisiion
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.warn("Notifications permission not granted");
    return false;
  }

  return true;
}

const DAY_NAME_TO_JS_INDEX = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};


function getNextOccurrence(dayName, hour, minute, weekOffset = 0) {
  const targetDow = DAY_NAME_TO_JS_INDEX[dayName];
  if (targetDow == null) throw new Error(`Invalid dayName: ${dayName}`);

  const now = new Date();
  const date = new Date(now);

  const currentDow = now.getDay(); 
  let deltaDays = (targetDow - currentDow + 7) % 7; //how many days to add

  // base date for this weekday
  date.setDate(now.getDate() + deltaDays + weekOffset * 7);
  date.setHours(hour, minute, 0, 0);

  // ensure correct date (future)
  if (date <= now) {
    date.setDate(date.getDate() + 7);
  }

  return date;
}

export async function scheduleReminderNotifications(reminder) {
  const { id, name, dosage, hour, minute, days } = reminder;
  const notificationIds = [];

  for (const dayName of days) {
    for (let weekOffset = 0; weekOffset < 10; weekOffset++) {
      const triggerDate = getNextOccurrence(dayName, hour, minute, weekOffset);

      const notifId = await Notifications.scheduleNotificationAsync({
        content: {
          title: name || "Medication reminder",
          body: dosage ? `${dosage} · Tap when taken` : "Tap when taken",
          data: {
            reminderId: id,
            dayName,
          },
        },
        trigger: triggerDate, 
      });

      notificationIds.push(notifId);
    }
  }

  return notificationIds; 
}

//mark taken when taped
export function registerNotificationTapListener() {
  const sub = Notifications.addNotificationResponseReceivedListener(
    async (response) => {
      try {
        const data = response.notification.request.content.data;
        const reminderId = data?.reminderId;
        if (!reminderId) return;

        await markReminderTakenById(reminderId);
      } catch (e) {
        console.warn("Failed to handle notification tap:", e);
      }
    }
  );
  return sub;
}


//cancel 
export async function cancelReminderNotifications(reminder) {
  if (!reminder?.notificationIds) return;

  for (const notifId of reminder.notificationIds) {
    try {
      await Notifications.cancelScheduledNotificationAsync(notifId);
    } catch (e) {
      console.warn("Failed to cancel notification", notifId, e);
    }
  }
}

