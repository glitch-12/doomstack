import React, { useEffect, useRef } from 'react';
import {
  AccessibilityInfo,
  StyleSheet,
  Text,
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  View,
} from 'react-native';
import { useTheme } from '../../theme';
import { MIN_TOUCH_TARGET } from '../../a11y/constants';

export interface TextInputProps
  extends Omit<RNTextInputProps, 'style' | 'onChangeText' | 'accessibilityLabel'> {
  /** Visible label, also used to build the accessible name announced by screen readers. */
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  /** When set, renders as an error and is announced to screen readers when it changes. */
  error?: string;
  disabled?: boolean;
  testID?: string;
}

export function TextInput({
  label,
  value,
  onChangeText,
  error,
  disabled = false,
  testID,
  ...rest
}: TextInputProps): React.JSX.Element {
  const theme = useTheme();
  const previousError = useRef<string | undefined>(undefined);

  useEffect(() => {
    // Live regions aren't reliable across iOS/Android, so we explicitly push
    // the error to the screen reader the moment it appears (WCAG 4.1.3).
    if (error && error !== previousError.current) {
      AccessibilityInfo.announceForAccessibility(error);
    }
    previousError.current = error;
  }, [error]);

  const accessibleLabel = error ? `${label}, ${error}` : label;

  return (
    <View style={styles.container}>
      <Text
        style={[
          theme.typography.label,
          { color: theme.colors.textMuted, marginBottom: theme.spacing.xs },
        ]}
      >
        {label}
      </Text>
      <RNTextInput
        {...rest}
        testID={testID}
        value={value}
        onChangeText={onChangeText}
        editable={!disabled}
        accessibilityLabel={accessibleLabel}
        accessibilityState={{ disabled }}
        placeholderTextColor={theme.colors.textMuted}
        style={[
          theme.typography.body,
          styles.input,
          {
            minHeight: MIN_TOUCH_TARGET,
            color: theme.colors.text,
            backgroundColor: theme.colors.surface,
            borderColor: error ? theme.colors.danger : theme.colors.border,
            opacity: disabled ? 0.5 : 1,
          },
        ]}
      />
      {error ? (
        <Text
          accessibilityLiveRegion="polite"
          style={[theme.typography.label, { color: theme.colors.danger, marginTop: theme.spacing.xs }]}
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
});
