# Fasting Tracker

Standalone Expo (React Native, TypeScript) Android app for tracking a water/chaas fast:
live elapsed timer (in-app and on the lock screen), one-tap water/chaas logging (also
from the notification), "what's happening now" with organ characters, weight log and
milestone motivation.

## Run it on your phone

Notifee doesn't work in Expo Go, so you need a **development build**.

```bash
npm install
npx eas-cli@latest login
npx eas-cli@latest build --profile development --platform android   # installs as an APK
npm start                                                            # then open the dev build
```

Building without git? In PowerShell set `$env:EAS_NO_VCS=1` once per session first.

To check the lock screen: Settings → Notifications → Lock screen → **Show all notification
content** (the app shows this tip once after you start a fast).

## Scripts

| Command | What it does |
|---|---|
| `npm start` | Metro for the dev client |
| `npm run build:dev` | EAS development build (Android APK) |
| `npm run build:preview` | Standalone APK (no Metro needed) — use this to keep the app on the phone |
| `npm run typecheck` / `npm run lint` | `tsc --noEmit` / `expo lint` |
| `npm test` | Unit tests for time formatting, phases, milestones (Node's built-in runner) |

## Layout

```
index.ts                     notifee.onBackgroundEvent, then expo-router/entry
plugins/withNotificationIcon white vector `ic_small_icon` for the notification
src/app/                     routes: (tabs)/index|body|weight, milestone (modal), summary
src/screens/                 Start, Timer, Body, Weight, Milestone, Summary
src/lib/store.ts             the only place that reads/writes AsyncStorage
src/lib/notifications.ts     channels, ongoing notification, milestone triggers, action handler
src/lib/content.ts           phases, organ status, motivation, milestone copy
src/lib/time.ts              formatting + "today" helpers
src/lib/surfaces.ts          refreshes notification + widget; shared notification event handler
src/widget/                  home-screen widget, its headless task handler and updater
src/components/art/          WaterGlass mascot + organ characters (react-native-svg)
```

## How the pieces fit

- **Elapsed** is always `Date.now() - startTime`, so it survives kills and reboots.
- **Lock screen**: an ongoing, `PUBLIC` notification with `showChronometer` + `timestamp =
  startTime`; Android ticks it, the app doesn't need to run. It's re-posted every time the
  app opens or comes to the foreground (it can be swiped on Android 14+ and doesn't survive
  a reboot).
- **+ Water / + Chaas** on the notification are handled by the shared
  `handleNotificationEvent` (background in `index.ts`, foreground in the root layout): append
  the drink, then re-post the notification with the same id to update counts.
- **Milestones** (12/24/36/48/60/72h, capped at the goal, plus the goal itself for 16h) are
  scheduled as `ms-<h>` trigger notifications — exact alarms if "Alarms & reminders" is
  allowed (asked once), otherwise inexact WorkManager triggers. When one fires, the ongoing
  notification's progress is refreshed. In-app, the milestone modal opens the first time the
  app is seen after crossing one (`milestones:seen`). Milestones already behind a backdated
  start aren't celebrated.
- **Keep-going content**: the lock-screen notification shows the day, phase, a rotating
  "keep going" line, and (expanded) a fasting fact plus time to the next target. Nudges
  (`nudge-<h>`) fire every 3 hours, not 10 PM–8 AM and not next to a milestone, and can be
  turned off on the Timer screen. Each one also refreshes the lock-screen text.
- **Home-screen widget** (`src/widget/`, via `react-native-android-widget`): hours fasted,
  progress, the push line and + Water / + Chaas buttons. It redraws every 30 min (which also
  refreshes the lock-screen notification) and on every change. Android phones generally don't
  let apps place widgets on the lock screen itself, so the notification is the lock-screen part.
- **Ending** moves the fast to `fast:history`, cancels the ongoing notification and all `ms-*`
  triggers, and shows a summary that never uses failure language.
