import Svg, { Circle, Ellipse, G, Path } from 'react-native-svg';
import type { Organ } from '../../lib/content';
import { colors } from '../../lib/theme';

const INK = colors.ink;
type P = { size?: number };

function Face({ l, r, smile, blushY }: { l: [number, number]; r: [number, number]; smile?: string; blushY?: number }) {
  const by = blushY ?? l[1] + 5;
  return (
    <G>
      <Circle cx={l[0]} cy={l[1]} r={3} fill={INK} />
      <Circle cx={r[0]} cy={r[1]} r={3} fill={INK} />
      <Ellipse cx={l[0] - 5} cy={by} rx={4} ry={2.4} fill={colors.blush} />
      <Ellipse cx={r[0] + 5} cy={by} rx={4} ry={2.4} fill={colors.blush} />
      {smile && <Path d={smile} stroke={INK} strokeWidth={2.5} strokeLinecap="round" fill="none" />}
    </G>
  );
}

const BRAIN_LOBES: [number, number, number][] = [
  [26, 36, 15],
  [42, 28, 16],
  [56, 38, 14],
  [40, 48, 18],
  [22, 50, 11],
  [58, 52, 10],
];

export function Brain({ size = 76 }: P) {
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80">
      {/* Stroke the union, then repaint 1.5 smaller without stroke to hide inner edges. */}
      {BRAIN_LOBES.map(([x, y, r], i) => (
        <Circle key={`o${i}`} cx={x} cy={y} r={r} fill="#F7B3C0" stroke={INK} strokeWidth={3} />
      ))}
      {BRAIN_LOBES.map(([x, y, r], i) => (
        <Circle key={`i${i}`} cx={x} cy={y} r={r - 1.5} fill="#F7B3C0" />
      ))}
      <Path d="M30 24q4 4 0 8M50 22q-3 5 2 8M60 40q-4 2-2 6M20 42q4 1 3 5" stroke="#D9788C" strokeWidth={2.5} strokeLinecap="round" fill="none" />
      <Face l={[34, 46]} r={[46, 46]} smile="M37 52q3 3 6 0" blushY={51} />
    </Svg>
  );
}

export function Liver({ size = 76 }: P) {
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80">
      <Path d="M8 38c0-14 18-20 36-18 16 2 30 6 30 16 0 12-16 24-36 28C20 67 8 56 8 38z" fill="#D9776A" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
      <Path d="M46 22q-4 10 2 20" stroke="#B85A4E" strokeWidth={2.5} strokeLinecap="round" fill="none" />
      <Circle cx={64} cy={12} r={4} fill={colors.sun} stroke={INK} strokeWidth={1.5} />
      <Circle cx={73} cy={6} r={2.6} fill={colors.sun} stroke={INK} strokeWidth={1.5} />
      <Face l={[26, 40]} r={[38, 40]} smile="M29 46q3 3 6 0" />
    </Svg>
  );
}

export function Stomach({ size = 76 }: P) {
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80">
      <Path d="M24 6h10v14c0 4 4 7 10 7 14 0 26 10 26 24 0 13-12 21-28 21C24 72 12 62 12 46c0-10 6-16 10-20 2-2 2-4 2-6z" fill="#F2A07B" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
      <Path d="M60 10q3 2 0 4t0 4M68 16q3 2 0 4t0 4" stroke={colors.muted} strokeWidth={2} strokeLinecap="round" fill="none" />
      <Face l={[34, 46]} r={[48, 46]} />
      <Ellipse cx={41} cy={55} rx={3} ry={3.5} fill={INK} />
    </Svg>
  );
}

export function FatCell({ size = 76 }: P) {
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80">
      <Path d="M16 44q-9-3-8-15M64 44q9-3 8-15" stroke={INK} strokeWidth={3} strokeLinecap="round" fill="none" />
      <Circle cx={40} cy={46} r={25} fill="#F6D365" stroke={INK} strokeWidth={3} />
      <Circle cx={30} cy={33} r={5} fill="#FBE9A8" />
      <Circle cx={52} cy={60} r={3} fill="#FBE9A8" />
      <Circle cx={56} cy={34} r={2} fill="#FBE9A8" />
      <Face l={[34, 46]} r={[46, 46]} smile="M36 52q4 5 8 0" blushY={51} />
    </Svg>
  );
}

export function OrganArt({ organ, size }: { organ: Organ; size?: number }) {
  switch (organ) {
    case 'brain':
      return <Brain size={size} />;
    case 'liver':
      return <Liver size={size} />;
    case 'stomach':
      return <Stomach size={size} />;
    case 'fat':
      return <FatCell size={size} />;
  }
}
