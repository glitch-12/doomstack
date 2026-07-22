import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Checkbox } from '../Checkbox';
import { ThemeProvider } from '../../../theme';
import { MIN_TOUCH_TARGET } from '../../../a11y/constants';

function renderCheckbox(props: Partial<React.ComponentProps<typeof Checkbox>> = {}) {
  const onChange = jest.fn();
  render(
    <ThemeProvider scheme="dark">
      <Checkbox label="Accept terms" checked={false} onChange={onChange} {...props} />
    </ThemeProvider>
  );
  return { onChange };
}

function flattenStyle(style: unknown): Record<string, unknown> {
  return Array.isArray(style) ? Object.assign({}, ...style.filter(Boolean)) : (style as Record<string, unknown>);
}

describe('Checkbox', () => {
  it('exposes an accessible checkbox role with the label as its name', () => {
    renderCheckbox();
    expect(screen.getByRole('checkbox', { name: 'Accept terms' })).toBeTruthy();
  });

  it('reports checked state via accessibilityState, not just a visible mark', () => {
    renderCheckbox({ checked: true });
    const box = screen.getByRole('checkbox', { name: 'Accept terms' });
    expect(box.props.accessibilityState).toMatchObject({ checked: true });
  });

  it('calls onChange with the toggled value when pressed', () => {
    const { onChange } = renderCheckbox({ checked: false });
    fireEvent.press(screen.getByRole('checkbox', { name: 'Accept terms' }));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('marks the checkbox disabled via accessibilityState and blocks presses', () => {
    const { onChange } = renderCheckbox({ disabled: true });
    const box = screen.getByRole('checkbox', { name: 'Accept terms' });
    expect(box.props.accessibilityState).toMatchObject({ disabled: true });
    fireEvent.press(box);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('meets the minimum touch target height', () => {
    renderCheckbox();
    const box = screen.getByRole('checkbox', { name: 'Accept terms' });
    const flatStyle = flattenStyle(box.props.style);
    expect(flatStyle.minHeight).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
  });
});
