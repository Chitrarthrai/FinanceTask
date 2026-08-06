import * as LocalAuthentication from 'expo-local-authentication';

export interface BiometricStatus {
  hasHardware: boolean;
  isEnrolled: boolean;
  supportedTypes: LocalAuthentication.AuthenticationType[];
}

/**
 * Checks hardware availability for FaceID / Fingerprint biometrics
 */
export const checkBiometricHardware = async (): Promise<BiometricStatus> => {
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

    return {
      hasHardware,
      isEnrolled,
      supportedTypes,
    };
  } catch (error) {
    console.warn('FinanceTask Mobile: Biometric hardware check error', error);
    return {
      hasHardware: false,
      isEnrolled: false,
      supportedTypes: [],
    };
  }
};

/**
 * Prompts FaceID / Fingerprint biometric authentication dialog
 */
export const authenticateWithBiometrics = async (
  promptMessage: string = 'Unlock FinanceTask Workspace'
): Promise<{ success: boolean; error?: string }> => {
  try {
    const status = await checkBiometricHardware();
    if (!status.hasHardware || !status.isEnrolled) {
      return { success: true }; // Fallback to PIN / skip if no biometrics enrolled
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      fallbackLabel: 'Use Passcode',
      disableDeviceFallback: false,
      cancelLabel: 'Cancel',
    });

    if (result.success) {
      return { success: true };
    } else {
      return { success: false, error: (result as any).error || 'Authentication failed' };
    }
  } catch (error: any) {
    console.error('Biometric authentication error:', error);
    return { success: false, error: error.message };
  }
};
