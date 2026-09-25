import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'dev.senbilan.manage',
  appName: 'Senbilan Manage',
  webDir: '../../dist/apps/mobile/browser',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      backgroundColor: '#0f172a',
    },
    StatusBar: {
      style: 'DARK',
    },
  },
};

export default config;
