import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { RadioGroup } from '../RadioGroup';
import { ThemeProvider } from '../../../theme';
import { MIN_TOUCH_TARGET } from '../../../a11y/constants';

const OPTIONS = [
  { label: 'Small', value: 'sm' },
  { label: 'Medium', value: 'md' },
  { label: 'Large', value: 'lg' },
];

function renderGroup(props: Partial<React.ComponentProps<typeof RadioGroup>> = {}) {
  const onChange = jest.fn();
  render(
    <ThemeProvider scheme="dark">
      <RadioGroup label="Size" options={OPTIONS} value="sm" onChange={onChange} {...props} />
    </ThemeProvider>
  );
  return { onChange };
}

function flattenStyle(style: unknown): Record<string, unknown> {
  return Array.isArray(style) ? Object.assign({}, ...style.filter(Boolean)) : (style as Record<string, unknown>);
}

describe('RadioGroup', () => {
  it('renders the group label as a header, announced once rather than per-option', () => {
    renderGroup();
    expect(screen.getByRole('header', { name: 'Size' })).toBeTruthy();
  });

  it('renders each option with a radio role and its own accessible name', () => {
    renderGroup();
    expect(screen.getByRole('radio', { name: 'Small' })).toBeTruthy();
    expect(screen.getByRole('radio', { name: 'Medium' })).toBeTruthy();
    expect(screen.getByRole('radio', { name: 'Large' })).toBeTruthy();
  });

  it('marks only the selected option as checked via accessibilityState', () => {
    renderGroup({ value: 'md' });
    expect(screen.getByRole('radio', { name: 'Small' }).props.accessibilityState).toMatchObject({
      checked: false,
    });
    expect(screen.getByRole('radio', { name: 'Medium' }).props.accessibilityState).toMatchObject({
      checked: true,
    });
  });

  it('calls onChange with the pressed option value', () => {
    const { onChange } = renderGroup({ value: 'sm' });
    fireEvent.press(screen.getByRole('radio', { name: 'Large' }));
    expect(onChange).toHaveBeenCalledWith('lg');
  });

  it('marks options disabled via accessibilityState and blocks presses', () => {
    const { onChange } = renderGroup({ disabled: true });
    const option = screen.getByRole('radio', { name: 'Medium' });
    expect(option.props.accessibilityState).toMatchObject({ disabled: true });
    fireEvent.press(option);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('meets the minimum touch target height for each option', () => {
    renderGroup();
    const option = screen.getByRole('radio', { name: 'Small' });
    const flatStyle = flattenStyle(option.props.style);
    expect(flatStyle.minHeight).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
  });
});
