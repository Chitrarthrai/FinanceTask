import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import AddTransactionModal from '../components/AddTransactionModal';
import { AuthProvider } from '../context/AuthContext';
import { DataProvider } from '../context/DataContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>
    <DataProvider>{children}</DataProvider>
  </AuthProvider>
);

describe('AddTransactionModal Integration Tests', () => {
  it('renders modal input fields and receives amount & title values', async () => {
    const onClose = jest.fn();
    const onSuccess = jest.fn();

    const { getByTestId } = await render(
      <AddTransactionModal
        isOpen={true}
        onClose={onClose}
        onSuccess={onSuccess}
      />,
      { wrapper }
    );

    const inputAmount = getByTestId('input-tx-amount');
    const inputTitle = getByTestId('input-tx-title');
    const btnSave = getByTestId('btn-save-tx');

    expect(inputAmount).toBeTruthy();
    expect(inputTitle).toBeTruthy();
    expect(btnSave).toBeTruthy();

    await act(async () => {
      fireEvent.changeText(inputAmount, '150');
      fireEvent.changeText(inputTitle, 'Groceries');
    });

    expect(inputAmount.props.value).toBe('150');
    expect(inputTitle.props.value).toBe('Groceries');
  });
});
