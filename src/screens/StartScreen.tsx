import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { WaterGlass } from '../components/art/WaterGlass';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { Txt } from '../components/Txt';
import { beginFast } from '../lib/actions';
import { useFast } from '../lib/FastProvider';
import { getFlag, setFlag } from '../lib/store';
import { colors, fonts, radii, TOUCH } from '../lib/theme';
import { HOUR, formatDayTime, formatHM, parseKg } from '../lib/time';
import type { GoalHours } from '../lib/types';

const GOALS: GoalHours[] = [16, 24, 48, 72];
const MAX_BACKDATE_H = 72;

export function StartScreen() {
  const [mode, setMode] = useState<'now' | 'earlier'>('now');
  const [earlier, setEarlier] = useState(() => roundToFive(Date.now() - 2 * HOUR));
  const [goal, setGoal] = useState<GoalHours>(72);
  const [weight, setWeight] = useState('');
  const [busy, setBusy] = useState(false);

  const { now } = useFast();
  const error =
    mode !== 'earlier'
      ? null
      : earlier > now
        ? "That's in the future — pick a time that's already passed."
        : now - earlier > MAX_BACKDATE_H * HOUR
          ? 'That was more than 72 hours ago — pick something more recent.'
          : null;

  const pickEarlier = () => {
    const max = new Date();
    const min = new Date(Date.now() - MAX_BACKDATE_H * HOUR);
    DateTimePickerAndroid.open({
      value: new Date(earlier),
      mode: 'date',
      maximumDate: max,
      minimumDate: min,
      onValueChange: (_e, date) => {
        const d = new Date(earlier);
        d.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
        DateTimePickerAndroid.open({
          value: d,
          mode: 'time',
          is24Hour: false,
          onValueChange: (_e2, t) => {
            const next = new Date(d);
            next.setHours(t.getHours(), t.getMinutes(), 0, 0);
            setEarlier(next.getTime());
          },
        });
      },
    });
  };

  const start = async () => {
    if (error || busy) return;
    if (mode === 'earlier' && earlier > Date.now()) return;
    const kg = parseKg(weight);
    if (weight.trim() && kg == null) {
      Alert.alert('Starting weight', 'Enter your weight in kg, like 72.4 — or leave it blank.');
      return;
    }
    setBusy(true);
    try {
      await beginFast({ startTime: mode === 'now' ? Date.now() : earlier, goalHours: goal, startWeightKg: kg ?? undefined });
      if (!(await getFlag('tip:lockscreen'))) {
        await setFlag('tip:lockscreen');
        Alert.alert(
          'See it on your lock screen',
          'Your timer is now in your notifications. To see it on the lock screen, turn on Settings → Notifications → Lock screen → "Show all notification content".',
        );
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <View style={styles.hero}>
        <View style={{ flex: 1, gap: 6 }}>
          <Txt w="bold" size={28} style={{ lineHeight: 36 }}>
            Start your fast
          </Txt>
          <Txt color={colors.muted}>Set when your last meal was. Everything else counts from here.</Txt>
        </View>
        <WaterGlass size={104} face="calm" arms="none" extras={['moon']} />
      </View>

      <Card style={{ gap: 14 }}>
        <View style={styles.segment} accessibilityRole="tablist">
          {(['now', 'earlier'] as const).map((m) => (
            <Pressable
              key={m}
              accessibilityRole="tab"
              accessibilityState={{ selected: mode === m }}
              onPress={() => setMode(m)}
              style={[styles.segmentItem, mode === m && styles.segmentOn]}
            >
              <Txt w={mode === m ? 'semibold' : 'medium'} color={mode === m ? colors.ink : colors.muted}>
                {m === 'now' ? 'Right now' : 'Earlier'}
              </Txt>
            </Pressable>
          ))}
        </View>

        {mode === 'earlier' && (
          <View style={{ gap: 6 }}>
            <Txt w="medium" size={13} color={colors.muted}>
              Last meal finished at
            </Txt>
            <Pressable onPress={pickEarlier} style={styles.input} accessibilityRole="button">
              <Txt w="semibold">{formatDayTime(earlier)}</Txt>
              <Txt size={13} color={colors.muted}>
                {earlier <= now ? `${formatHM(now - earlier)} ago` : ''}
              </Txt>
            </Pressable>
            {error && (
              <Txt size={13} color={colors.saffronText}>
                {error}
              </Txt>
            )}
          </View>
        )}

        <View style={{ gap: 8 }}>
          <Txt w="medium" size={13} color={colors.muted}>
            Goal
          </Txt>
          <View style={styles.chips}>
            {GOALS.map((g) => (
              <Pressable
                key={g}
                onPress={() => setGoal(g)}
                accessibilityRole="radio"
                accessibilityState={{ selected: goal === g }}
                style={[styles.chip, goal === g && styles.chipOn]}
              >
                <Txt w="semibold" color={goal === g ? colors.teal : colors.ink}>
                  {g}h
                </Txt>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={{ gap: 6 }}>
          <Txt w="medium" size={13} color={colors.muted}>
            Starting weight (optional)
          </Txt>
          <View style={[styles.input, { paddingVertical: 0 }]}>
            <TextInput
              value={weight}
              onChangeText={setWeight}
              keyboardType="decimal-pad"
              placeholder="e.g. 72.4"
              placeholderTextColor={colors.muted}
              style={styles.textInput}
            />
            <Txt color={colors.muted}>kg</Txt>
          </View>
        </View>
      </Card>

      <Button title={busy ? 'Starting…' : 'Start fast'} onPress={start} disabled={!!error || busy} />
      <Txt size={13} color={colors.muted} center>
        Time will show on your lock screen. You can end anytime — every hour counts.
      </Txt>
    </Screen>
  );
}

function roundToFive(ts: number) {
  const step = 5 * 60_000;
  return Math.floor(ts / step) * step;
}

const styles = StyleSheet.create({
  hero: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 8 },
  segment: { flexDirection: 'row', backgroundColor: colors.ground, borderRadius: 12, padding: 4 },
  segmentItem: { flex: 1, minHeight: TOUCH, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  segmentOn: { backgroundColor: colors.surface, elevation: 1 },
  chips: { flexDirection: 'row', gap: 8 },
  chip: {
    flex: 1,
    minHeight: TOUCH + 4,
    borderRadius: radii.tile,
    borderWidth: 1.5,
    borderColor: colors.inputBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipOn: { borderColor: colors.teal, backgroundColor: colors.tealTint },
  input: {
    minHeight: 52,
    borderWidth: 1.5,
    borderColor: colors.inputBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textInput: { flex: 1, fontFamily: fonts.medium, fontSize: 16, color: colors.ink, minHeight: 50 },
});
