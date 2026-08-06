import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import AddTaskModal from '../components/AddTaskModal';
import { AuthProvider } from '../context/AuthContext';
import { DataProvider } from '../context/DataContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>
    <DataProvider>{children}</DataProvider>
  </AuthProvider>
);

describe('AddTaskModal Integration Tests', () => {
  it('renders task modal input fields and updates title & description', async () => {
    const onClose = jest.fn();
    const onSuccess = jest.fn();

    const { getByTestId } = await render(
      <AddTaskModal
        isOpen={true}
        onClose={onClose}
        onSuccess={onSuccess}
      />,
      { wrapper }
    );

    const inputTitle = getByTestId('input-task-title');
    const inputDesc = getByTestId('input-task-desc');
    const btnSave = getByTestId('btn-save-task');

    expect(inputTitle).toBeTruthy();
    expect(inputDesc).toBeTruthy();
    expect(btnSave).toBeTruthy();

    await act(async () => {
      fireEvent.changeText(inputTitle, 'Test Unit Task');
    });
    await act(async () => {
      fireEvent.changeText(inputDesc, 'Task Details Unit Test');
    });

    expect(inputTitle.props.value).toBe('Test Unit Task');
    expect(inputDesc.props.value).toBe('Task Details Unit Test');
  });
});
