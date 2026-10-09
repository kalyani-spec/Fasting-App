export type Organ = 'brain' | 'liver' | 'stomach' | 'fat';

export type Phase = {
  from: number;
  to: number;
  title: string;
  explanation: string;
  feel: string;
  helps: string;
  organs: Record<Organ, string>;
  motivation: { headline: string; body: string }[];
};

export const PHASES: Phase[] = [
  {
    from: 0,
    to: 4,
    title: 'Digesting',
    explanation: 'Your last meal is being absorbed. Blood sugar rises, then settles.',
    feel: 'Normal, full',
    helps: 'Nothing special — start sipping water',
    organs: {
      brain: 'Running on sugar from your meal',
      liver: 'Storing extra sugar for later',
      stomach: 'Digesting your last meal',
      fat: 'Resting',
    },
    motivation: [
      { headline: "The timer's running.", body: "That's the hardest click." },
      { headline: 'Hunger now is habit, not need.', body: 'It passes in about 20 minutes.' },
    ],
  },
  {
    from: 4,
    to: 12,
    title: 'Running on stores',
    explanation: 'Insulin drops. Your body draws on sugar stored in the liver and muscles.',
    feel: 'First hunger pangs',
    helps: 'Water, staying busy',
    organs: {
      brain: 'Still running on sugar',
      liver: 'Releasing its stored sugar',
      stomach: 'Emptying out',
      fat: 'Starting to release a little fat',
    },
    motivation: [
      { headline: "The timer's running.", body: "That's the hardest click." },
      { headline: 'Hunger now is habit, not need.', body: 'It passes in about 20 minutes.' },
    ],
  },
  {
    from: 12,
    to: 24,
    title: 'The switch',
    explanation:
      'Stored sugar runs low and fat burning picks up. Hunger often peaks at old meal times.',
    feel: 'Hunger waves, a bit foggy',
    helps: 'Water, salted chaas, a short walk',
    organs: {
      brain: 'Might feel foggy around meal times',
      liver: 'Stores running low, switching gears',
      stomach: 'Grumbles at old meal times',
      fat: 'Releasing more fat for fuel',
    },
    motivation: [
      {
        headline: 'Hunger comes in waves.',
        body: 'Usually around your old meal times. Sip something and wait it out.',
      },
    ],
  },
  {
    from: 24,
    to: 48,
    title: 'Ketones are rising',
    explanation:
      'Your stored sugar is mostly used up. Your liver is turning fat into ketones, which your brain and muscles can run on.',
    feel: 'Low energy, a mild headache, hunger in waves',
    helps: 'Salted chaas, water, rest, an easy walk',
    organs: {
      brain: 'Starting to run partly on ketones',
      liver: 'Busy turning fat into ketones',
      stomach: 'Empty and quiet, grumbles at old meal times',
      fat: 'Handing over fat as fuel',
    },
    motivation: [
      { headline: '{h} hours.', body: "Yesterday's hunger is behind you." },
      { headline: 'Day two.', body: 'Your body knows what to do now.' },
    ],
  },
  {
    from: 48,
    to: 72,
    title: 'Steady state',
    explanation: 'For many people hunger eases and energy evens out.',
    feel: 'Calmer hunger, lighter',
    helps: 'Move gently, rest more, keep sipping',
    organs: {
      brain: 'Using more ketones for fuel',
      liver: 'Making ketones steadily',
      stomach: 'Hunger often quieter now',
      fat: 'The main fuel supplier now',
    },
    motivation: [{ headline: 'The home stretch.', body: 'Go slow, rest, keep sipping.' }],
  },
];

export function getPhaseIndex(elapsedH: number): number {
  for (let i = PHASES.length - 1; i >= 0; i--) {
    if (elapsedH >= PHASES[i].from) return i;
  }
  return 0;
}

export function getPhase(elapsedH: number): Phase {
  return PHASES[getPhaseIndex(elapsedH)];
}

export function phaseLabel(p: Phase): string {
  return `${p.from}–${p.to} HOURS`;
}

/** Rotates within a phase every 3 hours so it changes but doesn't flicker. */
export function getMotivation(elapsedH: number) {
  const phase = getPhase(elapsedH);
  const i = Math.floor(elapsedH / 3) % phase.motivation.length;
  const m = phase.motivation[i];
  const h = String(Math.floor(elapsedH));
  return { headline: m.headline.replace('{h}', h), body: m.body.replace('{h}', h) };
}

export const MILESTONE_HOURS = [12, 24, 36, 48, 60, 72] as const;

const MILESTONE_COPY: Record<number, { headline: string; body: string }> = {
  12: { headline: 'Half a day.', body: 'Your body is starting to dip into its stores.' },
  24: { headline: 'One full day.', body: 'The hardest stretch is usually the first. You just did it.' },
  36: { headline: '36 hours.', body: "Ketones are climbing. You're past the halfway mark of day two." },
  48: { headline: 'Two full days.', body: 'Many people find hunger gets quieter from here.' },
  60: { headline: '60 hours.', body: 'Twelve to go. Keep it gentle.' },
  72: { headline: 'Three days. Done.', body: 'Break your fast slowly with something light.' },
};

/** Milestones celebrated for a goal: the standard ones up to the goal, plus the goal itself. */
export function milestonesFor(goalHours: number): number[] {
  const list: number[] = MILESTONE_HOURS.filter((h) => h <= goalHours);
  if (!list.includes(goalHours)) list.push(goalHours);
  return list.sort((a, b) => a - b);
}

export function milestoneCopy(hours: number, goalHours: number) {
  if (hours === goalHours && !MILESTONE_COPY[hours]) {
    return {
      headline: `${hours} hours. Goal reached.`,
      body: 'You did what you set out to do. Break it gently, or keep going if you feel good.',
    };
  }
  return MILESTONE_COPY[hours] ?? { headline: `${hours} hours.`, body: 'Keep it gentle.' };
}
