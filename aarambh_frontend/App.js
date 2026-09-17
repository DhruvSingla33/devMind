import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';
import { isDarkTheme } from './src/theme/colors';

export default function App() {
  return (
    <AuthProvider>
      <StatusBar style={isDarkTheme ? 'light' : 'dark'} />
      <RootNavigator />
    </AuthProvider>
  );
}
