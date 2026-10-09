import { useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, Easing } from 'react-native';

/** translateY 0 → -5 → 0 over 2.6s, looping. Off when reduce-motion is on. */
export function Bobbing({ delay = 0, children }: { delay?: number; children: React.ReactNode }) {
  const [y] = useState(() => new Animated.Value(0));
  const [reduce, setReduce] = useState(true);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduce);
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduce);
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (reduce) {
      y.setValue(0);
      return;
    }
    const half = { duration: 1300, easing: Easing.inOut(Easing.sin), useNativeDriver: true };
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(y, { toValue: -5, ...half }),
        Animated.timing(y, { toValue: 0, ...half }),
      ]),
    );
    const t = setTimeout(() => loop.start(), delay);
    return () => {
      clearTimeout(t);
      loop.stop();
    };
  }, [reduce, delay, y]);

  return <Animated.View style={{ transform: [{ translateY: y }] }}>{children}</Animated.View>;
}
