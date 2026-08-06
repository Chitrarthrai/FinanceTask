import React from 'react';
import { render, screen } from '@testing-library/react-native';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import { AuthProvider } from '../context/AuthContext';
import { DataProvider } from '../context/DataContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>
    <DataProvider>{children}</DataProvider>
  </AuthProvider>
);

describe('AnalyticsScreen Component Integration Tests', () => {
  it('renders analytics screen cleanly without crashing', async () => {
    render(<AnalyticsScreen />, { wrapper });
    expect(screen.getByText(/Analytics/i)).toBeTruthy();
  });
});
