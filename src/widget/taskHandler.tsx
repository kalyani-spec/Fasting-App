import type { WidgetTaskHandlerProps } from 'react-native-android-widget';
import { showOngoing } from '../lib/notifications';
import { addDrink, getActive } from '../lib/store';
import { CLICK_CHAAS, CLICK_WATER, FastWidget } from './FastWidget';

/** Runs headless when the widget is added, resized, refreshed (every 30 min) or tapped. */
export async function widgetTaskHandler({ widgetInfo, widgetAction, clickAction, renderWidget }: WidgetTaskHandlerProps) {
  if (widgetAction === 'WIDGET_DELETED') return;

  if (widgetAction === 'WIDGET_CLICK' && (clickAction === CLICK_WATER || clickAction === CLICK_CHAAS)) {
    await addDrink(clickAction === CLICK_WATER ? 'water' : 'chaas');
  }

  const fast = await getActive();
  renderWidget(<FastWidget fast={fast} now={Date.now()} width={widgetInfo.width} height={widgetInfo.height} />);

  // Piggyback on the widget's refresh to keep the lock-screen text current too.
  if (fast) await showOngoing(fast).catch(() => {});
}
