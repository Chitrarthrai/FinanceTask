import React from 'react';
import { render } from '@testing-library/react-native';
import SecurityScreen from '../screens/SecurityScreen';
import { AuthProvider } from '../context/AuthContext';
import { DataProvider } from '../context/DataContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>
    <DataProvider>{children}</DataProvider>
  </AuthProvider>
);

describe('SecurityScreen Integration Tests', () => {
  it('renders security settings screen cleanly', async () => {
    const { getAllByText } = await render(<SecurityScreen />, { wrapper });
    expect(getAllByText(/Security/i).length).toBeGreaterThan(0);
  });
});
