import { authenticateWithBiometrics } from '../services/biometrics';
import { scheduleTaskAlarm } from '../services/notifications';
import { parseTransactionSMS } from '../services/smsScraper';

describe('Native Services Unit Tests', () => {
  it('authenticates with biometrics mock', async () => {
    const res = await authenticateWithBiometrics('Test Prompt');
    expect(res.success).toBe(true);
  });

  it('schedules task alarm notification mock', async () => {
    const id = await scheduleTaskAlarm('Test Alarm', 'Body', new Date());
    expect(id).toBe('mock-notification-id');
  });

  it('parses bank SMS messages accurately', () => {
    const sampleSMS = 'Alert: Your A/C 1234 has been debited by $45.50 at Grocery Store';
    const parsed = parseTransactionSMS(sampleSMS, 'HDFCBK');
    expect(parsed).not.toBeNull();
    if (parsed) {
      expect(parsed.amount).toBe(45.5);
      expect(parsed.type).toBe('expense');
    }
  });
});
