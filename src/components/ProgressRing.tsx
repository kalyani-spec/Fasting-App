import Svg, { Circle } from 'react-native-svg';
import { colors } from '../lib/theme';

type Props = { size?: number; stroke?: number; progress: number };

/** Ring starting at 12 o'clock with round caps. progress 0..1 */
export function ProgressRing({ size = 240, stroke = 16, progress }: Props) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const p = Math.max(0, Math.min(1, progress));
  return (
    <Svg width={size} height={size}>
      <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.line} strokeWidth={stroke} fill="none" />
      {p > 0 && (
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={colors.teal}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${c} ${c}`}
          strokeDashoffset={c * (1 - p)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      )}
    </Svg>
  );
}
