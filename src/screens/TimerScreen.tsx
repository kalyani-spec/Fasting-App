import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Switch, View } from 'react-native';
import { requestPinWidget } from 'react-native-android-widget';
import { Liver } from '../components/art/Organs';
import { WaterGlass } from '../components/art/WaterGlass';
import { GlassIcon } from '../components/art/Drinks';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { EndFastSheet } from '../components/EndFastSheet';
import { ProgressRing } from '../components/ProgressRing';
import { Screen } from '../components/Screen';
import { Txt } from '../components/Txt';
import { finishFast } from '../lib/actions';
import { getMotivation, getPhase, milestonesFor, phaseLabel } from '../lib/content';
import { useFast } from '../lib/FastProvider';
import { nudgesEnabled, setNudgesEnabled } from '../lib/notifications';
import { undoDrink } from '../lib/store';
import { WIDGET_NAME } from '../widget/FastWidget';
import { logDrink, refreshSurfaces } from '../lib/surfaces';
import { colors, radii } from '../lib/theme';
import { HOUR, countToday, dayNumber, formatDayTime, formatHHMM, formatHM, totalDays } from '../lib/time';
import type { DrinkType, Fast } from '../lib/types';

export function TimerScreen({ fast }: { fast: Fast }) {
  const { now } = useFast();
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);

  const elapsedMs = Math.max(0, now - fast.startTime);
  const elapsedH = elapsedMs / HOUR;
  const progress = elapsedH / fast.goalHours;
  const pct = Math.min(100, Math.round(progress * 100));
  const day = dayNumber(elapsedMs);
  const days = totalDays(fast.goalHours);
  const phase = getPhase(elapsedH);
  const motivation = getMotivation(elapsedH);
  const today = countToday(fast.drinks, now);
  const next = milestonesFor(fast.goalHours).find((h) => h > elapsedH);
  const goalEnd = fast.startTime + fast.goalHours * HOUR;

  const drink = async (type: DrinkType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    await logDrink(type);
  };
  const undo = async (type: DrinkType) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    await undoDrink(type);
    await refreshSurfaces();
  };

  const end = async () => {
    setConfirm(false);
    const ended = await finishFast();
    if (ended) router.push({ pathname: '/summary', params: { id: ended.id } });
  };

  return (
    <Screen>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Txt w="bold" size={22}>
            {day <= days ? `Day ${day} of ${days}` : `Day ${day}`}
          </Txt>
          <Txt color={colors.muted}>{elapsedH >= fast.goalHours ? 'Goal reached — well done' : "You're doing it"}</Txt>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Txt size={12} color={colors.muted}>
            Started
          </Txt>
          <Txt w="semibold" size={14}>
            {formatDayTime(fast.startTime)}
          </Txt>
        </View>
      </View>

      <Card style={{ alignItems: 'center', paddingVertical: 24 }}>
        <View style={{ width: 240, height: 240, alignItems: 'center', justifyContent: 'center' }}>
          <View style={StyleSheet.absoluteFill}>
            <ProgressRing progress={progress} />
          </View>
          <Txt w="semibold" size={12} color={colors.muted} style={{ letterSpacing: 1.5 }}>
            ELAPSED
          </Txt>
          <Txt w="bold" size={44} tabular style={{ lineHeight: 54 }} accessibilityLabel={`${formatHM(elapsedMs)} elapsed`}>
            {formatHHMM(elapsedMs)}
          </Txt>
          <Txt size={12} color={colors.muted}>
            hrs : min
          </Txt>
          <Txt w="semibold" size={14} color={colors.teal} style={{ marginTop: 6 }}>
            {pct}% of {fast.goalHours}h
          </Txt>
        </View>
      </Card>

      <View style={styles.row}>
        <Card style={styles.tile}>
          <Txt size={12} color={colors.muted}>
            Next milestone
          </Txt>
          <Txt w="semibold" size={15}>
            {next ? `${next}h · in ${formatHM(fast.startTime + next * HOUR - now)}` : 'All reached'}
          </Txt>
        </Card>
        <Card style={styles.tile}>
          <Txt size={12} color={colors.muted}>
            Goal ends
          </Txt>
          <Txt w="semibold" size={15}>
            {formatDayTime(goalEnd)}
          </Txt>
        </Card>
      </View>

      <Pressable onPress={() => router.navigate('/body')} accessibilityRole="button" accessibilityHint="Opens what's happening in your body">
        <Card dark style={styles.happening}>
          <Liver size={56} />
          <View style={{ flex: 1 }}>
            <Txt w="semibold" size={11} color={colors.mint} style={{ letterSpacing: 1.2 }}>
              HAPPENING NOW · {phaseLabel(phase)}
            </Txt>
            <Txt w="semibold" size={17} color="#FFF">
              {phase.title}
            </Txt>
            <Txt size={13} color={colors.darkMuted} numberOfLines={2}>
              {phase.explanation}
            </Txt>
          </View>
          <Txt w="bold" size={20} color={colors.darkMuted}>
            ›
          </Txt>
        </Card>
      </Pressable>

      <Txt w="semibold" size={17}>
        {"Today's sips"}
      </Txt>
      <View style={styles.row}>
        <DrinkCard
          label="Chaas"
          count={today.chaas}
          stroke={colors.saffron}
          fill={colors.saffronTint}
          buttonBg={colors.saffronTint}
          buttonText={colors.saffronText}
          onAdd={() => drink('chaas')}
          onUndo={() => undo('chaas')}
        />
        <DrinkCard
          label="Water"
          count={today.water}
          stroke={colors.water}
          fill="#CFE6FA"
          buttonBg={colors.waterTint}
          buttonText={colors.waterText}
          onAdd={() => drink('water')}
          onUndo={() => undo('water')}
        />
      </View>

      <Card style={styles.motivation}>
        <WaterGlass size={84} face="happy" arms="wave" />
        <View style={{ flex: 1, gap: 2 }}>
          <Txt w="semibold" size={16}>
            {motivation.headline}
          </Txt>
          <Txt size={14} color={colors.muted}>
            {motivation.body}
          </Txt>
        </View>
      </Card>

      <KeepGoingCard />

      <Button title="End fast" variant="link" onPress={() => setConfirm(true)} />

      <EndFastSheet visible={confirm} elapsedMs={elapsedMs} onConfirm={end} onCancel={() => setConfirm(false)} />
    </Screen>
  );
}

function KeepGoingCard() {
  const [nudges, setNudges] = useState(true);
  useEffect(() => {
    nudgesEnabled().then(setNudges);
  }, []);
  const toggle = (on: boolean) => {
    setNudges(on);
    setNudgesEnabled(on).catch(() => {});
  };
  return (
    <Card style={{ gap: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Txt w="semibold">Keep-going nudges</Txt>
          <Txt size={13} color={colors.muted}>
            A push and a fasting fact every 3 hours, quiet 10 PM–8 AM.
          </Txt>
        </View>
        <Switch
          value={nudges}
          onValueChange={toggle}
          trackColor={{ true: colors.mint, false: colors.line }}
          thumbColor={nudges ? colors.teal : '#FFF'}
          accessibilityLabel="Keep-going nudges"
        />
      </View>
      {Platform.OS === 'android' && (
        <Button
          title="Add widget to home screen"
          variant="outline"
          onPress={() => requestPinWidget({ widgetName: WIDGET_NAME }).catch(() => {})}
        />
      )}
    </Card>
  );
}

type DrinkProps = {
  label: string;
  count: number;
  stroke: string;
  fill: string;
  buttonBg: string;
  buttonText: string;
  onAdd: () => void;
  onUndo: () => void;
};

function DrinkCard({ label, count, stroke, fill, buttonBg, buttonText, onAdd, onUndo }: DrinkProps) {
  return (
    <Card style={[styles.tile, { gap: 10 }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <GlassIcon stroke={stroke} fill={fill} />
        <Txt w="semibold">{label}</Txt>
      </View>
      <Pressable
        onLongPress={onUndo}
        delayLongPress={450}
        accessibilityLabel={`${count} glasses of ${label.toLowerCase()} today`}
        accessibilityHint="Long press to undo the last one"
        style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}
      >
        <Txt w="bold" size={32} tabular style={{ lineHeight: 40 }}>
          {count}
        </Txt>
        <Txt size={13} color={colors.muted}>
          {count === 1 ? 'glass' : 'glasses'}
        </Txt>
      </Pressable>
      <Pressable
        onPress={onAdd}
        accessibilityRole="button"
        accessibilityLabel={`Add one glass of ${label.toLowerCase()}`}
        style={({ pressed }) => [styles.drinkBtn, { backgroundColor: buttonBg, opacity: pressed ? 0.75 : 1 }]}
      >
        <Txt w="semibold" color={buttonText}>
          + 1 glass
        </Txt>
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'flex-end', paddingTop: 8 },
  row: { flexDirection: 'row', gap: 12 },
  tile: { flex: 1, borderRadius: radii.tile + 4, padding: 14, gap: 2 },
  happening: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  motivation: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  drinkBtn: { minHeight: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
