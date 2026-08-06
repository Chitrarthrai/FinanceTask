global.IS_REACT_ACT_ENVIRONMENT = true;

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);


// Mock Expo Notifications
jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  getExpoPushTokenAsync: jest.fn().mockResolvedValue({ data: 'mock-expo-push-token' }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  setNotificationHandler: jest.fn(),
  scheduleNotificationAsync: jest.fn().mockResolvedValue('mock-notification-id'),
  cancelScheduledNotificationAsync: jest.fn().mockResolvedValue(),
  AndroidNotificationPriority: { HIGH: 5, DEFAULT: 3 },
  AndroidAudioUsage: { ALARM: 4 },
}));

// Mock Expo Local Authentication (Biometrics)
jest.mock('expo-local-authentication', () => ({
  hasHardwareAsync: jest.fn().mockResolvedValue(true),
  isEnrolledAsync: jest.fn().mockResolvedValue(true),
  supportedAuthenticationTypesAsync: jest.fn().mockResolvedValue([1]),
  authenticateAsync: jest.fn().mockResolvedValue({ success: true }),
}));

// Mock WebRTC for P2P
jest.mock('react-native-webrtc', () => ({
  RTCPeerConnection: jest.fn().mockImplementation(() => ({
    createOffer: jest.fn().mockResolvedValue({}),
    createAnswer: jest.fn().mockResolvedValue({}),
    setLocalDescription: jest.fn().mockResolvedValue({}),
    setRemoteDescription: jest.fn().mockResolvedValue({}),
    addIceCandidate: jest.fn().mockResolvedValue({}),
    onicecandidate: null,
    ondatachannel: null,
    close: jest.fn(),
  })),
  RTCIceCandidate: jest.fn(),
  RTCSessionDescription: jest.fn(),
}));

// Mock DateTimePicker
jest.mock('@react-native-community/datetimepicker', () => {
  const React = require('react');
  const { View } = require('react-native');
  const MockComponent = (props) => React.createElement(View, props);
  return {
    __esModule: true,
    default: MockComponent,
  };
});


// Mock Expo Image Picker
jest.mock('expo-image-picker', () => ({
  requestCameraPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  launchCameraAsync: jest.fn().mockResolvedValue({ canceled: true }),
  launchImageLibraryAsync: jest.fn().mockResolvedValue({ canceled: true }),
}));

// Mock Expo File System
jest.mock('expo-file-system/legacy', () => ({
  readAsStringAsync: jest.fn().mockResolvedValue(''),
  EncodingType: { Base64: 'base64' },
}));

// Mock Expo Constants
jest.mock('expo-constants', () => ({
  expoConfig: {
    name: 'FinanceTask',
    slug: 'FinanceTask',
  },
}));

// Mock Expo Print & Sharing
jest.mock('expo-print', () => ({
  printToFileAsync: jest.fn().mockResolvedValue({ uri: 'mock-pdf-uri' }),
}));
jest.mock('expo-sharing', () => ({
  shareAsync: jest.fn().mockResolvedValue(),
}));

// Mock Safe Area Context
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const { View } = require('react-native');
  const inset = { top: 0, right: 0, bottom: 0, left: 0 };
  return {
    SafeAreaProvider: ({ children }) => children,
    SafeAreaView: (props) => React.createElement(View, props),
    useSafeAreaInsets: () => inset,
    useSafeAreaFrame: () => ({ x: 0, y: 0, width: 390, height: 844 }),
  };
});

// Mock React Navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
  NavigationContainer: ({ children }) => children,
}));

// Mock React Native Gifted Charts
jest.mock('react-native-gifted-charts', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    PieChart: (props) => React.createElement(View, props),
    BarChart: (props) => React.createElement(View, props),
    LineChart: (props) => React.createElement(View, props),
  };
});

// Mock Gemini AI utils
jest.mock('./utils/gemini', () => ({
  parseReceiptImage: jest.fn().mockResolvedValue(null),
}));
jest.mock('./utils/geminiChat', () => ({
  chatWithGemini: jest.fn().mockResolvedValue({ text: 'Mock AI Response' }),
}));

// Mock React Native Reanimated
jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock')
);
global.ReanimatedDataMock = {
  now: () => Date.now(),
};


// Mock Supabase with auth and database queries
jest.mock('./lib/supabase', () => {
  const mockAuth = {
    getSession: jest.fn().mockResolvedValue({ data: { session: { user: { id: 'mock-user-id', email: 'test@example.com' } } } }),
    onAuthStateChange: jest.fn().mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } }),
    signOut: jest.fn().mockResolvedValue({}),
  };

  // Helper to build a chainable mock that behaves as a standard Promise
  const createMockQueryBuilder = (mockResolveValue) => {
    const promise = Promise.resolve(mockResolveValue);
    const builder = {
      select: () => builder,
      insert: (payload) => {
        const resolvedPayload = Array.isArray(payload) ? payload[0] : payload;
        const resultPayload = { ...resolvedPayload };
        if (!resultPayload.id) {
          resultPayload.id = '12345678-1234-4321-abcd-1234567890ab';
        }
        return createMockQueryBuilder({ data: resultPayload, error: null });
      },
      update: (payload) => {
        const resolvedPayload = Array.isArray(payload) ? payload[0] : payload;
        return createMockQueryBuilder({ data: resolvedPayload, error: null });
      },
      delete: () => builder,
      eq: () => builder,
      order: () => builder,
      limit: () => builder,
      single: () => builder,
      maybeSingle: () => builder,
      then: (onFulfilled, onRejected) => promise.then(onFulfilled, onRejected),
      catch: (onRejected) => promise.catch(onRejected),
      finally: (onFinally) => promise.finally(onFinally),
    };
    return builder;
  };


  const defaultMockResponse = {
    data: {
      id: 'mock-inserted-id',
      monthly_salary: 5000,
      savings_target_percent: 20,
      fixed_expenses: [],
      variable_expenses: [],
      emergency_fund_amount: 0,
      currency_symbol: '$'
    },
    error: null
  };

  const mockFrom = jest.fn().mockImplementation((table) => {
    if (table === 'tasks' || table === 'transactions' || table === 'notes' || table === 'categories') {
      return createMockQueryBuilder({ data: [], error: null });
    }
    return createMockQueryBuilder(defaultMockResponse);
  });


  return {
    supabase: {
      auth: mockAuth,
      from: mockFrom,
      rpc: jest.fn().mockResolvedValue({ data: [], error: null }),
    },
  };
});

// Mock AuthContext with static singleton user reference to prevent useEffect infinite loops
const MOCK_USER = { id: 'mock-user-id', email: 'test@example.com' };
const MOCK_SESSION = { user: MOCK_USER };

const mockAuthContext = {
  AuthProvider: ({ children }) => children,
  useAuth: () => ({
    session: MOCK_SESSION,
    user: MOCK_USER,
    loading: false,
    signOut: jest.fn(),
  }),
};

jest.mock('./context/AuthContext', () => mockAuthContext);




// Mock Expo Linear Gradient & Blur
jest.mock('expo-linear-gradient', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    LinearGradient: (props) => React.createElement(View, props),
  };
});

jest.mock('expo-blur', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    BlurView: (props) => React.createElement(View, props),
  };
});

jest.mock('nativewind', () => ({
  useColorScheme: () => ({
    colorScheme: 'dark',
    setColorScheme: jest.fn(),
    toggleColorScheme: jest.fn(),
  }),
  cssInterop: jest.fn(),
}));

jest.mock('lucide-react-native', () => {
  const React = require('react');
  const { View } = require('react-native');
  return new Proxy(
    {},
    {
      get: () => (props) => React.createElement(View, props),
    }
  );
});

jest.mock('./components/ui/ScreenWrapper', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    ScreenWrapper: ({ children }: any) => React.createElement(View, null, children),
  };
});

jest.mock('./components/ui/ViewToggle', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    ViewToggle: () => React.createElement(View, null),
  };
});

jest.mock('./components/AddTaskModal', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: () => React.createElement(View, null),
  };
});

jest.mock('./components/AddTransactionModal', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: () => React.createElement(View, null),
  };
});







