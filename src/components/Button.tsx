import { Pressable, StyleSheet, type ViewStyle } from 'react-native';
import { colors, radii, TOUCH } from '../lib/theme';
import { Txt } from './Txt';

type Props = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'mint' | 'outline' | 'outlineLight' | 'link';
  disabled?: boolean;
  style?: ViewStyle;
};

export function Button({ title, onPress, variant = 'primary', disabled, style }: Props) {
  const v = VARIANTS[variant];
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        v.box,
        { opacity: disabled ? 0.45 : pressed ? 0.8 : 1 },
        style,
      ]}
    >
      <Txt w={variant === 'link' ? 'medium' : 'semibold'} size={variant === 'link' ? 14 : 16} color={v.text}>
        {title}
      </Txt>
    </Pressable>
  );
}

const VARIANTS: Record<NonNullable<Props['variant']>, { box: ViewStyle; text: string }> = {
  primary: { box: { backgroundColor: colors.teal }, text: '#FFFFFF' },
  mint: { box: { backgroundColor: colors.mint }, text: colors.ink },
  outline: { box: { borderWidth: 1.5, borderColor: colors.teal }, text: colors.teal },
  outlineLight: { box: { borderWidth: 1.5, borderColor: colors.darkMuted }, text: '#FFFFFF' },
  link: { box: { minHeight: TOUCH, paddingVertical: 0 }, text: colors.muted },
};

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: radii.button,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
});
