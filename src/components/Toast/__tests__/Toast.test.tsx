import React from 'react';
import { AccessibilityInfo } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import { Toast } from '../Toast';
import { ThemeProvider } from '../../../theme';

function renderToast(props: Partial<React.ComponentProps<typeof Toast>> = {}) {
  const onDismiss = jest.fn();
  const utils = render(
    <ThemeProvider scheme="dark">
      <Toast visible message="Saved" onDismiss={onDismiss} {...props} />
    </ThemeProvider>
  );
  return { onDismiss, ...utils };
}

describe('Toast', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    // AccessibilityInfo.announceForAccessibility is a shared jest.fn() from
    // RN's test setup, not reset between tests by default — clear it so each
    // test's call-count assertions aren't polluted by earlier tests.
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders nothing when not visible', () => {
    renderToast({ visible: false });
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('exposes the message as an alert for screen readers', () => {
    renderToast({ message: 'Saved successfully' });
    expect(screen.getByRole('alert', { name: 'Saved successfully' })).toBeTruthy();
  });

  it('announces the message once when it first appears', () => {
    renderToast({ message: 'Saved successfully' });
    expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith('Saved successfully');
    expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledTimes(1);
  });

  it('calls onDismiss automatically after the given duration', () => {
    const { onDismiss } = renderToast({ duration: 3000 });
    expect(onDismiss).not.toHaveBeenCalled();
    jest.advanceTimersByTime(2999);
    expect(onDismiss).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('does not reset the auto-dismiss timer when onDismiss identity changes but visible stays true', () => {
    const onDismiss = jest.fn();
    const { rerender } = render(
      <ThemeProvider scheme="dark">
        <Toast visible message="Saved" onDismiss={onDismiss} duration={3000} />
      </ThemeProvider>
    );
    jest.advanceTimersByTime(2000);
    const secondOnDismiss = jest.fn();
    rerender(
      <ThemeProvider scheme="dark">
        <Toast visible message="Saved" onDismiss={secondOnDismiss} duration={3000} />
      </ThemeProvider>
    );
    jest.advanceTimersByTime(1000);
    expect(secondOnDismiss).toHaveBeenCalledTimes(1);
  });

  it('applies distinct colors for success and error variants', () => {
    renderToast({ variant: 'success', testID: 'success-toast' });
    const successStyle = screen.getByTestId('success-toast').props.style;

    renderToast({ variant: 'error', testID: 'error-toast' });
    const errorStyle = screen.getByTestId('error-toast').props.style;

    const flatten = (style: unknown) =>
      Array.isArray(style) ? Object.assign({}, ...style.filter(Boolean)) : style;
    expect(flatten(successStyle).backgroundColor).not.toBe(flatten(errorStyle).backgroundColor);
  });
});
