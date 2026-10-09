import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Alert, Keyboard, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { WaterGlass } from '../components/art/WaterGlass';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { Txt } from '../components/Txt';
import { useFast } from '../lib/FastProvider';
import { addWeight, deleteWeight } from '../lib/store';
import { colors, fonts, radii } from '../lib/theme';
import { DAY, formatClock, formatDate, parseKg, sameDay, startOfDay, totalDays } from '../lib/time';
import type { Fast, WeightEntry } from '../lib/types';

const CHART_H = 140;

export function WeightScreen() {
  const { active, history, weights, now } = useFast();
  const [input, setInput] = useState('');
  const anchor: Fast | null = active ?? history[0] ?? null;

  const log = async () => {
    const kg = parseKg(input);
    if (kg == null) {
      Alert.alert("Today's weight", 'Enter your weight in kg, like 72.4.');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    await addWeight(kg);
    setInput('');
    Keyboard.dismiss();
  };

  const confirmDelete = (w: WeightEntry) => {
    Alert.alert('Delete entry?', `${w.kg.toFixed(1)} kg on ${formatDate(w.ts)}`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteWeight(w.ts) },
    ]);
  };

  const todays = weights.find((w) => sameDay(w.ts, now));

  return (
    <Screen>
      <View style={styles.header}>
        <View style={{ flex: 1, gap: 4 }}>
          <Txt w="bold" size={24}>
            Weight
          </Txt>
          <Txt color={colors.muted}>One quick log a day is plenty.</Txt>
        </View>
        <WaterGlass size={96} face="happy" arms="side" extras={['scale']} />
      </View>

      <Card style={{ gap: 10 }}>
        <Txt w="medium" size={13} color={colors.muted}>
          {"Today's weight"}{todays ? ` · logged ${todays.kg.toFixed(1)} kg` : ''}
        </Txt>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={styles.input}>
            <TextInput
              value={input}
              onChangeText={setInput}
              keyboardType="decimal-pad"
              placeholder={todays ? todays.kg.toFixed(1) : 'e.g. 72.4'}
              placeholderTextColor={colors.muted}
              style={styles.textInput}
              onSubmitEditing={log}
              returnKeyType="done"
            />
            <Txt color={colors.muted}>kg</Txt>
          </View>
          <Button title={todays ? 'Update' : 'Log'} onPress={log} disabled={!input.trim()} style={{ minWidth: 92 }} />
        </View>
      </Card>

      {anchor && <DayChart fast={anchor} weights={weights} now={now} />}

      <Card style={{ backgroundColor: colors.tealTint }}>
        <Txt size={14} color={colors.ink}>
          {"Early drops are mostly water and stored sugar. Some comes back once you eat — that's normal, not a setback."}
        </Txt>
      </Card>

      {weights.length > 0 && (
        <View style={{ gap: 8 }}>
          <Txt w="semibold" size={17}>
            Entries
          </Txt>
          <Card style={{ paddingVertical: 4 }}>
            {[...weights].reverse().map((w, i, arr) => (
              <Pressable
                key={w.ts}
                onLongPress={() => confirmDelete(w)}
                accessibilityHint="Long press to delete"
                style={[styles.entry, i < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.line }]}
              >
                <View>
                  <Txt w="medium">{formatDate(w.ts)}</Txt>
                  <Txt size={12} color={colors.muted}>
                    {formatClock(w.ts)}
                  </Txt>
                </View>
                <Txt w="semibold" size={16} tabular>
                  {w.kg.toFixed(1)} kg
                </Txt>
              </Pressable>
            ))}
          </Card>
        </View>
      )}
    </Screen>
  );
}

function DayChart({ fast, weights, now }: { fast: Fast; weights: WeightEntry[]; now: number }) {
  const startDay = startOfDay(fast.startTime);
  const today = startOfDay(now);
  const n = totalDays(fast.goalHours) + 1;
  const days = Array.from({ length: n }, (_, i) => {
    const dayTs = startOfDay(startDay + i * DAY + 2 * 3_600_000); // +2h guards DST shifts
    return {
      label: i === 0 ? 'Start' : `Day ${i}`,
      dayTs,
      entry: weights.find((w) => sameDay(w.ts, dayTs)),
      future: dayTs > today,
    };
  });
  const kgs = days.flatMap((d) => (d.entry ? [d.entry.kg] : []));
  const lo = kgs.length ? Math.min(...kgs) - 0.5 : 0;
  const hi = kgs.length ? Math.max(...kgs) + 0.5 : 1;
  const first = kgs[0];
  const last = kgs[kgs.length - 1];
  const diff = kgs.length > 1 ? last - first : null;

  return (
    <Card style={{ gap: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <Txt w="semibold">This fast</Txt>
        {diff != null && (
          <Txt w="semibold" size={13} color={colors.teal}>
            {diff <= 0 ? `${Math.abs(diff).toFixed(1)} kg down` : `${diff.toFixed(1)} kg up`}
          </Txt>
        )}
      </View>
      <View style={styles.chart}>
        {days.map((d) => {
          const h = d.entry ? Math.max(12, ((d.entry.kg - lo) / (hi - lo)) * CHART_H) : CHART_H * 0.35;
          return (
            <View key={d.label} style={styles.col}>
              <Txt size={12} w="semibold" tabular color={d.entry ? colors.ink : colors.muted}>
                {d.entry ? d.entry.kg.toFixed(1) : d.future ? '' : '–'}
              </Txt>
              <View
                style={[
                  styles.bar,
                  { height: h },
                  d.entry
                    ? { backgroundColor: colors.teal }
                    : d.future
                      ? { borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.inputBorder }
                      : { backgroundColor: colors.line },
                ]}
              />
              <Txt size={12} color={colors.muted}>
                {d.label}
              </Txt>
            </View>
          );
        })}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 8 },
  input: {
    flex: 1,
    minHeight: 52,
    borderWidth: 1.5,
    borderColor: colors.inputBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: { flex: 1, fontFamily: fonts.medium, fontSize: 16, color: colors.ink, minHeight: 50 },
  chart: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, height: CHART_H + 48 },
  col: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 4 },
  bar: { width: '100%', maxWidth: 44, borderRadius: radii.tile - 4 },
  entry: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 56 },
});
