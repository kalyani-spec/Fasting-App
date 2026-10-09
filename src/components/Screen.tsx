import { ScrollView, type ScrollViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, SCREEN_PADDING } from '../lib/theme';

export function Screen({ children, contentContainerStyle, bg = colors.ground, ...rest }: ScrollViewProps & { bg?: string }) {
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: bg }}>
      <ScrollView
        {...rest}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[{ padding: SCREEN_PADDING, paddingBottom: 40, gap: 16 }, contentContainerStyle]}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
