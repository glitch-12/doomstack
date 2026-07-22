import React from 'react';
import {
  GestureResponderEvent,
  Pressable,
  PressableProps,
  StyleSheet,
  Text,
} from 'react-native';
import { useTheme } from '../../theme';
import { MIN_TOUCH_TARGET } from '../../a11y/constants';

export type ButtonVariant = 'primary' | 'secondary';

export interface ButtonProps
  extends Omit<
    PressableProps,
    'style' | 'accessibilityLabel' | 'accessibilityRole' | 'accessibilityState' | 'onPress' | 'disabled'
  > {
  /** Visible text, also used as the accessible name announced by screen readers. */
  label: string;
  onPress: (event: GestureResponderEvent) => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  testID?: string;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  testID,
  ...rest
}: ButtonProps): React.JSX.Element {
  const theme = useTheme();

  const backgroundColor = variant === 'primary' ? theme.colors.primary : theme.colors.surface;
  const textColor = variant === 'primary' ? theme.colors.primaryText : theme.colors.text;
  const borderColor = variant === 'primary' ? theme.colors.primary : theme.colors.border;

  return (
    <Pressable
      {...rest}
      testID={testID}
      onPress={onPress}
      disabled={disabled}
      accessible
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.base,
        {
          minHeight: MIN_TOUCH_TARGET,
          minWidth: MIN_TOUCH_TARGET,
          backgroundColor,
          borderColor,
          // Disabled always wins over the transient pressed state.
          opacity: disabled ? 0.5 : pressed ? 0.7 : 1,
        },
      ]}
    >
      <Text style={[theme.typography.body, styles.label, { color: textColor }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  label: {
    fontWeight: '600',
  },
});
