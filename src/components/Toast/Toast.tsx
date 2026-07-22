import React, { useEffect, useRef } from 'react';
import { AccessibilityInfo, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../theme';

export type ToastVariant = 'default' | 'success' | 'error';

export interface ToastProps {
  visible: boolean;
  message: string;
  onDismiss: () => void;
  variant?: ToastVariant;
  /** Milliseconds before the toast calls `onDismiss` on its own. */
  duration?: number;
  testID?: string;
}

export function Toast({
  visible,
  message,
  onDismiss,
  variant = 'default',
  duration = 4000,
  testID,
}: ToastProps): React.JSX.Element | null {
  const theme = useTheme();
  const wasVisible = useRef(false);
  // Read through refs inside the effect below so the auto-dismiss timer only
  // resets on a real false->true transition or a `duration` change — not on
  // every render where the caller passed a fresh `onDismiss` closure or the
  // same `message` again, which would otherwise silently extend the toast
  // indefinitely.
  const messageRef = useRef(message);
  messageRef.current = message;
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  useEffect(() => {
    if (!visible) {
      wasVisible.current = false;
      return;
    }

    if (!wasVisible.current) {
      // accessibilityLiveRegion only works on Android, so the appearance is
      // announced explicitly here too (same approach as TextInput's error
      // announcement) to reach VoiceOver users as well (WCAG 4.1.3).
      AccessibilityInfo.announceForAccessibility(messageRef.current);
    }
    wasVisible.current = true;

    const timer = setTimeout(() => onDismissRef.current(), duration);
    return () => clearTimeout(timer);
  }, [visible, duration]);

  if (!visible) {
    return null;
  }

  const backgroundColor =
    variant === 'success' ? theme.colors.success : variant === 'error' ? theme.colors.danger : theme.colors.surface;
  const textColor = variant === 'default' ? theme.colors.text : theme.colors.primaryText;

  return (
    <View
      testID={testID}
      accessible
      accessibilityRole="alert"
      accessibilityLabel={message}
      style={[styles.container, { backgroundColor }]}
    >
      <Text style={[theme.typography.body, { color: textColor }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 32,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
});
