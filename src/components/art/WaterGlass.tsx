import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';
import { colors } from '../../lib/theme';

export type Face = 'happy' | 'calm' | 'cheer' | 'open';
export type Arms = 'wave' | 'up' | 'side' | 'none';
export type Extra = 'moon' | 'bolt' | 'scale' | 'confetti';

type Props = { size?: number; face?: Face; arms?: Arms; extras?: Extra[] };

const INK = colors.ink;
const ARMS: Record<Exclude<Arms, 'none'>, [string, string]> = {
  wave: ['M34 66q-10 6-8 16', 'M87 62q12-2 16-16'],
  up: ['M34 64q-14-8-16-26', 'M86 64q14-8 16-26'],
  side: ['M34 66q-10 2-10 12', 'M86 66q10 2 10 12'],
};

const CONFETTI = [
  { x: 14, y: 20, c: '#F2C14E', r: 20 },
  { x: 104, y: 22, c: '#F2A39B', r: -25 },
  { x: 8, y: 52, c: '#9DC2F0', r: 40 },
  { x: 112, y: 54, c: '#8FD3C4', r: 15 },
  { x: 24, y: 6, c: '#8FD3C4', r: -10 },
  { x: 96, y: 4, c: '#F2C14E', r: 30 },
];
const DOTS = [
  { x: 30, y: 16, c: '#F2A39B' },
  { x: 120, y: 38, c: '#F2C14E' },
  { x: 4, y: 36, c: '#8FD3C4' },
  { x: 78, y: 8, c: '#9DC2F0' },
];

// viewBox is widened to 130 so the moon (x≈103–129) isn't clipped.
export function WaterGlass({ size = 120, face = 'happy', arms = 'side', extras = [] }: Props) {
  const has = (e: Extra) => extras.includes(e);
  return (
    <Svg width={(size * 130) / 120} height={size} viewBox="0 0 130 120">
      {has('confetti') && (
        <G>
          {CONFETTI.map((p, i) => (
            <Rect key={i} x={p.x} y={p.y} width={6} height={3.5} rx={1} fill={p.c} transform={`rotate(${p.r} ${p.x + 3} ${p.y + 2})`} />
          ))}
          {DOTS.map((p, i) => (
            <Circle key={`d${i}`} cx={p.x} cy={p.y} r={2.2} fill={p.c} />
          ))}
        </G>
      )}
      {has('moon') && <Path d="M116 6a13 13 0 1 0 8 22a11 11 0 0 1-8-22z" fill={colors.sun} />}
      {has('bolt') && <Path d="M106 30l-10 16h8l-5 14 12-19h-8l5-11z" fill={colors.sun} stroke={INK} strokeWidth={2} strokeLinejoin="round" />}
      {has('scale') && (
        <G>
          <Rect x={22} y={100} width={76} height={14} rx={7} fill={colors.tealTint} stroke={INK} strokeWidth={2.5} />
          <Rect x={52} y={104} width={16} height={6} rx={2} fill={colors.surface} />
        </G>
      )}

      {arms !== 'none' && (
        <G stroke={INK} strokeWidth={3} strokeLinecap="round" fill="none">
          <Path d={ARMS[arms][0]} />
          <Path d={ARMS[arms][1]} />
        </G>
      )}

      <Path d="M32 34h56l-6.5 66a8 8 0 0 1-8 7h-27a8 8 0 0 1-8-7z" fill="#FFF" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
      <Path d="M35.5 58c6-4 12 4 18 0s12 4 18 0 9 2 12 1l-4.2 41a5 5 0 0 1-5 4.5h-25.6a5 5 0 0 1-5-4.5z" fill="#CFE6FA" />
      <Circle cx={50} cy={94} r={2.5} fill="#FFF" />
      <Circle cx={68} cy={97} r={2} fill="#FFF" />
      <Circle cx={60} cy={90} r={1.5} fill="#FFF" />
      <Path d="M88 12c3 4 5 7 5 9a5 5 0 0 1-10 0c0-2 2-5 5-9z" fill="#9DC2F0" stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />

      {face === 'happy' || face === 'open' ? (
        <G>
          <Circle cx={51} cy={74} r={4} fill={INK} />
          <Circle cx={69} cy={74} r={4} fill={INK} />
          <Circle cx={52.3} cy={72.6} r={1.3} fill="#FFF" />
          <Circle cx={70.3} cy={72.6} r={1.3} fill="#FFF" />
        </G>
      ) : (
        <Path d="M46 74q4-4 8 0M66 74q4-4 8 0" stroke={INK} strokeWidth={3} strokeLinecap="round" fill="none" />
      )}
      <Ellipse cx={44} cy={82} rx={5} ry={3} fill={colors.blush} />
      <Ellipse cx={76} cy={82} rx={5} ry={3} fill={colors.blush} />
      {face === 'open' || face === 'cheer' ? (
        <Path d="M53 80q7 11 14 0z" fill={INK} />
      ) : (
        <Path d="M55 82q5 5 10 0" stroke={INK} strokeWidth={3} strokeLinecap="round" fill="none" />
      )}
    </Svg>
  );
}
