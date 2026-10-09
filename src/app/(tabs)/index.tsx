import { ActivityIndicator, View } from 'react-native';
import { StartScreen } from '../../screens/StartScreen';
import { TimerScreen } from '../../screens/TimerScreen';
import { useFast } from '../../lib/FastProvider';
import { colors } from '../../lib/theme';

export default function TimerTab() {
  const { loaded, active } = useFast();
  if (!loaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.teal} />
      </View>
    );
  }
  return active ? <TimerScreen fast={active} /> : <StartScreen />;
}
