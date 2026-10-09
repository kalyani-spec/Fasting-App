import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { WaterGlass } from './art/WaterGlass';
import { Button } from './Button';
import { Screen } from './Screen';
import { Txt } from './Txt';
import { colors } from '../lib/theme';

export function NoFast({ title, body }: { title: string; body: string }) {
  const router = useRouter();
  return (
    <Screen contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}>
      <WaterGlass size={120} face="calm" arms="none" extras={['moon']} />
      <View style={{ gap: 6 }}>
        <Txt w="bold" size={22} center>
          {title}
        </Txt>
        <Txt color={colors.muted} center>
          {body}
        </Txt>
      </View>
      <Button title="Start a fast" onPress={() => router.navigate('/')} style={{ alignSelf: 'stretch' }} />
    </Screen>
  );
}
