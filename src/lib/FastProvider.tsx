import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import * as store from './store';
import type { Fast, WeightEntry } from './types';

type FastState = {
  loaded: boolean;
  active: Fast | null;
  history: Fast[];
  weights: WeightEntry[];
  now: number;
  reload: () => Promise<void>;
};

const Ctx = createContext<FastState | null>(null);

const TICK_MS = 15_000;

export function FastProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<Omit<FastState, 'reload' | 'now'>>({
    loaded: false,
    active: null,
    history: [],
    weights: [],
  });
  const [now, setNow] = useState(() => Date.now());

  const reload = useCallback(async () => {
    const [active, history, weights] = await Promise.all([
      store.getActive(),
      store.getHistory(),
      store.getWeights(),
    ]);
    setState({ loaded: true, active, history, weights });
    setNow(Date.now());
  }, []);

  useEffect(() => {
    // Initial async load from storage; state is set after the awaits.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reload();
    const unsub = store.subscribe(reload);
    // Drinks added from the notification while backgrounded are written by the
    // headless task, so re-read storage whenever we come back.
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') reload();
    });
    const t = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => {
      unsub();
      sub.remove();
      clearInterval(t);
    };
  }, [reload]);

  return <Ctx.Provider value={{ ...state, now, reload }}>{children}</Ctx.Provider>;
}

export function useFast(): FastState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useFast must be used inside FastProvider');
  return v;
}
