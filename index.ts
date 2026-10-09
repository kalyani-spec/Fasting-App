import notifee from '@notifee/react-native';
import { handleNotificationEvent } from './src/lib/notifications';

// Must be registered before the app renders so "+ Water" / "+ Chaas" work
// from the lock screen while the app is killed or backgrounded.
notifee.onBackgroundEvent(handleNotificationEvent);

import 'expo-router/entry';
