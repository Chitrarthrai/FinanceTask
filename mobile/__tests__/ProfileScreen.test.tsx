import React from 'react';
import { render, screen } from '@testing-library/react-native';
import ProfileScreen from '../screens/ProfileScreen';
import { AuthProvider } from '../context/AuthContext';
import { DataProvider } from '../context/DataContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>
    <DataProvider>{children}</DataProvider>
  </AuthProvider>
);

describe('ProfileScreen Component Integration Tests', () => {
  it('renders user profile and configurations screen cleanly', async () => {
    render(<ProfileScreen />, { wrapper });
    expect(screen.getByText(/Profile/i)).toBeTruthy();
  });
});
