import React from 'react';
import { render, screen } from '@testing-library/react-native';
import SettingsScreen from '../screens/SettingsScreen';
import { AuthProvider } from '../context/AuthContext';
import { DataProvider } from '../context/DataContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>
    <DataProvider>{children}</DataProvider>
  </AuthProvider>
);

describe('SettingsScreen Integration Tests', () => {
  it('renders settings configuration screen cleanly', async () => {
    render(<SettingsScreen />, { wrapper });
    expect(screen.getByText(/Preferences/i)).toBeTruthy();
  });
});
