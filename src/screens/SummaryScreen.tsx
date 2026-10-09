import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { WaterGlass } from '../components/art/WaterGlass';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { Txt } from '../components/Txt';
import { useFast } from '../lib/FastProvider';
import { getFast } from '../lib/store';
import { colors } from '../lib/theme';
import { HOUR, countAll, formatDayTime, formatHM, startOfDay } from '../lib/time';
import type { Fast } from '../lib/types';

export function SummaryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { weights, now } = useFast();
  const router = useRouter();
  const [fast, setFast] = useState<Fast | null>(null);

  useEffect(() => {
    if (id) getFast(id).then(setFast);
  }, [id]);

  if (!fast) return null;

  const end = fast.endTime ?? now;
  const totalMs = end - fast.startTime;
  const totalH = totalMs / HOUR;
  const pct = Math.round((totalH / fast.goalHours) * 100);
  const drinks = countAll(fast.drinks);

  // Weight change: first entry from the start day onward vs. last entry up to the end.
  const inFast = weights.filter((w) => w.ts >= startOfDay(fast.startTime) && w.ts <= end + HOUR);
  const weightChange = inFast.length > 1 ? inFast[inFast.length - 1].kg - inFast[0].kg : null;

  const headline =
    totalH >= 1
      ? `You fasted ${Math.floor(totalH)} ${Math.floor(totalH) === 1 ? 'hour' : 'hours'}. That counts.`
      : `You fasted ${formatHM(totalMs)}. That counts.`;

  return (
    <Screen>
      <View style={{ alignItems: 'center', gap: 10, paddingTop: 12 }}>
        <WaterGlass size={130} face="cheer" arms="up" extras={['confetti']} />
        <Txt w="bold" size={26} center style={{ lineHeight: 34 }}>
          {headline}
        </Txt>
        <Txt color={colors.muted} center>
          {formatDayTime(fast.startTime)} → {formatDayTime(end)}
        </Txt>
      </View>

      <View style={styles.grid}>
        <Stat label="Total time" value={formatHM(totalMs)} />
        <Stat label={`Of your ${fast.goalHours}h goal`} value={`${pct}%`} />
        <Stat label="Water" value={`${drinks.water} ${drinks.water === 1 ? 'glass' : 'glasses'}`} />
        <Stat label="Chaas" value={`${drinks.chaas} ${drinks.chaas === 1 ? 'glass' : 'glasses'}`} />
        {weightChange != null && (
          <Stat
            label="Weight change"
            value={`${weightChange <= 0 ? '−' : '+'}${Math.abs(weightChange).toFixed(1)} kg`}
            wide
          />
        )}
      </View>

      <Card style={{ backgroundColor: colors.tealTint, gap: 4 }}>
        <Txt w="semibold">Break it gently</Txt>
        <Txt size={14}>Something light like dal water, curd rice or fruit first.</Txt>
      </Card>

      <Button title="Done" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} />
    </Screen>
  );
}

function Stat({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <Card style={[styles.stat, wide && { width: '100%' }]}>
      <Txt size={12} color={colors.muted}>
        {label}
      </Txt>
      <Txt w="bold" size={20} tabular>
        {value}
      </Txt>
    </Card>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  stat: { width: '47.5%', flexGrow: 1, padding: 14, borderRadius: 18 },
});
