import colors from '../theme/colors';

// Shared native-stack header look — imported by every Stack navigator so a
// single tweak (color, weight, border) updates the whole app's chrome at once
// instead of drifting across five duplicated screenOptions objects.
const headerOptions = {
  headerStyle: {
    backgroundColor: colors.backgroundElevated,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTintColor: colors.primary,
  headerTitleStyle: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 17,
  },
  headerShadowVisible: false,
};

export default headerOptions;
