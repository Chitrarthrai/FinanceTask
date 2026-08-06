import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

// Configure default notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Requests push and local notification permissions from the OS
 */
export const requestNotificationPermissions = async (): Promise<boolean> => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return false;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('task_alarms', {
        name: 'Task Alarm Notifications',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#00F2FF',
      });
    }

    return true;
  } catch (error) {
    console.warn('Notifications permission error:', error);
    return false;
  }
};

/**
 * Schedules a task alarm reminder notification
 */
export const scheduleTaskAlarm = async (
  title: string,
  body: string,
  triggerDate: Date
): Promise<string | null> => {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return null;

    const secondsFromNow = Math.max(5, Math.floor((triggerDate.getTime() - Date.now()) / 1000));

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: `⏰ ${title}`,
        body,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data: { type: 'task_alarm', title },
      },
      trigger: {
        type: 'timeInterval',
        seconds: secondsFromNow,
        repeats: false,
      } as any,
    });

    return notificationId;
  } catch (error) {
    console.error('Error scheduling task alarm:', error);
    return null;
  }
};

/**
 * Cancels a scheduled task alarm notification
 */
export const cancelScheduledAlarm = async (notificationId: string): Promise<void> => {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.error('Error canceling notification:', error);
  }
};

/**
 * Registers device for push notifications and returns EAS / Expo Push Token
 */
export const registerForPushNotificationsAsync = async (): Promise<string | null> => {
  try {
    if (!Device.isDevice) {
      console.log('Must use physical device for Push Notifications');
      return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Push notification permissions denied');
      return null;
    }

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;

    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId,
    });
    
    return tokenData.data;
  } catch (error) {
    console.error('Error getting push token:', error);
    return null;
  }
};
