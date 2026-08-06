import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { DataProvider, useData } from '../context/DataContext';

// Simple wrapper to provide DataContext
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <DataProvider>
    {children}
  </DataProvider>
);

describe('DataContext Integration Tests', () => {
  it('allows adding and managing tasks', async () => {
    const { result } = await renderHook(() => useData(), { wrapper });

    await waitFor(() => {
      expect(result.current.isDataLoaded).toBe(true);
    });

    await act(async () => {
      await result.current.addTask({
        id: '12345678-1234-4321-abcd-1234567890ab',
        title: 'Test Jest Task',
        description: 'Test Description',
        status: 'todo',
        priority: 'medium',
        dueDate: new Date().toISOString(),
        recurring: false,
        category: 'Personal',
      });
    });

    expect(result.current.tasks.some(t => t.title === 'Test Jest Task')).toBe(true);
  });

  it('allows adding and managing transactions', async () => {
    const { result } = await renderHook(() => useData(), { wrapper });

    await waitFor(() => {
      expect(result.current.isDataLoaded).toBe(true);
    });

    await act(async () => {
      await result.current.addTransaction({
        id: '12345678-1234-4321-abcd-1234567890ac',
        title: 'Salary Credit',
        amount: 5000,
        type: 'income',
        category: 'Salary',
        date: new Date().toISOString(),
        paymentMethod: 'Cash',
      });
    });

    expect(result.current.transactions.some(t => t.title === 'Salary Credit')).toBe(true);
  });
});









