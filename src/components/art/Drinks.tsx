import Svg, { Path } from 'react-native-svg';

/** Small glass icon for the drink tiles. */
export function GlassIcon({ size = 28, stroke, fill }: { size?: number; stroke: string; fill: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      <Path d="M7 5h18l-2 22a2 2 0 0 1-2 2H11a2 2 0 0 1-2-2z" fill="#FFF" stroke={stroke} strokeWidth={2.2} strokeLinejoin="round" />
      <Path d="M8.2 14c3-1.5 5 1.5 8 0s5 1.5 7.6 0L22.8 26.6a1.6 1.6 0 0 1-1.6 1.4H10.8a1.6 1.6 0 0 1-1.6-1.4z" fill={fill} />
    </Svg>
  );
}
