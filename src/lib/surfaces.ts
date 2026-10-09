import notifee, { EventType, type Event } from '@notifee/react-native';
import { ACTION_CHAAS, ACTION_WATER, MILESTONE_PREFIX, NUDGE_PREFIX, cancelAll, showOngoing, syncNotifications } from './notifications';
import { addDrink, getActive } from './store';
import type { DrinkType } from './types';
import { updateWidget } from '../widget/update';

/**
 * Everything outside the app that shows the fast: the lock-screen notification
 * and the home-screen widget. Call after any change.
 */
export async function refreshSurfaces() {
  const active = await getActive();
  try {
    if (active) await showOngoing(active);
    else await notifee.cancelNotification('fast-ongoing');
  } catch (e) {
    console.warn('Ongoing notification refresh failed', e);
  }
  await updateWidget();
}

/** App open/foreground: re-post notification, (re)schedule triggers, redraw widget. */
export async function syncSurfaces() {
  await syncNotifications().catch((e) => console.warn('Notification sync failed', e));
  await updateWidget();
}

export async function clearSurfaces() {
  await cancelAll().catch((e) => console.warn('Cancel notifications failed', e));
  await updateWidget();
}

export async function logDrink(type: DrinkType) {
  await addDrink(type);
  await refreshSurfaces();
}

/**
 * Shared handler for notification events — used by both onBackgroundEvent
 * (index.ts) and onForegroundEvent (root layout).
 */
export async function handleNotificationEvent({ type, detail }: Event) {
  if (type === EventType.ACTION_PRESS) {
    const id = detail.pressAction?.id;
    const drink: DrinkType | null = id === ACTION_WATER ? 'water' : id === ACTION_CHAAS ? 'chaas' : null;
    if (!drink) return;
    await logDrink(drink);
    // Tapping "+ Water" on a nudge also clears that nudge.
    const nid = detail.notification?.id;
    if (nid?.startsWith(NUDGE_PREFIX)) await notifee.cancelDisplayedNotification(nid);
    return;
  }
  // A milestone or nudge just fired: refresh the lock-screen text and the widget.
  const nid = detail.notification?.id;
  if (type === EventType.DELIVERED && (nid?.startsWith(MILESTONE_PREFIX) || nid?.startsWith(NUDGE_PREFIX))) {
    await refreshSurfaces();
  }
}
