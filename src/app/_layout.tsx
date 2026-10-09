import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from '@expo-google-fonts/poppins';
import notifee from '@notifee/react-native';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { milestonesFor } from '../lib/content';
import { FastProvider, useFast } from '../lib/FastProvider';
import { handleNotificationEvent, setupChannels, syncNotifications } from '../lib/notifications';
import * as store from '../lib/store';
import { HOUR } from '../lib/time';
import { colors } from '../lib/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  useEffect(() => {
    setupChannels().catch(() => {});
    const unsubFg = notifee.onForegroundEvent(handleNotificationEvent);
    // Re-post the ongoing notification on every open/foreground — it can be
    // swiped away on Android 14+ and doesn't survive a reboot.
    syncNotifications().catch(() => {});
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') syncNotifications().catch(() => {});
    });
    return () => {
      unsubFg();
      sub.remove();
    };
  }, []);

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <FastProvider>
        <StatusBar style="dark" />
        <MilestoneWatcher />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.ground } }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="milestone"
            options={{ presentation: 'fullScreenModal', animation: 'fade', contentStyle: { backgroundColor: colors.darkCard } }}
          />
          <Stack.Screen name="summary" options={{ presentation: 'modal' }} />
        </Stack>
      </FastProvider>
    </SafeAreaProvider>
  );
}

/** Opens the milestone modal the first time the app is seen after crossing one. */
function MilestoneWatcher() {
  const { active, now, loaded } = useFast();
  const router = useRouter();
  const busy = useRef(false);

  useEffect(() => {
    if (!loaded || !active || busy.current || AppState.currentState !== 'active') return;
    busy.current = true;
    (async () => {
      const elapsedH = (now - active.startTime) / HOUR;
      const reached = milestonesFor(active.goalHours).filter((h) => h <= elapsedH);
      if (!reached.length) return;
      const seen = await store.getMilestonesSeen();
      const fresh = reached.filter((h) => !seen.includes(h));
      if (!fresh.length) return;
      await store.markMilestonesSeen(fresh);
      router.push({ pathname: '/milestone', params: { h: String(Math.max(...fresh)) } });
    })()
      .catch(() => {})
      .finally(() => {
        busy.current = false;
      });
  }, [active, now, loaded, router]);

  return null;
}
