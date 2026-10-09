import { Platform } from 'react-native';
import { requestWidgetUpdate } from 'react-native-android-widget';
import { getActive } from '../lib/store';
import { FastWidget, WIDGET_NAME } from './FastWidget';

/** Redraws every placed widget. Safe to call when none are placed. */
export async function updateWidget() {
  if (Platform.OS !== 'android') return;
  try {
    const fast = await getActive();
    await requestWidgetUpdate({
      widgetName: WIDGET_NAME,
      renderWidget: (info) => <FastWidget fast={fast} now={Date.now()} width={info.width} height={info.height} />,
    });
  } catch (e) {
    console.warn('Widget update failed', e);
  }
}
