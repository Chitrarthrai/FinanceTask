import React from 'react';
import { render } from '@testing-library/react-native';
import ReportsScreen from '../screens/ReportsScreen';
import { AuthProvider } from '../context/AuthContext';
import { DataProvider } from '../context/DataContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>
    <DataProvider>{children}</DataProvider>
  </AuthProvider>
);

describe('ReportsScreen Integration Tests', () => {
  it('renders report screen header and export button', async () => {
    const { getByTestId } = await render(<ReportsScreen />, { wrapper });

    const btnExport = getByTestId('btn-export-pdf');
    expect(btnExport).toBeTruthy();
  });
});
