import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';

// Kept separate so it sits inside ThemeProvider and re-renders on theme change.
function ThemedStatusBar() {
  const { isDark } = useTheme();
  return <StatusBar style={isDark ? 'light' : 'dark'} />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ThemedStatusBar />
        <RootNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
}
