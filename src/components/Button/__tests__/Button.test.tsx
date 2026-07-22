import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Button } from '../Button';
import { ThemeProvider } from '../../../theme';
import { MIN_TOUCH_TARGET } from '../../../a11y/constants';

function renderButton(props: Partial<React.ComponentProps<typeof Button>> = {}) {
  const onPress = jest.fn();
  render(
    <ThemeProvider scheme="dark">
      <Button label="Submit" onPress={onPress} {...props} />
    </ThemeProvider>
  );
  return { onPress };
}

function flattenStyle(style: unknown): Record<string, unknown> {
  return Array.isArray(style) ? Object.assign({}, ...style.filter(Boolean)) : (style as Record<string, unknown>);
}

describe('Button', () => {
  it('exposes an accessible button role with the label as its name', () => {
    renderButton();
    expect(screen.getByRole('button', { name: 'Submit' })).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const { onPress } = renderButton();
    fireEvent.press(screen.getByRole('button', { name: 'Submit' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('marks the button disabled via accessibilityState and blocks presses', () => {
    const { onPress } = renderButton({ disabled: true });
    const button = screen.getByRole('button', { name: 'Submit' });
    expect(button.props.accessibilityState).toMatchObject({ disabled: true });
    fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('meets the minimum touch target size', () => {
    renderButton();
    const button = screen.getByRole('button', { name: 'Submit' });
    const flatStyle = flattenStyle(button.props.style);
    expect(flatStyle.minHeight).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
    expect(flatStyle.minWidth).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
  });

  it('applies distinct colors for the primary and secondary variants', () => {
    renderButton({ variant: 'primary', testID: 'primary-btn' });
    const primaryStyle = flattenStyle(screen.getByTestId('primary-btn').props.style);

    renderButton({ variant: 'secondary', testID: 'secondary-btn' });
    const secondaryStyle = flattenStyle(screen.getByTestId('secondary-btn').props.style);

    expect(primaryStyle.backgroundColor).not.toBe(secondaryStyle.backgroundColor);
  });
});
