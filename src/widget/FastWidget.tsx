import { FlexWidget, SvgWidget, TextWidget } from 'react-native-android-widget';
import { getNudge, getPhase, nextTarget } from '../lib/content';
import { HOUR, countToday, dayNumber, formatHM, totalDays } from '../lib/time';
import type { Fast } from '../lib/types';
import { MASCOT_CALM, MASCOT_WAVE } from './mascot';

export const WIDGET_NAME = 'FastWidget';
export const CLICK_WATER = 'ADD_WATER';
export const CLICK_CHAAS = 'ADD_CHAAS';

const C = {
  bg: '#17231F',
  tile: '#2C3B36',
  mint: '#8FD3C4',
  muted: '#C9D4D0',
  white: '#FFFFFF',
  teal: '#1E6B62',
  water: '#E1ECF8',
  waterText: '#1B4C82',
  chaas: '#FBEBD9',
  chaasText: '#8A4806',
} as const;

const F = { regular: 'Poppins_400Regular', semibold: 'Poppins_600SemiBold', bold: 'Poppins_700Bold' };

type Props = { fast: Fast | null; now: number; width: number; height: number };

/**
 * Home-screen widget. It's redrawn every 30 min and whenever something changes,
 * so it shows whole hours rather than a ticking clock.
 */
export function FastWidget({ fast, now, width, height }: Props) {
  const roomy = height >= 150;
  const showMascot = width >= 220;

  if (!fast) {
    return (
      <FlexWidget clickAction="OPEN_APP" style={{ ...root, flexDirection: 'row', alignItems: 'center', flexGap: 12 }}>
        {showMascot ? <SvgWidget svg={MASCOT_CALM} style={{ width: 64, height: 64 }} /> : null}
        <FlexWidget style={{ flex: 1, flexDirection: 'column' }}>
          <TextWidget text="Not fasting right now" style={text(16, F.semibold, C.white)} />
          <TextWidget text="Tap to start a fast" style={text(13, F.regular, C.muted)} />
        </FlexWidget>
      </FlexWidget>
    );
  }

  const elapsedMs = Math.max(0, now - fast.startTime);
  const elapsedH = elapsedMs / HOUR;
  const day = dayNumber(elapsedMs);
  const days = totalDays(fast.goalHours);
  const pct = Math.max(0, Math.min(100, Math.round((elapsedH / fast.goalHours) * 100)));
  const phase = getPhase(elapsedH);
  const { push } = getNudge(elapsedH);
  const next = nextTarget(elapsedH, fast.goalHours);
  const today = countToday(fast.drinks, now);
  const big = elapsedH < 1 ? `${Math.floor(elapsedMs / 60_000)} min` : `${Math.floor(elapsedH)} hours`;

  return (
    <FlexWidget clickAction="OPEN_APP" style={{ ...root, flexDirection: 'column', flexGap: 8 }}>
      <FlexWidget style={{ width: 'match_parent', flexDirection: 'row', alignItems: 'center', flexGap: 12 }}>
        {showMascot ? <SvgWidget svg={MASCOT_WAVE} style={{ width: 60, height: 60 }} /> : null}
        <FlexWidget style={{ flex: 1, flexDirection: 'column', flexGap: 2 }}>
          <TextWidget
            text={`${day <= days ? `DAY ${day} OF ${days}` : `DAY ${day}`} · ${phase.title.toUpperCase()}`}
            maxLines={1}
            truncate="END"
            style={{ ...text(11, F.semibold, C.mint), letterSpacing: 0.08 }}
          />
          <TextWidget text={big} style={text(26, F.bold, C.white)} />
          <ProgressBar pct={pct} />
          <TextWidget
            text={next ? `${pct}% · ${formatHM(next.inH * HOUR)} to ${next.label}` : `${pct}% · Goal reached`}
            maxLines={1}
            style={text(12, F.regular, C.muted)}
          />
        </FlexWidget>
      </FlexWidget>

      <TextWidget text={push} maxLines={2} truncate="END" style={text(13, F.semibold, C.white)} />

      {roomy ? (
        <FlexWidget style={{ width: 'match_parent', flexDirection: 'row', flexGap: 8 }}>
          <DrinkButton label={`+ Water · ${today.water}`} click={CLICK_WATER} bg={C.water} fg={C.waterText} />
          <DrinkButton label={`+ Chaas · ${today.chaas}`} click={CLICK_CHAAS} bg={C.chaas} fg={C.chaasText} />
        </FlexWidget>
      ) : null}
    </FlexWidget>
  );
}

function ProgressBar({ pct }: { pct: number }) {
  return (
    <FlexWidget style={{ width: 'match_parent', height: 6, flexDirection: 'row', backgroundColor: C.tile, borderRadius: 3, marginVertical: 3 }}>
      {pct > 0 ? <FlexWidget style={{ flex: pct, height: 6, backgroundColor: C.mint, borderRadius: 3 }} /> : null}
      {pct < 100 ? <FlexWidget style={{ flex: 100 - pct, height: 6 }} /> : null}
    </FlexWidget>
  );
}

function DrinkButton({ label, click, bg, fg }: { label: string; click: string; bg: `#${string}`; fg: `#${string}` }) {
  return (
    <FlexWidget
      clickAction={click}
      style={{ flex: 1, height: 40, backgroundColor: bg, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}
    >
      <TextWidget text={label} style={text(13, F.semibold, fg)} />
    </FlexWidget>
  );
}

const root = {
  width: 'match_parent' as const,
  height: 'match_parent' as const,
  backgroundColor: C.bg,
  borderRadius: 24,
  padding: 14,
};

function text(fontSize: number, fontFamily: string, color: `#${string}`) {
  return { fontSize, fontFamily, color };
}
