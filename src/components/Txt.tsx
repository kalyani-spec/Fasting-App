import { Text, type TextProps, type TextStyle } from 'react-native';
import { colors, fonts } from '../lib/theme';

type Weight = keyof typeof fonts;

type Props = TextProps & {
  w?: Weight;
  size?: number;
  color?: string;
  center?: boolean;
  tabular?: boolean;
};

/** Poppins text. Android can't synthesise weights for custom fonts, so weight maps to a family. */
export function Txt({ w = 'regular', size = 15, color = colors.ink, center, tabular, style, ...rest }: Props) {
  const base: TextStyle = {
    fontFamily: fonts[w],
    fontSize: size,
    lineHeight: Math.round(size * 1.4),
    color,
    textAlign: center ? 'center' : undefined,
    fontVariant: tabular ? ['tabular-nums'] : undefined,
  };
  return <Text {...rest} style={[base, style]} />;
}
