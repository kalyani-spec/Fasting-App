import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WaterGlass } from '../components/art/WaterGlass';
import { Button } from '../components/Button';
import { Txt } from '../components/Txt';
import { finishFast } from '../lib/actions';
import { milestoneCopy, milestonesFor } from '../lib/content';
import { useFast } from '../lib/FastProvider';
import { colors } from '../lib/theme';
import { HOUR, countAll, formatHM } from '../lib/time';

export function MilestoneScreen() {
  const { h } = useLocalSearchParams<{ h: string }>();
  const { active, now } = useFast();
  const router = useRouter();
  const hours = Number(h) || 12;

  if (!active) return null;

  const copy = milestoneCopy(hours, active.goalHours);
  const elapsedH = (now - active.startTime) / HOUR;
  const chips = milestonesFor(active.goalHours);
  const drinks = countAll(active.drinks);
  const toGoalMs = Math.max(0, active.startTime + active.goalHours * HOUR - now);

  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));
  const endHere = async () => {
    const ended = await finishFast();
    if (ended) router.replace({ pathname: '/summary', params: { id: ended.id } });
    else close();
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.top}>
        <WaterGlass size={170} face="cheer" arms="up" extras={['confetti']} />
        <View style={styles.pill}>
          <Txt w="bold" size={14} color={colors.ink}>
            {hours} hours
          </Txt>
        </View>
        <Txt w="bold" size={30} color="#FFF" center style={{ lineHeight: 38 }}>
          {copy.headline}
        </Txt>
        <Txt size={16} color={colors.darkMuted} center>
          {copy.body}
        </Txt>

        <View style={styles.chips}>
          {chips.map((c) => {
            const reached = c <= elapsedH;
            return (
              <View key={c} style={[styles.chip, reached ? styles.chipOn : styles.chipOff]}>
                <Txt w="semibold" size={13} color={reached ? colors.ink : colors.darkMuted}>
                  {c}h
                </Txt>
              </View>
            );
          })}
        </View>

        <View style={styles.stats}>
          <Stat value={String(drinks.water)} label="water" />
          <View style={styles.divider} />
          <Stat value={String(drinks.chaas)} label="chaas" />
          <View style={styles.divider} />
          <Stat value={toGoalMs > 0 ? formatHM(toGoalMs) : 'Done'} label="to goal" />
        </View>
      </View>

      <View style={{ gap: 10 }}>
        <Button title="Keep going" variant="mint" onPress={close} />
        <Button title={`End fast here — ${hours}h saved`} variant="outlineLight" onPress={endHere} />
        <Txt size={13} color={colors.darkMuted} center>
          Ending now still counts. Listen to your body.
        </Txt>
      </View>
    </SafeAreaView>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Txt w="bold" size={18} color="#FFF" tabular>
        {value}
      </Txt>
      <Txt size={12} color={colors.darkMuted}>
        {label}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.darkCard, padding: 20, justifyContent: 'space-between' },
  top: { alignItems: 'center', gap: 12, paddingTop: 16 },
  pill: { backgroundColor: colors.mint, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 4 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 8 },
  chip: { minWidth: 46, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, alignItems: 'center' },
  chipOn: { backgroundColor: colors.mint },
  chipOff: { borderWidth: 1.5, borderColor: colors.darkTile },
  stats: { flexDirection: 'row', alignSelf: 'stretch', backgroundColor: colors.darkTile, borderRadius: 16, paddingVertical: 14, marginTop: 8 },
  divider: { width: 1, backgroundColor: 'rgba(201,212,208,0.25)' },
});
