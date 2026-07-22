import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewProps } from 'react-native';
import { useTheme } from '../../theme';
import { MIN_TOUCH_TARGET } from '../../a11y/constants';

export interface RadioOption {
  label: string;
  value: string;
}

export interface RadioGroupProps extends Omit<ViewProps, 'style'> {
  /**
   * Visible heading for the group (e.g. the question being asked), rendered
   * with `accessibilityRole="header"` so screen readers announce it once
   * before moving into the individually-focusable options below.
   */
  label: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  testID?: string;
}

export function RadioGroup({
  label,
  options,
  value,
  onChange,
  disabled = false,
  testID,
  ...rest
}: RadioGroupProps): React.JSX.Element {
  const theme = useTheme();

  return (
    <View {...rest} testID={testID} style={styles.group}>
      <Text
        accessibilityRole="header"
        style={[theme.typography.label, { color: theme.colors.textMuted, marginBottom: theme.spacing.xs }]}
      >
        {label}
      </Text>
      {options.map((option) => {
        const checked = option.value === value;
        return (
          <Pressable
            key={option.value}
            testID={testID ? `${testID}-${option.value}` : undefined}
            onPress={() => onChange(option.value)}
            disabled={disabled}
            accessible
            accessibilityRole="radio"
            accessibilityLabel={option.label}
            accessibilityState={{ checked, disabled }}
            style={[
              styles.option,
              { minHeight: MIN_TOUCH_TARGET, opacity: disabled ? 0.5 : 1 },
            ]}
          >
            <View
              style={[
                styles.dot,
                {
                  borderColor: checked ? theme.colors.primary : theme.colors.border,
                },
              ]}
            >
              {checked ? (
                <View style={[styles.dotFill, { backgroundColor: theme.colors.primary }]} />
              ) : null}
            </View>
            <Text
              style={[theme.typography.body, { color: theme.colors.text, marginLeft: theme.spacing.sm }]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    width: '100%',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotFill: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
