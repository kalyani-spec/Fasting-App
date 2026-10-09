import { View, type ViewProps } from 'react-native';
import { colors, radii } from '../lib/theme';

export function Card({ style, dark, ...rest }: ViewProps & { dark?: boolean }) {
  return (
    <View
      {...rest}
      style={[
        {
          backgroundColor: dark ? colors.darkCard : colors.surface,
          borderRadius: radii.card,
          padding: 18,
        },
        style,
      ]}
    />
  );
}
