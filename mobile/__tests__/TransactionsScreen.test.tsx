import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react-native';
import TransactionsScreen from '../screens/TransactionsScreen';
import { AuthProvider } from '../context/AuthContext';
import { DataProvider } from '../context/DataContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>
    <DataProvider>{children}</DataProvider>
  </AuthProvider>
);

describe('TransactionsScreen Audit Ledger Component Tests', () => {
  it('renders transactions audit ledger screen cleanly', async () => {
    render(<TransactionsScreen route={{ params: {} }} />, { wrapper });
    await waitFor(() => {
      expect(screen.getByText('Transactions')).toBeTruthy();
    });
    await act(async () => {});
  });
});
