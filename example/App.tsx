import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  Button,
  Checkbox,
  Modal,
  RadioGroup,
  TextInput,
  Toast,
  ThemeProvider,
  useTheme,
} from '../src';

const PLAN_OPTIONS = [
  { label: 'Free', value: 'free' },
  { label: 'Pro', value: 'pro' },
  { label: 'Team', value: 'team' },
];

function DemoForm() {
  const { colors } = useTheme();

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>(undefined);
  const [agreed, setAgreed] = useState(false);
  const [plan, setPlan] = useState('free');
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);

  const handleContinue = () => {
    if (!email.includes('@')) {
      setEmailError('Enter a valid email');
      return;
    }
    setEmailError(undefined);
    setConfirmVisible(true);
  };

  const handleConfirm = () => {
    setConfirmVisible(false);
    setToastVisible(true);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.heading, { color: colors.text }]}>doomstack demo</Text>
        <Text style={[styles.subheading, { color: colors.text }]}>
          A real form flow — label → input → validation → submit → confirmation
          toast — for manually verifying VoiceOver (iOS) and TalkBack (Android).
        </Text>

        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          error={emailError}
          autoCapitalize="none"
          keyboardType="email-address"
          testID="email-input"
        />

        <RadioGroup
          label="Plan"
          options={PLAN_OPTIONS}
          value={plan}
          onChange={setPlan}
          testID="plan-radio-group"
        />

        <Checkbox
          label="I agree to the terms"
          checked={agreed}
          onChange={setAgreed}
          testID="agree-checkbox"
        />

        <Button
          label="Continue"
          onPress={handleContinue}
          disabled={!agreed}
          testID="continue-button"
        />
      </ScrollView>

      <Modal
        visible={confirmVisible}
        onClose={() => setConfirmVisible(false)}
        title="Confirm submission"
        testID="confirm-modal"
      >
        <Text style={{ color: colors.text }}>
          Submit the {plan} plan signup for {email}?
        </Text>
        <Button label="Confirm" onPress={handleConfirm} testID="confirm-button" />
      </Modal>

      <Toast
        visible={toastVisible}
        message="Signup submitted"
        onDismiss={() => setToastVisible(false)}
        variant="success"
        testID="submit-toast"
      />

      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <DemoForm />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
    gap: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
  },
  subheading: {
    fontSize: 14,
    marginBottom: 8,
  },
});
