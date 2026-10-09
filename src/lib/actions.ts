import { milestonesFor } from './content';
import * as notif from './notifications';
import * as store from './store';
import { clearSurfaces } from './surfaces';
import { updateWidget } from '../widget/update';
import { HOUR } from './time';
import type { Fast, GoalHours } from './types';

/** Start a fast: save it, post the lock-screen notification, schedule milestones. */
export async function beginFast(opts: { startTime: number; goalHours: GoalHours; startWeightKg?: number }) {
  const fast = await store.startFast(opts.startTime, opts.goalHours);
  // Milestones already behind a backdated start aren't "crossed" — don't celebrate them.
  const elapsedH = (Date.now() - fast.startTime) / HOUR;
  await store.markMilestonesSeen(milestonesFor(fast.goalHours).filter((h) => h <= elapsedH));
  if (opts.startWeightKg) await store.addWeight(opts.startWeightKg);

  try {
    await notif.requestPermission();
    await notif.maybePromptExactAlarms();
    await notif.showOngoing(fast);
    await notif.scheduleMilestones(fast);
    await notif.scheduleNudges(fast);
  } catch (e) {
    console.warn('Notification setup failed', e);
  }
  await updateWidget();
  return fast;
}

/** End the active fast: move it to history and clear all notifications. */
export async function finishFast(): Promise<Fast | null> {
  const ended = await store.endActive();
  await clearSurfaces();
  return ended;
}
