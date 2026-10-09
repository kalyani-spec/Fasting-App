import notifee, {
  AlarmType,
  AndroidImportance,
  AndroidNotificationSetting,
  AndroidStyle,
  AndroidVisibility,
  AuthorizationStatus,
  type TimestampTrigger,
  TriggerType,
} from '@notifee/react-native';
import { Alert, Platform } from 'react-native';
import { getNudge, getPhase, milestoneCopy, milestonesFor, nextTarget } from './content';
import { clearFlag, getActive, getFlag, setFlag } from './store';
import { HOUR, countToday, dayNumber, formatHM, totalDays } from './time';
import type { Fast } from './types';

export const ONGOING_ID = 'fast-ongoing';
const CH_ONGOING = 'fast-ongoing';
const CH_MILESTONES = 'fast-milestones';
const CH_NUDGES = 'fast-nudges';
export const MILESTONE_PREFIX = 'ms-';
export const NUDGE_PREFIX = 'nudge-';

/** Nudges every 3h, but not overnight and not right next to a milestone. */
const NUDGE_EVERY_H = 3;
const QUIET_FROM = 22;
const QUIET_TO = 8;

export const ACTION_WATER = 'add-water';
export const ACTION_CHAAS = 'add-chaas';

const isAndroid = Platform.OS === 'android';

export async function setupChannels() {
  if (!isAndroid) return;
  await notifee.createChannel({
    id: CH_ONGOING,
    name: 'Fasting timer',
    importance: AndroidImportance.LOW,
    visibility: AndroidVisibility.PUBLIC,
  });
  await notifee.createChannel({
    id: CH_MILESTONES,
    name: 'Milestones',
    importance: AndroidImportance.DEFAULT,
    visibility: AndroidVisibility.PUBLIC,
  });
  await notifee.createChannel({
    id: CH_NUDGES,
    name: 'Keep-going nudges',
    description: 'A short push and a fasting fact every few hours (not overnight)',
    importance: AndroidImportance.DEFAULT,
    visibility: AndroidVisibility.PUBLIC,
  });
}

/** Android 13+ POST_NOTIFICATIONS. Returns true if allowed. */
export async function requestPermission(): Promise<boolean> {
  const settings = await notifee.requestPermission();
  return settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED;
}

export async function showOngoing(fast: Fast) {
  if (!isAndroid) return;
  await setupChannels();
  const elapsedMs = Date.now() - fast.startTime;
  const elapsedH = elapsedMs / HOUR;
  const pct = Math.min(100, Math.round((elapsedH / fast.goalHours) * 100));
  const phase = getPhase(elapsedH);
  const today = countToday(fast.drinks);
  const day = dayNumber(elapsedMs);
  const days = totalDays(fast.goalHours);
  const dayText = day <= days ? `Day ${day} of ${days}` : `Day ${day} · goal reached`;
  // Rotates every hour; refreshed on drinks, nudges, milestones, widget updates and app opens.
  const { push, fact } = getNudge(elapsedH);
  const next = nextTarget(elapsedH, fast.goalHours);
  const nextText = next ? `${formatHM(next.inH * HOUR)} to ${next.label}` : 'Goal reached';

  await notifee.displayNotification({
    id: ONGOING_ID,
    title: `${dayText} · ${phase.title}`,
    body: push,
    subtitle: `${pct}% · ${nextText}`,
    android: {
      style: {
        type: AndroidStyle.BIGTEXT,
        text: `${push}\n\n${fact}\n\n${nextText} · ${today.water} water · ${today.chaas} chaas today`,
      },
      channelId: CH_ONGOING,
      smallIcon: 'ic_small_icon',
      color: '#1E6B62',
      ongoing: true,
      autoCancel: false,
      onlyAlertOnce: true,
      showTimestamp: true,
      showChronometer: true, // live count-up ticked by Android itself
      timestamp: fast.startTime,
      visibility: AndroidVisibility.PUBLIC,
      progress: { max: 100, current: pct },
      pressAction: { id: 'default' },
      actions: [
        { title: '+ Water', pressAction: { id: ACTION_WATER } },
        { title: '+ Chaas', pressAction: { id: ACTION_CHAAS } },
      ],
    },
  });
}

/** Can we use exact alarms? (Always true below Android 12.) */
async function exactAlarmsAllowed(): Promise<boolean> {
  const settings = await notifee.getNotificationSettings();
  return settings.android.alarm === AndroidNotificationSetting.ENABLED;
}

/**
 * Asks once for exact-alarm permission so milestone alerts land on time.
 * If declined, milestones still fire via inexact (WorkManager) triggers.
 */
export async function maybePromptExactAlarms(): Promise<void> {
  if (!isAndroid) return;
  if (await exactAlarmsAllowed()) return;
  if (await getFlag('prompt:exact-alarm')) return;
  await setFlag('prompt:exact-alarm');
  await new Promise<void>((resolve) => {
    Alert.alert(
      'On-time milestone alerts',
      'Allow "Alarms & reminders" so milestone alerts arrive exactly on the hour. Without it they may arrive a little late.',
      [
        { text: 'Not now', style: 'cancel', onPress: () => resolve() },
        {
          text: 'Allow',
          onPress: () => {
            notifee.openAlarmPermissionSettings().finally(() => resolve());
          },
        },
      ],
      { cancelable: true, onDismiss: () => resolve() },
    );
  });
}

/** Schedules ms-12 … ms-72 (only ≤ goal and still in the future). Idempotent. */
export async function scheduleMilestones(fast: Fast) {
  if (!isAndroid) return;
  await setupChannels();
  const exact = await exactAlarmsAllowed().catch(() => false);
  const now = Date.now();
  for (const h of milestonesFor(fast.goalHours)) {
    const at = fast.startTime + h * HOUR;
    if (at <= now + 5_000) continue;
    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: at,
      ...(exact ? { alarmManager: { type: AlarmType.SET_EXACT_AND_ALLOW_WHILE_IDLE } } : {}),
    };
    const copy = milestoneCopy(h, fast.goalHours);
    await notifee.createTriggerNotification(
      {
        id: `${MILESTONE_PREFIX}${h}`,
        title: copy.headline,
        body: copy.body,
        data: { milestone: String(h), fastId: fast.id },
        android: {
          channelId: CH_MILESTONES,
          smallIcon: 'ic_small_icon',
          color: '#1E6B62',
          visibility: AndroidVisibility.PUBLIC,
          pressAction: { id: 'default' },
        },
      },
      trigger,
    );
  }
}

export async function nudgesEnabled(): Promise<boolean> {
  return !(await getFlag('nudges:off'));
}

/** Schedules nudge-<slot> every 3h from start until the goal (idempotent). */
export async function scheduleNudges(fast: Fast) {
  if (!isAndroid) return;
  await cancelNudges();
  if (!(await nudgesEnabled())) return;
  await setupChannels();
  const now = Date.now();
  const milestones = milestonesFor(fast.goalHours);
  for (let h = NUDGE_EVERY_H; h < fast.goalHours; h += NUDGE_EVERY_H) {
    const at = fast.startTime + h * HOUR;
    if (at <= now + 60_000) continue;
    const hour = new Date(at).getHours();
    if (hour >= QUIET_FROM || hour < QUIET_TO) continue;
    if (milestones.some((m) => Math.abs(m - h) < 1.5)) continue;
    const { push, fact } = getNudge(h, h / NUDGE_EVERY_H);
    await notifee.createTriggerNotification(
      {
        id: `${NUDGE_PREFIX}${h}`,
        title: `${h} hours in. ${push}`,
        body: fact,
        android: {
          channelId: CH_NUDGES,
          smallIcon: 'ic_small_icon',
          color: '#1E6B62',
          visibility: AndroidVisibility.PUBLIC,
          style: { type: AndroidStyle.BIGTEXT, text: fact },
          pressAction: { id: 'default' },
          actions: [
            { title: '+ Water', pressAction: { id: ACTION_WATER } },
            { title: '+ Chaas', pressAction: { id: ACTION_CHAAS } },
          ],
        },
      },
      // Inexact is fine for nudges, and avoids needing the exact-alarm permission.
      { type: TriggerType.TIMESTAMP, timestamp: at, alarmManager: { type: AlarmType.SET_AND_ALLOW_WHILE_IDLE } },
    );
  }
}

async function cancelNudges() {
  const ids = (await notifee.getTriggerNotificationIds()).filter((id) => id.startsWith(NUDGE_PREFIX));
  if (ids.length) await notifee.cancelTriggerNotifications(ids);
}

export async function setNudgesEnabled(on: boolean) {
  if (on) await clearFlag('nudges:off');
  else await setFlag('nudges:off');
  const active = await getActive();
  if (active) await scheduleNudges(active);
  else await cancelNudges();
}

export async function cancelAll() {
  if (!isAndroid) return;
  const ids = (await notifee.getTriggerNotificationIds()).filter(
    (id) => id.startsWith(MILESTONE_PREFIX) || id.startsWith(NUDGE_PREFIX),
  );
  await notifee.cancelTriggerNotifications(ids);
  await notifee.cancelDisplayedNotifications(ids);
  await notifee.cancelNotification(ONGOING_ID);
}

/** Re-post the ongoing notification + milestone triggers (app open/foreground). */
export async function syncNotifications() {
  const active = await getActive();
  if (!active) return;
  await showOngoing(active);
  await scheduleMilestones(active);
  await scheduleNudges(active);
}
