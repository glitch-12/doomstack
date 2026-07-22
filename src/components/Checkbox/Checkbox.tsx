import React from 'react';
import { Pressable, PressableProps, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../theme';
import { MIN_TOUCH_TARGET } from '../../a11y/constants';

export interface CheckboxProps
  extends Omit<
    PressableProps,
    'style' | 'accessibilityLabel' | 'accessibilityRole' | 'accessibilityState' | 'onPress' | 'disabled'
  > {
  /** Visible text next to the box, also used as the accessible name. */
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  testID?: string;
}

export function Checkbox({
  label,
  checked,
  onChange,
  disabled = false,
  testID,
  ...rest
}: CheckboxProps): React.JSX.Element {
  const theme = useTheme();

  return (
    <Pressable
      {...rest}
      testID={testID}
      onPress={() => onChange(!checked)}
      disabled={disabled}
      accessible
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{ checked, disabled }}
      style={[
        styles.container,
        { minHeight: MIN_TOUCH_TARGET, opacity: disabled ? 0.5 : 1 },
      ]}
    >
      <View
        style={[
          styles.box,
          {
            borderColor: checked ? theme.colors.primary : theme.colors.border,
            backgroundColor: checked ? theme.colors.primary : theme.colors.surface,
          },
        ]}
      >
        {checked ? <Text style={{ color: theme.colors.primaryText }}>✓</Text> : null}
      </View>
      <Text style={[theme.typography.body, { color: theme.colors.text, marginLeft: theme.spacing.sm }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  box: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
