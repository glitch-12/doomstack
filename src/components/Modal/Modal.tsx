import React, { useEffect, useRef } from 'react';
import {
  AccessibilityInfo,
  Modal as RNModal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTheme } from '../../theme';
import { MIN_TOUCH_TARGET } from '../../a11y/constants';

export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  /** Rendered as the modal's heading, and announced to screen readers the moment it opens. */
  title: string;
  children: React.ReactNode;
  /**
   * Tapping the dimmed backdrop closes the modal. This is a sighted/touch
   * convenience only — VoiceOver/TalkBack intercept plain taps for their own
   * navigation gestures, so the close button is the accessible dismissal
   * path regardless of this setting.
   */
  dismissOnBackdropPress?: boolean;
  testID?: string;
}

export function Modal({
  visible,
  onClose,
  title,
  children,
  dismissOnBackdropPress = true,
  testID,
}: ModalProps): React.JSX.Element {
  const theme = useTheme();
  const wasVisible = useRef(false);

  useEffect(() => {
    // Screen readers don't reliably announce a newly-presented native modal
    // on their own, so we push the title the moment it opens (WCAG 4.1.3),
    // same approach as the error announcement in TextInput.
    if (visible && !wasVisible.current) {
      AccessibilityInfo.announceForAccessibility(title);
    }
    wasVisible.current = visible;
  }, [visible, title]);

  return (
    <RNModal visible={visible} transparent animationType="fade" onRequestClose={onClose} testID={testID}>
      <View style={styles.overlay}>
        <Pressable
          testID={testID ? `${testID}-backdrop` : undefined}
          style={StyleSheet.absoluteFill}
          onPress={dismissOnBackdropPress ? onClose : undefined}
          accessibilityRole="none"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        />
        <View accessibilityViewIsModal style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.header}>
            <Text accessibilityRole="header" style={[theme.typography.heading, { color: theme.colors.text }]}>
              {title}
            </Text>
            <Pressable
              onPress={onClose}
              accessible
              accessibilityRole="button"
              accessibilityLabel="Close"
              style={[
                styles.closeButton,
                { minHeight: MIN_TOUCH_TARGET, minWidth: MIN_TOUCH_TARGET },
              ]}
            >
              <Text style={{ color: theme.colors.textMuted }}>✕</Text>
            </Pressable>
          </View>
          {children}
        </View>
      </View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 480,
    borderRadius: 12,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  closeButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
