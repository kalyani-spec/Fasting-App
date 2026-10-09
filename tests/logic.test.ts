import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FACTS, PHASES, getMotivation, getNudge, getPhase, milestoneCopy, milestonesFor, nextTarget } from '../src/lib/content.ts';
import { HOUR, countToday, dayNumber, formatHHMM, formatHM, parseKg, startOfDay, totalDays } from '../src/lib/time.ts';

test('elapsed formats as HH:MM and can exceed 24h', () => {
  assert.equal(formatHHMM(10 * HOUR), '10:00');
  assert.equal(formatHHMM(30 * HOUR + 14 * 60_000), '30:14');
  assert.equal(formatHHMM(-5), '00:00');
  assert.equal(formatHM(41 * HOUR + 12 * 60_000), '41h 12m');
  assert.equal(formatHM(45 * 60_000), '45m');
});

test('backdated 10h start lands in "Running on stores"', () => {
  assert.equal(getPhase(10).title, 'Running on stores');
  assert.equal(getPhase(0).title, 'Digesting');
  assert.equal(getPhase(12).title, 'The switch');
  assert.equal(getPhase(30).title, 'Ketones are rising');
  assert.equal(getPhase(80).title, 'Steady state');
});

test('day numbering', () => {
  assert.equal(dayNumber(0), 1);
  assert.equal(dayNumber(23.9 * HOUR), 1);
  assert.equal(dayNumber(24 * HOUR), 2);
  assert.equal(totalDays(16), 1);
  assert.equal(totalDays(72), 3);
});

test('milestones are capped at goal and include the goal', () => {
  assert.deepEqual(milestonesFor(72), [12, 24, 36, 48, 60, 72]);
  assert.deepEqual(milestonesFor(48), [12, 24, 36, 48]);
  assert.deepEqual(milestonesFor(16), [12, 16]);
  assert.match(milestoneCopy(16, 16).headline, /Goal reached/);
  assert.equal(milestoneCopy(24, 72).headline, 'One full day.');
});

test('motivation fills {h}', () => {
  const m = getMotivation(30);
  assert.ok(!m.headline.includes('{h}'));
});

test("today's sips only count since local midnight", () => {
  const now = Date.now();
  const mid = startOfDay(now);
  const drinks = [
    { ts: mid - 1000, type: 'water' as const },
    { ts: mid + 1000, type: 'water' as const },
    { ts: mid + 2000, type: 'chaas' as const },
  ];
  assert.deepEqual(countToday(drinks, now), { water: 1, chaas: 1 });
});

test('weight parsing', () => {
  assert.equal(parseKg('72.44'), 72.4);
  assert.equal(parseKg('72,5'), 72.5);
  assert.equal(parseKg('abc'), null);
  assert.equal(parseKg('5'), null);
});

test('next target is the nearest of next day boundary / milestone / goal', () => {
  assert.deepEqual(nextTarget(30, 72), { label: '36h', inH: 6 });
  assert.equal(nextTarget(20, 72)?.label, 'Day 2');
  assert.equal(nextTarget(50, 72)?.label, '60h');
  assert.equal(nextTarget(66, 72)?.label, 'your 72h goal');
  assert.equal(nextTarget(5, 16)?.label, '12h');
  assert.equal(nextTarget(13, 16)?.label, 'your 16h goal');
  assert.equal(nextTarget(17, 16), null);
});

test('nudges have content for every phase and fill {h}', () => {
  assert.equal(FACTS.length, PHASES.length);
  for (let h = 0; h < 80; h++) {
    const n = getNudge(h);
    assert.ok(n.push.length > 0 && n.fact.length > 0);
    assert.ok(!n.push.includes('{h}'));
  }
});
