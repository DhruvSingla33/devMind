import { DefaultTheme, DarkTheme } from '@react-navigation/native';
import colors, { isDarkTheme } from '../theme/colors';

const base = isDarkTheme ? DarkTheme : DefaultTheme;

export const navigationTheme = {
  ...base,
  colors: {
    ...base.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.backgroundElevated,
    text: colors.textPrimary,
    border: colors.border,
    notification: colors.primary,
  },
};

export default navigationTheme;
