import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { TextInput } from '../TextInput';
import { ThemeProvider } from '../../../theme';
import { MIN_TOUCH_TARGET } from '../../../a11y/constants';

function renderInput(props: Partial<React.ComponentProps<typeof TextInput>> = {}) {
  const onChangeText = jest.fn();
  render(
    <ThemeProvider scheme="dark">
      <TextInput label="Email" value="" onChangeText={onChangeText} {...props} />
    </ThemeProvider>
  );
  return { onChangeText };
}

describe('TextInput', () => {
  it('exposes an accessible name built from the label', () => {
    renderInput();
    expect(screen.getByLabelText('Email')).toBeTruthy();
  });

  it('calls onChangeText when the user types', () => {
    const { onChangeText } = renderInput();
    fireEvent.changeText(screen.getByLabelText('Email'), 'a@b.com');
    expect(onChangeText).toHaveBeenCalledWith('a@b.com');
  });

  it('folds the error into the accessible name so screen readers hear it immediately', () => {
    renderInput({ error: 'Enter a valid email' });
    expect(screen.getByLabelText('Email, Enter a valid email')).toBeTruthy();
    expect(screen.getByText('Enter a valid email')).toBeTruthy();
  });

  it('marks the field disabled via accessibilityState, not just visually', () => {
    renderInput({ disabled: true });
    const field = screen.getByLabelText('Email');
    expect(field.props.accessibilityState).toMatchObject({ disabled: true });
    expect(field.props.editable).toBe(false);
  });

  it('meets the minimum touch target height', () => {
    renderInput();
    const field = screen.getByLabelText('Email');
    const flatStyle = Array.isArray(field.props.style)
      ? Object.assign({}, ...field.props.style.filter(Boolean))
      : field.props.style;
    expect(flatStyle.minHeight).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
  });
});
