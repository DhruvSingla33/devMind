import { registerRootComponent } from 'expo';

import { loadThemeMode } from './src/theme/themeMode';

// Load the saved theme preference BEFORE requiring App. `App` (and its whole
// screen tree) pulls in theme/colors.js, which picks the light/dark palette at
// module-load time from `globalThis.__themeMode`. Deferring the require until
// after the preference is set means the correct palette is chosen on first
// paint with no per-screen theming code. require() (not a top-level import) is
// used so App's module tree evaluates here, after the global is set.
async function bootstrap() {
  globalThis.__themeMode = await loadThemeMode();
  const App = require('./App').default;

  // registerRootComponent calls AppRegistry.registerComponent('main', () => App);
  // It also ensures that whether you load the app in Expo Go or in a native build,
  // the environment is set up appropriately
  registerRootComponent(App);
}

bootstrap();
