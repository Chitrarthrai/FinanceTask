import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import ChatScreen from '../screens/ChatScreen';
import { AuthProvider } from '../context/AuthContext';
import { DataProvider } from '../context/DataContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>
    <DataProvider>{children}</DataProvider>
  </AuthProvider>
);

describe('ChatScreen AI Integration Tests', () => {
  it('renders AI assistant input prompt and receives user typing', async () => {
    const { getByTestId } = await render(<ChatScreen />, { wrapper });

    const inputPrompt = getByTestId('input-chat-prompt');
    const btnSend = getByTestId('btn-send-chat');

    expect(inputPrompt).toBeTruthy();
    expect(btnSend).toBeTruthy();

    await act(async () => {
      fireEvent.changeText(inputPrompt, 'What is my budget analysis?');
    });

    expect(inputPrompt.props.value).toBe('What is my budget analysis?');
  });
});
