import { StyleSheet, View } from 'react-native';
import { OrganArt } from '../components/art/Organs';
import { WaterGlass } from '../components/art/WaterGlass';
import { Bobbing } from '../components/Bobbing';
import { Card } from '../components/Card';
import { NoFast } from '../components/NoFast';
import { Screen } from '../components/Screen';
import { Txt } from '../components/Txt';
import { PHASES, getPhaseIndex, phaseLabel, type Organ } from '../lib/content';
import { useFast } from '../lib/FastProvider';
import { colors, radii } from '../lib/theme';
import { HOUR, formatHM } from '../lib/time';

const ORGANS: { key: Organ; name: string }[] = [
  { key: 'brain', name: 'Brain' },
  { key: 'liver', name: 'Liver' },
  { key: 'stomach', name: 'Stomach' },
  { key: 'fat', name: 'Fat cells' },
];

export function BodyScreen() {
  const { active, now } = useFast();
  if (!active) {
    return <NoFast title="Nothing to show yet" body="Start a fast and this page follows what your body is doing, hour by hour." />;
  }

  const elapsedMs = Math.max(0, now - active.startTime);
  const elapsedH = elapsedMs / HOUR;
  const current = getPhaseIndex(elapsedH);
  const phase = PHASES[current];
  const timeline = PHASES.filter((p) => p.from < active.goalHours);

  return (
    <Screen>
      <View style={{ paddingTop: 8 }}>
        <Txt w="medium" color={colors.muted}>
          At {formatHM(elapsedMs)}
        </Txt>
        <Txt w="bold" size={24}>
          {"What's happening now"}
        </Txt>
      </View>

      <Card dark style={{ gap: 14 }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={{ flex: 1, gap: 4 }}>
            <Txt w="semibold" size={11} color={colors.mint} style={{ letterSpacing: 1.2 }}>
              {phaseLabel(phase)}
            </Txt>
            <Txt w="bold" size={22} color="#FFF">
              {phase.title}
            </Txt>
            <Txt size={14} color={colors.darkMuted}>
              {phase.explanation}
            </Txt>
          </View>
          <WaterGlass size={88} face="happy" arms="side" extras={['bolt']} />
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <InnerTile label="YOU MIGHT FEEL" text={phase.feel} />
          <InnerTile label="WHAT HELPS" text={phase.helps} />
        </View>
      </Card>

      <Txt w="semibold" size={17}>
        Your organs right now
      </Txt>
      <View style={styles.grid}>
        {ORGANS.map((o, i) => (
          <Card key={o.key} style={styles.organ}>
            <Bobbing delay={i * 400}>
              <OrganArt organ={o.key} size={76} />
            </Bobbing>
            <Txt w="semibold" center>
              {o.name}
            </Txt>
            <Txt size={13} color={colors.muted} center>
              {phase.organs[o.key]}
            </Txt>
          </Card>
        ))}
      </View>

      <Txt w="semibold" size={17}>
        Your {active.goalHours} hours
      </Txt>
      <Card style={{ paddingVertical: 10 }}>
        {timeline.map((p, i) => {
          const state = i < current ? 'done' : i === current ? 'current' : 'upcoming';
          const last = i === timeline.length - 1;
          return (
            <View key={p.from} style={styles.step}>
              <View style={styles.rail}>
                <View
                  style={[
                    styles.dot,
                    state === 'done' && { backgroundColor: colors.teal, borderColor: colors.teal },
                    state === 'current' && { backgroundColor: '#FFF', borderColor: colors.teal, borderWidth: 4 },
                  ]}
                />
                {!last && <View style={[styles.line, state === 'done' && { backgroundColor: colors.teal }]} />}
              </View>
              <View style={{ flex: 1, paddingBottom: last ? 4 : 18, gap: 2 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <Txt size={12} w="medium" color={colors.muted}>
                    {p.from}–{Math.min(p.to, active.goalHours)}h
                  </Txt>
                  {state === 'current' && (
                    <View style={styles.pill}>
                      <Txt w="semibold" size={11} color={colors.teal}>
                        You are here
                      </Txt>
                    </View>
                  )}
                </View>
                <Txt w="semibold" color={state === 'upcoming' ? colors.muted : colors.ink}>
                  {p.title}
                </Txt>
              </View>
            </View>
          );
        })}
      </Card>

      <Txt size={12} color={colors.muted}>
        Timings are approximate and differ person to person. If you feel faint, dizzy, or your heart races, stop and eat
        something light.
      </Txt>
    </Screen>
  );
}

function InnerTile({ label, text }: { label: string; text: string }) {
  return (
    <View style={styles.inner}>
      <Txt w="semibold" size={10} color={colors.mint} style={{ letterSpacing: 1 }}>
        {label}
      </Txt>
      <Txt size={13} color="#FFF">
        {text}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  organ: { width: '47.5%', flexGrow: 1, alignItems: 'center', gap: 4, padding: 14 },
  inner: { flex: 1, backgroundColor: colors.darkTile, borderRadius: radii.tile, padding: 12, gap: 4 },
  step: { flexDirection: 'row', gap: 12 },
  rail: { width: 18, alignItems: 'center' },
  dot: { width: 18, height: 18, borderRadius: 9, borderWidth: 2.5, borderColor: colors.inputBorder, backgroundColor: '#FFF', marginTop: 2 },
  line: { flex: 1, width: 3, backgroundColor: colors.line, marginVertical: 2, borderRadius: 2 },
  pill: { backgroundColor: colors.tealTint, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 1 },
});
