import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import LoginScreen from '../screens/LoginScreen';
import { AuthProvider } from '../context/AuthContext';
import { DataProvider } from '../context/DataContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>
    <DataProvider>{children}</DataProvider>
  </AuthProvider>
);

describe('LoginScreen Integration Tests', () => {
  it('renders login form inputs and updates email and password fields', async () => {
    const { getByTestId } = await render(<LoginScreen />, { wrapper });

    const inputEmail = getByTestId('input-login-email');
    const inputPassword = getByTestId('input-login-password');
    const btnSubmit = getByTestId('btn-login-submit');

    expect(inputEmail).toBeTruthy();
    expect(inputPassword).toBeTruthy();
    expect(btnSubmit).toBeTruthy();

    await act(async () => {
      fireEvent.changeText(inputEmail, 'user@example.com');
    });

    await act(async () => {
      fireEvent.changeText(inputPassword, 'secret123');
    });

    expect(inputEmail.props.value).toBe('user@example.com');
    expect(inputPassword.props.value).toBe('secret123');
  });
});
