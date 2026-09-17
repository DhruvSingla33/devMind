import { Alert, Platform } from 'react-native';

// react-native-web's Alert.alert() is a hard no-op (it never fires button
// callbacks), so anything gated behind it — a confirmation, an error
// message — would silently do nothing on the web target. Fall back to the
// browser's native dialogs there.

export function notify(title, message) {
  if (Platform.OS === 'web') {
    window.alert(message ? `${title}\n\n${message}` : title);
    return;
  }
  Alert.alert(title, message);
}

export function confirmAsync(title, message, confirmLabel = 'Confirm') {
  if (Platform.OS === 'web') {
    return Promise.resolve(window.confirm(message ? `${title}\n\n${message}` : title));
  }
  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
      { text: confirmLabel, style: 'destructive', onPress: () => resolve(true) },
    ]);
  });
}
