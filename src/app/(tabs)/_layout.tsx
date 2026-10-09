import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors, fonts } from '../../lib/theme';

function Icon({ name, color }: { name: 'timer' | 'body' | 'weight'; color: ColorValue }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      {name === 'timer' && (
        <>
          <Circle cx={12} cy={13} r={8} />
          <Path d="M12 9v4l2.5 2M10 2h4" />
        </>
      )}
      {name === 'body' && <Path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10z" />}
      {name === 'weight' && (
        <>
          <Path d="M5 21h14l-2-12H7z" />
          <Circle cx={12} cy={5} r={2.5} />
        </>
      )}
    </Svg>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.teal,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.line, height: 64, paddingTop: 6 },
        tabBarLabelStyle: { fontFamily: fonts.medium, fontSize: 12 },
        sceneStyle: { backgroundColor: colors.ground },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Timer', tabBarIcon: ({ color }) => <Icon name="timer" color={color} /> }} />
      <Tabs.Screen name="body" options={{ title: 'Body', tabBarIcon: ({ color }) => <Icon name="body" color={color} /> }} />
      <Tabs.Screen name="weight" options={{ title: 'Weight', tabBarIcon: ({ color }) => <Icon name="weight" color={color} /> }} />
    </Tabs>
  );
}
