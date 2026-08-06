import React from 'react';
import { render, screen } from '@testing-library/react-native';
import P2PShareScreen from '../screens/P2PShareScreen';
import { AuthProvider } from '../context/AuthContext';
import { DataProvider } from '../context/DataContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>
    <DataProvider>{children}</DataProvider>
  </AuthProvider>
);

describe('P2PShareScreen Integration Tests', () => {
  it('renders P2P Share screen cleanly', async () => {
    render(<P2PShareScreen />, { wrapper });
    expect(screen.getByText(/Share/i)).toBeTruthy();
  });
});
