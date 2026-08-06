import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import NotesView from '../components/NotesView';
import { AuthProvider } from '../context/AuthContext';
import { DataProvider } from '../context/DataContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>
    <DataProvider>{children}</DataProvider>
  </AuthProvider>
);

describe('NotesView Component & Feature Integration Tests', () => {
  it('renders search input and new note button with testIDs', async () => {
    const { getByTestId } = await render(<NotesView />, { wrapper });

    const searchInput = getByTestId('input-notes-search');
    const btnNewNote = getByTestId('btn-new-note');

    expect(searchInput).toBeTruthy();
    expect(btnNewNote).toBeTruthy();

    await act(async () => {
      fireEvent.changeText(searchInput, 'Budget Meeting');
    });

    expect(searchInput.props.value).toBe('Budget Meeting');
  });
});
