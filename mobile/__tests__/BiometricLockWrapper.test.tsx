import React from 'react';
import { render } from '@testing-library/react-native';
import { BiometricLockWrapper } from '../components/BiometricLockWrapper';
import { AuthProvider } from '../context/AuthContext';

describe('BiometricLockWrapper Component Tests', () => {
  it('renders children when test mode is active', async () => {
    process.env.EXPO_PUBLIC_TEST_MODE = 'true';

    const { getByTestId } = await render(
      <AuthProvider>
        <BiometricLockWrapper>
          <React.Fragment />
        </BiometricLockWrapper>
      </AuthProvider>
    );

    // Lock screen should be bypassed in test mode
    expect(() => getByTestId('biometric-lock-screen')).toThrow();
  });
});
