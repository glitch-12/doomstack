import React from 'react';
import { Text, Modal as RNModal } from 'react-native';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Modal } from '../Modal';
import { ThemeProvider } from '../../../theme';

function renderModal(props: Partial<React.ComponentProps<typeof Modal>> = {}) {
  const onClose = jest.fn();
  render(
    <ThemeProvider scheme="dark">
      <Modal visible title="Delete item" onClose={onClose} testID="dialog" {...props}>
        <Text>Are you sure?</Text>
      </Modal>
    </ThemeProvider>
  );
  return { onClose };
}

describe('Modal', () => {
  it('renders the title as a header and shows its content when visible', () => {
    renderModal();
    expect(screen.getByRole('header', { name: 'Delete item' })).toBeTruthy();
    expect(screen.getByText('Are you sure?')).toBeTruthy();
  });

  it('does not render its content when not visible', () => {
    renderModal({ visible: false });
    expect(screen.queryByText('Are you sure?')).toBeNull();
  });

  it('exposes an accessible close button that calls onClose', () => {
    const { onClose } = renderModal();
    fireEvent.press(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when the backdrop is pressed', () => {
    const { onClose } = renderModal();
    fireEvent.press(screen.getByTestId('dialog-backdrop', { includeHiddenElements: true }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not close on backdrop press when dismissOnBackdropPress is false', () => {
    const { onClose } = renderModal({ dismissOnBackdropPress: false });
    fireEvent.press(screen.getByTestId('dialog-backdrop', { includeHiddenElements: true }));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('wires onRequestClose to onClose, so the Android hardware back button dismisses it', () => {
    const { onClose } = renderModal();
    const modalElement = screen.UNSAFE_getByType(RNModal);
    modalElement.props.onRequestClose();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('hides the backdrop from screen readers so it is not announced as a focusable element', () => {
    renderModal();
    const backdrop = screen.getByTestId('dialog-backdrop', { includeHiddenElements: true });
    expect(backdrop.props.accessibilityElementsHidden).toBe(true);
  });
});
