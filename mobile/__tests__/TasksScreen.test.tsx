import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react-native';
import TasksScreen from '../screens/TasksScreen';
import { AuthProvider } from '../context/AuthContext';
import { DataProvider } from '../context/DataContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>
    <DataProvider>{children}</DataProvider>
  </AuthProvider>
);

describe('TasksScreen Operations Kanban Component Tests', () => {
  it('renders operations kanban screen cleanly', async () => {
    render(<TasksScreen route={{ params: {} }} />, { wrapper });
    await waitFor(() => {
      expect(screen.getByText(/Tasks/i)).toBeTruthy();
    });
    await act(async () => {});
  });
});

