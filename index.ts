import notifee from '@notifee/react-native';
import { registerWidgetTaskHandler } from 'react-native-android-widget';
import { handleNotificationEvent } from './src/lib/surfaces';
import { widgetTaskHandler } from './src/widget/taskHandler';

// Both must be registered before the app renders so "+ Water" / "+ Chaas"
// work from the lock screen and the widget while the app is killed.
notifee.onBackgroundEvent(handleNotificationEvent);
registerWidgetTaskHandler(widgetTaskHandler);

import 'expo-router/entry';
