// Writes a white monochrome vector drawable `ic_small_icon` used as the
// notification small icon (Android requires a single-colour icon).
const { withDangerousMod } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

const ICON = `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="24dp" android:height="24dp"
    android:viewportWidth="24" android:viewportHeight="24">
  <!-- glass -->
  <path android:fillColor="#FFFFFFFF"
      android:pathData="M5,3h14l-1.6,17.2A2,2 0,0 1,15.4 22H8.6A2,2 0,0 1,6.6 20.2L5,3zM7.2,5l0.5,5.2c1.4,-0.8 2.8,0.6 4.3,0s2.9,0.8 4.3,0L16.8,5H7.2z"/>
</vector>
`;

module.exports = function withNotificationIcon(config) {
  return withDangerousMod(config, [
    'android',
    async (cfg) => {
      const dir = path.join(cfg.modRequest.platformProjectRoot, 'app/src/main/res/drawable');
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, 'ic_small_icon.xml'), ICON);
      return cfg;
    },
  ]);
};
